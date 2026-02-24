from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from .. import models, schemas, auth_utils
from ..database import get_db

router = APIRouter(
    prefix="/api/transactions",
    tags=["transactions"]
)

@router.get("/", response_model=List[schemas.TransactionResponse])
def get_transactions(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    transactions = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id
    ).order_by(desc(models.Transaction.date)).all()
    
    # Manually join category name if needed, or rely on ORM
    for t in transactions:
        if t.category:
            t.category_name = t.category.name
            
    return transactions

@router.post("/", response_model=schemas.TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    transaction: schemas.TransactionCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    new_transaction = models.Transaction(
        user_id=current_user.id,
        category_id=transaction.category_id,
        amount=transaction.amount,
        description=transaction.description,
        date=transaction.date,
        type=transaction.type
    )
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    
    # Fetch category name for response
    if new_transaction.category:
        new_transaction.category_name = new_transaction.category.name
        
    return new_transaction

@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    transaction = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    db.delete(transaction)
    db.commit()
    return None
