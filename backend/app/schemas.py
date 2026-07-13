from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# ----------------- AUTHENTICATION SCHEMAS -----------------

class UserSignUp(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserSignIn(BaseModel):
    username_or_email: str = Field(...)
    password: str = Field(...)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


# ----------------- PROFILE SECTION SCHEMAS -----------------

class PersonalInfoBase(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    website: Optional[str] = None
    summary: Optional[str] = None

class PersonalInfoCreate(PersonalInfoBase):
    pass

class PersonalInfoUpdate(PersonalInfoBase):
    pass

class PersonalInfoOut(PersonalInfoBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class EducationBase(BaseModel):
    institution: str
    degree: str
    field_of_study: str
    start_date: str
    end_date: Optional[str] = None
    gpa: Optional[str] = None
    location: Optional[str] = None

class EducationCreate(EducationBase):
    pass

class EducationUpdate(EducationBase):
    pass

class EducationOut(EducationBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class SkillBase(BaseModel):
    name: str
    level: Optional[str] = None  # e.g., Beginner, Intermediate, Advanced

class SkillCreate(SkillBase):
    pass

class SkillUpdate(SkillBase):
    pass

class SkillOut(SkillBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class TechnologyBase(BaseModel):
    name: str
    category: Optional[str] = None  # e.g., Frontend, Backend, Devops, Database, Language

class TechnologyCreate(TechnologyBase):
    pass

class TechnologyUpdate(TechnologyBase):
    pass

class TechnologyOut(TechnologyBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class ProjectBase(BaseModel):
    title: str
    description: str
    technologies: Optional[str] = None  # comma separated
    role: Optional[str] = None
    team_size: Optional[str] = None
    outcome: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    url: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(ProjectBase):
    pass

class ProjectOut(ProjectBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class InternshipBase(BaseModel):
    company: str
    role: str
    description: str
    start_date: str
    end_date: Optional[str] = None
    location: Optional[str] = None

class InternshipCreate(InternshipBase):
    pass

class InternshipUpdate(InternshipBase):
    pass

class InternshipOut(InternshipBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class CertificationBase(BaseModel):
    name: str
    issuer: str
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    url: Optional[str] = None

class CertificationCreate(CertificationBase):
    pass

class CertificationUpdate(CertificationBase):
    pass

class CertificationOut(CertificationBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class LeadershipBase(BaseModel):
    organization: str
    role: str
    description: str
    start_date: str
    end_date: Optional[str] = None

class LeadershipCreate(LeadershipBase):
    pass

class LeadershipUpdate(LeadershipBase):
    pass

class LeadershipOut(LeadershipBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class AchievementBase(BaseModel):
    title: str
    description: str
    date: Optional[str] = None

class AchievementCreate(AchievementBase):
    pass

class AchievementUpdate(AchievementBase):
    pass

class AchievementOut(AchievementBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class PositionBase(BaseModel):
    organization: str
    role: str
    description: str
    start_date: str
    end_date: Optional[str] = None

class PositionCreate(PositionBase):
    pass

class PositionUpdate(PositionBase):
    pass

class PositionOut(PositionBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True


# Aggregated profile info response
class ProfileSummaryOut(BaseModel):
    completion_percentage: float
    sections_status: Dict[str, bool]
    personal_info: Optional[PersonalInfoOut] = None
    educations: List[EducationOut] = []
    skills: List[SkillOut] = []
    technologies: List[TechnologyOut] = []
    projects: List[ProjectOut] = []
    internships: List[InternshipOut] = []
    certifications: List[CertificationOut] = []
    leaderships: List[LeadershipOut] = []
    achievements: List[AchievementOut] = []
    positions: List[PositionOut] = []


# ----------------- JOB DESCRIPTION SCHEMAS -----------------

class JDBase(BaseModel):
    company_name: str
    role: str
    jd_text: str

class JDCreate(JDBase):
    pass

class JDUpdate(JDBase):
    pass

class JDOut(JDBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ----------------- ATS & TAILORED RESUME SCHEMAS -----------------

class ATSAnalysisReport(BaseModel):
    match_percentage: float
    matching_skills: List[str]
    missing_skills: List[str]
    strengths: List[str]
    gaps: Optional[List[str]] = []
    weaknesses: List[str]
    missing_experience: List[str]
    missing_certifications: List[str]
    recommendations: List[str]
    improvement_roadmap: List[str]

class TailoredResumeJSON(BaseModel):
    personal_info: Dict[str, Any]
    summary: str
    education: List[Dict[str, Any]]
    skills: List[str]
    technologies: List[str]
    projects: List[Dict[str, Any]]
    internships: List[Dict[str, Any]]
    certifications: List[Dict[str, Any]]
    leadership: List[Dict[str, Any]]
    achievements: List[Dict[str, Any]]
    positions_of_responsibility: List[Dict[str, Any]]

class GeneratedResumeOut(BaseModel):
    id: int
    user_id: int
    jd_id: Optional[int] = None
    company_name: str
    role: str
    created_at: datetime
    ats_score: float
    resume_json: Dict[str, Any]
    ats_analysis_json: Dict[str, Any]
    jd: Optional[JDOut] = None

    class Config:
        from_attributes = True


# ----------------- AI CHAT SCHEMAS -----------------

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class AIChatRequest(BaseModel):
    section: str  # e.g., "projects", "internships", etc.
    messages: List[ChatMessage]
    current_form_data: Optional[Dict[str, Any]] = None

class AIChatResponse(BaseModel):
    response_text: str
    is_complete: bool
    parsed_data: Optional[Dict[str, Any]] = None
