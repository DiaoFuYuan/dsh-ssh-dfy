import { readFileSync } from 'node:fs'
import { posix } from 'node:path'
import { Client, type ConnectConfig, type SFTPWrapper } from 'ssh2'
import type { ExecResult, HostRecord, ReadResult, RemoteEntry, RemoteListing } from './protocol.js'
import type { HostStore } from './store.js'

/** Default remote-command timeout. */
const DEFAULT_EXEC_TIMEOUT_MS = 60000

/** Cap on one remote file read (256 KiB). */
const DEFAULT_READ_BYTES = 256 * 1024

/** Cap on one directory listing. */
const MAX_ENTRIES = 2000

/**
 * The SSH engine: one lazily connected ssh2 client per host alias, reused for
 * every exec / SFTP call until the connection drops. The web browser and the
 * agent share this pool, so a host configured in the GUI is immediately
 * operable through the tools.
 */
export class SshEngine {
  private readonly pool = new Map<string, Promise<Client>>()

  /**
   * @param store - the host registry the pool resolves aliases through.
   */
  constructor(private readonly store: HostStore) {}

  /** Host summaries without secrets. */
  list(query?: string): HostRecord[] {
    const records = this.store.list()
    if (query === undefined || query.trim() === '') return records
    const needle = query.trim().toLowerCase()
    return records.filter(record =>
      record.alias.toLowerCase().includes(needle)
      || record.host.toLowerCase().includes(needle)
      || record.user.toLowerCase().includes(needle)
      || (record.description ?? '').toLowerCase().includes(needle))
  }

