/**
 * dsh-ssh-workspace — browser half.
 *
 * Registers the sidebar row and the center-column page for the SSH workspace,
 * exactly like the shipped panel pages: the shell owns the row box, the label
 * and the panel switch; this module contributes the glyph and the page.
 *
 * Failure policy: mounting problems are logged, never thrown — an external
 * plugin must not take the GUI boot down.
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import { WorkspaceIcon, WorkspacePanel } from './panel'

/** The panel id shared by the sidebar row and the main-slot page. */
export const PANEL_ID = 'ssh-workspace'

/** Row order among the shell's global panel rows. */
const PANEL_ORDER = 45

/** Required service: the slot registry owned by the renderer. */
export const inject = ['slots']

/** Minimal face of the slot registry this plugin uses. */
interface SlotRegistry {
  inject(key: string, callback: () => () => void): () => void
  register(options: Record<string, unknown>, component: unknown): () => void
}

/**
 * Register the sidebar row and the page.
 * @param ctx - client root context (service: slots).
 */
export function apply(ctx: ClientContext): void {
  const slots = (ctx as unknown as { slots?: SlotRegistry }).slots
  if (slots === undefined) {
    console.warn('[dsh-ssh-workspace] slot registry missing; panel not mounted')
    return
  }
  const disposers: Array<() => void> = []
  try {
    disposers.push(slots.inject('sidebar.panellist', () => slots.register({
      name: 'sidebar.panellist',
      id: PANEL_ID,
      order: PANEL_ORDER,
      label: () => 'SSH',
    }, WorkspaceIcon)))
    disposers.push(slots.inject('main', () => slots.register({
      name: 'main',
      key: PANEL_ID,
    }, WorkspacePanel)))
  } catch (error) {
    console.warn('[dsh-ssh-workspace] panel registration failed:', error)
  }
  ctx.effect(() => () => {
    for (const dispose of disposers.splice(0)) dispose()
  }, 'dsh-ssh-workspace: ui mounts')
}
