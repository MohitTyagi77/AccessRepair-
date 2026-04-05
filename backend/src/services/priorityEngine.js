/**
 * AccessRepair - Priority Engine
 * Calculates priority score for each violation to determine fix order
 */
const { SEVERITY_WEIGHTS, ELEMENT_IMPORTANCE } = require('../../../shared/constants');

/**
 * Calculate priority score for a single violation node
 * Factors: severity, element importance, DOM position, repetition
 *
 * @param {Object} violation
 * @param {string} violation.severity
 * @param {string} violation.html
 * @param {string} violation.selector
 * @param {number} repetitionCount - How many times this rule was violated
 * @param {number} index - Index in the DOM (lower = higher on page)
 * @param {number} totalNodes - Total nodes on page
 * @returns {number} priorityScore (0-100)
 */
function calculatePriority(violation, repetitionCount = 1, index = 0, totalNodes = 100) {
    // 1. Severity weight (0-40 points)
    const severityScore = (SEVERITY_WEIGHTS[violation.severity] || 1) * 4;

    // 2. Element importance (0-30 points)
    const tagMatch = violation.html.match(/^<(\w+)/);
    const tagName = tagMatch ? tagMatch[1].toLowerCase() : 'default';
    const elementScore = ((ELEMENT_IMPORTANCE[tagName] || ELEMENT_IMPORTANCE.default) / 10) * 30;

    // 3. DOM position - above fold gets higher priority (0-15 points)
    const positionRatio = totalNodes > 0 ? 1 - (index / totalNodes) : 1;
    const positionScore = positionRatio * 15;

    // 4. Repetition frequency - more common = higher priority (0-15 points)
    const repetitionScore = Math.min(repetitionCount / 5, 1) * 15;

    const total = Math.round(severityScore + elementScore + positionScore + repetitionScore);
    return Math.min(100, Math.max(0, total));
}

/**
 * Prioritize a flat list of violations
 * @param {Array} violations - Array of { severity, html, selector, ruleId, description, ... }
 * @returns {Array} Sorted violations with priorityScore added
 */
function prioritizeViolations(violations) {
    // Count repetitions per ruleId
    const ruleCounts = {};
    for (const v of violations) {
        ruleCounts[v.ruleId] = (ruleCounts[v.ruleId] || 0) + 1;
    }

    // Calculate priority for each violation
    const prioritized = violations.map((v, index) => ({
        ...v,
        priorityScore: calculatePriority(v, ruleCounts[v.ruleId] || 1, index, violations.length),
    }));

    // Sort by priority (highest first)
    prioritized.sort((a, b) => b.priorityScore - a.priorityScore);

    return prioritized;
}

module.exports = { calculatePriority, prioritizeViolations };
