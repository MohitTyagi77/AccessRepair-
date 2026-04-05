# AccessRepair - Setup Guide

## Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

## Quick Start

### 1. Clone & Install

```bash
cd accessrepair
npm run install:all
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:
```
GEMINI_API_KEY=your_key_here
```

Get a key from: https://aistudio.google.com/app/apikey

### 3. Install Playwright Browser

```bash
cd backend
npx playwright install chromium
```

### 4. Setup Database

```bash
cd backend
npx prisma migrate dev --name init
```

### 5. Run Development Servers

From the root directory:
```bash
npm run dev
```

Or run separately:
```bash
# Terminal 1 - Backend (port 3001)
npm run dev:backend

# Terminal 2 - Frontend (port 5173)
npm run dev:frontend
```

### 6. Open Application

Navigate to `http://localhost:5173`

## Project Structure

```
/accessrepair
├── /frontend      React + Vite + Tailwind
├── /backend       Node.js + Express + Prisma
├── /shared        Types & constants
└── /docs          Documentation
```

## Troubleshooting

- **Playwright fails**: Run `npx playwright install --with-deps chromium`
- **Prisma errors**: Delete `backend/prisma/dev.db` and re-run migrate
- **AI features not working**: Verify GEMINI_API_KEY is set correctly
