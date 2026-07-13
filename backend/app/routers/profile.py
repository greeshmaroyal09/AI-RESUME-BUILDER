from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.auth import get_current_user
from app.models import (
    User, UserProfilePersonal, UserProfileEducation, UserProfileSkill,
    UserProfileTechnology, UserProfileProject, UserProfileInternship,
    UserProfileCertification, UserProfileLeadership, UserProfileAchievement,
    UserProfilePosition
)
from app.schemas import (
    ProfileSummaryOut, PersonalInfoCreate, PersonalInfoUpdate, PersonalInfoOut,
    EducationCreate, EducationUpdate, EducationOut,
    SkillCreate, SkillUpdate, SkillOut,
    TechnologyCreate, TechnologyUpdate, TechnologyOut,
    ProjectCreate, ProjectUpdate, ProjectOut,
    InternshipCreate, InternshipUpdate, InternshipOut,
    CertificationCreate, CertificationUpdate, CertificationOut,
    LeadershipCreate, LeadershipUpdate, LeadershipOut,
    AchievementCreate, AchievementUpdate, AchievementOut,
    PositionCreate, PositionUpdate, PositionOut
)
from app.services.profile import get_profile_completeness

router = APIRouter(prefix="/api/profile", tags=["profile"])

# ----------------- GENERAL PROFILE SUMMARY -----------------

@router.get("/summary", response_model=ProfileSummaryOut)
def get_profile_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    comp = get_profile_completeness(current_user.id, db)
    
    # Query all sections
    personal = db.query(UserProfilePersonal).filter(UserProfilePersonal.user_id == current_user.id).first()
    educations = db.query(UserProfileEducation).filter(UserProfileEducation.user_id == current_user.id).all()
    skills = db.query(UserProfileSkill).filter(UserProfileSkill.user_id == current_user.id).all()
    technologies = db.query(UserProfileTechnology).filter(UserProfileTechnology.user_id == current_user.id).all()
    projects = db.query(UserProfileProject).filter(UserProfileProject.user_id == current_user.id).all()
    internships = db.query(UserProfileInternship).filter(UserProfileInternship.user_id == current_user.id).all()
    certifications = db.query(UserProfileCertification).filter(UserProfileCertification.user_id == current_user.id).all()
    leaderships = db.query(UserProfileLeadership).filter(UserProfileLeadership.user_id == current_user.id).all()
    achievements = db.query(UserProfileAchievement).filter(UserProfileAchievement.user_id == current_user.id).all()
    positions = db.query(UserProfilePosition).filter(UserProfilePosition.user_id == current_user.id).all()

    return {
        "completion_percentage": comp["completion_percentage"],
        "sections_status": comp["sections_status"],
        "personal_info": personal,
        "educations": educations,
        "skills": skills,
        "technologies": technologies,
        "projects": projects,
        "internships": internships,
        "certifications": certifications,
        "leaderships": leaderships,
        "achievements": achievements,
        "positions": positions
    }


# ----------------- PERSONAL INFO -----------------

