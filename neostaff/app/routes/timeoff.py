from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import crud, schemas

router = APIRouter(prefix="/timeoff", tags=["TimeOff"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def create_timeoff(t: schemas.TimeOffCreate, db: Session = Depends(get_db)):
    return crud.create_timeoff(db, t)