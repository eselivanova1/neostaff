from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import SessionLocal
from app import crud, schemas

router = APIRouter(prefix="/notifications", tags=["Notifications"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/employee/{emp_id}", response_model=List[schemas.Notification])
def get_employee_notifications(emp_id: int, unread_only: bool = False, db: Session = Depends(get_db)):
    return crud.get_employee_notifications(db, emp_id, unread_only)

@router.post("/", response_model=schemas.Notification)
def create_notification(notification: schemas.NotificationCreate, db: Session = Depends(get_db)):
    return crud.create_notification(db, notification)

@router.put("/{notification_id}/read", response_model=schemas.Notification)
def mark_as_read(notification_id: int, db: Session = Depends(get_db)):
    notification = crud.mark_notification_read(db, notification_id)
    if notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

@router.get("/recent", response_model=List[schemas.Notification])
def get_recent_notifications(unread_only: bool = False, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_recent_notifications(db, unread_only, limit)

@router.get("/summary")
def get_notifications_summary(emp_id: int = None, db: Session = Depends(get_db)):
    return crud.get_notifications_summary(db, emp_id)

@router.post("/check-inactivity")
def check_inactivity(db: Session = Depends(get_db)):
    crud.check_inactivity_notifications(db)
    return {"message": "Inactivity notifications checked and created if needed"}

@router.post("/check-certifications")
def check_certifications(db: Session = Depends(get_db)):
    crud.check_certification_notifications(db)
    return {"message": "Certification notifications checked and created if needed"}