from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    personal_info = relationship("UserProfilePersonal", back_populates="user", uselist=False, cascade="all, delete-orphan")
    educations = relationship("UserProfileEducation", back_populates="user", cascade="all, delete-orphan")
    skills = relationship("UserProfileSkill", back_populates="user", cascade="all, delete-orphan")
    technologies = relationship("UserProfileTechnology", back_populates="user", cascade="all, delete-orphan")
    projects = relationship("UserProfileProject", back_populates="user", cascade="all, delete-orphan")
    internships = relationship("UserProfileInternship", back_populates="user", cascade="all, delete-orphan")
    certifications = relationship("UserProfileCertification", back_populates="user", cascade="all, delete-orphan")
    leaderships = relationship("UserProfileLeadership", back_populates="user", cascade="all, delete-orphan")
    achievements = relationship("UserProfileAchievement", back_populates="user", cascade="all, delete-orphan")
    positions = relationship("UserProfilePosition", back_populates="user", cascade="all, delete-orphan")
    jds = relationship("JobDescription", back_populates="user", cascade="all, delete-orphan")
    resumes = relationship("GeneratedResume", back_populates="user", cascade="all, delete-orphan")


class UserProfilePersonal(Base):
    __tablename__ = "user_profile_personal"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    github = Column(String, nullable=True)
    linkedin = Column(String, nullable=True)
    website = Column(String, nullable=True)
    summary = Column(Text, nullable=True)

    user = relationship("User", back_populates="personal_info")


class UserProfileEducation(Base):
    __tablename__ = "user_profile_education"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    institution = Column(String, nullable=False)
    degree = Column(String, nullable=False)
    field_of_study = Column(String, nullable=False)
    start_date = Column(String, nullable=False)  # Stored as text/string for flexibility
    end_date = Column(String, nullable=True)     # Present or end date
    gpa = Column(String, nullable=True)
    location = Column(String, nullable=True)

    user = relationship("User", back_populates="educations")


class UserProfileSkill(Base):
    __tablename__ = "user_profile_skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    level = Column(String, nullable=True)  # e.g., Beginner, Intermediate, Advanced

    user = relationship("User", back_populates="skills")


class UserProfileTechnology(Base):
    __tablename__ = "user_profile_technologies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=True)  # e.g., Languages, Frameworks, Libraries, Tools

    user = relationship("User", back_populates="technologies")


class UserProfileProject(Base):
    __tablename__ = "user_profile_projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    technologies = Column(String, nullable=True)  # comma separated
    role = Column(String, nullable=True)          # e.g., Frontend Lead, Full Stack Developer
    team_size = Column(String, nullable=True)     # e.g., "3 members"
    outcome = Column(Text, nullable=True)         # e.g., "Reduced page latency by 20%"
    start_date = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    url = Column(String, nullable=True)

    user = relationship("User", back_populates="projects")


class UserProfileInternship(Base):
    __tablename__ = "user_profile_internships"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=True)      # Present/date
    location = Column(String, nullable=True)

    user = relationship("User", back_populates="internships")


class UserProfileCertification(Base):
    __tablename__ = "user_profile_certifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    issuer = Column(String, nullable=False)
    issue_date = Column(String, nullable=True)
    expiry_date = Column(String, nullable=True)
    url = Column(String, nullable=True)

    user = relationship("User", back_populates="certifications")


class UserProfileLeadership(Base):
    __tablename__ = "user_profile_leaderships"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    organization = Column(String, nullable=False)
    role = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=True)

    user = relationship("User", back_populates="leaderships")


class UserProfileAchievement(Base):
    __tablename__ = "user_profile_achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    date = Column(String, nullable=True)

    user = relationship("User", back_populates="achievements")


class UserProfilePosition(Base):
    __tablename__ = "user_profile_positions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    organization = Column(String, nullable=False)
    role = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=True)

    user = relationship("User", back_populates="positions")


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    company_name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    jd_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="jds")
    resumes = relationship("GeneratedResume", back_populates="jd")


class GeneratedResume(Base):
    __tablename__ = "generated_resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    jd_id = Column(Integer, ForeignKey("job_descriptions.id", ondelete="SET NULL"), nullable=True)
    company_name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    ats_score = Column(Float, nullable=False)
    resume_json = Column(JSON, nullable=False)          # Tailored resume details
    ats_analysis_json = Column(JSON, nullable=False)    # Match %, keywords, gaps, strengths, improvements

    user = relationship("User", back_populates="resumes")
    jd = relationship("JobDescription", back_populates="resumes")
