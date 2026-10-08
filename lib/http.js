/** Default JSON body cap: 256 KiB (host forms are small). */
const DEFAULT_BODY_MAX_BYTES = 256 * 1024;
/** Whether a value is a JSON object. */
export function isJsonObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
/**
 * Read a request body as JSON.
 * @returns the parsed object, or null on an empty, oversized or invalid body.
 */
export async function readJsonObject(req, maxBytes = DEFAULT_BODY_MAX_BYTES) {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
        const buffer = chunk;
        size += buffer.length;
        if (size > maxBytes) {
            req.destroy();
            return null;
        }
        chunks.push(buffer);
    }
    const text = Buffer.concat(chunks).toString('utf8');
    if (text === '')
        return null;
    try {
        const parsed = JSON.parse(text);
        return isJsonObject(parsed) ? parsed : null;
    }
    catch {
        return null;
    }
}
/** Write one JSON response (never cached, never sniffed). */
export function writeJson(res, status, body, headers = {}) {
    res.writeHead(status, {
        'content-type': 'application/json; charset=utf-8',
        'referrer-policy': 'no-referrer',
        'cache-control': 'no-store',
        ...headers,
    });
    res.end(JSON.stringify(body));
}
