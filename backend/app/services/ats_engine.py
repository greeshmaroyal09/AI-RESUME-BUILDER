import json
import re
from typing import Dict, Any, List, Tuple
from sqlalchemy.orm import Session
import google.generativeai as genai
from app.config import settings
from app.models import (
    UserProfilePersonal, UserProfileEducation, UserProfileSkill,
    UserProfileTechnology, UserProfileProject, UserProfileInternship,
    UserProfileCertification, UserProfileLeadership, UserProfileAchievement,
    UserProfilePosition
)
from app.schemas import ATSAnalysisReport

# Predefined list of popular technical skills/keywords for matching fallback
TECHNICAL_KEYWORDS = [
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust", "ruby", "php", "sql", "nosql",
    "react", "angular", "vue", "next.js", "node.js", "express", "django", "fastapi", "flask", "spring boot",
    "docker", "kubernetes", "aws", "azure", "gcp", "git", "ci/cd", "linux", "html", "css", "tailwind",
    "machine learning", "deep learning", "nlp", "computer vision", "tensorflow", "pytorch", "scikit-learn",
    "pandas", "numpy", "spark", "hadoop", "tableau", "powerbi", "graphql", "rest api", "agile", "scrum"
]

def get_user_profile_data(user_id: int, db: Session) -> Dict[str, Any]:
    """
    Utility to serialize all user profile data into a readable format for prompts or local processing.
    """
    personal = db.query(UserProfilePersonal).filter(UserProfilePersonal.user_id == user_id).first()
    educations = db.query(UserProfileEducation).filter(UserProfileEducation.user_id == user_id).all()
    skills = db.query(UserProfileSkill).filter(UserProfileSkill.user_id == user_id).all()
    technologies = db.query(UserProfileTechnology).filter(UserProfileTechnology.user_id == user_id).all()
    projects = db.query(UserProfileProject).filter(UserProfileProject.user_id == user_id).all()
    internships = db.query(UserProfileInternship).filter(UserProfileInternship.user_id == user_id).all()
    certifications = db.query(UserProfileCertification).filter(UserProfileCertification.user_id == user_id).all()
    leaderships = db.query(UserProfileLeadership).filter(UserProfileLeadership.user_id == user_id).all()
    achievements = db.query(UserProfileAchievement).filter(UserProfileAchievement.user_id == user_id).all()
    positions = db.query(UserProfilePosition).filter(UserProfilePosition.user_id == user_id).all()

    return {
        "personal_info": {
            "first_name": personal.first_name if personal else "",
            "last_name": personal.last_name if personal else "",
            "email": personal.email if personal else "",
            "summary": personal.summary if personal else "",
            "location": personal.location if personal else "",
            "phone": personal.phone if personal else "",
            "github": personal.github if personal else "",
            "linkedin": personal.linkedin if personal else "",
            "website": personal.website if personal else ""
        },
        "education": [{"institution": e.institution, "degree": e.degree, "field": e.field_of_study, "gpa": e.gpa, "start_date": e.start_date, "end_date": e.end_date, "location": e.location} for e in educations],
        "skills": [s.name for s in skills],
        "technologies": [t.name for t in technologies],
        "projects": [{"title": p.title, "description": p.description, "technologies": p.technologies, "team_size": p.team_size, "outcome": p.outcome, "start_date": p.start_date, "end_date": p.end_date, "url": p.url} for p in projects],
        "internships": [{"company": i.company, "role": i.role, "description": i.description, "start_date": i.start_date, "end_date": i.end_date, "location": i.location} for i in internships],
        "certifications": [{"name": c.name, "issuer": c.issuer, "issue_date": c.issue_date, "expiry_date": c.expiry_date, "url": c.url} for c in certifications],
        "leadership": [{"org": l.organization, "role": l.role, "description": l.description, "start_date": l.start_date, "end_date": l.end_date} for l in leaderships],
        "achievements": [{"title": a.title, "description": a.description, "date": a.date} for a in achievements],
        "positions": [{"org": p.organization, "role": p.role, "description": p.description, "start_date": p.start_date, "end_date": p.end_date} for p in positions]
    }


