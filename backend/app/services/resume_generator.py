import json
from typing import Dict, Any, List
from sqlalchemy.orm import Session
import google.generativeai as genai
from app.config import settings
from app.services.ats_engine import get_user_profile_data

# Standard action verbs to improve bullet points in local fallback mode
ACTION_VERBS = ["Spearheaded", "Architected", "Engineered", "Optimized", "Designed", "Formulated", "Pioneered", "Implemented", "Executed", "Directed"]

def generate_resume_with_gemini(profile_data: Dict[str, Any], ats_analysis: Dict[str, Any], role: str, company: str) -> Dict[str, Any]:
    """
    Leverages Gemini to rephrase user profile data to fit the JD requirements without fabricating facts.
    """
    genai.configure(api_key=settings.GEMINI_API_KEY)

    prompt = f"""
You are an elite, professional Resume Writer.
Your task is to tailor the candidate's Profile Data for a target role at a target company.
You must use the ATS analysis reports to guide which skills and experiences to emphasize.

Target Role: {role}
Target Company: {company}

ATS Analysis Insights:
{json.dumps(ats_analysis, indent=2)}

Candidate Original Profile Data:
{json.dumps(profile_data, indent=2)}

STRICT RULES FOR TAILORING:
1. NEVER invent, hallucinate, or extrapolate facts. Do not add skills, project details, certifications, or internships the candidate does not have.
2. Only REPHRASE, REORDER, and RESTRUCTURE the existing details.
3. Optimize the wording of summaries, project descriptions (incorporating the project's team_size and outcome details if provided), and internship points using strong, professional action verbs, metrics, and ATS-friendly phrasing.
4. If a section is empty in the candidate profile, leave it empty (empty array or null) in the generated JSON.

Generate a JSON object matching this exact schema:
{{
  "personal_info": {{
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "github": "string",
    "linkedin": "string",
    "website": "string"
  }},
  "summary": "A 3-4 sentence professional summary tailored specifically for {role} at {company}, highlighting the matching skills and profile strengths.",
  "education": [
    {{
      "institution": "string",
      "degree": "string",
      "field_of_study": "string",
      "start_date": "string",
      "end_date": "string",
      "gpa": "string",
      "location": "string"
    }}
  ],
  "skills": ["skill1", "skill2", ...], // User's actual skills, ordered by relevance to the JD
  "technologies": ["tech1", "tech2", ...], // User's actual technologies, ordered by relevance to the JD
  "projects": [
    {{
      "title": "string",
      "description": "Tailored project description utilizing strong bullet points starting with action verbs. Highlight user's actual contributions and technologies.",
      "technologies": "string", // comma-separated
      "role": "string",
      "start_date": "string",
      "end_date": "string",
      "url": "string"
    }}
  ],
  "internships": [
    {{
      "company": "string",
      "role": "string",
      "description": "Tailored internship bullet points highlighting user's achievements and duties with action verbs.",
      "start_date": "string",
      "end_date": "string",
      "location": "string"
    }}
  ],
  "certifications": [
    {{
      "name": "string",
      "issuer": "string",
      "issue_date": "string",
      "expiry_date": "string",
      "url": "string"
    }}
  ],
  "leadership": [
    {{
      "organization": "string",
      "role": "string",
      "description": "Tailored description of leadership achievements.",
      "start_date": "string",
      "end_date": "string"
    }}
  ],
  "achievements": [
    {{
      "title": "string",
      "description": "Tailored summary of the award.",
      "date": "string"
    }}
  ],
  "positions_of_responsibility": [
    {{
      "organization": "string",
      "role": "string",
      "description": "Tailored explanation of responsibilities.",
      "start_date": "string",
      "end_date": "string"
    }}
  ]
}}
"""

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config={"response_mime_type": "application/json"}
    )
    
    try:
        response = model.generate_content(prompt)
        tailored_resume = json.loads(response.text.strip())
        return tailored_resume
    except Exception as e:
        print(f"Gemini resume generation failed: {e}. Falling back to rule-based generation.")
        return generate_resume_with_rules(profile_data, ats_analysis, role, company)


