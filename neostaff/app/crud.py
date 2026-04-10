from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import date, datetime, timedelta
from app import models, schemas

def get_employees(db: Session, show_terminated: bool = False):
    query = db.query(models.Employee)
    if not show_terminated:
        query = query.filter(models.Employee.is_active == True)
    return query.all()

def get_employee(db: Session, emp_id: int):
    return db.query(models.Employee).filter(models.Employee.id == emp_id).first()

def get_employee_by_employee_id(db: Session, employee_id: str):
    return db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()

def get_events(db: Session):
    return db.query(models.Event).order_by(models.Event.date.desc()).all()

def create_employee(db: Session, employee: schemas.EmployeeCreate):
    # Генерируем уникальный employee_id если не указан
    if not employee.employee_id:
        # Простая генерация: первые буквы имени + ID
        base_id = f"{employee.first_name[0]}{employee.last_name[0]}".upper()
        counter = 1
        while db.query(models.Employee).filter(models.Employee.employee_id == f"{base_id}{counter:03d}").first():
            counter += 1
        employee.employee_id = f"{base_id}{counter:03d}"

    db_employee = models.Employee(**employee.dict())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

def update_employee(db: Session, emp_id: int, employee_update: schemas.EmployeeUpdate):
    db_employee = db.query(models.Employee).filter(models.Employee.id == emp_id).first()
    if db_employee:
        update_data = employee_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_employee, field, value)
        db.commit()
        db.refresh(db_employee)
    return db_employee

def terminate_employee(db: Session, emp_id: int, termination_date: date = None):
    if termination_date is None:
        termination_date = date.today()

    db_employee = db.query(models.Employee).filter(models.Employee.id == emp_id).first()
    if db_employee:
        db_employee.is_active = False
        db_employee.termination_date = termination_date
        db.commit()
        db.refresh(db_employee)

        # Создаем уведомление об увольнении
        create_notification(db, schemas.NotificationCreate(
            employee_id=emp_id,
            type="termination",
            title="Employee Terminated",
            message=f"Employee {db_employee.first_name} {db_employee.last_name} was terminated on {termination_date}",
            priority="high"
        ))

    return db_employee

def reactivate_employee(db: Session, emp_id: int):
    db_employee = db.query(models.Employee).filter(models.Employee.id == emp_id).first()
    if db_employee:
        db_employee.is_active = True
        db_employee.termination_date = None
        db.commit()
        db.refresh(db_employee)
    return db_employee

def create_event(db: Session, event: schemas.EventCreate):
    db_event = models.Event(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)

    # Если это аттестация, проверяем необходимость следующих уведомлений
    if event.is_certification:
        check_certification_notifications(db)

    return db_event

def create_timeoff(db: Session, timeoff: schemas.TimeOffCreate):
    db_timeoff = models.TimeOff(**timeoff.dict())
    db.add(db_timeoff)
    db.commit()
    db.refresh(db_timeoff)
    return db_timeoff

def create_notification(db: Session, notification: schemas.NotificationCreate):
    db_notification = models.Notification(**notification.dict())
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

def cleanup_old_notifications(db: Session):
    now = datetime.utcnow()
    remove_after_days = now - timedelta(days=90)
    read_cleanup_days = now - timedelta(days=30)

    db.query(models.Notification).filter(
        or_(
            models.Notification.created_at < remove_after_days,
            and_(models.Notification.is_read == True, models.Notification.created_at < read_cleanup_days)
        )
    ).delete(synchronize_session=False)
    db.commit()

def get_recent_notifications(db: Session, unread_only: bool = False, limit: int = 10):
    cleanup_old_notifications(db)
    query = db.query(models.Notification)
    if unread_only:
        query = query.filter(models.Notification.is_read == False)
    return query.order_by(models.Notification.created_at.desc()).limit(limit).all()

def get_employee_notifications(db: Session, emp_id: int, unread_only: bool = False):
    cleanup_old_notifications(db)
    query = db.query(models.Notification).filter(models.Notification.employee_id == emp_id)
    if unread_only:
        query = query.filter(models.Notification.is_read == False)
    return query.order_by(models.Notification.created_at.desc()).all()

def mark_notification_read(db: Session, notification_id: int):
    db_notification = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    if db_notification:
        db_notification.is_read = True
        db.commit()
        db.refresh(db_notification)
    return db_notification

def check_certification_notifications(db: Session):
    """Проверяет всех сотрудников и создает уведомления о необходимости аттестации"""
    try:
        today = date.today()
        print(f"Checking certifications for {today}")

        # Получаем всех активных сотрудников
        employees = db.query(models.Employee).filter(models.Employee.is_active == True).all()
        print(f"Found {len(employees)} active employees")

        for employee in employees:
            print(f"Checking employee {employee.id}: {employee.first_name} {employee.last_name}")

            # Создаем тестовое уведомление для каждого сотрудника
            try:
                create_notification(db, schemas.NotificationCreate(
                    employee_id=employee.id,
                    type="test_certification",
                    title="Test Certification Check",
                    message=f"Test notification for {employee.first_name} {employee.last_name}",
                    priority="normal"
                ))
                print(f"Created test notification for employee {employee.id}")
            except Exception as e:
                print(f"Error creating notification for employee {employee.id}: {e}")

        return {"message": f"Checked {len(employees)} employees"}
    except Exception as e:
        print(f"Error in check_certification_notifications: {e}")
        return {"error": str(e)}

def check_inactivity_notifications(db: Session, months_threshold: int = 3):
    """Создает уведомления по сотрудникам, у которых не было событий более указанного периода."""
    try:
        threshold_date = date.today() - timedelta(days=months_threshold * 30)
        employees = db.query(models.Employee).filter(models.Employee.is_active == True).all()

        for employee in employees:
            last_event = (
                db.query(models.Event)
                .filter(models.Event.employee_id == employee.id)
                .order_by(models.Event.date.desc())
                .first()
            )

            last_activity_date = last_event.date if last_event else employee.hire_date
            if not last_activity_date or last_activity_date <= threshold_date:
                recent_notice = (
                    db.query(models.Notification)
                    .filter(
                        models.Notification.employee_id == employee.id,
                        models.Notification.type == "inactivity_warning",
                        models.Notification.is_read == False,
                        models.Notification.created_at >= datetime.utcnow() - timedelta(days=30)
                    )
                    .first()
                )
                if recent_notice:
                    continue

                create_notification(db, schemas.NotificationCreate(
                    employee_id=employee.id,
                    type="inactivity_warning",
                    title="No recent activity",
                    message=(
                        f"No events found for {employee.first_name} {employee.last_name} in the last {months_threshold} months. "
                        "Please review their status and update the career journey."
                    ),
                    priority="high"
                ))

        return {"message": f"Checked inactivity for {len(employees)} employees"}
    except Exception as e:
        print(f"Error in check_inactivity_notifications: {e}")
        return {"error": str(e)}

def get_notifications_summary(db: Session, emp_id: int = None):
    """Получает сводку по уведомлениям"""
    cleanup_old_notifications(db)
    query = db.query(models.Notification)

    if emp_id:
        query = query.filter(models.Notification.employee_id == emp_id)

    total = query.count()
    unread = query.filter(models.Notification.is_read == False).count()
    urgent = query.filter(
        and_(
            models.Notification.is_read == False,
            models.Notification.priority.in_(["high", "urgent"])
        )
    ).count()

    return {
        "total": total,
        "unread": unread,
        "urgent": urgent
    }
