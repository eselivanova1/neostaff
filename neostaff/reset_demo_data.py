from datetime import date

from sqlalchemy import text

from app import crud, schemas
from app.database import SessionLocal


EMPLOYEES = [
    {"employee_id": "IT001", "first_name": "Алексей", "last_name": "Соколов", "department": "IT", "position": "Head of Engineering", "hire_date": date(2018, 5, 14), "role": "manager", "hierarchy_level": 4, "about": "Руководит инженерной командой и развитием внутренней платформы."},
    {"employee_id": "IT002", "first_name": "Мария", "last_name": "Павлова", "department": "IT", "position": "Senior Backend Engineer", "hire_date": date(2020, 2, 3), "role": "employee", "hierarchy_level": 3, "about": "Развивает backend-сервисы и отвечает за надежность интеграций."},
    {"employee_id": "IT003", "first_name": "Дмитрий", "last_name": "Орехов", "department": "IT", "position": "Frontend Engineer", "hire_date": date(2021, 9, 20), "role": "employee", "hierarchy_level": 2, "about": "Отвечает за интерфейсы HR-продуктов и внутренние кабинеты."},
    {"employee_id": "IT004", "first_name": "Елена", "last_name": "Громова", "department": "IT", "position": "QA Engineer", "hire_date": date(2022, 1, 17), "role": "employee", "hierarchy_level": 2, "about": "Ведет регрессионное тестирование и автоматизацию smoke-наборов."},
    {"employee_id": "IT005", "first_name": "Илья", "last_name": "Назаров", "department": "IT", "position": "DevOps Engineer", "hire_date": date(2019, 11, 11), "role": "employee", "hierarchy_level": 3, "about": "Поддерживает CI/CD и облачную инфраструктуру."},
    {"employee_id": "IT006", "first_name": "Ольга", "last_name": "Ларионова", "department": "IT", "position": "Business Systems Analyst", "hire_date": date(2023, 3, 6), "role": "employee", "hierarchy_level": 2, "about": "Собирает требования для HR и finance-процессов."},
    {"employee_id": "HR001", "first_name": "Татьяна", "last_name": "Миронова", "department": "HR", "position": "HR Director", "hire_date": date(2017, 8, 7), "role": "hr", "hierarchy_level": 4, "about": "Курирует подбор, адаптацию и кадровые процессы компании."},
    {"employee_id": "HR002", "first_name": "Ирина", "last_name": "Беляева", "department": "HR", "position": "HR Business Partner", "hire_date": date(2020, 6, 1), "role": "hr", "hierarchy_level": 3, "about": "Поддерживает руководителей и развивает организационную структуру."},
    {"employee_id": "HR003", "first_name": "Светлана", "last_name": "Егорова", "department": "HR", "position": "Recruiter", "hire_date": date(2022, 10, 10), "role": "hr", "hierarchy_level": 2, "about": "Ведет подбор в продуктовые и технические команды."},
    {"employee_id": "HR004", "first_name": "Дарья", "last_name": "Фролова", "department": "HR", "position": "People Operations Specialist", "hire_date": date(2023, 7, 24), "role": "hr", "hierarchy_level": 2, "about": "Отвечает за кадровый документооборот и отпускной контур."},
    {"employee_id": "FN001", "first_name": "Виктор", "last_name": "Крылов", "department": "Finance", "position": "Chief Financial Officer", "hire_date": date(2016, 4, 18), "role": "manager", "hierarchy_level": 4, "about": "Управляет бюджетированием и финансовым контролем."},
    {"employee_id": "FN002", "first_name": "Екатерина", "last_name": "Зуева", "department": "Finance", "position": "Financial Analyst", "hire_date": date(2021, 5, 12), "role": "employee", "hierarchy_level": 2, "about": "Анализирует финансовые показатели и отклонения по P&L."},
    {"employee_id": "FN003", "first_name": "Максим", "last_name": "Руднев", "department": "Finance", "position": "Accountant", "hire_date": date(2019, 1, 28), "role": "employee", "hierarchy_level": 2, "about": "Ведет бухгалтерский учет и закрытие периода."},
    {"employee_id": "FN004", "first_name": "Анна", "last_name": "Киселева", "department": "Finance", "position": "Payroll Specialist", "hire_date": date(2022, 4, 4), "role": "employee", "hierarchy_level": 2, "about": "Отвечает за зарплатный контур и выплаты сотрудникам."},
    {"employee_id": "SL001", "first_name": "Сергей", "last_name": "Волков", "department": "Sales", "position": "Sales Director", "hire_date": date(2018, 9, 3), "role": "manager", "hierarchy_level": 4, "about": "Развивает B2B-продажи и партнерский канал."},
    {"employee_id": "SL002", "first_name": "Наталья", "last_name": "Комарова", "department": "Sales", "position": "Key Account Manager", "hire_date": date(2020, 11, 16), "role": "employee", "hierarchy_level": 3, "about": "Ведет крупнейших корпоративных клиентов."},
    {"employee_id": "SL003", "first_name": "Павел", "last_name": "Гаврилов", "department": "Sales", "position": "Sales Manager", "hire_date": date(2023, 2, 13), "role": "employee", "hierarchy_level": 2, "about": "Отвечает за входящий pipeline и демо-встречи."},
    {"employee_id": "SL004", "first_name": "Вероника", "last_name": "Лебедева", "department": "Sales", "position": "Business Development Manager", "hire_date": date(2021, 8, 30), "role": "employee", "hierarchy_level": 2, "about": "Развивает новые сегменты и стратегические партнерства."},
    {"employee_id": "MK001", "first_name": "Роман", "last_name": "Титов", "department": "Marketing", "position": "Marketing Director", "hire_date": date(2019, 4, 22), "role": "manager", "hierarchy_level": 4, "about": "Определяет маркетинговую стратегию и бренд-платформу."},
    {"employee_id": "MK002", "first_name": "Юлия", "last_name": "Авдеева", "department": "Marketing", "position": "Content Lead", "hire_date": date(2021, 1, 18), "role": "employee", "hierarchy_level": 3, "about": "Курирует редакционный календарь и контент-команду."},
    {"employee_id": "MK003", "first_name": "Кирилл", "last_name": "Поляков", "department": "Marketing", "position": "Performance Marketer", "hire_date": date(2022, 6, 20), "role": "employee", "hierarchy_level": 2, "about": "Ведет платный трафик и оптимизацию воронки."},
    {"employee_id": "MK004", "first_name": "Алина", "last_name": "Шестакова", "department": "Marketing", "position": "Brand Designer", "hire_date": date(2023, 9, 11), "role": "employee", "hierarchy_level": 2, "about": "Поддерживает визуальную систему и бренд-материалы."},
    {"employee_id": "OP001", "first_name": "Александр", "last_name": "Борисов", "department": "Operations", "position": "Operations Director", "hire_date": date(2017, 2, 6), "role": "manager", "hierarchy_level": 4, "about": "Управляет операционной эффективностью и SLA внутренних сервисов."},
    {"employee_id": "OP002", "first_name": "София", "last_name": "Жданова", "department": "Operations", "position": "Project Manager", "hire_date": date(2021, 10, 25), "role": "employee", "hierarchy_level": 3, "about": "Координирует кросс-функциональные проекты автоматизации."},
    {"employee_id": "OP003", "first_name": "Никита", "last_name": "Демин", "department": "Operations", "position": "Business Analyst", "hire_date": date(2022, 8, 8), "role": "employee", "hierarchy_level": 2, "about": "Анализирует процессы и готовит предложения по оптимизации."},
    {"employee_id": "LG001", "first_name": "Валерия", "last_name": "Кравцова", "department": "Legal", "position": "Legal Counsel", "hire_date": date(2020, 7, 13), "role": "employee", "hierarchy_level": 3, "about": "Сопровождает договоры и корпоративные юридические вопросы."},
    {"employee_id": "PR001", "first_name": "Егор", "last_name": "Савельев", "department": "Product", "position": "Product Director", "hire_date": date(2019, 3, 4), "role": "manager", "hierarchy_level": 4, "about": "Отвечает за продуктовую стратегию HR-платформы."},
    {"employee_id": "PR002", "first_name": "Марина", "last_name": "Терехова", "department": "Product", "position": "Product Manager", "hire_date": date(2021, 12, 6), "role": "employee", "hierarchy_level": 3, "about": "Ведет roadmap кадрового контура и сценарии менеджеров."},
    {"employee_id": "DS001", "first_name": "Полина", "last_name": "Нестерова", "department": "Design", "position": "Lead Product Designer", "hire_date": date(2020, 9, 14), "role": "employee", "hierarchy_level": 3, "about": "Проектирует пользовательский опыт HR-интерфейсов."},
    {"employee_id": "DS002", "first_name": "Глеб", "last_name": "Федоров", "department": "Design", "position": "UX Designer", "hire_date": date(2023, 1, 9), "role": "employee", "hierarchy_level": 2, "about": "Исследует сценарии использования и улучшает ключевые экраны."},
]


