from typing import Dict, Any, List, Tuple

def review_education(data: Dict[str, Any]) -> Tuple[float, List[str], List[str]]:
    score = 0.0
    missing = []
    questions = []
    
    if data.get("institution"):
        score += 25
    else:
        missing.append("Institution Name")
        questions.append("What is the name of the school, college, or university?")
        
    if data.get("degree"):
        score += 25
    else:
        missing.append("Degree Title")
        questions.append("What degree or diploma did you pursue? (e.g. B.S., High School)")
        
    if data.get("field_of_study"):
        score += 20
    else:
        missing.append("Field of Study")
        questions.append("What was your major or field of study? (e.g. Computer Science)")
        
    if data.get("gpa"):
        score += 15
    else:
        missing.append("GPA or score")
        questions.append("What was your GPA or final grade percentage? (e.g. 3.8/4.0)")
        
    if data.get("location"):
        score += 10
    else:
        missing.append("Institution Location")
        questions.append("Where is this institution located? (e.g. Roorkee, India)")
        
    if data.get("start_date") and data.get("end_date"):
        score += 5
    else:
        missing.append("Timeline Dates")
        questions.append("What were the start and completion dates for your studies?")
        
    return score, missing, questions


def review_skills(data: Dict[str, Any]) -> Tuple[float, List[str], List[str]]:
    score = 0.0
    missing = []
    questions = []
    
    if data.get("name"):
        score += 50
    else:
        missing.append("Skill Name")
        questions.append("What is the name of the skill? (e.g. Python, SQL)")
        
    if data.get("level") in ["Beginner", "Intermediate", "Advanced"]:
        score += 50
    else:
        missing.append("Proficiency Level")
        questions.append("What is your proficiency level in this skill? Please select Beginner, Intermediate, or Advanced.")
        
    return score, missing, questions


def review_technologies(data: Dict[str, Any]) -> Tuple[float, List[str], List[str]]:
    score = 0.0
    missing = []
    questions = []
    
    if data.get("name"):
        score += 50
    else:
        missing.append("Technology Name")
        questions.append("What is the name of the technology? (e.g. React, Docker)")
        
    if data.get("category"):
        score += 50
    else:
        missing.append("Category")
        questions.append("What category does this technology belong to? (e.g. Languages, Frameworks, Databases)")
        
    return score, missing, questions


def review_projects(data: Dict[str, Any]) -> Tuple[float, List[str], List[str]]:
    score = 0.0
    missing = []
    questions = []
    
    if data.get("title"):
        score += 20
    else:
        missing.append("Project Title")
        questions.append("What was the project name or title?")
        
    desc = data.get("description", "")
    if len(desc) > 20:
        score += 20
    else:
        missing.append("Detailed Description")
        questions.append("Can you provide a more detailed description of the project (what problem did it solve, challenges faced)?")
        
    if data.get("technologies"):
        score += 20
    else:
        missing.append("Technologies Used")
        questions.append("What programming languages, frameworks, or database technologies did you use?")
        
    if data.get("role"):
        score += 15
    else:
        missing.append("Your Role")
        questions.append("What was your role or contribution? (e.g. Full Stack developer, UI Architect)")
        
    if data.get("team_size"):
        score += 15
    else:
        missing.append("Team Size")
        questions.append("Was this an individual project or team-based? What was the team size?")
        
    if data.get("outcome"):
        score += 10
    else:
        missing.append("Project Outcome / Impact")
        questions.append("What was the outcome, performance speedup, or quantitative metrics achieved? (e.g. automated 5 hours/week, 90% accuracy)")
        
    return score, missing, questions


def review_internships(data: Dict[str, Any]) -> Tuple[float, List[str], List[str]]:
    score = 0.0
    missing = []
    questions = []
    
    if data.get("company"):
        score += 25
    else:
        missing.append("Company Name")
        questions.append("What was the name of the company or organization?")
        
    if data.get("role"):
        score += 25
    else:
        missing.append("Role Title")
        questions.append("What was your title or role during the internship? (e.g. Software Engineering Intern)")
        
    desc = data.get("description", "")
    if len(desc) > 30:
        score += 20
    else:
        missing.append("Responsibilities / Accomplishments")
        questions.append("Can you detail your primary responsibilities and achievements during the internship?")
        
    if data.get("location"):
        score += 15
    else:
        missing.append("Location")
        questions.append("Where was the internship located? (e.g. Remote, City, State)")
        
    if data.get("start_date") and data.get("end_date"):
        score += 15
    else:
        missing.append("Timeline Dates")
        questions.append("What were the start and completion dates of the internship?")
        
    return score, missing, questions


