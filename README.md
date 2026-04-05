# AccessRepair 🛡️✨

**AI-powered accessibility auditor and auto-fixer.** Stop manually auditing WCAG violations. AccessRepair uses Playwright and axe-core to find issues, and Google Gemini (or OpenAI/Claude) to fix them instantly.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![React](https://img.shields.io/badge/react-19.0.0-61dafb.svg)

## 🚀 Features

- **Deep Scanning**: WCAG 2.1 AA compliance scans using Playwright + axe-core.
- **AI Auto-Fix**: LLM-powered HTML fixes with root cause analysis and affected user insights.
- **Smart Priority**: Violations ranked by severity, effort to fix, and user impact.
- **Accessibility Simulation**: View your site through screen reader, low vision, and color blindness filters.
- **AI Chat Assistant**: Context-aware AI helper to guide you through complex remediation.
- **QA Improvement Loop**: Self-improving prompt engine that learns from failure patterns.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, React Query, Recharts, Lucide.
- **Backend**: Node.js, Express, Playwright, axe-core.
- **AI Engine**: Multi-provider support (Google Gemini 1.5/2.0, OpenAI GPT-4o, Anthropic Claude 3.5).
- **Database**: SQLite + Prisma ORM for scan history and violation tracking.

## 📦 Installation

### Prerequisites
- Node.js (v18+)
- A Google Gemini API Key (Default) or OpenAI/Anthropic keys.

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/accessrepair.git
cd accessrepair
```

### 2. Install dependencies
```bash
npm run install:all
```

### 3. Configure environment variables
Create a `.env` file in the root or in `backend/`:
```env
# AI Configuration
AI_PROVIDER=gemini # or 'openai', 'claude'
GEMINI_API_KEY=your_key_here
# OPENAI_API_KEY=your_key_here
# ANTHROPIC_API_KEY=your_key_here

# Database
DATABASE_URL="file:./dev.db"
```

### 4. Initialize Database
```bash
npm run db:generate
npm run db:migrate
```

## 🚀 Running the App

### Development Mode
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

### Production Build
```bash
# Frontend
cd frontend && npm run build
# Backend
cd backend && npm run start
```

## 🧠 QA Auto-Improvement Loop

AccessRepair features an advanced "LLM-as-a-judge" loop to improve its own fixes. To run the QA loop:
```bash
cd backend
npm run qa
```
This will:
1. Scan a set of predefined test URLs.
2. Generate AI fixes.
3. Use a separate LLM judge to evaluate fix quality.
4. If failures are detected, it **automatically rewrites** its own base prompt to prevent future errors.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
Built with ❤️ for a more inclusive web.
