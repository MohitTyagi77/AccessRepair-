/**
 * Minimal structured logger for backend services.
 * Keeps output JSON-friendly for production log aggregators.
 */

function format(level, message, meta) {
    return {
        ts: new Date().toISOString(),
        level,
        message,
        ...(meta ? { meta } : {}),
    };
}

function info(message, meta) {
    console.log(JSON.stringify(format('info', message, meta)));
}

function warn(message, meta) {
    console.warn(JSON.stringify(format('warn', message, meta)));
}

function error(message, meta) {
    console.error(JSON.stringify(format('error', message, meta)));
}

module.exports = {
    info,
    warn,
    error,
};
