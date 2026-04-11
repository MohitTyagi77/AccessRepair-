const dns = require('dns').promises;
const net = require('net');

/**
 * @typedef {{ valid: true, normalizedUrl: string, resolvedAddresses: string[] }} UrlValidationSuccess
 * @typedef {{ valid: false, reason: string }} UrlValidationFailure
 * @typedef {UrlValidationSuccess | UrlValidationFailure} UrlValidationResult
 */

const BLOCKED_HOSTNAMES = new Set(['localhost', 'localhost.localdomain']);

function isPrivateIPv4(ip) {
    const [a, b] = ip.split('.').map(Number);
    return (
        a === 0 ||
        a === 10 ||
        (a === 100 && b >= 64 && b <= 127) || // carrier-grade NAT
        a === 127 ||
        (a === 169 && b === 254) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 0) ||
        (a === 192 && b === 168) ||
        a >= 224 // multicast/reserved
    );
}

function isPrivateIPv6(ip) {
    const normalized = ip.toLowerCase();
    return (
        normalized === '::1' ||
        normalized === '::' ||
        normalized.startsWith('fc') ||
        normalized.startsWith('fd') ||
        normalized.startsWith('fe80') ||
        normalized.startsWith('ff')
    );
}

function isDisallowedIp(ip) {
    if (net.isIPv4(ip)) return isPrivateIPv4(ip);
    if (net.isIPv6(ip)) return isPrivateIPv6(ip);
    return true;
}

/**
 * Validate URL safety to prevent SSRF targets.
 *
 * @param {string} rawUrl
 * @returns {Promise<UrlValidationResult>}
 */
async function validateScanUrl(rawUrl) {
    let parsed;

    try {
        parsed = new URL(rawUrl);
    } catch {
        return { valid: false, reason: 'Invalid URL format. Please include http:// or https://' };
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
        return { valid: false, reason: 'Only http:// and https:// URLs are supported' };
    }

    if (!parsed.hostname) {
        return { valid: false, reason: 'URL must include a valid hostname' };
    }

    if (parsed.username || parsed.password) {
        return { valid: false, reason: 'URLs with embedded credentials are not allowed' };
    }

    const hostname = parsed.hostname.toLowerCase();
    if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith('.localhost')) {
        return { valid: false, reason: 'Localhost targets are not allowed' };
    }

    const resolvedAddresses = [];

    if (net.isIP(hostname)) {
        if (isDisallowedIp(hostname)) {
            return { valid: false, reason: 'Private/internal IP ranges are blocked for security reasons' };
        }
        resolvedAddresses.push(hostname);
        return { valid: true, normalizedUrl: parsed.toString(), resolvedAddresses };
    }

    try {
        const records = await dns.lookup(hostname, { all: true, verbatim: true });
        if (!records.length) {
            return { valid: false, reason: 'Hostname could not be resolved' };
        }

        for (const record of records) {
            if (isDisallowedIp(record.address)) {
                return { valid: false, reason: 'Hostname resolves to a private/internal IP range' };
            }
            resolvedAddresses.push(record.address);
        }
    } catch {
        return { valid: false, reason: 'Hostname could not be resolved' };
    }

    return { valid: true, normalizedUrl: parsed.toString(), resolvedAddresses };
}

module.exports = { validateScanUrl };