def generate_resume_with_rules(profile_data: Dict[str, Any], ats_analysis: Dict[str, Any], role: str, company: str) -> Dict[str, Any]:
    """
    A smart rule-based resume tailoring fallback engine.
    It takes candidate data, rephrases summaries, sorts skills by match relevance, and formats projects/internships
    using elite resume templates and active vocabulary.
    """
    # 1. Personal Info
    personal = profile_data["personal_info"]
    first = personal.get("first_name", "")
    last = personal.get("last_name", "")
    email = personal.get("email", "")
    phone = personal.get("phone", "")
    loc = personal.get("location", "")
    git = personal.get("github", "")
    link = personal.get("linkedin", "")
    web = personal.get("website", "")
    orig_sum = personal.get("summary", "")

    # Create tailored Summary
    skills_list = [s.title() for s in profile_data["skills"][:4]]
    skills_phrase = f"proficient in {', '.join(skills_list)}" if skills_list else "with a strong background in software concepts"
    
    if orig_sum:
        tailored_summary = (
            f"Result-driven professional {skills_phrase}, eager to contribute to the {role} position at {company}. "
            f"Possesses a proven track record of applying technical skills to solve complex problems as demonstrated in "
            f"various projects. {orig_sum.strip()}"
        )
    else:
        tailored_summary = (
            f"Detail-oriented professional with technical skills {skills_phrase}, seeking to leverage experience "
            f"in technical environments for the {role} role at {company}. Adept at designing functional solutions, "
            f"working within collaborative environments, and delivering quality code."
        )

    # 2. Education - Direct pass-through
    education = []
    for edu in profile_data["education"]:
        education.append({
            "institution": edu.get("institution", ""),
            "degree": edu.get("degree", ""),
            "field_of_study": edu.get("field", ""),
            "start_date": edu.get("start_date", ""),
            "end_date": edu.get("end_date", ""),
            "gpa": edu.get("gpa", ""),
            "location": edu.get("location", "")
        })

    # 3. Sort skills & technologies by matching status first (relevance)
    skills = []
    matching_set = {s.lower() for s in ats_analysis.get("matching_skills", [])}
    
    all_skills = profile_data["skills"]
    sorted_skills = sorted(all_skills, key=lambda x: x.lower() in matching_set, reverse=True)
    skills = [s for s in sorted_skills]

    all_techs = profile_data["technologies"]
    sorted_techs = sorted(all_techs, key=lambda x: x.lower() in matching_set, reverse=True)
    technologies = [t for t in sorted_techs]

    # 4. Tailor Projects description (rephrase with action verbs)
    projects = []
    for idx, proj in enumerate(profile_data["projects"]):
        desc = proj.get("description", "")
        tech_list = proj.get("technologies", "")
        team = proj.get("team_size", "")
        outc = proj.get("outcome", "")
        
        # Apply professional verbs
        verb = ACTION_VERBS[idx % len(ACTION_VERBS)]
        
        # Simple rephrase to add action structure
        sentences = [s.strip() for s in desc.split('.') if s.strip()]
        new_bullets = []
        
        # Incorporate team size
        team_phrase = f"in a team environment of {team}" if team else "independently"
        
        if sentences:
            new_bullets.append(f"- {verb} the development of the project {team_phrase}, focusing to: {sentences[0][0].lower() + sentences[0][1:] if len(sentences[0]) > 1 else sentences[0]}.")
            for s in sentences[1:]:
                # Alternate action verb
                alt_verb = ACTION_VERBS[(idx + 1) % len(ACTION_VERBS)]
                new_bullets.append(f"- {alt_verb} core functionalities to {s[0].lower() + s[1:] if len(s) > 1 else s}.")
        else:
            new_bullets.append(f"- {verb} project design and structure {team_phrase} using {tech_list or 'key features'}.")
            
        # Incorporate outcome
        if outc:
            new_bullets.append(f"- Achieved project deliverables: {outc}.")
            
        projects.append({
            "title": proj.get("title", ""),
            "description": "\n".join(new_bullets),
            "technologies": tech_list,
            "role": proj.get("role", "Developer"),
            "start_date": proj.get("start_date", ""),
            "end_date": proj.get("end_date", ""),
            "url": proj.get("url", "")
        })

    # 5. Tailor Internships (rephrase with action verbs)
    internships = []
    for idx, intern in enumerate(profile_data["internships"]):
        desc = intern.get("description", "")
        role_title = intern.get("role", "")
        company_name = intern.get("company", "")
        
        sentences = [s.strip() for s in desc.split('.') if s.strip()]
        new_bullets = []
        for s_idx, s in enumerate(sentences):
            verb = ACTION_VERBS[(idx + s_idx) % len(ACTION_VERBS)]
            new_bullets.append(f"- {verb} {s[0].lower() + s[1:] if len(s) > 1 else s}.")
            
        if not new_bullets:
            new_bullets.append(f"- Spearheaded collaborative objectives in the {role_title} capacity.")
            new_bullets.append("- Resolved complex tickets and contributed code to the main codebase.")

        internships.append({
            "company": company_name,
            "role": role_title,
            "description": "\n".join(new_bullets),
            "start_date": intern.get("start_date", ""),
            "end_date": intern.get("end_date", ""),
            "location": intern.get("location", "")
        })

    # 6. Certifications - Direct pass
    certifications = []
    for cert in profile_data["certifications"]:
        certifications.append({
            "name": cert.get("name", ""),
            "issuer": cert.get("issuer", ""),
            "issue_date": cert.get("issue_date", ""),
            "expiry_date": cert.get("expiry_date", ""),
            "url": cert.get("url", "")
        })

    # 7. Leadership - Direct pass with bullet points
    leadership = []
    for lead in profile_data["leadership"]:
        leadership.append({
            "organization": lead.get("org", ""),
            "role": lead.get("role", ""),
            "description": f"- Coordinated and led activities for {lead.get('role', '')} role.\n- " + lead.get("description", ""),
            "start_date": lead.get("start_date", ""),
            "end_date": lead.get("end_date", "")
        })

    # 8. Achievements - Direct pass
    achievements = []
    for ach in profile_data["achievements"]:
        achievements.append({
            "title": ach.get("title", ""),
            "description": ach.get("description", ""),
            "date": ach.get("date", "")
        })

    # 9. Positions - Direct pass
    positions = []
    for pos in profile_data["positions"]:
        positions.append({
            "organization": pos.get("org", ""),
            "role": pos.get("role", ""),
            "description": pos.get("description", ""),
            "start_date": pos.get("start_date", ""),
            "end_date": pos.get("end_date", "")
        })

    return {
        "personal_info": {
            "first_name": first,
            "last_name": last,
            "email": email,
            "phone": phone,
            "location": loc,
            "github": git,
            "linkedin": link,
            "website": web
        },
        "summary": tailored_summary,
        "education": education,
        "skills": skills,
        "technologies": technologies,
        "projects": projects,
        "internships": internships,
        "certifications": certifications,
        "leadership": leadership,
        "achievements": achievements,
        "positions_of_responsibility": positions
    }


def generate_tailored_resume(user_id: int, ats_analysis: Dict[str, Any], role: str, company: str, db: Session) -> Dict[str, Any]:
    """
    Main entry point for tailoring the resume based on target JD analysis.
    """
    profile_data = get_user_profile_data(user_id, db)
    if settings.GEMINI_API_KEY:
        return generate_resume_with_gemini(profile_data, ats_analysis, role, company)
    else:
        return generate_resume_with_rules(profile_data, ats_analysis, role, company)
