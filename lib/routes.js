import { writeJson, readJsonObject } from './http.js';
import { isLoopbackRequest } from './loopback.js';
import { API } from './protocol.js';
import { HostStore } from './store.js';
/** First value of one query parameter. */
function query(url, name) {
    const value = url.searchParams.get(name);
    return value === null ? undefined : value;
}
/**
 * Build the /api/dsh-ssh-dfy route family. Every route is loopback-only:
 * these endpoints drive remote servers and store credentials, so a LAN-exposed
 * dsh web deployment must never serve them.
 * @param deps - store and engine.
 * @returns the routes to register on the host webserver.
 */
export function makeRoutes(deps) {
    const { store, engine } = deps;
    /** Loopback fence shared by every handler. */
    const fence = (req, res) => {
        if (!isLoopbackRequest(req)) {
            writeJson(res, 403, { error: 'forbidden: loopback-only' });
            return false;
        }
        return true;
    };
    return [
        {
            kind: 'exact',
            path: API.hosts,
            handler: async (req, res) => {
                if (!fence(req, res))
                    return;
                const method = req.method ?? 'GET';
                const url = new URL(req.url ?? '/', 'http://localhost');
                if (method === 'GET') {
                    writeJson(res, 200, { hosts: engine.list(query(url, 'query')).map(HostStore.toPublic) });
                    return;
                }
                if (method === 'POST') {
                    const body = await readJsonObject(req);
                    if (body === null) {
                        writeJson(res, 400, { error: 'invalid JSON body' });
                        return;
                    }
                    try {
                        const record = store.upsert(body);
                        writeJson(res, 201, { host: HostStore.toPublic(record) });
                    }
                    catch (error) {
                        writeJson(res, 400, { error: error instanceof Error ? error.message : String(error) });
                    }
                    return;
                }
                if (method === 'DELETE') {
                    const alias = query(url, 'alias');
                    if (alias === undefined) {
                        writeJson(res, 400, { error: 'alias is required' });
                        return;
                    }
                    writeJson(res, 200, { removed: store.remove(alias) });
                    return;
                }
                writeJson(res, 405, { error: 'method not allowed: ' + method });
            },
        },
        {
            kind: 'exact',
            path: API.home,
            handler: async (req, res) => {
                if (!fence(req, res))
                    return;
                if (req.method !== 'GET') {
                    writeJson(res, 405, { error: 'method not allowed: ' + (req.method ?? '') });
                    return;
                }
                const url = new URL(req.url ?? '/', 'http://localhost');
                const alias = query(url, 'alias');
                if (alias === undefined) {
                    writeJson(res, 400, { error: 'alias is required' });
                    return;
                }
                try {
                    writeJson(res, 200, { path: await engine.remoteHome(alias) });
                }
                catch (error) {
                    writeJson(res, 502, { error: error instanceof Error ? error.message : String(error) });
                }
            },
        },
        {
            kind: 'exact',
            path: API.list,
            handler: async (req, res) => {
                if (!fence(req, res))
                    return;
                if (req.method !== 'GET') {
                    writeJson(res, 405, { error: 'method not allowed: ' + (req.method ?? '') });
                    return;
                }
                const url = new URL(req.url ?? '/', 'http://localhost');
                const alias = query(url, 'alias');
                if (alias === undefined) {
                    writeJson(res, 400, { error: 'alias is required' });
                    return;
                }
                const host = store.get(alias);
                const target = query(url, 'path') ?? host?.workspaceRoot;
                try {
                    writeJson(res, 200, await engine.listDir(alias, target));
                }
                catch (error) {
                    writeJson(res, 502, { error: error instanceof Error ? error.message : String(error) });
                }
            },
        },
        {
            kind: 'exact',
            path: API.read,
            handler: async (req, res) => {
                if (!fence(req, res))
                    return;
                if (req.method !== 'GET') {
                    writeJson(res, 405, { error: 'method not allowed: ' + (req.method ?? '') });
                    return;
                }
                const url = new URL(req.url ?? '/', 'http://localhost');
                const alias = query(url, 'alias');
                const path = query(url, 'path');
                if (alias === undefined || path === undefined) {
                    writeJson(res, 400, { error: 'alias and path are required' });
                    return;
                }
                const maxBytes = Number(query(url, 'maxBytes') ?? '');
                try {
                    writeJson(res, 200, await engine.readFile(alias, path, Number.isFinite(maxBytes) && maxBytes > 0 ? maxBytes : undefined));
                }
                catch (error) {
                    writeJson(res, 502, { error: error instanceof Error ? error.message : String(error) });
                }
            },
        },
    ];
}
