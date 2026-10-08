/**
 * The remote workspace tab: pick a host, pick the workspace root on that host,
 * then browse every file below it — inside the right sidebar, next to the
 * conversation. The agent tools default to the same workspace root.
 *
 * The whole surface is one column with four modes (browse / picker / preview /
 * form) so it inherits the sidebar's own background instead of painting one.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { sshApi, type AuthKind, type HostInput, type HostPublic, type RemoteListing } from './api'

/** Tab glyph used by the right-sidebar guide entry. */
export function SshIcon({ size = 16 }: { size?: number; active?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1.75" y="2.75" width="12.5" height="10.5" rx="2.5" />
      <path d="M4.75 6.5l1.9 1.6-1.9 1.6" />
      <path d="M8.4 9.9h2.85" />
    </svg>
  )
}

const SVG = { width: 15, height: 15, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }

function FolderIcon() {
  return <svg {...SVG}><path d="M1.9 4.4a1.5 1.5 0 0 1 1.5-1.5h2.2l1.4 1.6h5.1a1.5 1.5 0 0 1 1.5 1.5v5.6a1.5 1.5 0 0 1-1.5 1.5H3.4a1.5 1.5 0 0 1-1.5-1.5z" /></svg>
}
function FileIcon() {
  return <svg {...SVG}><path d="M9.2 1.9H4.4a1.4 1.4 0 0 0-1.4 1.4v9.4a1.4 1.4 0 0 0 1.4 1.4h7.2a1.4 1.4 0 0 0 1.4-1.4V5.6z" /><path d="M9.2 1.9v3.7h3.8" /></svg>
}
function CodeIcon() {
  return <svg {...SVG}><path d="M9.2 1.9H4.4a1.4 1.4 0 0 0-1.4 1.4v9.4a1.4 1.4 0 0 0 1.4 1.4h7.2a1.4 1.4 0 0 0 1.4-1.4V5.6z" /><path d="M9.2 1.9v3.7h3.8" /><path d="M6.3 8.4L5 9.7l1.3 1.3M9.7 8.4L11 9.7l-1.3 1.3" /></svg>
}
function ImageIcon() {
  return <svg {...SVG}><rect x="2.1" y="3.1" width="11.8" height="9.8" rx="1.4" /><circle cx="5.9" cy="6.4" r="1.1" /><path d="M3 11.4l3-2.6 2.3 2 1.9-1.6 2.8 2.4" /></svg>
}
function ArchiveIcon() {
  return <svg {...SVG}><rect x="2.4" y="2.4" width="11.2" height="3.2" rx="1" /><path d="M3.5 5.6v7.1a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V5.6" /><path d="M8 8v2.4" /></svg>
}
function LinkIcon() {
  return <svg {...SVG}><path d="M6.6 9.4a2.6 2.6 0 0 0 3.7 0l1.9-1.9a2.6 2.6 0 0 0-3.7-3.7l-1 1" /><path d="M9.4 6.6a2.6 2.6 0 0 0-3.7 0L3.8 8.5a2.6 2.6 0 0 0 3.7 3.7l1-1" /></svg>
}
function RefreshIcon() {
  return <svg {...SVG}><path d="M13 8a5 5 0 1 1-1.6-3.7" /><path d="M13.2 2.6v2.8h-2.8" /></svg>
}
function PlusIcon() {
  return <svg {...SVG}><path d="M8 3.6v8.8M3.6 8h8.8" /></svg>
}
function MinusIcon() {
  return <svg {...SVG}><path d="M3.6 8h8.8" /></svg>
}
function UpIcon() {
  return <svg {...SVG}><path d="M8 12.4V3.8" /><path d="M4.2 7.6L8 3.8l3.8 3.8" /></svg>
}
function BackIcon() {
  return <svg {...SVG}><path d="M12.4 8H3.8" /><path d="M7.4 4.2L3.6 8l3.8 3.8" /></svg>
}
function ServerIcon() {
  return <svg {...SVG}><rect x="2.2" y="2.6" width="11.6" height="4.6" rx="1.3" /><rect x="2.2" y="8.8" width="11.6" height="4.6" rx="1.3" /><path d="M4.6 4.9h.01M4.6 11.1h.01" /></svg>
}
function WarningIcon() {
  return <svg {...SVG}><path d="M8 2.6l5.4 9.4H2.6z" /><path d="M8 6.4v2.6M8 11h.01" /></svg>
}
function InboxIcon() {
  return <svg {...SVG} width={26} height={26}><path d="M2 9.4l1.8-5A1.4 1.4 0 0 1 5.1 3.5h5.8a1.4 1.4 0 0 1 1.3.9l1.8 5" /><path d="M2 9.4h3.4l.9 1.8h3.4l.9-1.8H14v3.6a1.4 1.4 0 0 1-1.4 1.4H3.4A1.4 1.4 0 0 1 2 13z" /></svg>
}

