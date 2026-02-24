from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    username = Column(String, unique=True)
    contact = Column(String)
    gender = Column(String)
    marital_status = Column(String)
    id_number = Column(String)
    address = Column(String)
    photo = Column(String)
    password = Column(String, nullable=False)

    categories = relationship("Category", back_populates="owner")
    transactions = relationship("Transaction", back_populates="owner")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # 'income' or 'expense'

    owner = relationship("User", back_populates="categories")
    transactions = relationship("Transaction", back_populates="category")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    category_id = Column(Integer, ForeignKey("categories.id"))
    amount = Column(Float, nullable=False)
    description = Column(String)
    date = Column(String, nullable=False)
    type = Column(String, nullable=False) # 'income' or 'expense'

    owner = relationship("User", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")
