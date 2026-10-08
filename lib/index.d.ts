/**
 * dsh-ssh-dfy — host half.
 *
 * Mounts the SSH engine (ssh2 connection pool), the /api/dsh-ssh-dfy
 * route family the browser panel drives, and four agent tools (ssh_hosts,
 * ssh_exec, ssh_ls, ssh_read). The browser half (./client) renders the
 * workspace panel: pick a host, pick the workspace root, then browse the tree
 * below it.
 */
import type { Context } from '@deepseek-ai/cordis';
/** Stable cordis plugin name. */
export declare const name = "ssh-dfy";
/** Services required before the SSH surfaces can mount. */
export declare const inject: string[];
/**
 * Mount the engine, the routes and the agent tools.
 * @param ctx - host plugin context carrying webServer/tools.
 */
export declare function apply(ctx: Context): void;