/** Extensions rendered with the code glyph. */
const CODE_EXT = new Set(['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'json', 'yml', 'yaml', 'toml', 'ini', 'conf', 'env', 'sh', 'bash', 'zsh', 'py', 'rb', 'go', 'rs', 'java', 'kt', 'c', 'h', 'cpp', 'hpp', 'cs', 'php', 'sql', 'md', 'txt', 'log', 'css', 'scss', 'html', 'xml', 'vue', 'svelte', 'lua', 'pl', 'r'])
const IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'svg', 'avif'])
const ARCHIVE_EXT = new Set(['zip', 'tar', 'gz', 'tgz', 'bz2', 'xz', '7z', 'rar', 'jar', 'war'])

/** Pick the row glyph for one entry. */
function EntryIcon({ entry }: { entry: { type: string; name: string } }) {
  if (entry.type === 'dir') return <span className="dfy-ico dfy-ico--dir"><FolderIcon /></span>
  if (entry.type === 'link') return <span className="dfy-ico dfy-ico--link"><LinkIcon /></span>
  const ext = entry.name.includes('.') ? entry.name.split('.').pop()!.toLowerCase() : ''
  if (IMAGE_EXT.has(ext)) return <span className="dfy-ico dfy-ico--image"><ImageIcon /></span>
  if (ARCHIVE_EXT.has(ext)) return <span className="dfy-ico dfy-ico--archive"><ArchiveIcon /></span>
  if (CODE_EXT.has(ext)) return <span className="dfy-ico dfy-ico--code"><CodeIcon /></span>
  return <span className="dfy-ico"><FileIcon /></span>
}

/** Human-readable byte count. */
function humanSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
}

