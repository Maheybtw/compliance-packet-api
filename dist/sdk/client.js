"use strict";
// src/sdk/client.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComplianceClient = createComplianceClient;
/**
 * Minimal client for the Compliance Packet API.
 *
 * Usage:
 *   const client = createComplianceClient({ apiKey: 'cpk_...' });
 *   const packet = await client.check('some text');
 *   const usage = await client.usage();
 */
function createComplianceClient(options) {
    const baseUrl = (options.baseUrl ?? 'http://localhost:4000').replace(/\/+$/, '');
    const apiKey = options.apiKey;
    if (!apiKey || typeof apiKey !== 'string') {
        throw new Error('apiKey is required to create the Compliance client.');
    }
    async function request(path, init) {
        const url = `${baseUrl}${path}`;
        const res = await fetch(url, {
            ...init,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
                ...(init.headers || {}),
            },
        });
        const text = await res.text();
        let json = null;
        if (text) {
            try {
                json = JSON.parse(text);
            }
            catch {
                // leave json as null if it wasn't valid JSON
            }
        }
        if (!res.ok) {
            const message = (json && (json.error || json.message)) ||
                `Request failed with status ${res.status}`;
            const err = new Error(message);
            err.status = res.status;
            err.body = json ?? text;
            throw err;
        }
        return json;
    }
    return {
        /**
         * Check a piece of content and get back a Compliance Packet.
         */
        async check(content) {
            if (!content || typeof content !== 'string') {
                throw new Error('content must be a non-empty string');
            }
            return request('/check', {
                method: 'POST',
                body: JSON.stringify({ content }),
            });
        },
        /**
         * Get simple usage stats for the current API key.
         */
        async usage() {
            return request('/usage', {
                method: 'GET',
            });
        },
    };
}
//# sourceMappingURL=client.js.map