TERMINATED_EMPLOYEE_IDS = {"IT006", "HR003", "SL003", "MK004", "OP003", "DS002"}


CAREER_EVENTS = [
    {"employee_id": "IT002", "type": "promotion", "date": date(2023, 4, 1), "title": "Повышение до Senior Backend Engineer", "description": "Сотрудник переведен на senior-роль после успешного запуска сервиса интеграций."},
    {"employee_id": "IT003", "type": "grade_change", "date": date(2024, 2, 12), "title": "Изменение грейда до Middle", "description": "Подтвержден новый грейд после оценки компетенций."},
    {"employee_id": "IT006", "type": "termination", "date": date(2025, 12, 20), "title": "Увольнение", "description": "Трудовой договор расторгнут по соглашению сторон."},
    {"employee_id": "HR002", "type": "transfer", "date": date(2022, 9, 5), "title": "Перевод в HR Business Partner", "description": "Сотрудник переведен в роль HRBP для поддержки продуктового направления."},
    {"employee_id": "HR003", "type": "termination", "date": date(2025, 8, 29), "title": "Увольнение", "description": "Сотрудник завершил работу в компании по собственному желанию."},
    {"employee_id": "FN002", "type": "salary_change", "date": date(2024, 7, 1), "title": "Пересмотр заработной платы", "description": "Изменен уровень компенсации по итогам годового цикла."},
    {"employee_id": "SL002", "type": "promotion", "date": date(2023, 10, 2), "title": "Повышение до Key Account Manager", "description": "Расширена зона ответственности по стратегическим клиентам."},
    {"employee_id": "SL003", "type": "termination", "date": date(2025, 11, 15), "title": "Увольнение", "description": "Сотрудник покинул компанию после завершения испытательного срока."},
    {"employee_id": "MK003", "type": "grade_change", "date": date(2024, 5, 20), "title": "Изменение грейда до Middle", "description": "Подтвержден рост уровня по результатам performance review."},
    {"employee_id": "MK004", "type": "termination", "date": date(2026, 1, 31), "title": "Увольнение", "description": "Сотрудник завершил работу в компании по личным обстоятельствам."},
    {"employee_id": "OP002", "type": "transfer", "date": date(2023, 11, 7), "title": "Перевод в проектный офис", "description": "Сотрудник переведен на кросс-функциональные программы автоматизации."},
    {"employee_id": "OP003", "type": "termination", "date": date(2025, 9, 19), "title": "Увольнение", "description": "Трудовые отношения прекращены по инициативе сотрудника."},
    {"employee_id": "PR002", "type": "promotion", "date": date(2024, 9, 9), "title": "Повышение до Product Manager", "description": "Сотрудник расширил продуктовую зону ответственности и был повышен."},
    {"employee_id": "DS002", "type": "termination", "date": date(2025, 10, 10), "title": "Увольнение", "description": "Сотрудник завершил работу в компании."},
]


