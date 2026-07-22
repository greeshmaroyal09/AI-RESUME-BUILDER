import io
import json
from typing import Dict, Any
from PyPDF2 import PdfReader
from docx import Document
import google.generativeai as genai
from app.config import settings

def extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted + "\n"
    return text

def extract_text_from_docx(file_bytes: bytes) -> str:
    doc = Document(io.BytesIO(file_bytes))
    return "\n".join([para.text for para in doc.paragraphs])

def extract_resume_text(file_bytes: bytes, filename: str) -> str:
    ext = filename.split(".")[-1].lower()
    if ext == "pdf":
        raw_text = extract_text_from_pdf(file_bytes)
    elif ext in ["doc", "docx"]:
        raw_text = extract_text_from_docx(file_bytes)
    else:
        raise ValueError(f"Unsupported file format: {ext}. Please upload a PDF or DOCX file.")
    
    if not raw_text.strip():
        raise ValueError("Could not extract any text from the uploaded document.")
    return raw_text

import re

def analyze_uploaded_resume_fallback(raw_text: str, role: str) -> Dict[str, Any]:
    """Fallback rule-based engine when Gemini API key is missing."""
    raw_lower = raw_text.lower()
    
    TECHNICAL_KEYWORDS = [
        "python", "javascript", "typescript", "java", "c++", "c#", "go", "sql",
        "react", "angular", "vue", "node.js", "django", "fastapi", "spring",
        "docker", "kubernetes", "aws", "azure", "gcp", "git", "ci/cd", "linux",
        "machine learning", "deep learning", "nlp", "computer vision", "tensorflow",
        "agile", "scrum", "graphql", "rest api"
    ]
    
    found_skills = []
    
    for kw in TECHNICAL_KEYWORDS:
        if re.search(r'\b' + re.escape(kw) + r'\b', raw_lower):
            found_skills.append(kw.title())
    
    if not found_skills:
        found_skills = ["Communication", "Problem Solving"]
        
    missing_skills = ["System Design", "Cloud Architecture", "Advanced Testing"]
    
    return {
        "ats_score": 65,
        "resume_quality": 70,
        "keyword_optimization": 60,
        "matching_skills": found_skills[:8],
        "missing_skills": missing_skills,
        "improvement_suggestions": [
            f"Add more specific industry keywords related to {role}.",
            "Quantify your past professional achievements with metrics (e.g., increased efficiency by 20%).",
            "Consider adding a summary section highlighting your core strengths for ATS parsing."
        ]
    }

def analyze_uploaded_resume(raw_text: str, role: str) -> Dict[str, Any]:
    """
    Evaluates the uploaded resume against the target role.
    """
    if not settings.GEMINI_API_KEY:
        return analyze_uploaded_resume_fallback(raw_text, role)

    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash"
    )
    
    prompt = f"""
You are an expert ATS (Applicant Tracking System) and AI Career Coach.
You have been provided with an candidate's uploaded resume text, and a target role they are applying for.

Analyze the resume against the target role. Return a highly structured JSON report.
Your analysis must be tough but fair.
CRITICAL: ONLY OUTPUT VALID JSON. DO NOT INCLUDE ANY MARKDOWN CODE BLOCKS OR EXTRA TEXT.

TARGET ROLE: {role}

CANDIDATE RESUME:
{raw_text}

SCHEMA TO FOLLOW:
{{
  "ats_score": 0, // overall integer score 0-100
  "resume_quality": 0, // integer 0-100
  "keyword_optimization": 0, // integer 0-100
  "matching_skills": ["skill1", "skill2"], // skills in resume that match the target role
  "missing_skills": ["skill3", "skill4"], // critical skills for this role missing in resume
  "improvement_suggestions": [
    "actionable suggestion 1",
    "actionable suggestion 2",
    "actionable suggestion 3"
  ]
}}
"""
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return json.loads(text.strip())
    except Exception as e:
        print(f"Gemini ATS engine failed: {e}. Falling back to Rule-based engine.")
        return analyze_uploaded_resume_fallback(raw_text, role)
