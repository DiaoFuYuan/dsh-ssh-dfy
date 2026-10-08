/**
 * The remote workspace tab: pick a host, pick the workspace root on that
 * host, then browse every file below it — inside the right sidebar, next to
 * the conversation. The agent tools default to the same workspace root.
 */
import { useCallback, useEffect, useState } from 'react'
import { sshApi, type AuthKind, type HostInput, type HostPublic, type RemoteListing } from './api'

/** Tab glyph used by the right-sidebar guide entry. */
export function SshIcon({ size = 16 }: { size?: number; active?: boolean }) {
  return (
    <svg
      data-dsh-panel-entry="ssh-dfy"
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="1.75" y="2.75" width="12.5" height="10.5" rx="1.75" />
      <path d="M4.5 6.25l2 1.75-2 1.75" />
      <path d="M8.25 10h3.25" />
    </svg>
  )
}

const C = {
  border: 'var(--ds-color-border, rgba(128,140,160,0.28))',
  muted: 'var(--ds-color-text-secondary, #8b94a3)',
  text: 'var(--ds-color-text-primary, inherit)',
  accent: 'var(--ds-color-accent, #4c6ef5)',
  danger: '#d64545',
}

const btn = (primary = false, small = false): Record<string, string | number> => ({
  background: primary ? C.accent : 'transparent',
  color: primary ? '#fff' : C.text,
  border: '1px solid ' + (primary ? C.accent : C.border),
  borderRadius: 5,
  padding: small ? '1px 6px' : '3px 8px',
  fontSize: small ? 11 : 12,
  cursor: 'pointer',
  lineHeight: 1.6,
  whiteSpace: 'nowrap',
})

const field: Record<string, string | number> = {
  background: 'transparent',
  color: C.text,
  border: '1px solid ' + C.border,
  borderRadius: 5,
  padding: '3px 6px',
  fontSize: 12,
  width: '100%',
  boxSizing: 'border-box',
}

const overlay: Record<string, string | number> = {
  position: 'absolute',
  inset: 0,
  background: 'var(--ds-color-bg-secondary, #171a21)',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 5,
}

/** Human-readable byte count. */
function humanSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'K'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + 'M'
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + 'G'
}

/** Empty host form. */
function emptyForm(): HostInput {
  return { alias: '', host: '', port: 22, user: 'root', auth: 'agent', privateKeyPath: '', password: '', description: '' }
}