def reset_demo_data() -> None:
    db = SessionLocal()
    try:
        db.execute(text("DELETE FROM notifications"))
        db.execute(text("DELETE FROM timeoffs"))
        db.execute(text("DELETE FROM events"))
        db.execute(text("DELETE FROM employees"))
        db.commit()

        employee_ids = {}
        for payload in EMPLOYEES:
            employee = crud.create_employee(db, schemas.EmployeeCreate(**payload))
            employee_ids[payload["employee_id"]] = employee.id

            if payload["employee_id"] in TERMINATED_EMPLOYEE_IDS:
                employee.is_active = False
                termination_event = next(
                    (event for event in CAREER_EVENTS if event["employee_id"] == payload["employee_id"] and event["type"] == "termination"),
                    None,
                )
                employee.termination_date = termination_event["date"] if termination_event else date(2025, 12, 31)
                db.commit()
                db.refresh(employee)

        for event in CAREER_EVENTS:
            crud.create_event(
                db,
                schemas.EventCreate(
                    employee_id=employee_ids[event["employee_id"]],
                    type=event["type"],
                    title=event["title"],
                    description=event["description"],
                    date=event["date"],
                    is_certification=False,
                ),
            )

        print(f"Employees: {len(EMPLOYEES)}")
        print(f"Active: {len(EMPLOYEES) - len(TERMINATED_EMPLOYEE_IDS)}")
        print(f"Terminated: {len(TERMINATED_EMPLOYEE_IDS)}")
        print(f"Events: {len(CAREER_EVENTS)}")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    reset_demo_data()
