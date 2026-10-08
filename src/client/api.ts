/**
 * Browser-side client for the /api/dsh-ssh-workspace route family.
 * Every call is same-origin and loopback-only on the host side.
 */

/** Route family (kept in sync with src/protocol.ts). */
const API = {
  hosts: '/api/dsh-ssh-workspace/hosts',
  home: '/api/dsh-ssh-workspace/home',
  list: '/api/dsh-ssh-workspace/list',
  read: '/api/dsh-ssh-workspace/read',
}

/** Authentication kind a host entry uses. */
export type AuthKind = 'agent' | 'key' | 'password'

/** One configured host, secret-free. */
export interface HostPublic {
  alias: string
  host: string
  port: number
  user: string
  auth: AuthKind
  privateKeyPath?: string
  workspaceRoot?: string
  description?: string
  hasPassword: boolean
  hasPassphrase: boolean
  createdAt: number
  updatedAt: number
}

/** One remote directory entry. */
export interface RemoteEntry {
  name: string
  path: string
  type: 'file' | 'dir' | 'link' | 'other'
  size: number
  mode: string
  mtimeMs: number
}

/** One remote directory listing. */
export interface RemoteListing {
  path: string
  parent: string | null
  entries: RemoteEntry[]
  truncated: boolean
}

/** One remote file read. */
export interface ReadResult {
  path: string
  size: number
  truncated: boolean
  content: string
}

/** Host payload accepted by the save endpoint. */
export interface HostInput {
  alias: string
  host: string
  port: number
  user: string
  auth: AuthKind
  privateKeyPath?: string
  passphrase?: string
  password?: string
  workspaceRoot?: string
  description?: string
}

/** One JSON request; throws the host's error message on failure. */
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { credentials: 'same-origin', ...init })
  const text = await response.text()
  let payload: unknown = undefined
  try {
    payload = text === '' ? undefined : JSON.parse(text)
  } catch {
    payload = undefined
  }
  if (!response.ok) {
    const message = payload !== null && typeof payload === 'object' && 'error' in payload
      ? String((payload as { error: unknown }).error)
      : response.status + ' ' + response.statusText
    throw new Error(message)
  }
  return payload as T
}

/** Build a query string from defined values. */
function qs(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value))
  }
  const text = search.toString()
  return text === '' ? '' : '?' + text
}

/** The route family as typed calls. */
export const sshApi = {
  async hosts(query?: string): Promise<HostPublic[]> {
    const result = await request<{ hosts: HostPublic[] }>(API.hosts + qs({ query }))
    return result.hosts ?? []
  },
  async saveHost(input: HostInput): Promise<HostPublic> {
    const result = await request<{ host: HostPublic }>(API.hosts, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    })
    return result.host
  },
  async deleteHost(alias: string): Promise<void> {
    await request<{ removed: boolean }>(API.hosts + qs({ alias }), { method: 'DELETE' })
  },
  async home(alias: string): Promise<string> {
    const result = await request<{ path: string }>(API.home + qs({ alias }))
    return result.path
  },
  async list(alias: string, path?: string): Promise<RemoteListing> {
    return await request<RemoteListing>(API.list + qs({ alias, path }))
  },
  async read(alias: string, path: string): Promise<ReadResult> {
    return await request<ReadResult>(API.read + qs({ alias, path }))
  },
}