def analyze_with_gemini(profile_data: Dict[str, Any], jd_text: str, role: str, company: str) -> Dict[str, Any]:
    """
    Leverages Gemini to extract keywords and compare with the profile, generating a realistic report.
    """
    genai.configure(api_key=settings.GEMINI_API_KEY)
    
    prompt = f"""
You are an expert Applicant Tracking System (ATS) Engine and Career Coach.
Analyze the candidate's Profile against the target Job Description (JD) below.

Target Role: {role}
Target Company: {company}

Candidate Profile Details:
{json.dumps(profile_data, indent=2)}

Target Job Description:
\"\"\"{jd_text}\"\"\"

Generate a JSON object in this exact schema:
{{
  "match_percentage": float, // A realistic score between 0 and 100 based on keyword overlap and requirement matches
  "matching_skills": ["skill1", "skill2", ...], // Skills present in BOTH the profile and the JD
  "missing_skills": ["skill3", "skill4", ...], // Skills requested in the JD but not found in the profile
  "strengths": ["strength1", "strength2", ...], // Specific highlights about the candidate's profile relative to the JD
  "weaknesses": ["weakness1", "weakness2", ...], // Constructive critical weaknesses relative to target role
  "missing_experience": ["exp1", "exp2", ...], // Specific missing experiences (e.g. team projects, agile development, internships)
  "missing_certifications": ["cert1", "cert2", ...], // Specific missing certifications relevant to target role
  "recommendations": ["rec1", "rec2", ...], // Hyper-personalized recommendations
  "improvement_roadmap": ["step1", "step2", ...] // A step-by-step career path checklist to achieve match readiness
}}

Make sure you do NOT invent skills the candidate does not have under "matching_skills". Ensure your strengths, weaknesses, gaps, and roadmap are highly constructive and role-specific.
"""

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config={"response_mime_type": "application/json"}
    )
    
    try:
        response = model.generate_content(prompt)
        report = json.loads(response.text.strip())
        # Ensure compatibility keys
        if "gaps" not in report:
            report["gaps"] = report.get("weaknesses", [])
        return report
    except Exception as e:
        print(f"Gemini ATS engine failed: {e}. Falling back to Rule-based engine.")
        return analyze_with_rules(profile_data, jd_text, role, company)


