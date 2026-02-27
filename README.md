# PortfolifyAI

**AI-powered portfolio & resume builder** — Build stunning portfolios, craft ATS-optimized resumes, generate case studies, and get AI-driven career recommendations.

## ✨ Features

### Core Tools
- **Resume Builder** — Step-by-step form with live preview and PDF export
- **Portfolio Builder** — Customizable themes, colors, fonts, and one-click publish
- **Case Study Generator** — AI-generated project case studies from your inputs
- **JD Analyzer** — Match your resume against job descriptions with ATS scoring
- **Recommendations** — Personalized career improvement action items

### AI-Powered (8 Features)
- ✨ **AI Resume Summary** — Auto-generate a professional summary
- ✨ **AI Bullet Enhancer** — Rewrite experience bullets with impact metrics
- ✨ **AI Skill Suggestions** — Get 8-12 missing skills suggested for your role
- ✨ **AI Portfolio Bio** — Generate a tagline & about section for your portfolio
- ✨ **AI Cover Letter** — Generate tailored cover letters from resume + job description
- ✨ **AI JD Match Analysis** — Score how well your resume matches a job posting
- ✨ **AI Case Study Writer** — Turn project details into polished case studies
- ✨ **AI Career Coach** — Get actionable recommendations to boost your profile

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS, Vite |
| Backend | Python, FastAPI, Pydantic |
| Database | MongoDB Atlas |
| AI | Groq API (Llama 3.3 70B) |
| Auth | Google OAuth 2.0 + JWT |
| Deploy | Vercel (frontend), local/cloud (backend) |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB Atlas account
- Groq API key ([console.groq.com](https://console.groq.com))
- Google OAuth Client ID ([console.cloud.google.com](https://console.cloud.google.com))

### 1. Clone the repo
```bash
git clone https://github.com/nvk170405/PortfolifyAI.git
cd PortfolifyAI
```

### 2. Frontend setup
```bash
npm install
```

Create a `.env` file in the root:
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 3. Backend setup
```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in `backend/`:
```env
SECRET_KEY=your-secret-key
GROQ_API_KEY=gsk_your-groq-api-key
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?appName=PortfolifyAI
MONGODB_DB_NAME=PortfolifyAI
```

### 4. Run locally
```bash
# Terminal 1 — Frontend
npm run dev

# Terminal 2 — Backend
cd backend
uvicorn app.main:app --reload --port 8000
```

Open [http://localhost:5173](http://localhost:5173)

## 📁 Project Structure

```
PortfolifyAI/
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── contexts/           # Auth context
│   ├── pages/              # Route pages
│   └── services/           # API service layer
├── backend/                # FastAPI backend
│   └── app/
│       ├── routers/        # API endpoints
│       ├── services/       # AI/LLM service
│       ├── schemas/        # Pydantic models
│       └── utils/          # Auth utilities
├── public/                 # Static assets
├── vercel.json             # Vercel SPA config
└── package.json
```

## 📄 License

MIT

---

Built with ❤️ using React, FastAPI, and AI
