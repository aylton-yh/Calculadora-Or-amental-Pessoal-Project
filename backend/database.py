from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import sys

# Ensure we can find the database in the root or server folder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "server", "database.sqlite")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

# Add check/creation if not exists? No, we want to migrate, so it SHOULD exist.
# But for safety in case we want to start fresh later:
if not os.path.exists(DB_PATH):
    print(f"WARNING: Database not found at {DB_PATH}")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
