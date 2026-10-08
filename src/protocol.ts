/** Route family owned by this plugin (loopback-only). */
export const API = {
  hosts: '/api/dsh-ssh-workspace/hosts',
  home: '/api/dsh-ssh-workspace/home',
  list: '/api/dsh-ssh-workspace/list',
  read: '/api/dsh-ssh-workspace/read',
} as const

/** Authentication kind a host entry uses. */
export type AuthKind = 'agent' | 'key' | 'password'

/** One remote host as persisted on this machine. */
export interface HostRecord {
  /** Stable user-chosen alias; the key every tool and route uses. */
  alias: string
  /** Hostname or IP of the remote machine. */
  host: string
  /** SSH port. */
  port: number
  /** Login user on the remote machine. */
  user: string
  /** How to authenticate. */
  auth: AuthKind
  /** Private key path (auth = 'key'). */
  privateKeyPath?: string
  /** Private key passphrase (auth = 'key'), stored in the private registry file. */
  passphrase?: string
  /** Password (auth = 'password'), stored in the private registry file. */
  password?: string
  /** Workspace root the file browser and ssh_* tools default to (absolute remote path). */
  workspaceRoot?: string
  /** Free-form note. */
  description?: string
  createdAt: number
  updatedAt: number
}

/** Host view that never carries a secret. */
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

/** One directory entry read over SFTP. */
export interface RemoteEntry {
  name: string
  path: string
  type: 'file' | 'dir' | 'link' | 'other'
  size: number
  mode: string
  mtimeMs: number
}

/** One directory listing. */
export interface RemoteListing {
  path: string
  parent: string | null
  entries: RemoteEntry[]
  truncated: boolean
}

/** Outcome of one remote command. */
export interface ExecResult {
  success: boolean
  exitCode: number | null
  timedOut: boolean
  stdout: string
  stderr: string
  durationMs: number
  error?: string
}

/** Outcome of one remote file read. */
export interface ReadResult {
  path: string
  size: number
  truncated: boolean
  content: string
}
