/**
 * The SSH workspace page: pick a host, pick the workspace root on that host,
 * then browse every file below that root. The agent tools operate on the same
 * workspace root, so the panel and the model always agree on the scope.
 */
import { useCallback, useEffect, useState } from 'react'
import { sshApi, type AuthKind, type HostInput, type HostPublic, type RemoteListing } from './api'

/** Sidebar glyph (the shell owns the row box, label and highlight). */
export function WorkspaceIcon({ size }: { size: number; active?: boolean }) {
  return (
    <svg
      data-dsh-panel-entry="ssh-workspace"
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
      <path d="M4.5 6.25h7M4.5 9h7M4.5 11.5h4" />
    </svg>
  )
}

const COLORS = {
  border: 'var(--ds-color-border, #2a2f3a)',
  muted: 'var(--ds-color-text-secondary, #9aa4b2)',
  text: 'var(--ds-color-text-primary, #e6e9ef)',
  bg: 'var(--ds-color-bg-secondary, #171a21)',
  accent: 'var(--ds-color-accent, #4c6ef5)',
}

const button = (primary = false): Record<string, string | number> => ({
  background: primary ? COLORS.accent : 'transparent',
  color: primary ? '#fff' : COLORS.text,
  border: '1px solid ' + (primary ? COLORS.accent : COLORS.border),
  borderRadius: 6,
  padding: '4px 10px',
  fontSize: 12,
  cursor: 'pointer',
})

const input: Record<string, string | number> = {
  background: 'transparent',
  color: COLORS.text,
  border: '1px solid ' + COLORS.border,
  borderRadius: 6,
  padding: '5px 8px',
  fontSize: 12,
  width: '100%',
  boxSizing: 'border-box',
}

/** Human-readable byte count. */
function humanSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
}

/** Empty host form. */
function emptyForm(): HostInput {
  return { alias: '', host: '', port: 22, user: 'root', auth: 'agent', privateKeyPath: '', password: '', description: '' }
}

