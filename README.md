# AI Resume Analyzer SaaS

Production-ready resume analysis SaaS built with FastAPI, React, Tailwind CSS, MongoDB, and OpenAI.

## Folder Structure

```text
ai resume analyser/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── dependencies/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── services/
│   │   ├── utils/
│   │   └── main.py
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── utils/
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vercel.json
│   └── vite.config.js
├── render.yaml
└── README.md
```

## Core Features

- PDF resume upload and parsing
- ATS scoring with detected skills, education, and experience extraction
- Resume vs job description keyword matching
- OpenAI-powered resume improvement feedback in structured JSON
- JWT authentication with MongoDB user storage
- Protected dashboard with upload history and score tracking
- Deployment-ready split for Render backend and Vercel frontend

## Backend Setup

1. Create `backend/.env` from `backend/.env.example`
2. Install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

3. Start the API:

```bash
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`.

## Frontend Setup

1. Create `frontend/.env` from `frontend/.env.example`
2. Install dependencies:

```bash
cd frontend
npm install
```

3. Start the app:

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Environment Variables

### Backend

```env
APP_NAME=AI Resume Analyzer API
API_V1_PREFIX=/api/v1
SECRET_KEY=replace-with-a-long-random-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=ai_resume_analyzer
CORS_ORIGINS=["http://localhost:5173","https://your-frontend-domain.vercel.app"]
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-4o-mini
MAX_UPLOAD_SIZE_MB=5
```

### Frontend

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Example API Requests

### Sign Up

```http
POST /api/v1/auth/signup
Content-Type: application/json

{
  "full_name": "Ava Patel",
  "email": "ava@example.com",
  "password": "StrongPass123"
}
```

```json
{
  "access_token": "jwt-token",
  "token_type": "bearer",
  "user": {
    "id": "67f5e9db9a6e3f9f14d6dd1e",
    "full_name": "Ava Patel",
    "email": "ava@example.com",
    "created_at": "2026-04-09T06:12:20.981Z"
  }
}
```

### Analyze Resume

```bash
curl -X POST http://localhost:8000/api/v1/analyze-resume \
  -H "Authorization: Bearer <token>" \
  -F "file=@resume.pdf"
```

```json
{
  "analysis_id": "67f5ea4a9a6e3f9f14d6dd1f",
  "filename": "resume.pdf",
  "ats_score": 82,
  "detected_skills": ["Python", "FastAPI", "MongoDB", "React"],
  "suggestions": [
    "Add quantified achievements to work experience, such as percentages, revenue, or scale."
  ],
  "extracted_data": {
    "skills": ["Python", "FastAPI", "MongoDB", "React"],
    "education": ["B.Tech in Computer Science - ABC University"],
    "experience": ["Software Engineer | Example Corp | 2023 - Present"]
  },
  "resume_text": "Full extracted resume text...",
  "created_at": "2026-04-09T06:14:02.102Z"
}
```

### Match Resume

```http
POST /api/v1/match-resume
Authorization: Bearer <token>
Content-Type: application/json

{
  "resume_text": "Experienced Python developer with FastAPI and MongoDB...",
  "job_description_text": "We need a backend engineer with Python, FastAPI, Docker, AWS, and REST API expertise..."
}
```

```json
{
  "match_score": 60,
  "matched_keywords": ["Python", "FastAPI", "MongoDB", "REST API"],
  "missing_keywords": ["Docker", "AWS"]
}
```

### Improve Resume

```http
POST /api/v1/improve-resume
Authorization: Bearer <token>
Content-Type: application/json

{
  "resume_text": "Experienced Python developer with FastAPI and MongoDB..."
}
```

```json
{
  "strengths": [
    "The resume uses relevant backend technologies that align with ATS parsing."
  ],
  "weaknesses": [
    "Work experience bullets are not quantified with outcomes."
  ],
  "improvement_suggestions": [
    "Rewrite each experience bullet to show business impact, ownership, and measurable results."
  ]
}
```

## Deployment

### Render Backend

- Use the included root-level `render.yaml`
- Set your MongoDB and OpenAI secrets in Render
- Render start command is already configured as `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Vercel Frontend

- Import the repository into Vercel
- Set the project root directory to `frontend`
- Add `VITE_API_BASE_URL=https://your-render-service.onrender.com/api/v1`
- Deploy using the included `frontend/vercel.json` for SPA rewrites

## Notes

- `/analyze-resume`, `/match-resume`, `/improve-resume`, and dashboard routes are protected with JWT auth
- Resume history is stored in MongoDB and surfaced in the frontend dashboard
- The ATS score is heuristic-based and easy to extend in `backend/app/services/resume_service.py`
- OpenAI feedback returns strict structured JSON for predictable frontend rendering