  /** Run one shell command on a remote host. */
  async exec(alias: string, command: string, timeoutMs: number = DEFAULT_EXEC_TIMEOUT_MS, signal?: AbortSignal): Promise<ExecResult> {
    const client = await this.client(alias)
    const started = Date.now()
    return await new Promise<ExecResult>(resolve => {
      let settled = false
      const finish = (result: ExecResult): void => {
        if (settled) return
        settled = true
        cleanup()
        resolve(result)
      }
      let timer: NodeJS.Timeout | undefined
      const onAbort = (): void => {
        finish({ success: false, exitCode: null, timedOut: false, stdout: '', stderr: '', durationMs: Date.now() - started, error: 'aborted' })
      }
      const cleanup = (): void => {
        if (timer !== undefined) clearTimeout(timer)
        signal?.removeEventListener('abort', onAbort)
      }
      signal?.addEventListener('abort', onAbort, { once: true })
      client.exec(command, (error, stream) => {
        if (error) {
          finish({ success: false, exitCode: null, timedOut: false, stdout: '', stderr: '', durationMs: Date.now() - started, error: error.message })
          return
        }
        let stdout = ''
        let stderr = ''
        let timedOut = false
        timer = setTimeout(() => {
          timedOut = true
          stream.close()
        }, Math.max(1000, timeoutMs))
        stream.on('data', (chunk: Buffer) => { stdout += chunk.toString('utf8') })
        stream.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString('utf8') })
        stream.on('close', (code: number | null) => {
          finish({
            success: code === 0 && !timedOut,
            exitCode: code ?? null,
            timedOut,
            stdout,
            stderr,
            durationMs: Date.now() - started,
          })
        })
        stream.on('error', (streamError: Error) => {
          finish({ success: false, exitCode: null, timedOut, stdout, stderr, durationMs: Date.now() - started, error: streamError.message })
        })
      })
    })
  }

  /** The remote home directory of the login user. */
  async remoteHome(alias: string): Promise<string> {
    const result = await this.exec(alias, 'printf %s "$HOME"', 15000)
    const value = result.stdout.trim()
    if (value !== '') return value
    const fallback = await this.exec(alias, 'pwd', 15000)
    return fallback.stdout.trim() || '/'
  }

  /** Read one remote directory over SFTP. */
  async listDir(alias: string, path?: string): Promise<RemoteListing> {
    const target = path === undefined || path === '' ? await this.remoteHome(alias) : normalizeRemotePath(path)
    const sftp = await this.sftp(alias)
    const entries = await new Promise<RemoteEntry[]>((resolve, reject) => {
      sftp.readdir(target, (error, list) => {
        if (error) {
          reject(new Error('cannot list ' + target + ': ' + error.message))
          return
        }
        const mapped: RemoteEntry[] = []
        for (const item of list) {
          if (mapped.length >= MAX_ENTRIES) break
          const attributes = item.attrs as unknown as { mode?: number; size?: number; mtime?: number; isDirectory?: () => boolean; isFile?: () => boolean; isSymbolicLink?: () => boolean }
          const mode = attributes.mode ?? 0
          const type: RemoteEntry['type'] = attributes.isDirectory?.() === true
            ? 'dir'
            : attributes.isSymbolicLink?.() === true
              ? 'link'
              : attributes.isFile?.() === true ? 'file' : 'other'
          mapped.push({
            name: item.filename,
            path: posix.join(target, item.filename),
            type,
            size: attributes.size ?? 0,
            mode: toOctal(mode),
            mtimeMs: (attributes.mtime ?? 0) * 1000,
          })
        }
        mapped.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'dir' ? -1 : b.type === 'dir' ? 1 : 0))
        resolve(mapped)
      })
    })
    return {
      path: target,
      parent: target === '/' ? null : posix.dirname(target),
      entries,
      truncated: entries.length >= MAX_ENTRIES,
    }
  }

  /** Read one remote file over SFTP, capped. */
  async readFile(alias: string, path: string, maxBytes: number = DEFAULT_READ_BYTES): Promise<ReadResult> {
    const target = normalizeRemotePath(path)
    const sftp = await this.sftp(alias)
    const stats = await new Promise<{ size: number }>((resolve, reject) => {
      sftp.stat(target, (error, attributes) => {
        if (error) reject(new Error('cannot stat ' + target + ': ' + error.message))
        else resolve({ size: Number((attributes as unknown as { size?: number }).size ?? 0) })
      })
    })
    const cap = Math.max(1, Math.min(maxBytes, 1024 * 1024))
    const buffer = await new Promise<Buffer>((resolve, reject) => {
      sftp.open(target, 'r', (openError, handle) => {
        if (openError) {
          reject(new Error('cannot open ' + target + ': ' + openError.message))
          return
        }
        const chunk = Buffer.alloc(Math.min(cap, stats.size === 0 ? cap : stats.size))
        sftp.read(handle, chunk, 0, chunk.length, 0, (readError, bytesRead) => {
          sftp.close(handle, () => { /* best effort */ })
          if (readError) reject(new Error('cannot read ' + target + ': ' + readError.message))
          else resolve(chunk.subarray(0, bytesRead))
        })
      })
    })
    return {
      path: target,
      size: stats.size,
      truncated: stats.size > buffer.length,
      content: buffer.toString('utf8'),
    }
  }

  /** Close every pooled connection. */
  dispose(): void {
    for (const pending of this.pool.values()) {
      pending.then(client => client.end()).catch(() => { /* already gone */ })
    }
    this.pool.clear()
  }

  /** The pooled client for one alias, connecting on first use. */
  private client(alias: string): Promise<Client> {
    const host = this.store.get(alias)
    if (host === undefined) return Promise.reject(new Error('unknown host alias: ' + alias + ' (configure it in the SSH workspace panel first)'))
    const pooled = this.pool.get(alias)
    if (pooled !== undefined) return pooled
    const pending = new Promise<Client>((resolve, reject) => {
      const client = new Client()
      let settled = false
      client.once('ready', () => {
        settled = true
        resolve(client)
      })
      client.once('error', (error: Error) => {
        this.pool.delete(alias)
        if (!settled) reject(new Error('ssh connect failed for ' + alias + ': ' + error.message))
      })
      client.once('close', () => { this.pool.delete(alias) })
      try {
        client.connect(connectConfig(host))
      } catch (error) {
        this.pool.delete(alias)
        reject(error instanceof Error ? error : new Error(String(error)))
      }
    })
    this.pool.set(alias, pending)
    return pending
  }

  /** An SFTP session on the pooled connection. */
  private sftp(alias: string): Promise<SFTPWrapper> {
    return this.client(alias).then(client => new Promise<SFTPWrapper>((resolve, reject) => {
      client.sftp((error, sftp) => {
        if (error) reject(new Error('sftp unavailable on ' + alias + ': ' + error.message))
        else resolve(sftp)
      })
    }))
  }
}

/** Build the ssh2 connect config for one stored host. */
function connectConfig(host: HostRecord): ConnectConfig {
  const config: ConnectConfig = {
    host: host.host,
    port: host.port,
    username: host.user,
    readyTimeout: 20000,
    keepaliveInterval: 15000,
    keepaliveCountMax: 3,
  }
  if (host.auth === 'password') {
    config.password = host.password ?? ''
  } else if (host.auth === 'key') {
    config.privateKey = readFileSync(host.privateKeyPath ?? '', 'utf8')
    if (host.passphrase !== undefined && host.passphrase !== '') config.passphrase = host.passphrase
  } else {
    config.agent = process.env.SSH_AUTH_SOCK ?? '\\\\.\\pipe\\openssh-ssh-agent'
  }
  return config
}

/** Absolute-ize a remote path without touching the local filesystem. */
export function normalizeRemotePath(path: string): string {
  const trimmed = path.trim()
  if (trimmed === '') return '.'
  if (trimmed === '~') return '~'
  if (trimmed.startsWith('~/')) return posix.join('~', trimmed.slice(2))
  return posix.isAbsolute(trimmed) ? posix.normalize(trimmed) : trimmed
}

/** Render a mode value as an octal string. */
function toOctal(mode: number): string {
  return (mode & 0o7777).toString(8).padStart(4, '0')
}
