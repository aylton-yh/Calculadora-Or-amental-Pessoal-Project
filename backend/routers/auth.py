from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from . import models, schemas, auth_utils
from .database import get_db

router = APIRouter(
    prefix="/api/auth",
    tags=["auth"]
)

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check existing user
    db_user = db.query(models.User).filter(
        (models.User.email == user.email) | (models.User.username == user.username)
    ).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Usuário ou Email já cadastrado.")

    # Create new user
    hashed_password = auth_utils.get_password_hash(user.password)
    
    # Map pydantic camelCase/English to DB snake_case
    new_user = models.User(
        name=user.name,
        email=user.email,
        username=user.username,
        contact=user.contact,
        gender=user.gender,
        marital_status=user.maritalStatus,
        id_number=user.idNumber,
        address=user.address,
        photo=user.photo,
        password=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "User registered successfully"}

@router.post("/login")
def login(creds: schemas.LoginRequest, db: Session = Depends(get_db)):
    # Find user
    user = db.query(models.User).filter(
        (models.User.username == creds.username) | (models.User.email == creds.username)
    ).first()
    
    if not user or not auth_utils.verify_password(creds.password, user.password):
        raise HTTPException(status_code=400, detail="Credenciais inválidas ou erro de conexão com o servidor.")
        
    # Generate token
    token = auth_utils.create_access_token(data={"sub": user.username, "id": user.id})
    
    # Prepare response user (exclude password)
    user_data = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "username": user.username,
        "contact": user.contact,
        "gender": user.gender,
        "marital_status": user.marital_status,
        "id_number": user.id_number,
        "address": user.address,
        "photo": user.photo
    }
    
    return {"token": token, "user": user_data}

@router.put("/profile")
def update_profile(user_update: schemas.UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth_utils.get_current_user)):
    # Check if email or username already taken by another user
    if user_update.email and user_update.email != current_user.email:
        if db.query(models.User).filter(models.User.email == user_update.email).first():
            raise HTTPException(status_code=400, detail="Email já está em uso.")
    
    if user_update.username and user_update.username != current_user.username:
        if db.query(models.User).filter(models.User.username == user_update.username).first():
            raise HTTPException(status_code=400, detail="Nome de usuário já está em uso.")

    # Update fields
    if user_update.name is not None: current_user.name = user_update.name
    if user_update.email is not None: current_user.email = user_update.email
    if user_update.username is not None: current_user.username = user_update.username
    if user_update.contact is not None: current_user.contact = user_update.contact
    if user_update.gender is not None: current_user.gender = user_update.gender
    if user_update.maritalStatus is not None: current_user.marital_status = user_update.maritalStatus
    if user_update.idNumber is not None: current_user.id_number = user_update.idNumber
    if user_update.address is not None: current_user.address = user_update.address
    if user_update.photo is not None: current_user.photo = user_update.photo
    if user_update.password:
        current_user.password = auth_utils.get_password_hash(user_update.password)

    db.commit()
    db.refresh(current_user)
    
    # Generate new token in case username changed
    token = auth_utils.create_access_token(data={"sub": current_user.username, "id": current_user.id})
    
    # Return updated user data and token
    user_data = {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "username": current_user.username,
        "contact": current_user.contact,
        "gender": current_user.gender,
        "marital_status": current_user.marital_status,
        "id_number": current_user.id_number,
        "address": current_user.address,
        "photo": current_user.photo
    }
    return {"token": token, "user": user_data}

@router.delete("/profile")
def delete_profile(db: Session = Depends(get_db), current_user: models.User = Depends(auth_utils.get_current_user)):
    # Cascading delete should be handled by DB or manually
    # Relationships in models.py don't have cascade="all, delete" yet. 
    # Let's add it or do it here.
    
    # Manually delete related data to be safe in SQLite
    db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id).delete()
    db.query(models.Category).filter(models.Category.user_id == current_user.id).delete()
    
    db.delete(current_user)
    db.commit()
    return {"message": "Conta eliminada com sucesso."}