/** The workspace page. */
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
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerListing, setPickerListing] = useState<RemoteListing | null>(null)

  const selected = hosts.find(host => host.alias === alias)

  /** Run one async step with busy/error bookkeeping. */
  const run = useCallback(async (step: () => Promise<void>) => {
    setBusy(true)
    setError('')
    try {
      await step()
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : String(problem))
    } finally {
      setBusy(false)
    }
  }, [])

  const refreshHosts = useCallback(async (keepAlias?: string) => {
    const list = await sshApi.hosts()
    setHosts(list)
    const next = keepAlias !== undefined && list.some(host => host.alias === keepAlias)
      ? keepAlias
      : list[0]?.alias ?? ''
    setAlias(next)
    return list
  }, [])

  useEffect(() => {
    void run(async () => { await refreshHosts() })
  }, [run, refreshHosts])

  /** Open the workspace root (or the login home) of the selected host. */
  useEffect(() => {
    if (alias === '') {
      setListing(null)
      setRoot('')
      return
    }
    const host = hosts.find(item => item.alias === alias)
    const workspace = host?.workspaceRoot ?? ''
    setRoot(workspace)
    setPreview(null)
    void run(async () => {
      setListing(await sshApi.list(alias, workspace === '' ? undefined : workspace))
    })
  }, [alias, hosts, run])

  /** Open one directory inside the workspace. */
  const openPath = useCallback((path?: string) => {
    if (alias === '') return
    void run(async () => {
      setPreview(null)
      setListing(await sshApi.list(alias, path))
    })
  }, [alias, run])

  /** Open the workspace-root picker at the login home. */
  const openPicker = useCallback(() => {
    if (alias === '') return
    setPickerOpen(true)
    void run(async () => {
      const home = await sshApi.home(alias)
      setPickerListing(await sshApi.list(alias, home))
    })
  }, [alias, run])

  /** Walk the picker to another directory. */
  const pickerGo = useCallback((path?: string) => {
    void run(async () => { setPickerListing(await sshApi.list(alias, path)) })
  }, [alias, run])

  /** Save the picked directory as the workspace root. */
  const usePickedRoot = useCallback((path: string) => {
    void run(async () => {
      await sshApi.saveHost({ ...(selected as HostPublic), alias: selected?.alias ?? '', port: selected?.port ?? 22, auth: (selected?.auth ?? 'agent') as AuthKind, workspaceRoot: path })
      setPickerOpen(false)
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
  const deleteHost = useCallback((target: string) => {
    void run(async () => {
      await sshApi.deleteHost(target)
      await refreshHosts()
    })
  }, [refreshHosts, run])

  /** Preview one remote file. */
  const openFile = useCallback((path: string) => {
    void run(async () => {
      const result = await sshApi.read(alias, path)
      setPreview({ path: result.path, content: result.content, truncated: result.truncated, size: result.size })
    })
  }, [alias, run])

  const breadcrumb = listing?.path ?? ''

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 0, color: COLORS.text, fontSize: 13, background: COLORS.bg }}>
      {/* ------------------------------------------------------------ hosts */}
      <aside style={{ width: 240, flex: '0 0 240px', borderRight: '1px solid ' + COLORS.border, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ padding: '10px 12px', borderBottom: '1px solid ' + COLORS.border, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <strong style={{ fontSize: 13 }}>SSH 工作区</strong>
          <button style={button()} onClick={() => setFormOpen(value => !value)}>{formOpen ? '取消' : '+ 主机'}</button>
        </div>

        {formOpen && (
          <div style={{ padding: 12, borderBottom: '1px solid ' + COLORS.border, display: 'grid', gap: 6 }}>
            {([
              ['alias', '别名（工具里用）'],
              ['host', '主机 / IP'],
              ['user', '用户名'],
              ['privateKeyPath', '私钥路径（auth=key）'],
            ] as Array<[keyof HostInput, string]>).map(([key, label]) => (
              <label key={String(key)} style={{ display: 'grid', gap: 3 }}>
                <span style={{ color: COLORS.muted, fontSize: 11 }}>{label}</span>
                <input
                  style={input}
                  value={String(form[key] ?? '')}
                  onChange={event => setForm({ ...form, [key]: event.target.value })}
                />
              </label>
            ))}
            <div style={{ display: 'flex', gap: 6 }}>
              <label style={{ display: 'grid', gap: 3, width: 80 }}>
                <span style={{ color: COLORS.muted, fontSize: 11 }}>端口</span>
                <input style={input} value={String(form.port)} onChange={event => setForm({ ...form, port: Number(event.target.value) || 22 })} />
              </label>
              <label style={{ display: 'grid', gap: 3, flex: 1 }}>
                <span style={{ color: COLORS.muted, fontSize: 11 }}>认证方式</span>
                <select style={input} value={form.auth} onChange={event => setForm({ ...form, auth: event.target.value as AuthKind })}>
                  <option value="agent">ssh-agent</option>
                  <option value="key">私钥文件</option>
                  <option value="password">密码</option>
                </select>
              </label>
            </div>
            {form.auth === 'password' && (
              <label style={{ display: 'grid', gap: 3 }}>
                <span style={{ color: COLORS.muted, fontSize: 11 }}>密码（存在本机 0600 文件里）</span>
                <input style={input} type="password" value={form.password ?? ''} onChange={event => setForm({ ...form, password: event.target.value })} />
              </label>
            )}
            <button style={button(true)} onClick={saveHost} disabled={busy}>保存主机</button>
          </div>
        )}

        <div style={{ overflow: 'auto', flex: 1, minHeight: 0 }}>
          {hosts.length === 0 && <p style={{ color: COLORS.muted, padding: 12, fontSize: 12 }}>还没有主机，点右上角「+ 主机」添加一台。</p>}
          {hosts.map(host => (
            <div
              key={host.alias}
              onClick={() => setAlias(host.alias)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid ' + COLORS.border,
                background: host.alias === alias ? 'rgba(76,110,245,0.14)' : 'transparent',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                <strong style={{ fontSize: 12 }}>{host.alias}</strong>
                <button
                  style={{ ...button(), padding: '1px 6px', fontSize: 11 }}
                  onClick={event => { event.stopPropagation(); deleteHost(host.alias) }}
                >
                  删
                </button>
              </div>
              <div style={{ color: COLORS.muted, fontSize: 11 }}>{host.user}@{host.host}:{host.port}</div>
              <div style={{ color: COLORS.muted, fontSize: 11 }}>根目录：{host.workspaceRoot ?? '（未设置，默认 ~）'}</div>
            </div>
          ))}
        </div>
      </aside>

      {/* ----------------------------------------------------------- browser */}
      <section style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid ' + COLORS.border, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: COLORS.muted, fontSize: 12 }}>工作区根目录</span>
          <code style={{ fontSize: 12 }}>{root === '' ? (selected?.workspaceRoot ?? '未设置（默认登录家目录）') : root}</code>
          <button style={button()} onClick={openPicker} disabled={alias === ''}>选择根目录…</button>
          <button style={button()} onClick={() => openPath(root === '' ? undefined : root)} disabled={alias === ''}>刷新</button>
          {busy && <span style={{ color: COLORS.muted, fontSize: 11 }}>加载中…</span>}
        </div>

        {error !== '' && (
          <div style={{ margin: '8px 14px', padding: '8px 10px', border: '1px solid #d64545', borderRadius: 6, color: '#ffb4b4', fontSize: 12, whiteSpace: 'pre-wrap' }}>
            {error}
          </div>
        )}

        {alias === '' ? (
          <div style={{ padding: 24, color: COLORS.muted }}>先在左侧选择或添加一台主机。</div>
        ) : (
          <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '6px 14px', color: COLORS.muted, fontSize: 12, borderBottom: '1px solid ' + COLORS.border, display: 'flex', gap: 10, alignItems: 'center' }}>
                <button style={button()} onClick={() => listing?.parent != null && openPath(listing.parent)} disabled={listing?.parent == null}>↑ 上级</button>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{breadcrumb === '' ? '—' : breadcrumb}</span>
              </div>
              <div style={{ overflow: 'auto', flex: 1, minHeight: 0 }}>
                {(listing?.entries ?? []).map(entry => (
                  <div
                    key={entry.path}
                    onClick={() => entry.type === 'dir' ? openPath(entry.path) : openFile(entry.path)}
                    style={{ padding: '5px 14px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center', borderBottom: '1px solid ' + COLORS.border }}
                  >
                    <span style={{ width: 14, textAlign: 'center' }}>{entry.type === 'dir' ? '📁' : entry.type === 'link' ? '🔗' : '📄'}</span>
                    <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.name}</span>
                    <span style={{ color: COLORS.muted, fontSize: 11 }}>{entry.type === 'dir' ? '' : humanSize(entry.size)}</span>
                    <span style={{ color: COLORS.muted, fontSize: 11, width: 52, textAlign: 'right' }}>{entry.mode}</span>
                  </div>
                ))}
                {listing != null && listing.entries.length === 0 && <div style={{ padding: 14, color: COLORS.muted }}>空目录</div>}
              </div>
            </div>

            {preview != null && (
              <div style={{ width: '46%', flex: '0 0 46%', borderLeft: '1px solid ' + COLORS.border, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <div style={{ padding: '6px 12px', borderBottom: '1px solid ' + COLORS.border, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>{preview.path}</span>
                  <span style={{ color: COLORS.muted, fontSize: 11 }}>{humanSize(preview.size)}{preview.truncated ? ' · 已截断' : ''}</span>
                  <button style={button()} onClick={() => setPreview(null)}>关闭</button>
                </div>
                <pre style={{ margin: 0, padding: 12, overflow: 'auto', flex: 1, fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{preview.content}</pre>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------- root picker */}
      {pickerOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40 }}>
          <div style={{ width: 560, maxHeight: '70vh', background: COLORS.bg, border: '1px solid ' + COLORS.border, borderRadius: 8, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid ' + COLORS.border, display: 'flex', gap: 8, alignItems: 'center' }}>
              <strong style={{ flex: 1, fontSize: 13 }}>选择工作区根目录</strong>
              <button style={button()} onClick={() => pickerGo(pickerListing?.parent ?? undefined)} disabled={pickerListing?.parent == null}>↑ 上级</button>
              <button style={button()} onClick={() => setPickerOpen(false)}>取消</button>
            </div>
            <div style={{ padding: '6px 12px', color: COLORS.muted, fontSize: 12, borderBottom: '1px solid ' + COLORS.border }}>{pickerListing?.path ?? '…'}</div>
            <div style={{ overflow: 'auto', flex: 1, minHeight: 0 }}>
              {(pickerListing?.entries ?? []).filter(entry => entry.type === 'dir').map(entry => (
                <div key={entry.path} onClick={() => pickerGo(entry.path)} style={{ padding: '5px 12px', cursor: 'pointer', borderBottom: '1px solid ' + COLORS.border }}>📁 {entry.name}</div>
              ))}
            </div>
            <div style={{ padding: 10, borderTop: '1px solid ' + COLORS.border, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                style={button(true)}
                disabled={pickerListing == null}
                onClick={() => pickerListing != null && usePickedRoot(pickerListing.path)}
              >
                使用此目录作为工作区
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
