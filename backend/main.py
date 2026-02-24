from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, transactions, categories
from .database import engine, Base

# Create tables if they don't exist (migrations should handle this ideally, but this is safe for now)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Real Balance API")

# CORS
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(categories.router)

@app.get("/")
def read_root():
    return {"message": "Real Balance API is running"}
