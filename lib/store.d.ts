import type { AuthKind, HostPublic, HostRecord } from './protocol.js';
/** Input accepted by {@link HostStore.upsert}. */
export interface HostInput {
    alias: string;
    host: string;
    port?: number;
    user: string;
    auth?: AuthKind;
    privateKeyPath?: string;
    passphrase?: string;
    password?: string;
    workspaceRoot?: string;
    description?: string;
}
/**
 * The host registry: a small JSON document under $DSH_HOME/dsh-ssh-dfy.
 * Secrets (password, passphrase) live here and are never projected into any
 * agent-facing or browser-facing view.
 */
export declare class HostStore {
    private readonly file;
    /**
     * @param file - registry path override (tests pass a temp file).
     */
    constructor(file?: string);
    /** Every stored host, in insertion order. */
    list(): HostRecord[];
    /** One host by alias, or undefined. */
    get(alias: string): HostRecord | undefined;
    /** Create or replace one host; returns the stored record. */
    upsert(input: HostInput): HostRecord;
    /** Delete one host; true when a record was removed. */
    remove(alias: string): boolean;
    /** Set (or clear) the workspace root of one host. */
    setWorkspaceRoot(alias: string, root: string | undefined): HostRecord;
    /** Secret-free projection for the agent and the browser. */
    static toPublic(record: HostRecord): HostPublic;
    /** Read the registry; a missing or corrupt file reads as empty. */
    private readAll;
    /** Write the registry atomically, 0600 inside a 0700 directory. */
    private writeAll;
}
