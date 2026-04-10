from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class EmployeeBase(BaseModel):
    employee_id: Optional[str] = None
    first_name: str
    last_name: str
    department: str
    position: str
    hire_date: Optional[date] = None
    termination_date: Optional[date] = None
    is_active: bool = True
    role: str = "employee"
    hierarchy_level: int = 1
    manager_id: Optional[int] = None
    about: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    employee_id: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    hire_date: Optional[date] = None
    termination_date: Optional[date] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None
    hierarchy_level: Optional[int] = None
    manager_id: Optional[int] = None
    about: Optional[str] = None

class Employee(EmployeeBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True
        from_attributes = True

class EventBase(BaseModel):
    type: str
    title: str
    description: str
    date: date
    employee_id: int
    is_certification: bool = False

class EventCreate(EventBase):
    pass

class Event(EventBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True
        from_attributes = True

class TimeOffBase(BaseModel):
    type: str
    start_date: date
    end_date: date
    employee_id: int
    status: str = "pending"
    notes: Optional[str] = None

class TimeOffCreate(TimeOffBase):
    pass

class TimeOff(TimeOffBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True
        from_attributes = True

class NotificationBase(BaseModel):
    employee_id: int
    type: str
    title: str
    message: str
    priority: str = "normal"
    due_date: Optional[date] = None

class NotificationCreate(NotificationBase):
    pass

class Notification(NotificationBase):
    id: int
    is_read: bool = False
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True