/** Stylesheet injected once per document. */
const CSS = `
.dfy-root { position: relative; height: 100%; min-height: 0; display: flex; flex-direction: column; font-size: 12px; line-height: 1.55; color: inherit;
  --dfy-line: rgba(127,140,160,.26); --dfy-soft: rgba(127,140,160,.10); --dfy-hover: rgba(127,140,160,.16);
  --dfy-accent: var(--ds-color-accent, #4c6ef5); --dfy-mono: var(--ds-font-family-code, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  --dfy-ease: cubic-bezier(.32,.72,0,1); }
.dfy-root *, .dfy-root *::before, .dfy-root *::after { box-sizing: border-box; }
.dfy-root button { font: inherit; color: inherit; }
.dfy-root input, .dfy-root select { font: inherit; color: inherit; }

.dfy-head { display: flex; align-items: center; gap: 6px; padding: 9px 10px 7px; }
.dfy-head__title { flex: 1; min-width: 0; display: flex; align-items: center; gap: 6px; font-weight: 600; letter-spacing: .01em; }
.dfy-head__title span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dfy-pulse { width: 6px; height: 6px; border-radius: 999px; background: var(--dfy-accent); box-shadow: 0 0 0 3px rgba(76,110,245,.18); flex: none; }

.dfy-btn { display: inline-flex; align-items: center; justify-content: center; gap: 5px; height: 25px; min-width: 25px; padding: 0 8px; border: 1px solid var(--dfy-line);
  border-radius: 7px; background: transparent; cursor: pointer; transition: background .14s var(--dfy-ease), border-color .14s var(--dfy-ease), transform .08s var(--dfy-ease), opacity .14s var(--dfy-ease); }
.dfy-btn:hover:not(:disabled) { background: var(--dfy-hover); }
.dfy-btn:active:not(:disabled) { transform: translateY(1px); }
.dfy-btn:disabled { opacity: .4; cursor: default; }
.dfy-btn--icon { padding: 0; width: 25px; }
.dfy-btn--primary { background: var(--dfy-accent); border-color: transparent; color: #fff; font-weight: 600; }
.dfy-btn--primary:hover:not(:disabled) { background: var(--dfy-accent); filter: brightness(1.1); }
.dfy-btn--block { width: 100%; height: 30px; }

.dfy-bar { display: flex; align-items: center; gap: 6px; padding: 0 10px 9px; }
.dfy-select { flex: 1; min-width: 0; height: 28px; padding: 0 8px; border: 1px solid var(--dfy-line); border-radius: 7px; background: var(--dfy-soft); cursor: pointer;
  transition: border-color .14s var(--dfy-ease), background .14s var(--dfy-ease); }
.dfy-select:hover { border-color: rgba(127,140,160,.45); }
.dfy-select:focus-visible, .dfy-btn:focus-visible, .dfy-field:focus-visible, .dfy-row:focus-visible { outline: 2px solid var(--dfy-accent); outline-offset: 1px; }

.dfy-scope { display: flex; align-items: center; gap: 6px; padding: 7px 10px 9px; border-top: 1px solid var(--dfy-line); border-bottom: 1px solid var(--dfy-line); }
.dfy-scope__label { flex: none; opacity: .6; font-size: 10.5px; letter-spacing: .06em; text-transform: uppercase; }
.dfy-scope__path { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: var(--dfy-mono); font-size: 11px; opacity: .85; }
.dfy-scope__path--unset { opacity: .5; font-style: italic; }

.dfy-crumbs { display: flex; align-items: center; gap: 6px; padding: 7px 10px; }
.dfy-crumbs__path { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; direction: rtl; text-align: left; font-family: var(--dfy-mono); font-size: 11px; opacity: .7; }

.dfy-list { flex: 1; min-height: 0; overflow: auto; padding: 2px 6px 10px; }
.dfy-list::-webkit-scrollbar { width: 8px; }
.dfy-list::-webkit-scrollbar-thumb { background: rgba(127,140,160,.28); border-radius: 999px; }
.dfy-list::-webkit-scrollbar-track { background: transparent; }
.dfy-row { display: flex; align-items: center; gap: 8px; padding: 5px 8px; border-radius: 7px; cursor: pointer; transition: background .1s var(--dfy-ease); }
.dfy-row:hover { background: var(--dfy-hover); }
.dfy-row__name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dfy-row__size { flex: none; font-size: 10.5px; opacity: .55; font-variant-numeric: tabular-nums; }
.dfy-ico { flex: none; width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; opacity: .75; }
.dfy-ico--dir { opacity: 1; color: var(--dfy-accent); }
.dfy-ico--code { opacity: .95; color: #4aa3d8; }
.dfy-ico--image { opacity: .95; color: #3fb98f; }
.dfy-ico--archive { opacity: .95; color: #c08a3e; }
.dfy-ico--link { opacity: .8; color: #9a7ad8; }

.dfy-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 30px 20px; text-align: center; opacity: .62; }
.dfy-empty__hint { font-size: 11.5px; max-width: 230px; }

.dfy-error { display: flex; gap: 8px; margin: 8px 10px; padding: 8px 10px; border: 1px solid rgba(214,69,69,.5); background: rgba(214,69,69,.10); border-radius: 8px; }
.dfy-error__text { flex: 1; min-width: 0; white-space: pre-wrap; word-break: break-word; font-size: 11.5px; }
.dfy-error svg { flex: none; color: #e06a6a; margin-top: 1px; }

.dfy-progress { height: 2px; margin: 0 10px; border-radius: 999px; overflow: hidden; background: var(--dfy-soft); }
.dfy-progress__bar { height: 100%; width: 38%; border-radius: 999px; background: var(--dfy-accent); animation: dfy-slide 1.1s var(--dfy-ease) infinite; }
@keyframes dfy-slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(320%); } }

.dfy-form { flex: 1; min-height: 0; overflow: auto; padding: 4px 10px 12px; display: flex; flex-direction: column; gap: 10px; }
.dfy-field { width: 100%; height: 29px; padding: 0 9px; border: 1px solid var(--dfy-line); border-radius: 7px; background: var(--dfy-soft); transition: border-color .14s var(--dfy-ease); }
.dfy-field:hover { border-color: rgba(127,140,160,.45); }
.dfy-label { display: flex; flex-direction: column; gap: 4px; }
.dfy-label > span { font-size: 10.5px; letter-spacing: .05em; text-transform: uppercase; opacity: .6; }
.dfy-pair { display: flex; gap: 8px; }
.dfy-pair > .dfy-label:first-child { flex: 1; }
.dfy-pair > .dfy-label:last-child { flex: 0 0 74px; }
.dfy-note { font-size: 10.5px; opacity: .55; }

.dfy-preview { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.dfy-preview__meta { display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-top: 1px solid var(--dfy-line); border-bottom: 1px solid var(--dfy-line); }
.dfy-preview__name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: var(--dfy-mono); font-size: 11px; }
.dfy-chip { flex: none; font-size: 10px; padding: 1px 6px; border-radius: 999px; background: var(--dfy-soft); border: 1px solid var(--dfy-line); opacity: .8; }
.dfy-preview__body { flex: 1; min-height: 0; overflow: auto; margin: 0; padding: 10px 12px 14px; font-family: var(--dfy-mono); font-size: 11.5px; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
.dfy-preview__body::-webkit-scrollbar { width: 8px; }
.dfy-preview__body::-webkit-scrollbar-thumb { background: rgba(127,140,160,.28); border-radius: 999px; }

.dfy-foot { padding: 6px 10px 8px; border-top: 1px solid var(--dfy-line); font-size: 10.5px; opacity: .5; }
.dfy-fade { animation: dfy-fade .16s var(--dfy-ease); }
@keyframes dfy-fade { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: none; } }
`