def analyze_with_rules(profile_data: Dict[str, Any], jd_text: str, role: str, company: str) -> Dict[str, Any]:
    """
    A smart rule-based keyword match fallback engine that matches user skills and finds missing keywords.
    It builds strengths, weaknesses, gaps, and a personalized improvement roadmap based on missing elements.
    """
    jd_lower = jd_text.lower()
    
    # 1. Gather all user skills/technologies/keywords
    user_skills_set = set()
    for s in profile_data["skills"]:
        user_skills_set.add(s.lower())
    for t in profile_data["technologies"]:
        user_skills_set.add(t.lower())
        
    # Also parse descriptions of projects/internships for skills
    all_profile_text = " ".join([
        profile_data["personal_info"].get("summary", ""),
        " ".join([e["degree"] + " " + e["field"] for e in profile_data["education"]]),
        " ".join([p["title"] + " " + p["description"] + " " + (p["technologies"] or "") for p in profile_data["projects"]]),
        " ".join([i["company"] + " " + i["role"] + " " + i["description"] for i in profile_data["internships"]])
    ]).lower()
    
    # 2. Find which of our predefined key technologies are required by this JD
    required_jd_skills = []
    for keyword in TECHNICAL_KEYWORDS:
        pattern = r'\b' + re.escape(keyword) + r'\b'
        if re.search(pattern, jd_lower):
            required_jd_skills.append(keyword)
            
    # If no standard keywords found, look for common nouns as fallbacks
    if not required_jd_skills:
        required_jd_skills = ["python", "sql", "git", "rest api"]
        
    # 3. Classify matching vs missing
    matching_skills = []
    missing_skills = []
    
    for skill in required_jd_skills:
        if skill in user_skills_set or re.search(r'\b' + re.escape(skill) + r'\b', all_profile_text):
            matching_skills.append(skill.title())
        else:
            missing_skills.append(skill.title())
            
    # 4. Calculate Match Percentage
    total_req = len(required_jd_skills)
    matched_count = len(matching_skills)
    
    if total_req > 0:
        base_score = (matched_count / total_req) * 100
    else:
        base_score = 50.0
        
    # Boost/adjust score based on sections completion
    score_modifiers = 0
    if len(profile_data["education"]) > 0:
        score_modifiers += 5
    if len(profile_data["projects"]) > 0:
        score_modifiers += 10
    if len(profile_data["internships"]) > 0:
        score_modifiers += 15
    else:
        score_modifiers -= 10
        
    final_score = min(max(base_score + score_modifiers, 25.0), 95.0)
    final_score = round(final_score, 1)
    
    # 5. Strengths
    strengths = []
    if matching_skills:
        strengths.append(f"Demonstrates knowledge of core required technologies: {', '.join(matching_skills[:3])}.")
    if len(profile_data["projects"]) >= 2:
        strengths.append(f"Strong practical experience shown through {len(profile_data['projects'])} projects.")
    elif len(profile_data["projects"]) == 1:
        strengths.append("Possesses hands-on project experience.")
        
    if len(profile_data["education"]) > 0:
        edu = profile_data["education"][0]
        strengths.append(f"Solid academic background in {edu['field']} from {edu['institution']}.")
        
    if len(profile_data["internships"]) > 0:
        strengths.append(f"Has prior professional internship experience at {profile_data['internships'][0]['company']}.")
        
    if not strengths:
        strengths.append("Completed baseline personal profile registration.")
        
    # 6. Weaknesses, Missing Experience, Missing Certs, Roadmap
    weaknesses = []
    missing_experience = []
    missing_certifications = []
    recommendations = []
    improvement_roadmap = []
    
    if missing_skills:
        weaknesses.append(f"Lack of technical evidence in key requirements: {', '.join(missing_skills[:4])}.")
        recommendations.append(f"Focus on learning and adding the following skills to your profile: {', '.join(missing_skills[:3])}.")
        improvement_roadmap.append(f"1. Complete a dedicated tutorials/course on lacking skills: {', '.join(missing_skills[:3])}.")
        
    if len(profile_data["projects"]) == 0:
        missing_experience.append("No project records listed to demonstrate hands-on application.")
        weaknesses.append("Lack of practical engineering projects.")
        recommendations.append("Build 1-2 projects applying the required technical stack.")
        improvement_roadmap.append("2. Develop a standalone portfolio project that integrates " + (missing_skills[0] if missing_skills else "Python/React") + ".")
    elif missing_skills and len(profile_data["projects"]) > 0:
        recommendations.append(f"Build a small project that directly implements {missing_skills[0]} to bridge the hands-on gap.")
        improvement_roadmap.append(f"2. Upgrade your active projects by integrating {missing_skills[0]}.")
        
    if len(profile_data["internships"]) == 0:
        missing_experience.append(f"No industrial internship or corporate software experience listed, which is highly preferred for {role}.")
        weaknesses.append("Lack of collaborative workspace experience.")
        recommendations.append("Apply for open-source contributions or freelance work to add collaborative coding experiences.")
        improvement_roadmap.append("3. Contribute to open-source or complete a virtual collaborative internship program.")
        
    if len(profile_data["certifications"]) == 0:
        missing_certifications.append("No professional certifications listed to validate domain knowledge.")
        cert_suggestion = "AWS Cloud Practitioner" if "aws" in [s.lower() for s in missing_skills] else "Professional Developer Certification"
        weaknesses.append("No formal technical credentials.")
        recommendations.append(f"Consider obtaining a recognized industry certification, such as {cert_suggestion}.")
        improvement_roadmap.append(f"4. Study and acquire a professional credential, such as {cert_suggestion}.")

    # Fallback if profile is fully optimized
    if not weaknesses:
        weaknesses.append("No critical technical gaps identified; profile matches JD criteria very well.")
        recommendations.append(f"Optimize your professional summary to highlight company specific alignment with {company}.")
        improvement_roadmap.append("1. Perform deep review on resume summary phrasing.\n2. Apply directly via premium channels.")

    return {
        "match_percentage": final_score,
        "matching_skills": matching_skills,
        "missing_skills": missing_skills,
        "strengths": strengths,
        "gaps": weaknesses,
        "weaknesses": weaknesses,
        "missing_experience": missing_experience,
        "missing_certifications": missing_certifications,
        "recommendations": recommendations,
        "improvement_roadmap": improvement_roadmap
    }


def analyze_ats(user_id: int, jd_text: str, role: str, company: str, db: Session) -> Dict[str, Any]:
    """
    Main function to orchestrate ATS analysis.
    """
    profile_data = get_user_profile_data(user_id, db)
    if settings.GEMINI_API_KEY:
        return analyze_with_gemini(profile_data, jd_text, role, company)
    else:
        return analyze_with_rules(profile_data, jd_text, role, company)
