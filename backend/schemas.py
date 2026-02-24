from pydantic import BaseModel
from typing import Optional, List

# User Schemas
class UserBase(BaseModel):
    name: str
    email: str
    username: str
    contact: Optional[str] = None
    gender: Optional[str] = None
    maritalStatus: Optional[str] = None # Frontend sends camelCase
    idNumber: Optional[str] = None      # Frontend sends camelCase
    address: Optional[str] = None
    photo: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    username: Optional[str] = None
    contact: Optional[str] = None
    gender: Optional[str] = None
    maritalStatus: Optional[str] = None
    idNumber: Optional[str] = None
    address: Optional[str] = None
    photo: Optional[str] = None
    password: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    marital_status: Optional[str] = None # DB is snake_case
    id_number: Optional[str] = None      # DB is snake_case
    
    class Config:
        orm_mode = True
        
    # Helper to map frontend camelCase to backend snake_case if needed, 
    # but Pydantic's 'orm_mode' usually reads from the object attributes.
    # We might need to handle the input mapping in the route.

# Login Schema
class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    token: str
    user: dict # Or UserResponse

# Transaction/Category Schemas
class CategoryBase(BaseModel):
    name: str
    type: str

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    user_id: Optional[int]

    class Config:
        orm_mode = True

class TransactionBase(BaseModel):
    amount: float
    description: str
    date: str
    type: str
    category_id: int

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    category_name: Optional[str] = None # Computed field

    class Config:
        orm_mode = True
