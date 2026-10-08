import type { IncomingMessage, OutgoingHttpHeaders, ServerResponse } from 'node:http';
/** Whether a value is a JSON object. */
export declare function isJsonObject(value: unknown): value is Record<string, unknown>;
/**
 * Read a request body as JSON.
 * @returns the parsed object, or null on an empty, oversized or invalid body.
 */
export declare function readJsonObject(req: IncomingMessage, maxBytes?: number): Promise<Record<string, unknown> | null>;
/** Write one JSON response (never cached, never sniffed). */
export declare function writeJson(res: ServerResponse, status: number, body: unknown, headers?: OutgoingHttpHeaders): void;
