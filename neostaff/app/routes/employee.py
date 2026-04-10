from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.database import SessionLocal
from app import crud, schemas

router = APIRouter(prefix="/employees", tags=["Employees"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[schemas.Employee])
def get_all(show_terminated: bool = Query(False, description="Include terminated employees"),
            db: Session = Depends(get_db)):
    return crud.get_employees(db, show_terminated=show_terminated)

@router.get("/{emp_id}", response_model=schemas.Employee)
def get_one(emp_id: int, db: Session = Depends(get_db)):
    emp = crud.get_employee(db, emp_id)
    if emp is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp

@router.get("/by-employee-id/{employee_id}", response_model=schemas.Employee)
def get_by_employee_id(employee_id: str, db: Session = Depends(get_db)):
    emp = crud.get_employee_by_employee_id(db, employee_id)
    if emp is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp

@router.post("/", response_model=schemas.Employee)
def create(emp: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    return crud.create_employee(db, emp)

@router.put("/{emp_id}", response_model=schemas.Employee)
def update(emp_id: int, emp_update: schemas.EmployeeUpdate, db: Session = Depends(get_db)):
    emp = crud.update_employee(db, emp_id, emp_update)
    if emp is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp

@router.post("/{emp_id}/terminate", response_model=schemas.Employee)
def terminate(emp_id: int, termination_date: Optional[date] = None, db: Session = Depends(get_db)):
    emp = crud.terminate_employee(db, emp_id, termination_date)
    if emp is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp

@router.post("/{emp_id}/reactivate", response_model=schemas.Employee)
def reactivate(emp_id: int, db: Session = Depends(get_db)):
    emp = crud.reactivate_employee(db, emp_id)
    if emp is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp