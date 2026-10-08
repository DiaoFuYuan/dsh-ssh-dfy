import type { IncomingMessage } from 'node:http';
/** Whether a socket address is in the IPv4 loopback range (127/8). */
export declare function isIPv4Loopback(address: string): boolean;
/** Whether a socket remote address is loopback (127/8, ::1, IPv4-mapped). */
export declare function isLoopbackAddress(address: string | undefined): boolean;
/** Whether a hostname names the loopback authority. */
export declare function isLoopbackHostname(hostname: string): boolean;
/**
 * Request-level trust fence for the SSH routes: these endpoints drive remote
 * servers, so a LAN-exposed dsh web deployment must never serve them.
 */
export declare function isLoopbackRequest(request: IncomingMessage): boolean;
