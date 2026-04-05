/**
 * AccessRepair - Scoring Engine
 * Calculates weighted accessibility score from 0-100
 */
const { SEVERITY_WEIGHTS } = require('../../../shared/constants');

/**
 * Calculate accessibility score based on violations
 * Formula: Score = 100 - ((penalty / totalElements) * 100), clamped [0, 100]
 *
 * @param {Array} violations - Flat list of violations with severity
 * @param {number} totalElements - Total elements analyzed
 * @returns {{ score: number, breakdown: Object }}
 */
function calculateScore(violations, totalElements) {
    if (totalElements === 0) {
        return { score: 100, breakdown: { critical: 0, serious: 0, moderate: 0, minor: 0 } };
    }

    const breakdown = { critical: 0, serious: 0, moderate: 0, minor: 0 };
    let totalPenalty = 0;

    for (const violation of violations) {
        const weight = SEVERITY_WEIGHTS[violation.severity] || SEVERITY_WEIGHTS.minor;
        const count = violation.nodeCount || 1;
        breakdown[violation.severity] = (breakdown[violation.severity] || 0) + count;
        totalPenalty += weight * count;
    }

    // Calculate score, clamped between 0 and 100
    const rawScore = 100 - ((totalPenalty / totalElements) * 100);
    const score = Math.round(Math.max(0, Math.min(100, rawScore)));

    return { score, breakdown };
}

module.exports = { calculateScore };