/** The right-sidebar remote workspace tab. */
export function WorkspacePanel() {
  const [hosts, setHosts] = useState<HostPublic[]>([])
  const [alias, setAlias] = useState('')
  const [root, setRoot] = useState('')
  const [listing, setListing] = useState<RemoteListing | null>(null)
  const [preview, setPreview] = useState<{ path: string; content: string; truncated: boolean; size: number } | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<HostInput>(emptyForm())
  const [picker, setPicker] = useState<{ open: boolean; listing: RemoteListing | null }>({ open: false, listing: null })

  const selected = hosts.find(host => host.alias === alias)

  /** Run one async step with busy/error bookkeeping. */
  const run = useCallback(async (step: () => Promise<void>) => {
    setBusy(true)
    setError('')
    try { await step() } catch (problem) {
      setError(problem instanceof Error ? problem.message : String(problem))
    } finally { setBusy(false) }
  }, [])

  const refreshHosts = useCallback(async (keepAlias?: string) => {
    const list = await sshApi.hosts()
    setHosts(list)
    setAlias(keepAlias !== undefined && list.some(host => host.alias === keepAlias) ? keepAlias : list[0]?.alias ?? '')
    return list
  }, [])

  useEffect(() => { void run(async () => { await refreshHosts() }) }, [run, refreshHosts])

  /** Open the workspace root (or the login home) whenever the host changes. */
  useEffect(() => {
    if (alias === '') { setListing(null); setRoot(''); return }
    const workspace = hosts.find(host => host.alias === alias)?.workspaceRoot ?? ''
    setRoot(workspace)
    setPreview(null)
    void run(async () => { setListing(await sshApi.list(alias, workspace === '' ? undefined : workspace)) })
  }, [alias, hosts, run])

  /** Browse one directory. */
  const openPath = useCallback((path?: string) => {
    if (alias === '') return
    void run(async () => { setPreview(null); setListing(await sshApi.list(alias, path)) })
  }, [alias, run])

  /** Open the root picker at the login home. */
  const openPicker = useCallback(() => {
    void run(async () => {
      const home = await sshApi.home(alias)
      setPicker({ open: true, listing: await sshApi.list(alias, home) })
    })
  }, [alias, run])

  /** Walk the picker. */
  const pickerGo = useCallback((path?: string) => {
    void run(async () => {
      const next = await sshApi.list(alias, path)
      setPicker({ open: true, listing: next })
    })
  }, [alias, run])

  /** Persist the picked directory as the workspace root. */
  const usePickedRoot = useCallback((path: string) => {
    if (selected === undefined) return
    void run(async () => {
      await sshApi.saveHost({
        alias: selected.alias,
        host: selected.host,
        port: selected.port,
        user: selected.user,
        auth: selected.auth as AuthKind,
        privateKeyPath: selected.privateKeyPath,
        workspaceRoot: path,
        description: selected.description,
      })
      setPicker({ open: false, listing: null })
      await refreshHosts(alias)
      setRoot(path)
      setListing(await sshApi.list(alias, path))
    })
  }, [alias, refreshHosts, run, selected])

  /** Save the host form. */
  const saveHost = useCallback(() => {
    void run(async () => {
      const saved = await sshApi.saveHost(form)
      setFormOpen(false)
      setForm(emptyForm())
      await refreshHosts(saved.alias)
    })
  }, [form, refreshHosts, run])

  /** Delete one host. */
  const removeHost = useCallback(() => {
    if (alias === '') return
    void run(async () => {
      await sshApi.deleteHost(alias)
      await refreshHosts()
    })
  }, [alias, refreshHosts, run])

  /** Preview one remote file. */
  const openFile = useCallback((path: string) => {
    void run(async () => {
      const result = await sshApi.read(alias, path)
      setPreview({ path: result.path, content: result.content, truncated: result.truncated, size: result.size })
    })
  }, [alias, run])

  return (
    <div style={{ position: 'relative', height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', fontSize: 12, color: C.text }}>
      {/* host + root bar */}
      <div style={{ padding: '6px 8px', display: 'grid', gap: 6, borderBottom: '1px solid ' + C.border }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <select
            style={{ ...field, flex: 1 }}
            value={alias}
            onChange={event => setAlias(event.target.value)}
          >
            {hosts.length === 0 && <option value="">（还没有主机）</option>}
            {hosts.map(host => <option key={host.alias} value={host.alias}>{host.alias} — {host.user}@{host.host}</option>)}
          </select>
          <button style={btn()} title="新增主机" onClick={() => setFormOpen(true)}>+</button>
          {alias !== '' && <button style={btn()} title="删除当前主机" onClick={removeHost}>−</button>}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: C.muted }} title={root === '' ? (selected?.workspaceRoot ?? '未设置（默认登录家目录）') : root}>
            根目录：{root === '' ? (selected?.workspaceRoot ?? '未设置（默认 ~）') : root}
          </span>
          <button style={btn()} onClick={openPicker} disabled={alias === '' || busy}>选择</button>
          <button style={btn()} onClick={() => openPath(root === '' ? undefined : root)} disabled={alias === '' || busy}>刷新</button>
        </div>
      </div>

      {error !== '' && (
        <div style={{ margin: 8, padding: '6px 8px', border: '1px solid ' + C.danger, borderRadius: 5, color: '#ffb4b4', whiteSpace: 'pre-wrap' }}>{error}</div>
      )}

      {/* breadcrumb */}
      <div style={{ padding: '4px 8px', display: 'flex', gap: 6, alignItems: 'center', borderBottom: '1px solid ' + C.border, color: C.muted }}>
        <button style={btn(false, true)} onClick={() => listing?.parent != null && openPath(listing.parent)} disabled={listing?.parent == null}>↑</button>
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={listing?.path ?? ''}>
          {listing?.path ?? (alias === '' ? '先添加一台主机' : '…')}
        </span>
        {busy && <span style={{ fontSize: 11 }}>…</span>}
      </div>

      {/* entries */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {(listing?.entries ?? []).map(entry => (
          <div
            key={entry.path}
            onClick={() => entry.type === 'dir' ? openPath(entry.path) : openFile(entry.path)}
            style={{ padding: '3px 8px', cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center' }}
            onMouseEnter={event => { (event.currentTarget as HTMLElement).style.background = 'rgba(128,140,160,0.12)' }}
            onMouseLeave={event => { (event.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <span style={{ width: 12, textAlign: 'center' }}>{entry.type === 'dir' ? '📁' : entry.type === 'link' ? '🔗' : '📄'}</span>
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.name}</span>
            {entry.type !== 'dir' && <span style={{ color: C.muted, fontSize: 11 }}>{humanSize(entry.size)}</span>}
          </div>
        ))}
        {listing != null && listing.entries.length === 0 && <div style={{ padding: 10, color: C.muted }}>空目录</div>}
      </div>

      {/* ------------------------------------------------------- host form */}
      {formOpen && (
        <div style={overlay}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid ' + C.border, display: 'flex', alignItems: 'center', gap: 8 }}>
            <strong style={{ flex: 1 }}>新增主机</strong>
            <button style={btn()} onClick={() => setFormOpen(false)}>取消</button>
          </div>
          <div style={{ padding: 10, display: 'grid', gap: 8, overflow: 'auto' }}>
            <label style={{ display: 'grid', gap: 3 }}><span style={{ color: C.muted, fontSize: 11 }}>别名（工具里用）</span>
              <input style={field} value={form.alias} onChange={event => setForm({ ...form, alias: event.target.value })} /></label>
            <label style={{ display: 'grid', gap: 3 }}><span style={{ color: C.muted, fontSize: 11 }}>主机 / IP</span>
              <input style={field} value={form.host} onChange={event => setForm({ ...form, host: event.target.value })} /></label>
            <div style={{ display: 'flex', gap: 8 }}>
              <label style={{ display: 'grid', gap: 3, flex: 1 }}><span style={{ color: C.muted, fontSize: 11 }}>用户名</span>
                <input style={field} value={form.user} onChange={event => setForm({ ...form, user: event.target.value })} /></label>
              <label style={{ display: 'grid', gap: 3, width: 70 }}><span style={{ color: C.muted, fontSize: 11 }}>端口</span>
                <input style={field} value={String(form.port)} onChange={event => setForm({ ...form, port: Number(event.target.value) || 22 })} /></label>
            </div>
            <label style={{ display: 'grid', gap: 3 }}><span style={{ color: C.muted, fontSize: 11 }}>认证方式</span>
              <select style={field} value={form.auth} onChange={event => setForm({ ...form, auth: event.target.value as AuthKind })}>
                <option value="agent">ssh-agent</option>
                <option value="key">私钥文件</option>
                <option value="password">密码</option>
              </select></label>
            {form.auth === 'key' && (
              <label style={{ display: 'grid', gap: 3 }}><span style={{ color: C.muted, fontSize: 11 }}>私钥路径（本机）</span>
                <input style={field} value={form.privateKeyPath ?? ''} onChange={event => setForm({ ...form, privateKeyPath: event.target.value })} /></label>
            )}
            {form.auth === 'password' && (
              <label style={{ display: 'grid', gap: 3 }}><span style={{ color: C.muted, fontSize: 11 }}>密码（存本机 0600 文件）</span>
                <input style={field} type="password" value={form.password ?? ''} onChange={event => setForm({ ...form, password: event.target.value })} /></label>
            )}
            <button style={btn(true)} onClick={saveHost} disabled={busy}>保存</button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- root picker */}
      {picker.open && (
        <div style={overlay}>
          <div style={{ padding: '6px 8px', borderBottom: '1px solid ' + C.border, display: 'flex', gap: 6, alignItems: 'center' }}>
            <strong style={{ flex: 1 }}>选择工作区根目录</strong>
            <button style={btn(false, true)} onClick={() => pickerGo(picker.listing?.parent ?? undefined)} disabled={picker.listing?.parent == null}>↑</button>
            <button style={btn(false, true)} onClick={() => setPicker({ open: false, listing: null })}>取消</button>
          </div>
          <div style={{ padding: '4px 8px', color: C.muted, borderBottom: '1px solid ' + C.border, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {picker.listing?.path ?? '…'}
          </div>
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            {(picker.listing?.entries ?? []).filter(entry => entry.type === 'dir').map(entry => (
              <div key={entry.path} onClick={() => pickerGo(entry.path)} style={{ padding: '3px 8px', cursor: 'pointer' }}>📁 {entry.name}</div>
            ))}
          </div>
          <div style={{ padding: 8, borderTop: '1px solid ' + C.border }}>
            <button
              style={{ ...btn(true), width: '100%' }}
              disabled={picker.listing == null || busy}
              onClick={() => picker.listing != null && usePickedRoot(picker.listing.path)}
            >
              使用此目录作为工作区
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- preview */}
      {preview != null && (
        <div style={overlay}>
          <div style={{ padding: '6px 8px', borderBottom: '1px solid ' + C.border, display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={preview.path}>{preview.path.split('/').pop()}</span>
            <span style={{ color: C.muted, fontSize: 11 }}>{humanSize(preview.size)}{preview.truncated ? '+' : ''}</span>
            <button style={btn(false, true)} onClick={() => setPreview(null)}>返回</button>
          </div>
          <pre style={{ margin: 0, padding: 8, overflow: 'auto', flex: 1, fontSize: 11.5, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{preview.content}</pre>
        </div>
      )}
    </div>
  )
}
