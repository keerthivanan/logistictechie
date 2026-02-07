from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.schemas import Token, UserLogin, UserResponse
from app.core import security
from app import crud
from datetime import timedelta

router = APIRouter()

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: UserLogin, db: AsyncSession = Depends(deps.get_db)):
    """
    REAL Authentication against PostgreSQL.
    """
    user = await crud.user.get_by_email(db, email=form_data.email)
    
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(
    token: str = Depends(OAuth2PasswordBearer(tokenUrl="api/auth/login")),
    db: AsyncSession = Depends(deps.get_db)
):
    # Retrieve user from token (simplified for brevity, usually done in deps)
    payload = security.decode_token(token)
    email: str = payload.get("sub")
    
    if email is None:
        raise HTTPException(status_code=401, detail="Invalid Credentials")
        
    user = await crud.user.get_by_email(db, email=email)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
        
    return user