@router.post("/personal", response_model=PersonalInfoOut)
def create_or_update_personal_info(info: PersonalInfoCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_info = db.query(UserProfilePersonal).filter(UserProfilePersonal.user_id == current_user.id).first()
    if db_info:
        # Update existing
        for key, value in info.model_dump().items():
            setattr(db_info, key, value)
    else:
        # Create new
        db_info = UserProfilePersonal(user_id=current_user.id, **info.model_dump())
        db.add(db_info)
    
    db.commit()
    db.refresh(db_info)
    return db_info

@router.get("/personal", response_model=PersonalInfoOut)
def get_personal_info(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_info = db.query(UserProfilePersonal).filter(UserProfilePersonal.user_id == current_user.id).first()
    if not db_info:
        raise HTTPException(status_code=404, detail="Personal info not found")
    return db_info


# ----------------- EDUCATION -----------------

@router.post("/education", response_model=EducationOut)
def add_education(edu: EducationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_edu = UserProfileEducation(user_id=current_user.id, **edu.model_dump())
    db.add(db_edu)
    db.commit()
    db.refresh(db_edu)
    return db_edu

@router.put("/education/{edu_id}", response_model=EducationOut)
def update_education(edu_id: int, edu: EducationUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_edu = db.query(UserProfileEducation).filter(UserProfileEducation.id == edu_id, UserProfileEducation.user_id == current_user.id).first()
    if not db_edu:
        raise HTTPException(status_code=404, detail="Education record not found")
    for key, value in edu.model_dump().items():
        setattr(db_edu, key, value)
    db.commit()
    db.refresh(db_edu)
    return db_edu

@router.delete("/education/{edu_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_education(edu_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_edu = db.query(UserProfileEducation).filter(UserProfileEducation.id == edu_id, UserProfileEducation.user_id == current_user.id).first()
    if not db_edu:
        raise HTTPException(status_code=404, detail="Education record not found")
    db.delete(db_edu)
    db.commit()
    return None


# ----------------- SKILLS -----------------

@router.post("/skills", response_model=SkillOut)
def add_skill(skill: SkillCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_skill = UserProfileSkill(user_id=current_user.id, **skill.model_dump())
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    return db_skill

@router.put("/skills/{skill_id}", response_model=SkillOut)
def update_skill(skill_id: int, skill: SkillUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_skill = db.query(UserProfileSkill).filter(UserProfileSkill.id == skill_id, UserProfileSkill.user_id == current_user.id).first()
    if not db_skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    for key, value in skill.model_dump().items():
        setattr(db_skill, key, value)
    db.commit()
    db.refresh(db_skill)
    return db_skill

@router.delete("/skills/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_skill(skill_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_skill = db.query(UserProfileSkill).filter(UserProfileSkill.id == skill_id, UserProfileSkill.user_id == current_user.id).first()
    if not db_skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    db.delete(db_skill)
    db.commit()
    return None


# ----------------- TECHNOLOGIES -----------------

@router.post("/technologies", response_model=TechnologyOut)
def add_technology(tech: TechnologyCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_tech = UserProfileTechnology(user_id=current_user.id, **tech.model_dump())
    db.add(db_tech)
    db.commit()
    db.refresh(db_tech)
    return db_tech

@router.put("/technologies/{tech_id}", response_model=TechnologyOut)
def update_technology(tech_id: int, tech: TechnologyUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_tech = db.query(UserProfileTechnology).filter(UserProfileTechnology.id == tech_id, UserProfileTechnology.user_id == current_user.id).first()
    if not db_tech:
        raise HTTPException(status_code=404, detail="Technology not found")
    for key, value in tech.model_dump().items():
        setattr(db_tech, key, value)
    db.commit()
    db.refresh(db_tech)
    return db_tech

@router.delete("/technologies/{tech_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_technology(tech_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_tech = db.query(UserProfileTechnology).filter(UserProfileTechnology.id == tech_id, UserProfileTechnology.user_id == current_user.id).first()
    if not db_tech:
        raise HTTPException(status_code=404, detail="Technology not found")
    db.delete(db_tech)
    db.commit()
    return None


# ----------------- PROJECTS -----------------

@router.post("/projects", response_model=ProjectOut)
def add_project(proj: ProjectCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_proj = UserProfileProject(user_id=current_user.id, **proj.model_dump())
    db.add(db_proj)
    db.commit()
    db.refresh(db_proj)
    return db_proj

@router.put("/projects/{proj_id}", response_model=ProjectOut)
def update_project(proj_id: int, proj: ProjectUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_proj = db.query(UserProfileProject).filter(UserProfileProject.id == proj_id, UserProfileProject.user_id == current_user.id).first()
    if not db_proj:
        raise HTTPException(status_code=404, detail="Project not found")
    for key, value in proj.model_dump().items():
        setattr(db_proj, key, value)
    db.commit()
    db.refresh(db_proj)
    return db_proj

@router.delete("/projects/{proj_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(proj_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_proj = db.query(UserProfileProject).filter(UserProfileProject.id == proj_id, UserProfileProject.user_id == current_user.id).first()
    if not db_proj:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(db_proj)
    db.commit()
    return None


# ----------------- INTERNSHIPS -----------------

@router.post("/internships", response_model=InternshipOut)
def add_internship(intern: InternshipCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_intern = UserProfileInternship(user_id=current_user.id, **intern.model_dump())
    db.add(db_intern)
    db.commit()
    db.refresh(db_intern)
    return db_intern

@router.put("/internships/{intern_id}", response_model=InternshipOut)
def update_internship(intern_id: int, intern: InternshipUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_intern = db.query(UserProfileInternship).filter(UserProfileInternship.id == intern_id, UserProfileInternship.user_id == current_user.id).first()
    if not db_intern:
        raise HTTPException(status_code=404, detail="Internship not found")
    for key, value in intern.model_dump().items():
        setattr(db_intern, key, value)
    db.commit()
    db.refresh(db_intern)
    return db_intern

@router.delete("/internships/{intern_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_internship(intern_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_intern = db.query(UserProfileInternship).filter(UserProfileInternship.id == intern_id, UserProfileInternship.user_id == current_user.id).first()
    if not db_intern:
        raise HTTPException(status_code=404, detail="Internship not found")
    db.delete(db_intern)
    db.commit()
    return None


# ----------------- CERTIFICATIONS -----------------

@router.post("/certifications", response_model=CertificationOut)
def add_certification(cert: CertificationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_cert = UserProfileCertification(user_id=current_user.id, **cert.model_dump())
    db.add(db_cert)
    db.commit()
    db.refresh(db_cert)
    return db_cert

@router.put("/certifications/{cert_id}", response_model=CertificationOut)
def update_certification(cert_id: int, cert: CertificationUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_cert = db.query(UserProfileCertification).filter(UserProfileCertification.id == cert_id, UserProfileCertification.user_id == current_user.id).first()
    if not db_cert:
        raise HTTPException(status_code=404, detail="Certification not found")
    for key, value in cert.model_dump().items():
        setattr(db_cert, key, value)
    db.commit()
    db.refresh(db_cert)
    return db_cert

@router.delete("/certifications/{cert_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_certification(cert_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_cert = db.query(UserProfileCertification).filter(UserProfileCertification.id == cert_id, UserProfileCertification.user_id == current_user.id).first()
    if not db_cert:
        raise HTTPException(status_code=404, detail="Certification not found")
    db.delete(db_cert)
    db.commit()
    return None


# ----------------- LEADERSHIP -----------------

@router.post("/leadership", response_model=LeadershipOut)
def add_leadership(lead: LeadershipCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_lead = UserProfileLeadership(user_id=current_user.id, **lead.model_dump())
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead

@router.put("/leadership/{lead_id}", response_model=LeadershipOut)
def update_leadership(lead_id: int, lead: LeadershipUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_lead = db.query(UserProfileLeadership).filter(UserProfileLeadership.id == lead_id, UserProfileLeadership.user_id == current_user.id).first()
    if not db_lead:
        raise HTTPException(status_code=404, detail="Leadership record not found")
    for key, value in lead.model_dump().items():
        setattr(db_lead, key, value)
    db.commit()
    db.refresh(db_lead)
    return db_lead

@router.delete("/leadership/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_leadership(lead_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_lead = db.query(UserProfileLeadership).filter(UserProfileLeadership.id == lead_id, UserProfileLeadership.user_id == current_user.id).first()
    if not db_lead:
        raise HTTPException(status_code=404, detail="Leadership record not found")
    db.delete(db_lead)
    db.commit()
    return None


# ----------------- ACHIEVEMENTS -----------------

@router.post("/achievements", response_model=AchievementOut)
def add_achievement(ach: AchievementCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_ach = UserProfileAchievement(user_id=current_user.id, **ach.model_dump())
    db.add(db_ach)
    db.commit()
    db.refresh(db_ach)
    return db_ach

@router.put("/achievements/{ach_id}", response_model=AchievementOut)
def update_achievement(ach_id: int, ach: AchievementUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_ach = db.query(UserProfileAchievement).filter(UserProfileAchievement.id == ach_id, UserProfileAchievement.user_id == current_user.id).first()
    if not db_ach:
        raise HTTPException(status_code=404, detail="Achievement not found")
    for key, value in ach.model_dump().items():
        setattr(db_ach, key, value)
    db.commit()
    db.refresh(db_ach)
    return db_ach

@router.delete("/achievements/{ach_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_achievement(ach_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_ach = db.query(UserProfileAchievement).filter(UserProfileAchievement.id == ach_id, UserProfileAchievement.user_id == current_user.id).first()
    if not db_ach:
        raise HTTPException(status_code=404, detail="Achievement not found")
    db.delete(db_ach)
    db.commit()
    return None


# ----------------- POSITIONS OF RESPONSIBILITY -----------------

@router.post("/positions", response_model=PositionOut)
def add_position(pos: PositionCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_pos = UserProfilePosition(user_id=current_user.id, **pos.model_dump())
    db.add(db_pos)
    db.commit()
    db.refresh(db_pos)
    return db_pos

@router.put("/positions/{pos_id}", response_model=PositionOut)
def update_position(pos_id: int, pos: PositionUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_pos = db.query(UserProfilePosition).filter(UserProfilePosition.id == pos_id, UserProfilePosition.user_id == current_user.id).first()
    if not db_pos:
        raise HTTPException(status_code=404, detail="Position record not found")
    for key, value in pos.model_dump().items():
        setattr(db_pos, key, value)
    db.commit()
    db.refresh(db_pos)
    return db_pos

@router.delete("/positions/{pos_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_position(pos_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_pos = db.query(UserProfilePosition).filter(UserProfilePosition.id == pos_id, UserProfilePosition.user_id == current_user.id).first()
    if not db_pos:
        raise HTTPException(status_code=404, detail="Position record not found")
    db.delete(db_pos)
    db.commit()
    return None


@router.post("/review/{section}")
def review_draft_entry(section: str, data: dict, current_user: User = Depends(get_current_user)):
    from app.services.profile_intelligence import review_profile_section
    return review_profile_section(section, data)

