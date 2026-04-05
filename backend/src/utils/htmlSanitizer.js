/**
 * AccessRepair - HTML Sanitizer
 * Cleans HTML before sending to AI to prevent injection and reduce noise
 */
const sanitizeHtml = require('sanitize-html');

/**
 * Sanitize HTML snippet before sending to AI
 * Strips scripts, styles, and dangerous attributes while preserving structure
 */
function sanitize(html) {
    if (!html || typeof html !== 'string') return '';

    return sanitizeHtml(html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([
            'img', 'button', 'input', 'select', 'textarea', 'form',
            'label', 'fieldset', 'legend', 'nav', 'main', 'header',
            'footer', 'section', 'article', 'aside', 'figure', 'figcaption',
        ]),
        allowedAttributes: {
            '*': ['class', 'id', 'role', 'aria-*', 'tabindex', 'title', 'lang', 'dir'],
            'a': ['href', 'target', 'rel'],
            'img': ['src', 'alt', 'width', 'height'],
            'input': ['type', 'name', 'placeholder', 'value', 'required', 'disabled', 'aria-*'],
            'button': ['type', 'disabled', 'aria-*'],
            'label': ['for'],
            'select': ['name', 'required', 'disabled'],
            'textarea': ['name', 'placeholder', 'required', 'disabled', 'rows', 'cols'],
            'form': ['action', 'method'],
        },
        disallowedTagsMode: 'discard',
    });
}

/**
 * Escape HTML for safe display in frontend
 */
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

module.exports = { sanitize, escapeHtml };
