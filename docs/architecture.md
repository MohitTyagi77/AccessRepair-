# AccessRepair - Architecture

## Overview

AccessRepair is an AI-powered accessibility auditor that scans websites, identifies accessibility violations, and provides AI-generated fixes using Google's Gemini API.

## Data Flow

```
User enters URL → Frontend → POST /api/scan (SSE) → Backend Pipeline:
  1. Playwright launches browser
  2. Navigates to URL
  3. axe-core scans for violations
  4. Scoring engine calculates score
  5. Priority engine ranks violations
  6. Gemini AI generates fixes
  7. Results saved to SQLite
  8. Response streamed back via SSE
```

## Backend Services

| Service | File | Responsibility |
|---------|------|----------------|
| Scan | `scanService.js` | Playwright + axe-core analysis |
| Score | `scoring.js` | Weighted accessibility score |
| Priority | `priorityEngine.js` | Smart violation ranking |
| AI Fix | `aiFixService.js` | Gemini-powered HTML fixes |
| AI Chat | `aiChatService.js` | Context-aware chat assistant |

## Frontend Panels

| Panel | Purpose |
|-------|---------|
| Score | Circular progress with trend |
| Violations | Grouped + sorted violation list |
| Repair | Split diff view (broken → fixed) |
| Insights | Root cause + affected users |
| Simulation | Screen reader, low vision, color blindness |
| Timeline | Score history graph |
| Chat | AI accessibility assistant |

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, React Query, Recharts
- **Backend**: Node.js, Express, Playwright, axe-core
- **AI**: Google Gemini API
- **Database**: SQLite + Prisma ORM
