import { defineTool } from '@deepseek-ai/dsh-tools'
import type { ContentBlock } from '@deepseek-ai/dsh-llm'
import type { SshEngine } from './engine.js'
import type { ExecResult, ReadResult, RemoteListing } from './protocol.js'
import { HostStore } from './store.js'

/** One text content block (the only render shape these tools emit). */
function text(value: string): ContentBlock[] {
  return [{ type: 'text', text: value }]
}

/** Host row exactly as the tool's output schema declares it. */
interface AgentHostRow {
  alias: string
  host: string
  port: number
  user: string
  auth: string
  hasPassword: boolean
  workspaceRoot?: string
  description?: string
}

/** Markdown table of the configured hosts (no secrets). */
function renderHosts(hosts: AgentHostRow[]): string {
  if (hosts.length === 0) return 'no hosts configured — open the SSH workspace panel in the dsh web GUI and add one'
  const rows = hosts.map(host => [
    host.alias,
    host.host,
    String(host.port),
    host.user,
    host.auth,
    host.workspaceRoot ?? '-',
    host.description ?? '',
  ].join(' | '))
  return ['alias | host | port | user | auth | workspaceRoot | description', '--- | --- | --- | --- | --- | --- | ---', ...rows].join('\n')
}

/** Render one exec outcome (mirrors the local shell tool's exit-code convention). */
function renderExec(result: ExecResult, alias: string): string {
  const marker = result.timedOut ? '[timed out]' : '[exit code: ' + (result.exitCode ?? 'null') + ']'
  const parts = ['[' + alias + '] ' + marker]
  if (result.stdout !== '') parts.push('stdout:\n' + result.stdout)
  if (result.stderr !== '') parts.push('stderr:\n' + result.stderr)
  if (result.error !== undefined) parts.push('error: ' + result.error)
  parts.push('duration: ' + result.durationMs + ' ms')
  return parts.join('\n')
}

/** Render one directory listing. */
function renderListing(listing: RemoteListing): string {
  if (listing.entries.length === 0) return listing.path + ' is empty'
  const rows = listing.entries.map(entry => [
    entry.type,
    entry.mode,
    String(entry.size),
    entry.name,
  ].join(' | '))
  const head = 'path: ' + listing.path + (listing.truncated ? ' (truncated)' : '')
  return [head, 'type | mode | size | name', '--- | --- | --- | ---', ...rows].join('\n')
}

/** Render one file read. */
function renderRead(result: ReadResult): string {
  const head = 'path: ' + result.path + ' (' + result.size + ' bytes' + (result.truncated ? ', truncated' : '') + ')'
  return head + '\n---\n' + result.content
}

/** Host inventory: what the agent may operate on. */
export function sshHostsTool(engine: SshEngine) {
  return defineTool({
    name: 'ssh_hosts',
    description: 'List the remote SSH hosts configured for this machine (alias, host, port, user, auth, workspace root). Every other ssh_* tool takes one of these aliases. Hosts and credentials are configured by the user in the dsh web GUI SSH workspace panel.',
    parameters: {
      query: { type: 'string', description: 'Optional case-insensitive filter over alias, host, user and description.' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          hosts: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                alias: { type: 'string', required: true },
                host: { type: 'string', required: true },
                port: { type: 'integer', required: true },
                user: { type: 'string', required: true },
                auth: { type: 'string', required: true },
                workspaceRoot: { type: 'string' },
                description: { type: 'string' },
                hasPassword: { type: 'boolean', required: true },
              },
            },
          },
        },
      },
      render: (_args, value: { hosts: AgentHostRow[] }) => text(renderHosts(value.hosts)),
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return { hosts: engine.list(args.query).map(HostStore.toPublic) }
    },
  })
}

/** Remote command execution. */
export function sshExecTool(engine: SshEngine) {
  return defineTool({
    name: 'ssh_exec',
    description: 'Execute a shell command on a REMOTE SSH host by alias. The command runs on the remote machine, never on this one — use the local shell tool for local commands. Prefer one combined read-only command over many round trips.',
    parameters: {
      alias: { type: 'string', required: true, description: 'Host alias from ssh_hosts.' },
      command: { type: 'string', required: true, description: 'Shell command to run on the remote host.' },
      timeoutMs: { type: 'integer', description: 'Timeout in milliseconds (default 60000).' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          success: { type: 'boolean', required: true },
          exitCode: { oneOf: [{ type: 'integer' }, { type: 'null' }], required: true },
          timedOut: { type: 'boolean', required: true },
          stdout: { type: 'string', required: true },
          stderr: { type: 'string', required: true },
          durationMs: { type: 'integer', required: true },
          error: { type: 'string' },
        },
      },
      render: (args, value: ExecResult) => text(renderExec(value, args.alias)),
    },
    async execute(args, exec) {
      try {
        return await engine.exec(args.alias, args.command, args.timeoutMs, exec.signal)
      } catch (error) {
        return {
          success: false,
          exitCode: null,
          timedOut: false,
          stdout: '',
          stderr: '',
          durationMs: 0,
          error: error instanceof Error ? error.message : String(error),
        }
      }
    },
  })
}

/** Remote directory listing (the same listing the panel renders). */
export function sshLsTool(engine: SshEngine) {
  return defineTool({
    name: 'ssh_ls',
    description: 'List a directory on a REMOTE SSH host over SFTP. Omit path to list the host workspace root (or the login home when no root is set).',
    parameters: {
      alias: { type: 'string', required: true, description: 'Host alias from ssh_hosts.' },
      path: { type: 'string', description: 'Absolute remote directory path. Omit for the workspace root.' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          path: { type: 'string', required: true },
          parent: { oneOf: [{ type: 'string' }, { type: 'null' }], required: true },
          truncated: { type: 'boolean', required: true },
          entries: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                name: { type: 'string', required: true },
                path: { type: 'string', required: true },
                type: { type: 'string', required: true },
                size: { type: 'integer', required: true },
                mode: { type: 'string', required: true },
                mtimeMs: { type: 'integer', required: true },
              },
            },
          },
        },
      },
      render: (_args, value: RemoteListing) => text(renderListing(value)),
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      const host = engine.list().find(record => record.alias === args.alias)
      const target = args.path ?? host?.workspaceRoot
      return await engine.listDir(args.alias, target)
    },
  })
}

/** Remote file read over SFTP. */
export function sshReadTool(engine: SshEngine) {
  return defineTool({
    name: 'ssh_read',
    description: 'Read a text file from a REMOTE SSH host over SFTP (capped at 1 MiB). Use the local read tool for files on this machine.',
    parameters: {
      alias: { type: 'string', required: true, description: 'Host alias from ssh_hosts.' },
      path: { type: 'string', required: true, description: 'Absolute remote file path.' },
      maxBytes: { type: 'integer', description: 'Byte cap for this read (default 262144, max 1048576).' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          path: { type: 'string', required: true },
          size: { type: 'integer', required: true },
          truncated: { type: 'boolean', required: true },
          content: { type: 'string', required: true },
        },
      },
      render: (_args, value: ReadResult) => text(renderRead(value)),
    },
    isConcurrencySafe: () => true,
    async execute(args) {
      return await engine.readFile(args.alias, args.path, args.maxBytes)
    },
  })
}
