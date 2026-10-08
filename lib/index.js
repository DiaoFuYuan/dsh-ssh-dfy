import { HostStore } from './store.js';
import { SshEngine } from './engine.js';
import { makeRoutes } from './routes.js';
import { sshExecTool, sshHostsTool, sshLsTool, sshReadTool } from './tools.js';
/** Stable cordis plugin name. */
export const name = 'ssh-workspace';
/** Services required before the SSH surfaces can mount. */
export const inject = ['webServer', 'tools'];
/**
 * Mount the engine, the routes and the agent tools.
 * @param ctx - host plugin context carrying webServer/tools.
 */
export function apply(ctx) {
    const store = new HostStore();
    const engine = new SshEngine(store);
    ctx.effect(() => () => { engine.dispose(); }, 'dsh-ssh-workspace: engine');
    ctx.effect(() => {
        const disposers = makeRoutes({ store, engine }).map(route => ctx.webServer.register(route));
        return () => { for (const dispose of disposers)
            dispose(); };
    }, 'dsh-ssh-workspace: routes');
    ctx.effect(() => {
        const tools = [
            sshHostsTool(engine),
            sshExecTool(engine),
            sshLsTool(engine),
            sshReadTool(engine),
        ];
        const disposers = tools.map(tool => ctx.tools.register(tool));
        return () => { for (const dispose of disposers)
            dispose(); };
    }, 'dsh-ssh-workspace: tools');
}
