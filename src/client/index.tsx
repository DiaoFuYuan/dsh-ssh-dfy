/**
 * dsh-ssh-dfy — browser half.
 *
 * Contributes ONE right-sidebar tab: the remote workspace (host picker →
 * workspace root → file tree). The main conversation column is untouched —
 * you chat on the left and browse the server on the right.
 *
 * Failure policy: mounting problems are logged, never thrown.
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import { SshIcon, WorkspacePanel } from './panel'

/** Right-sidebar tab id shared by the tab declaration and its body. */
const TAB_ID = 'ssh-dfy'

/** Services required before the right-sidebar tab can mount. */
export const inject = ['slots', 'sidebarRightTabs']

/** Minimal face of the right-sidebar tab registry. */
interface SidebarRightTabs {
  register(options: Record<string, unknown>): () => void
}

/** Minimal face of the slot registry. */
interface SlotRegistry {
  inject(key: string, callback: () => () => void): () => void
  register(options: Record<string, unknown>, component: unknown): () => void
}

/**
 * Declare the tab type and register its body.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  const face = ctx as unknown as { slots?: SlotRegistry; sidebarRightTabs?: SidebarRightTabs }
  const slots = face.slots
  const tabs = face.sidebarRightTabs
  if (slots === undefined || tabs === undefined) {
    console.warn('[dsh-ssh-dfy] right sidebar services missing; panel not mounted')
    return
  }
  const disposers: Array<() => void> = []
  try {
    disposers.push(tabs.register({
      id: TAB_ID,
      kind: TAB_ID,
      title: () => 'SSH',
      guide: [{
        id: 'ssh-dfy.guide',
        order: 46,
        title: () => 'SSH 远程工作区',
        description: () => '选择主机与工作区根目录，浏览该目录下的所有文件；对话里用 ssh_exec / ssh_ls / ssh_read 操作服务器',
        icon: SshIcon,
      }],
    }))
    disposers.push(slots.inject('sidebar.right.pane.tab', () => slots.register({
      name: 'sidebar.right.pane.tab',
      key: TAB_ID,
    }, WorkspacePanel)))
  } catch (error) {
    console.warn('[dsh-ssh-dfy] right sidebar registration failed:', error)
  }
  ctx.effect(() => () => {
    for (const dispose of disposers.splice(0)) dispose()
  }, 'dsh-ssh-dfy: right sidebar tab')
}
