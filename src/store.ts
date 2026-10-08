import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { hostsFile } from './home.js'
import type { AuthKind, HostPublic, HostRecord } from './protocol.js'

/** Authentication kinds the store accepts. */
const AUTH_KINDS: readonly AuthKind[] = ['agent', 'key', 'password']

/** Alias shape: safe for tools, routes and URLs. */
const ALIAS_PATTERN = /^[A-Za-z0-9._-]{1,64}$/

/** Input accepted by {@link HostStore.upsert}. */
export interface HostInput {
  alias: string
  host: string
  port?: number
  user: string
  auth?: AuthKind
  privateKeyPath?: string
  passphrase?: string
  password?: string
  workspaceRoot?: string
  description?: string
}

/**
 * The host registry: a small JSON document under $DSH_HOME/dsh-ssh-workspace.
 * Secrets (password, passphrase) live here and are never projected into any
 * agent-facing or browser-facing view.
 */
export class HostStore {
  private readonly file: string

  /**
   * @param file - registry path override (tests pass a temp file).
   */
  constructor(file: string = hostsFile()) {
    this.file = file
  }

  /** Every stored host, in insertion order. */
  list(): HostRecord[] {
    return this.readAll()
  }

  /** One host by alias, or undefined. */
  get(alias: string): HostRecord | undefined {
    return this.readAll().find(record => record.alias === alias)
  }

  /** Create or replace one host; returns the stored record. */
  upsert(input: HostInput): HostRecord {
    const now = Date.now()
    const records = this.readAll()
    const index = records.findIndex(record => record.alias === input.alias)
    const previous = index >= 0 ? records[index] : undefined
    const record = normalize(input, previous, now)
    if (index >= 0) records[index] = record
    else records.push(record)
    this.writeAll(records)
    return record
  }

  /** Delete one host; true when a record was removed. */
  remove(alias: string): boolean {
    const records = this.readAll()
    const next = records.filter(record => record.alias !== alias)
    if (next.length === records.length) return false
    this.writeAll(next)
    return true
  }

  /** Set (or clear) the workspace root of one host. */
  setWorkspaceRoot(alias: string, root: string | undefined): HostRecord {
    const records = this.readAll()
    const index = records.findIndex(record => record.alias === alias)
    if (index < 0) throw new Error('unknown host alias: ' + alias)
    const record = { ...records[index]!, updatedAt: Date.now() }
    if (root === undefined || root === '') delete record.workspaceRoot
    else record.workspaceRoot = root
    records[index] = record
    this.writeAll(records)
    return record
  }

  /** Secret-free projection for the agent and the browser. */
  static toPublic(record: HostRecord): HostPublic {
    return {
      alias: record.alias,
      host: record.host,
      port: record.port,
      user: record.user,
      auth: record.auth,
      privateKeyPath: record.privateKeyPath,
      workspaceRoot: record.workspaceRoot,
      description: record.description,
      hasPassword: record.password !== undefined && record.password !== '',
      hasPassphrase: record.passphrase !== undefined && record.passphrase !== '',
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }
  }

  /** Read the registry; a missing or corrupt file reads as empty. */
  private readAll(): HostRecord[] {
    if (!existsSync(this.file)) return []
    try {
      const parsed: unknown = JSON.parse(readFileSync(this.file, 'utf8'))
      if (!Array.isArray(parsed)) return []
      return parsed.filter(isRecordLike)
    } catch {
      return []
    }
  }

  /** Write the registry atomically, 0600 inside a 0700 directory. */
  private writeAll(records: HostRecord[]): void {
    mkdirSync(dirname(this.file), { recursive: true, mode: 0o700 })
    const tmp = this.file + '.tmp'
    writeFileSync(tmp, JSON.stringify(records, null, 2) + '\n', { mode: 0o600 })
    try {
      chmodSync(tmp, 0o600)
    } catch {
      /* best effort on platforms without POSIX modes */
    }
    renameSync(tmp, this.file)
    try {
      unlinkSync(tmp)
    } catch {
      /* already renamed */
    }
  }
}

/** Whether a parsed entry carries the fields the store requires. */
function isRecordLike(value: unknown): value is HostRecord {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return typeof record.alias === 'string' && typeof record.host === 'string' && typeof record.user === 'string'
}

/** Validate and fill one record against its previous version. */
function normalize(input: HostInput, previous: HostRecord | undefined, now: number): HostRecord {
  const alias = String(input.alias ?? '').trim()
  if (!ALIAS_PATTERN.test(alias)) throw new Error('invalid alias: use letters, digits, dot, dash or underscore (1-64 chars)')
  const host = String(input.host ?? '').trim()
  if (host === '') throw new Error('host is required')
  const user = String(input.user ?? '').trim()
  if (user === '') throw new Error('user is required')
  const port = input.port === undefined ? (previous?.port ?? 22) : Number(input.port)
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('invalid port: expected 1-65535')
  const auth: AuthKind = input.auth === undefined ? (previous?.auth ?? 'agent') : input.auth
  if (!AUTH_KINDS.includes(auth)) throw new Error('invalid auth: expected agent, key or password')

  const privateKeyPath = blank(input.privateKeyPath) ? previous?.privateKeyPath : input.privateKeyPath
  if (auth === 'key' && blank(privateKeyPath)) throw new Error('auth=key requires privateKeyPath')
  const password = blank(input.password) ? previous?.password : input.password
  if (auth === 'password' && blank(password)) throw new Error('auth=password requires password')

  const record: HostRecord = {
    alias,
    host,
    port,
    user,
    auth,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  }
  if (!blank(privateKeyPath)) record.privateKeyPath = privateKeyPath
  if (!blank(passphraseOf(input, previous))) record.passphrase = passphraseOf(input, previous)
  if (!blank(password)) record.password = password
  const root = blank(input.workspaceRoot) ? previous?.workspaceRoot : input.workspaceRoot
  if (!blank(root)) record.workspaceRoot = root
  const description = blank(input.description) ? previous?.description : input.description
  if (!blank(description)) record.description = description
  return record
}

/** Passphrase that survives an edit which omits the field. */
function passphraseOf(input: HostInput, previous: HostRecord | undefined): string | undefined {
  return blank(input.passphrase) ? previous?.passphrase : input.passphrase
}

/** Whether a string is absent or empty. */
function blank(value: string | undefined): boolean {
  return value === undefined || value.trim() === ''
}