/** Inject the stylesheet once. */
function useStyles(): void {
  useEffect(() => {
    const id = 'dsh-ssh-dfy-style'
    if (document.getElementById(id) !== null) return
    const style = document.createElement('style')
    style.id = id
    style.textContent = CSS
    document.head.appendChild(style)
  }, [])
}

/** Empty host form. */
function emptyForm(): HostInput {
  return { alias: '', host: '', port: 22, user: 'root', auth: 'agent', privateKeyPath: '', password: '', description: '' }
}

type Mode = 'browse' | 'picker' | 'preview' | 'form'

/** The right-sidebar remote workspace tab. */
export function WorkspacePanel() {
  useStyles()
  const [hosts, setHosts] = useState<HostPublic[]>([])
  const [alias, setAlias] = useState('')
  const [root, setRoot] = useState('')
  const [listing, setListing] = useState<RemoteListing | null>(null)
  const [preview, setPreview] = useState<{ path: string; content: string; truncated: boolean; size: number } | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState<Mode>('browse')
  const [form, setForm] = useState<HostInput>(emptyForm())
  const [picker, setPicker] = useState<RemoteListing | null>(null)

  const selected = useMemo(() => hosts.find(host => host.alias === alias), [hosts, alias])

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

  useEffect(() => {
    if (alias === '') { setListing(null); setRoot(''); return }
    const workspace = hosts.find(host => host.alias === alias)?.workspaceRoot ?? ''
    setRoot(workspace)
    setPreview(null)
    setMode('browse')
    void run(async () => { setListing(await sshApi.list(alias, workspace === '' ? undefined : workspace)) })
  }, [alias, hosts, run])

  const openPath = useCallback((path?: string) => {
    if (alias === '') return
    void run(async () => { setListing(await sshApi.list(alias, path)) })
  }, [alias, run])

  const openPicker = useCallback(() => {
    void run(async () => {
      const home = await sshApi.home(alias)
      setPicker(await sshApi.list(alias, home))
      setMode('picker')
    })
  }, [alias, run])

  const pickerGo = useCallback((path?: string) => {
    void run(async () => { setPicker(await sshApi.list(alias, path)) })
  }, [alias, run])

  const usePickedRoot = useCallback((path: string) => {
    if (selected === undefined) return
    void run(async () => {
      await sshApi.saveHost({
        alias: selected.alias, host: selected.host, port: selected.port, user: selected.user,
        auth: selected.auth as AuthKind, privateKeyPath: selected.privateKeyPath,
        workspaceRoot: path, description: selected.description,
      })
      await refreshHosts(alias)
      setRoot(path)
      setListing(await sshApi.list(alias, path))
      setMode('browse')
    })
  }, [alias, refreshHosts, run, selected])

  const saveHost = useCallback(() => {
    void run(async () => {
      const saved = await sshApi.saveHost(form)
      setForm(emptyForm())
      await refreshHosts(saved.alias)
      setMode('browse')
    })
  }, [form, refreshHosts, run])

  const removeHost = useCallback(() => {
    if (alias === '') return
    void run(async () => { await sshApi.deleteHost(alias); await refreshHosts() })
  }, [alias, refreshHosts, run])

  const openFile = useCallback((path: string) => {
    void run(async () => {
      const result = await sshApi.read(alias, path)
      setPreview({ path: result.path, content: result.content, truncated: result.truncated, size: result.size })
      setMode('preview')
    })
  }, [alias, run])

  const back = useCallback(() => { setMode('browse'); setPreview(null) }, [])

  const title = mode === 'form' ? '新增主机' : mode === 'picker' ? '选择工作区根目录' : mode === 'preview' ? '文件预览' : '远程工作区'

  return (
    <div className="dfy-root">
      <div className="dfy-head">
        {mode !== 'browse'
          ? <button className="dfy-btn dfy-btn--icon" onClick={back} title="返回"><BackIcon /></button>
          : <span className="dfy-pulse" />}
        <div className="dfy-head__title"><span>{title}</span></div>
        {mode === 'browse' && (
          <>
            <button className="dfy-btn dfy-btn--icon" onClick={() => openPath(root === '' ? undefined : root)} disabled={alias === '' || busy} title="刷新"><RefreshIcon /></button>
            <button className="dfy-btn dfy-btn--icon" onClick={() => { setForm(emptyForm()); setMode('form') }} title="新增主机"><PlusIcon /></button>
            <button className="dfy-btn dfy-btn--icon" onClick={removeHost} disabled={alias === '' || busy} title="删除当前主机"><MinusIcon /></button>
          </>
        )}
      </div>

      {busy && <div className="dfy-progress"><div className="dfy-progress__bar" /></div>}

      {/* ---------------------------------------------------------- browse */}
      {mode === 'browse' && (
        <>
          <div className="dfy-bar">
            <select className="dfy-select" value={alias} onChange={event => setAlias(event.target.value)}>
              {hosts.length === 0 && <option value="">还没有主机</option>}
              {hosts.map(host => <option key={host.alias} value={host.alias}>{host.alias} · {host.user}@{host.host}:{host.port}</option>)}
            </select>
          </div>
          <div className="dfy-scope">
            <span className="dfy-scope__label">根目录</span>
            <span className={'dfy-scope__path' + (root === '' ? ' dfy-scope__path--unset' : '')} title={root === '' ? '未设置（默认登录家目录）' : root}>
              {root === '' ? '未设置（默认 ~）' : root}
            </span>
            <button className="dfy-btn" onClick={openPicker} disabled={alias === '' || busy}>选择</button>
          </div>
        </>
      )}

      {error !== '' && (
        <div className="dfy-error"><WarningIcon /><div className="dfy-error__text">{error}</div></div>
      )}

      {/* ---------------------------------------------------------- browse list */}
      {mode === 'browse' && (
        <>
          <div className="dfy-crumbs">
            <button className="dfy-btn dfy-btn--icon" onClick={() => listing?.parent != null && openPath(listing.parent)} disabled={listing?.parent == null} title="上一级"><UpIcon /></button>
            <span className="dfy-crumbs__path" title={listing?.path ?? ''}>{listing?.path ?? ''}</span>
          </div>
          <div className="dfy-list">
            {(listing?.entries ?? []).map(entry => (
              <div key={entry.path} className="dfy-row" tabIndex={0}
                onClick={() => entry.type === 'dir' ? openPath(entry.path) : openFile(entry.path)}
                onKeyDown={event => { if (event.key === 'Enter') entry.type === 'dir' ? openPath(entry.path) : openFile(entry.path) }}
                title={entry.name}
              >
                <EntryIcon entry={entry} />
                <span className="dfy-row__name">{entry.name}</span>
                {entry.type !== 'dir' && <span className="dfy-row__size">{humanSize(entry.size)}</span>}
              </div>
            ))}
            {alias === '' && (
              <div className="dfy-empty"><InboxIcon /><div className="dfy-empty__hint">还没有主机。点右上角 <b>+</b> 添加一台服务器，然后选择工作区根目录。</div></div>
            )}
            {alias !== '' && listing != null && listing.entries.length === 0 && !busy && (
              <div className="dfy-empty"><InboxIcon /><div className="dfy-empty__hint">这个目录是空的</div></div>
            )}
          </div>
          <div className="dfy-foot">根目录即 Agent 默认作用域 · ssh_ls / ssh_read / ssh_exec</div>
        </>
      )}

      {/* ---------------------------------------------------------- picker */}
      {mode === 'picker' && (
        <>
          <div className="dfy-crumbs">
            <button className="dfy-btn dfy-btn--icon" onClick={() => pickerGo(picker?.parent ?? undefined)} disabled={picker?.parent == null} title="上一级"><UpIcon /></button>
            <span className="dfy-crumbs__path" title={picker?.path ?? ''}>{picker?.path ?? '…'}</span>
          </div>
          <div className="dfy-list">
            {(picker?.entries ?? []).filter(entry => entry.type === 'dir').map(entry => (
              <div key={entry.path} className="dfy-row" tabIndex={0} onClick={() => pickerGo(entry.path)}>
                <EntryIcon entry={entry} />
                <span className="dfy-row__name">{entry.name}</span>
              </div>
            ))}
            {picker != null && picker.entries.filter(entry => entry.type === 'dir').length === 0 && (
              <div className="dfy-empty"><InboxIcon /><div className="dfy-empty__hint">这里没有子目录</div></div>
            )}
          </div>
          <div style={{ padding: '0 10px 10px' }}>
            <button className="dfy-btn dfy-btn--primary dfy-btn--block" disabled={picker == null || busy} onClick={() => picker != null && usePickedRoot(picker.path)}>
              使用此目录作为工作区
            </button>
          </div>
        </>
      )}

      {/* ---------------------------------------------------------- preview */}
      {mode === 'preview' && preview != null && (
        <div className="dfy-preview dfy-fade">
          <div className="dfy-preview__meta">
            <EntryIcon entry={{ type: 'file', name: preview.path }} />
            <span className="dfy-preview__name" title={preview.path}>{preview.path.split('/').pop()}</span>
            <span className="dfy-chip">{humanSize(preview.size)}{preview.truncated ? '+' : ''}</span>
          </div>
          <pre className="dfy-preview__body">{preview.content}</pre>
        </div>
      )}

      {/* ---------------------------------------------------------- form */}
      {mode === 'form' && (
        <div className="dfy-form dfy-fade">
          <label className="dfy-label"><span>别名（工具里用）</span>
            <input className="dfy-field" value={form.alias} placeholder="prod" onChange={event => setForm({ ...form, alias: event.target.value })} /></label>
          <label className="dfy-label"><span>主机 / IP</span>
            <input className="dfy-field" value={form.host} placeholder="10.0.0.9" onChange={event => setForm({ ...form, host: event.target.value })} /></label>
          <div className="dfy-pair">
            <label className="dfy-label"><span>用户名</span>
              <input className="dfy-field" value={form.user} onChange={event => setForm({ ...form, user: event.target.value })} /></label>
            <label className="dfy-label"><span>端口</span>
              <input className="dfy-field" value={String(form.port)} onChange={event => setForm({ ...form, port: Number(event.target.value) || 22 })} /></label>
          </div>
          <label className="dfy-label"><span>认证方式</span>
            <select className="dfy-field" value={form.auth} onChange={event => setForm({ ...form, auth: event.target.value as AuthKind })}>
              <option value="agent">ssh-agent（推荐）</option>
              <option value="key">私钥文件</option>
              <option value="password">密码</option>
            </select></label>
          {form.auth === 'key' && (
            <label className="dfy-label"><span>私钥路径（本机）</span>
              <input className="dfy-field" placeholder="C:\\Users\\you\\.ssh\\id_ed25519" value={form.privateKeyPath ?? ''} onChange={event => setForm({ ...form, privateKeyPath: event.target.value })} /></label>
          )}
          {form.auth === 'password' && (
            <label className="dfy-label"><span>密码</span>
              <input className="dfy-field" type="password" value={form.password ?? ''} onChange={event => setForm({ ...form, password: event.target.value })} /></label>
          )}
          <div className="dfy-note">密码/口令存放在本机 $DSH_HOME/dsh-ssh-dfy/hosts.json（0600），不会返回给 Agent 或浏览器。</div>
          <button className="dfy-btn dfy-btn--primary dfy-btn--block" onClick={saveHost} disabled={busy || form.alias === '' || form.host === ''}>保存主机</button>
        </div>
      )}
    </div>
  )
}
