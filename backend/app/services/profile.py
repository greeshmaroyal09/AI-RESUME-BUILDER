from sqlalchemy.orm import Session
from app.models import (
    User, UserProfilePersonal, UserProfileEducation, UserProfileSkill,
    UserProfileTechnology, UserProfileProject, UserProfileInternship,
    UserProfileCertification, UserProfileLeadership, UserProfileAchievement,
    UserProfilePosition
)
from typing import Dict, Any

def get_profile_completeness(user_id: int, db: Session) -> Dict[str, Any]:
    """
    Computes profile completion status per section.
    Each section has required fields that must be filled to be considered complete.
    """

    # Personal Info: requires first_name, last_name, email, phone
    personal = db.query(UserProfilePersonal).filter(UserProfilePersonal.user_id == user_id).first()
    has_personal = (
        personal is not None
        and bool(personal.first_name and personal.first_name.strip())
        and bool(personal.last_name and personal.last_name.strip())
        and bool(personal.email and personal.email.strip())
        and bool(personal.phone and personal.phone.strip())
    )

    # Education: at least 1 record with institution + degree + start_date
    educations = db.query(UserProfileEducation).filter(UserProfileEducation.user_id == user_id).all()
    has_education = any(
        bool(e.institution and e.institution.strip())
        and bool(e.degree and e.degree.strip())
        and bool(e.start_date and e.start_date.strip())
        for e in educations
    )

    # Skills: at least 1 record
    has_skills = db.query(UserProfileSkill).filter(UserProfileSkill.user_id == user_id).count() > 0

    # Technologies: at least 1 record
    has_technologies = db.query(UserProfileTechnology).filter(UserProfileTechnology.user_id == user_id).count() > 0

    # Projects: at least 1 record with title + description
    projects = db.query(UserProfileProject).filter(UserProfileProject.user_id == user_id).all()
    has_projects = any(
        bool(p.title and p.title.strip())
        and bool(p.description and p.description.strip())
        for p in projects
    )

    # Internships: at least 1 record with company + role + description
    internships = db.query(UserProfileInternship).filter(UserProfileInternship.user_id == user_id).all()
    has_internships = any(
        bool(i.company and i.company.strip())
        and bool(i.role and i.role.strip())
        and bool(i.description and i.description.strip())
        for i in internships
    )

    # Certifications: at least 1 with name + issuer
    certifications = db.query(UserProfileCertification).filter(UserProfileCertification.user_id == user_id).all()
    has_certifications = any(
        bool(c.name and c.name.strip())
        and bool(c.issuer and c.issuer.strip())
        for c in certifications
    )

    # Leadership: at least 1 with organization + role
    leaderships = db.query(UserProfileLeadership).filter(UserProfileLeadership.user_id == user_id).all()
    has_leaderships = any(
        bool(l.organization and l.organization.strip())
        and bool(l.role and l.role.strip())
        for l in leaderships
    )

    # Achievements: at least 1 with title + description
    achievements = db.query(UserProfileAchievement).filter(UserProfileAchievement.user_id == user_id).all()
    has_achievements = any(
        bool(a.title and a.title.strip())
        and bool(a.description and a.description.strip())
        for a in achievements
    )

    # Positions: at least 1 with organization + role
    positions = db.query(UserProfilePosition).filter(UserProfilePosition.user_id == user_id).all()
    has_positions = any(
        bool(p.organization and p.organization.strip())
        and bool(p.role and p.role.strip())
        for p in positions
    )

    status = {
        "personal_info": has_personal,
        "education": has_education,
        "skills": has_skills,
        "technologies": has_technologies,
        "projects": has_projects,
        "internships": has_internships,
        "certifications": has_certifications,
        "leadership": has_leaderships,
        "achievements": has_achievements,
        "positions": has_positions,
    }

    # 10 sections × 10% each = 100%
    completed_sections = sum(1 for v in status.values() if v)
    percentage = float(completed_sections * 10)

    return {
        "completion_percentage": percentage,
        "sections_status": status
    }
