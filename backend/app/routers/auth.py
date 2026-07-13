from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.models import User
from app.schemas import UserSignUp, UserSignIn, Token, UserOut
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup(user_data: UserSignUp, db: Session = Depends(get_db)):
    # Check if username exists
    existing_username = db.query(User).filter(User.username == user_data.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email exists
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    hashed_pw = get_password_hash(user_data.password)
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_pw
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate token
    token_data = {"sub": new_user.username, "user_id": new_user.id}
    token = create_access_token(data=token_data)
    return {"access_token": token, "token_type": "bearer"}


@router.post("/signin", response_model=Token)
def signin(credentials: UserSignIn, db: Session = Depends(get_db)):
    # Find user by email or username
    user = db.query(User).filter(
        (User.username == credentials.username_or_email) | 
        (User.email == credentials.username_or_email)
    ).first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate token
    token_data = {"sub": user.username, "user_id": user.id}
    token = create_access_token(data=token_data)
    return {"access_token": token, "token_type": "bearer"}


# OAuth2-compliant endpoint for automatic doc integrations or external tools
@router.post("/signin-token-url", response_model=Token)
def signin_token_url(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.username == form_data.username) | 
        (User.email == form_data.username)
    ).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_data = {"sub": user.username, "user_id": user.id}
    token = create_access_token(data=token_data)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
