from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, DateTime, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True)  # Уникальный идентификатор сотрудника
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)  # Новый атрибут
    phone = Column(String, nullable=True)  # Новый атрибут
    department = Column(String, nullable=False)
    position = Column(String, nullable=False)
    hire_date = Column(Date, nullable=False)
    termination_date = Column(Date, nullable=True)  # Дата увольнения
    is_active = Column(Boolean, default=True)
    role = Column(String, default="employee")  # employee, manager, hr, admin
    salary = Column(Float, nullable=True)  # Новый атрибут
    hierarchy_level = Column(Integer, default=1)  # Уровень в иерархии (1-низший, 5-высший)
    manager_id = Column(Integer, ForeignKey("employees.id"), nullable=True)  # Руководитель
    about = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Связи
    events = relationship("Event", back_populates="employee")
    timeoffs = relationship("TimeOff", back_populates="employee")
    notifications = relationship("Notification", back_populates="employee")
    manager = relationship("Employee", remote_side=[id], backref="subordinates")

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    type = Column(String, nullable=False)  # promotion, review, certification, training, etc.
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    date = Column(Date, nullable=False)
    is_certification = Column(Boolean, default=False)  # Для отслеживания аттестаций
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    employee = relationship("Employee", back_populates="events")

class TimeOff(Base):
    __tablename__ = "timeoffs"

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    type = Column(String, nullable=False)  # vacation / sick / day_off
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(String, default="pending")  # pending, approved, rejected
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    employee = relationship("Employee", back_populates="timeoffs")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    type = Column(String, nullable=False)  # certification_due, review_due, probation_ending, etc.
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    priority = Column(String, default="normal")  # low, normal, high, urgent
    due_date = Column(Date, nullable=True)  # Дата, к которой нужно выполнить действие
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    employee = relationship("Employee", back_populates="notifications")