def review_certifications(data: Dict[str, Any]) -> Tuple[float, List[str], List[str]]:
    score = 0.0
    missing = []
    questions = []
    
    if data.get("name"):
        score += 40
    else:
        missing.append("Certification Name")
        questions.append("What is the official name of the certification?")
        
    if data.get("issuer"):
        score += 30
    else:
        missing.append("Issuing Organization")
        questions.append("Which organization issued this certificate? (e.g. AWS, Coursera)")
        
    if data.get("issue_date"):
        score += 15
    else:
        missing.append("Issue Date")
        questions.append("When was the certification issued? (MM/YYYY)")
        
    if data.get("url"):
        score += 15
    else:
        missing.append("Verification URL")
        questions.append("Do you have a credential verification URL link for this certificate?")
        
    return score, missing, questions


def review_leadership(data: Dict[str, Any]) -> Tuple[float, List[str], List[str]]:
    score = 0.0
    missing = []
    questions = []
    
    if data.get("organization"):
        score += 30
    else:
        missing.append("Organization Name")
        questions.append("What was the organization name?")
        
    if data.get("role"):
        score += 30
    else:
        missing.append("Role Title")
        questions.append("What was your role or title? (e.g. Club Lead, Event Organizer)")
        
    desc = data.get("description", "")
    if len(desc) > 20:
        score += 40
    else:
        missing.append("Achievements / Contributions")
        questions.append("Can you describe the tasks you coordinated and the achievements of your leadership?")
        
    return score, missing, questions


def review_achievements(data: Dict[str, Any]) -> Tuple[float, List[str], List[str]]:
    score = 0.0
    missing = []
    questions = []
    
    if data.get("title"):
        score += 40
    else:
        missing.append("Achievement Title")
        questions.append("What was the title of the award or achievement? (e.g. Hackathon Winner)")
        
    desc = data.get("description", "")
    if len(desc) > 25:
        score += 40
    else:
        missing.append("Context / Description")
        questions.append("Can you detail the context, scope, or evaluation criteria of this achievement?")
        
    if data.get("date"):
        score += 20
    else:
        missing.append("Date Received")
        questions.append("When did you receive this achievement? (MM/YYYY)")
        
    return score, missing, questions


def review_positions(data: Dict[str, Any]) -> Tuple[float, List[str], List[str]]:
    score = 0.0
    missing = []
    questions = []
    
    if data.get("organization"):
        score += 30
    else:
        missing.append("Organization Name")
        questions.append("What was the organization name?")
        
    if data.get("role"):
        score += 30
    else:
        missing.append("Role Title")
        questions.append("What was your role or title?")
        
    desc = data.get("description", "")
    if len(desc) > 20:
        score += 40
    else:
        missing.append("Duties Description")
        questions.append("Can you detail your duties and what responsibilities you carried?")
        
    return score, missing, questions


def review_profile_section(section: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main orchestrator for profile intelligence checks.
    """
    review_map = {
        "education": review_education,
        "skills": review_skills,
        "technologies": review_technologies,
        "projects": review_projects,
        "internships": review_internships,
        "certifications": review_certifications,
        "leadership": review_leadership,
        "achievements": review_achievements,
        "positions": review_positions
    }
    
    review_func = review_map.get(section.lower())
    if not review_func:
        return {
            "completeness_score": 100.0,
            "missing_elements": [],
            "follow_up_questions": [],
            "is_sufficient": True
        }
        
    score, missing, questions = review_func(data)
    
    # 80% is the threshold for a highly-qualified, complete profile record
    return {
        "completeness_score": round(score, 1),
        "missing_elements": missing,
        "follow_up_questions": questions,
        "is_sufficient": score >= 80.0
    }
