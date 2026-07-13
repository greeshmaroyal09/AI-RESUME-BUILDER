from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import datetime
from app.database import get_db
from app.auth import get_current_user
from app.models import User, JobDescription, GeneratedResume
from app.schemas import ATSAnalysisReport, GeneratedResumeOut
from app.services.ats_engine import analyze_ats
from app.services.resume_generator import generate_tailored_resume
from app.services.exporter import export_pdf, export_docx

router = APIRouter(prefix="/api/resume", tags=["resume"])

class AnalyzeRequest(BaseModel):
    jd_id: int

class GenerateRequest(BaseModel):
    jd_id: int

@router.post("/analyze", response_model=ATSAnalysisReport)
def analyze_profile_against_jd(req: AnalyzeRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    jd = db.query(JobDescription).filter(
        JobDescription.id == req.jd_id,
        JobDescription.user_id == current_user.id
    ).first()

    if not jd:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job Description not found"
        )

    # Perform ATS analysis
    report = analyze_ats(
        user_id=current_user.id,
        jd_text=jd.jd_text,
        role=jd.role,
        company=jd.company_name,
        db=db
    )
    return report


@router.post("/generate", response_model=GeneratedResumeOut)
def generate_and_save_resume(req: GenerateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    jd = db.query(JobDescription).filter(
        JobDescription.id == req.jd_id,
        JobDescription.user_id == current_user.id
    ).first()

    if not jd:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job Description not found"
        )

    # 1. Orchestrate multi-agent flow (Reviewer, Writer, and Coach Agents)
    from app.services.agents import CrewOrchestrator
    from app.services.ats_engine import get_user_profile_data
    
    profile_data = get_user_profile_data(current_user.id, db)
    orchestrator = CrewOrchestrator()
    collaboration_results = orchestrator.run_collaboration(
        profile_data=profile_data,
        jd_text=jd.jd_text,
        role=jd.role,
        company=jd.company_name
    )
    
    report = collaboration_results["ats_report"]
    tailored_data = collaboration_results["resume"]

    # 2. Create a generated resume history entry
    new_resume = GeneratedResume(
        user_id=current_user.id,
        jd_id=jd.id,
        company_name=jd.company_name,
        role=jd.role,
        ats_score=report["match_percentage"],
        resume_json=tailored_data,
        ats_analysis_json=report
    )

    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)
    
    return new_resume


@router.delete("/history/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume_history_item(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(GeneratedResume).filter(
        GeneratedResume.id == resume_id,
        GeneratedResume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume history item not found")
    db.delete(resume)
    db.commit()
    return None


@router.get("/history", response_model=List[GeneratedResumeOut])
def get_resume_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(GeneratedResume).filter(
        GeneratedResume.user_id == current_user.id
    ).order_by(GeneratedResume.created_at.desc()).all()


@router.get("/history/{resume_id}", response_model=GeneratedResumeOut)
def get_history_item(resume_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(GeneratedResume).filter(
        GeneratedResume.id == resume_id,
        GeneratedResume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume history item not found"
        )

    return resume


@router.get("/export/{resume_id}/pdf")
def download_resume_pdf(resume_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(GeneratedResume).filter(
        GeneratedResume.id == resume_id,
        GeneratedResume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    pdf_bytes = export_pdf(resume.resume_json)
    filename = f"{resume.company_name}_{resume.role}_Resume.pdf".replace(" ", "_")
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/export/{resume_id}/docx")
def download_resume_docx(resume_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(GeneratedResume).filter(
        GeneratedResume.id == resume_id,
        GeneratedResume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    docx_bytes = export_docx(resume.resume_json)
    filename = f"{resume.company_name}_{resume.role}_Resume.docx".replace(" ", "_")
    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
