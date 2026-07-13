# AI Resume Builder / Career Intelligence Platform

## Project Overview
The AI Resume Builder is an intelligent, conversational career intelligence platform designed to seamlessly gather, validate, and format a user's professional background into an ATS-friendly, high-quality resume. Moving away from static "dumb forms," the application leverages an intelligent AI workflow to validate inputs, ask contextual follow-up questions, and iteratively build robust profiles.

## Features
- **Conversational Profile Builder:** An AI-powered assistant that actively guides the user step-by-step, verifying information like dates, URLs, and numeric inputs before accepting them.
- **Smart Validation Logic:** Rejects meaningless inputs (e.g., "OK", "yes") and asks clarifying questions, ensuring only high-quality data enters the profile.
- **Dynamic Dark/Light Mode:** Full theming support across the entire application with persistence.
- **Job Description (JD) Workspace:** Add target job descriptions to let the AI tailor the generated resumes specifically for those roles.
- **Resume History & Export:** Keeps an archived history of tailored sessions. Easily export results as PDF or DOCX.
- **Full Edit/Delete Lifecycle:** Users can revisit and edit sections of their profile dynamically without starting from scratch. 
- **Mobile-Responsive UI:** Developed using modern Tailwind CSS utilities for seamless use on any device.

## Technology Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Zustand (State Management), Lucide React (Icons).
- **Backend:** Python, FastAPI, SQLAlchemy (SQLite), Uvicorn, Google Generative AI (Gemini).
- **Architecture:** Client-Server model with a RESTful JSON API layer and persistent SQLite relational database.

## Architecture
The platform is separated into a Vite-powered React frontend and a FastAPI-driven Python backend. State is managed globally via Zustand on the frontend, whilst the backend utilizes a stateful loop structure within `ai_assistant.py` to maintain multi-turn context and enforce strict schema validation for profile building.

## Installation Steps

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- A valid Gemini API Key

### Backend Setup
1. Open a terminal and navigate to the `backend` directory.
2. Create a virtual environment:
   `python -m venv venv`
3. Activate the virtual environment:
   - Windows: `.\venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
4. Install dependencies:
   `pip install -r requirements.txt`
5. Create a `.env` file in the `backend` folder and add your Gemini API Key:
   `GEMINI_API_KEY="your_api_key_here"`

### Frontend Setup
1. Open a terminal and navigate to the `frontend` directory.
2. Install Node dependencies:
   `npm install`
3. Create a `.env` file in the `frontend` folder if you need a custom API endpoint (defaults to `http://127.0.0.1:8000`).

## How to Run Backend
From the `backend` directory, ensure your virtual environment is active, then run:
```bash
uvicorn app.main:app --reload
```
The API will be available at `http://127.0.0.1:8000`.

## How to Run Frontend
From the `frontend` directory, run:
```bash
npm run dev
```
The UI will be accessible locally at `http://localhost:5173`.

## API Overview
- `GET /api/auth/me` - Validates the current user session.
- `GET /api/profile/summary` - Retrieves the aggregated completion status of the user's profile.
- `POST /api/ai/chat` - The core conversational endpoint handling the intelligent prompt loops.
- `GET /api/jd` - Retrieves all saved job descriptions.
- `POST /api/resume/generate` - Triggers the tailoring process against a specific JD.
- `GET /api/resume/history` - Fetches past resume generations.

## Future Enhancements
- Implementation of the CrewAI multi-agent verification system (Profile Verification Agent).
- Smart Profile Scoring to grade resumes (Beginner, Developing, Strong, Competitive).
- Automated GitHub and LinkedIn scraping.
