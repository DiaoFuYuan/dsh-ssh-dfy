/** Resolve the dsh home directory: DSH_HOME wins, ~/.dsh otherwise. */
export declare function dshHome(): string;
/** Absolute path of the host registry file (created on first write). */
export declare function hostsFile(): string;
