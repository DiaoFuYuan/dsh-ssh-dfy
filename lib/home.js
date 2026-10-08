import { homedir } from 'node:os';
import { isAbsolute, join } from 'node:path';
/** Resolve the dsh home directory: DSH_HOME wins, ~/.dsh otherwise. */
export function dshHome() {
    const raw = process.env.DSH_HOME;
    if (raw !== undefined && raw.trim() !== '') {
        const trimmed = raw.trim();
        const expanded = trimmed === '~'
            ? homedir()
            : trimmed.startsWith('~/') || trimmed.startsWith('~\\')
                ? join(homedir(), trimmed.slice(2))
                : trimmed;
        return isAbsolute(expanded) ? expanded : join(process.cwd(), expanded);
    }
    return join(homedir(), '.dsh');
}
/** Absolute path of the host registry file (created on first write). */
export function hostsFile() {
    return join(dshHome(), 'dsh-ssh-workspace', 'hosts.json');
}
