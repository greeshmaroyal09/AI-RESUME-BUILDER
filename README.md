# AI Resume Builder / Career Intelligence Platform

## Project Overview

AI Resume Builder is an intelligent conversational career intelligence platform that helps users create, analyze, optimize, and tailor professional resumes. Unlike traditional form-based resume builders, the platform uses an AI-powered conversational workflow to collect, validate, and structure professional information into high-quality ATS-friendly resumes.

The platform also allows users to upload existing resumes for AI-driven analysis, ATS evaluation, skill gap identification, and personalized improvement recommendations.

---

## Key Features

### Conversational AI Profile Builder
- AI-guided profile creation experience.
- Collects professional information through natural conversations.
- Eliminates the need for lengthy manual forms.
- Dynamically asks contextual follow-up questions.

### Smart Validation Engine
- Validates dates, URLs, contact details, and structured inputs.
- Rejects low-quality or meaningless responses.
- Ensures complete and professional profile information.

### Resume Generation
- Generates structured ATS-friendly resumes.
- Uses collected profile information to build professional resume content.
- Supports iterative profile improvement.

### AI Resume Tailoring
- Tailor resumes for specific job descriptions.
- Highlights relevant skills and experience.
- Improves resume relevance for targeted roles.
- Generates customized resume versions based on job requirements.

### Job Description Workspace
- Save and manage multiple job descriptions.
- Select target job descriptions for tailoring.
- Maintain a reusable library of job opportunities.

### Resume Analysis & ATS Evaluation
- Upload existing PDF or DOCX resumes.
- AI-powered resume parsing and analysis.
- ATS compatibility scoring.
- Resume quality assessment.
- Matching skills identification.
- Missing skills detection.
- Improvement recommendations.

### Skill Gap Analysis
- Compare uploaded resumes against target roles.
- Identify missing technical and professional skills.
- Highlight high-priority improvement areas.
- Generate actionable recommendations.

### Resume History
- Stores previously generated tailored resumes.
- Allows users to revisit and review past sessions.
- Maintains historical resume versions.

### Export Support
- Export generated resumes in PDF format.
- Export generated resumes in DOCX format.

### Dark / Light Mode
- Fully supported theme switching.
- Persistent user preference storage.

### Responsive Design
- Mobile-friendly user experience.
- Optimized layouts for desktop, tablet, and mobile devices.

---

## Technology Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- Lucide React

### Backend
- Python
- FastAPI
- SQLAlchemy
- SQLite
- Uvicorn

### AI Services
- Google Gemini API

---

## System Architecture

The application follows a client-server architecture.

### Frontend
The frontend is built using React, TypeScript, and Vite. Zustand is used for lightweight global state management, while Tailwind CSS provides responsive and modern UI components.

### Backend
The backend is built with FastAPI and SQLAlchemy. SQLite is used for persistent storage. AI workflows are powered through Gemini integration and structured validation pipelines.

### AI Workflow

```text
User Input
     ↓
AI Validation
     ↓
Profile Construction
     ↓
Resume Generation
     ↓
Resume Tailoring
     ↓
ATS Analysis
     ↓
Recommendations
```

## Installation

### Prerequisites

- Node.js v18+
- Python 3.10+
- Gemini API Key

---

## Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the environment:

### Windows

```bash
.\venv\Scripts\activate
```

### Mac/Linux

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file:

```env
GEMINI_API_KEY=your_api_key_here
```

Run backend:

```bash
uvicorn app.main:app --reload
```

Backend will run at:

```text
http://127.0.0.1:8000
```

---

## Frontend Setup

Navigate to frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Frontend will run at:

```text
http://localhost:5173
```

---

## API Overview

### Authentication

```http
GET /api/auth/me
```

Validates the current user session.

---

### Profile Summary

```http
GET /api/profile/summary
```

Returns profile completion status and profile overview.

---

### Conversational AI Assistant

```http
POST /api/ai/chat
```

Handles conversational profile building and validation workflows.

---

### Job Descriptions

```http
GET /api/jd
```

Retrieve stored job descriptions.

```http
POST /api/jd
```

Create a new job description.

---

### Resume Generation

```http
POST /api/resume/generate
```

Generate tailored resumes for selected job descriptions.

---

### Resume Analysis

```http
POST /api/resume/analyze
```

Analyze uploaded resumes and generate:

- ATS Score
- Resume Quality Score
- Matching Skills
- Missing Skills
- Improvement Suggestions

---

### Resume History

```http
GET /api/resume/history
```

Retrieve previous resume generation sessions.

---

## Current Capabilities

- Conversational profile creation
- Intelligent input validation
- ATS-friendly resume generation
- AI-powered resume tailoring
- Resume upload and analysis
- ATS scoring
- Missing skill detection
- Resume history management
- PDF/DOCX export
- Responsive UI
- Dark/Light mode support

---

## Future Enhancements

- CrewAI multi-agent profile verification
- GitHub profile integration
- LinkedIn profile enrichment
- Advanced ATS benchmarking
- Real-time job market intelligence
- Career readiness scoring
- Personalized career roadmap generation
- Multi-model AI support (Gemini, Ollama, OpenAI)

---

## Contributors

- Singam Setty Greeshma Royal

---

## License

This project is developed for educational, research, and career development purposes.
