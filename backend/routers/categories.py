from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, auth_utils
from ..database import get_db

router = APIRouter(
    prefix="/api/categories",
    tags=["categories"]
)

@router.get("/", response_model=List[schemas.CategoryResponse])
def get_categories(
    type: Optional[str] = None, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    query = db.query(models.Category).filter(
        (models.Category.user_id == current_user.id) | (models.Category.user_id == None)
    )
    if type:
        query = query.filter(models.Category.type == type)
    return query.all()
