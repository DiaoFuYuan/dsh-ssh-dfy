import type { WebRoute } from '@deepseek-ai/dsh-host-webserver';
import type { SshEngine } from './engine.js';
import { HostStore } from './store.js';
/** Everything the route family needs. */
export interface RouteDeps {
    /** The host registry. */
    store: HostStore;
    /** The SSH engine. */
    engine: SshEngine;
}
/**
 * Build the /api/dsh-ssh-workspace route family. Every route is loopback-only:
 * these endpoints drive remote servers and store credentials, so a LAN-exposed
 * dsh web deployment must never serve them.
 * @param deps - store and engine.
 * @returns the routes to register on the host webserver.
 */
export declare function makeRoutes(deps: RouteDeps): WebRoute[];
