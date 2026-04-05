/**
 * AccessRepair - Shared Type Definitions (JSDoc)
 *
 * @typedef {Object} ScanResult
 * @property {number} id
 * @property {string} url
 * @property {number} score
 * @property {string} createdAt
 * @property {ViolationResult[]} violations
 *
 * @typedef {Object} ViolationResult
 * @property {number} id
 * @property {string} severity - 'critical' | 'serious' | 'moderate' | 'minor'
 * @property {string} description
 * @property {string} html - original HTML snippet
 * @property {string} selector - CSS selector
 * @property {string} helpUrl - axe-core help URL
 * @property {number} priorityScore
 * @property {AIFix|null} fix
 *
 * @typedef {Object} AIFix
 * @property {string} fixedHtml
 * @property {string} explanation
 * @property {number} confidence - 0.0 to 1.0
 * @property {string} rootCause
 * @property {string} affectedUsers
 *
 * @typedef {Object} ChatMessage
 * @property {'user'|'assistant'} role
 * @property {string} content
 * @property {string} timestamp
 *
 * @typedef {Object} ScanProgress
 * @property {string} stage
 * @property {string} message
 * @property {number} progress - 0 to 100
 */

module.exports = {};
