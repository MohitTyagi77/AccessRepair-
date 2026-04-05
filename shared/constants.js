/**
 * AccessRepair - Shared Constants
 * Used by both frontend and backend
 */

// Severity weights for scoring engine
const SEVERITY_WEIGHTS = {
  critical: 10,
  serious: 5,
  moderate: 2,
  minor: 1,
};

// Score thresholds for UI color coding
const SCORE_THRESHOLDS = {
  GOOD: 80,       // green
  MODERATE: 50,   // yellow/orange
  POOR: 0,        // red
};

// Monetization tier limits
const TIER_LIMITS = {
  free: {
    scansPerDay: 1,
    aiFixes: 5,
  },
  pro: {
    scansPerDay: Infinity,
    aiFixes: Infinity,
  },
};

// Element importance weights for priority engine
const ELEMENT_IMPORTANCE = {
  button: 8,
  a: 8,
  input: 9,
  select: 9,
  textarea: 9,
  form: 10,
  nav: 7,
  img: 6,
  h1: 7,
  h2: 6,
  h3: 5,
  table: 5,
  label: 7,
  default: 3,
};

// Scan status messages for SSE streaming
const SCAN_STAGES = {
  LAUNCHING: 'Launching browser...',
  NAVIGATING: 'Navigating to URL...',
  WAITING: 'Waiting for page to load...',
  SCANNING: 'Running accessibility scan...',
  SCORING: 'Calculating accessibility score...',
  PRIORITIZING: 'Prioritizing violations...',
  AI_FIXING: 'Generating AI fixes...',
  SAVING: 'Saving results...',
  COMPLETE: 'Scan complete!',
  ERROR: 'Scan failed',
};

module.exports = {
  SEVERITY_WEIGHTS,
  SCORE_THRESHOLDS,
  TIER_LIMITS,
  ELEMENT_IMPORTANCE,
  SCAN_STAGES,
};
