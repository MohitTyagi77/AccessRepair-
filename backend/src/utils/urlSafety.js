const dns = require('dns').promises;
const net = require('net');

function isPrivateIPv4(ip) {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(Number.isNaN)) return false;

    return (
        parts[0] === 10 ||
        (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
        (parts[0] === 192 && parts[1] === 168) ||
        parts[0] === 127 ||
        (parts[0] === 169 && parts[1] === 254)
    );
}

function isPrivateIPv6(ip) {
    const normalized = ip.toLowerCase();
    return (
        normalized === '::1' ||
        normalized.startsWith('fc') ||
        normalized.startsWith('fd') ||
        normalized.startsWith('fe80')
    );
}

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

    const lowerHost = parsed.hostname.toLowerCase();
    if (lowerHost === 'localhost' || lowerHost.endsWith('.localhost')) {
        return { valid: false, reason: 'Localhost targets are not allowed' };
    }

    if (net.isIP(lowerHost)) {
        const blocked = net.isIPv4(lowerHost) ? isPrivateIPv4(lowerHost) : isPrivateIPv6(lowerHost);
        if (blocked) {
            return { valid: false, reason: 'Private/internal IP ranges are blocked for security reasons' };
        }
        return { valid: true, normalizedUrl: parsed.toString() };
    }

    try {
        const records = await dns.lookup(parsed.hostname, { all: true, verbatim: true });
        for (const record of records) {
            if ((record.family === 4 && isPrivateIPv4(record.address)) ||
                (record.family === 6 && isPrivateIPv6(record.address))) {
                return { valid: false, reason: 'Hostname resolves to a private/internal IP range' };
            }
        }
    } catch {
        return { valid: false, reason: 'Hostname could not be resolved' };
    }

    return { valid: true, normalizedUrl: parsed.toString() };
}

module.exports = { validateScanUrl };
