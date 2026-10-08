import type { ExecResult, HostRecord, ReadResult, RemoteListing } from './protocol.js';
import type { HostStore } from './store.js';
/**
 * The SSH engine: one lazily connected ssh2 client per host alias, reused for
 * every exec / SFTP call until the connection drops. The web browser and the
 * agent share this pool, so a host configured in the GUI is immediately
 * operable through the tools.
 */
export declare class SshEngine {
    private readonly store;
    private readonly pool;
    /**
     * @param store - the host registry the pool resolves aliases through.
     */
    constructor(store: HostStore);
    /** Host summaries without secrets. */
    list(query?: string): HostRecord[];
    /** Run one shell command on a remote host. */
    exec(alias: string, command: string, timeoutMs?: number, signal?: AbortSignal): Promise<ExecResult>;
    /** The remote home directory of the login user. */
    remoteHome(alias: string): Promise<string>;
    /** Read one remote directory over SFTP. */
    listDir(alias: string, path?: string): Promise<RemoteListing>;
    /** Read one remote file over SFTP, capped. */
    readFile(alias: string, path: string, maxBytes?: number): Promise<ReadResult>;
    /** Close every pooled connection. */
    dispose(): void;
    /** The pooled client for one alias, connecting on first use. */
    private client;
    /** An SFTP session on the pooled connection. */
    private sftp;
}
/** Absolute-ize a remote path without touching the local filesystem. */
export declare function normalizeRemotePath(path: string): string;
