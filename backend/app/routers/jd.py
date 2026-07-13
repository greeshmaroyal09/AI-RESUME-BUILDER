from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.auth import get_current_user
from app.models import User, JobDescription
from app.schemas import JDCreate, JDUpdate, JDOut

router = APIRouter(prefix="/api/jd", tags=["jd"])

@router.get("", response_model=List[JDOut])
def get_job_descriptions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(JobDescription).filter(JobDescription.user_id == current_user.id).all()


@router.post("", response_model=JDOut, status_code=status.HTTP_201_CREATED)
def create_job_description(jd: JDCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check limit of active Job Descriptions (capped at 3)
    existing_count = db.query(JobDescription).filter(JobDescription.user_id == current_user.id).count()
    if existing_count >= 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit reached. You can have at most 3 active Job Descriptions."
        )

    db_jd = JobDescription(
        user_id=current_user.id,
        company_name=jd.company_name,
        role=jd.role,
        jd_text=jd.jd_text
    )
    db.add(db_jd)
    db.commit()
    db.refresh(db_jd)
    return db_jd


@router.put("/{jd_id}", response_model=JDOut)
def update_job_description(jd_id: int, jd: JDUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_jd = db.query(JobDescription).filter(
        JobDescription.id == jd_id,
        JobDescription.user_id == current_user.id
    ).first()

    if not db_jd:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job Description not found"
        )

    db_jd.company_name = jd.company_name
    db_jd.role = jd.role
    db_jd.jd_text = jd.jd_text
    
    db.commit()
    db.refresh(db_jd)
    return db_jd


@router.delete("/{jd_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job_description(jd_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_jd = db.query(JobDescription).filter(
        JobDescription.id == jd_id,
        JobDescription.user_id == current_user.id
    ).first()

    if not db_jd:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job Description not found"
        )

    db.delete(db_jd)
    db.commit()
    return None
