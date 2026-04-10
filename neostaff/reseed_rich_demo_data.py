from datetime import date, timedelta

from sqlalchemy import text

from app import crud, schemas
from app.database import SessionLocal
from reset_demo_data import EMPLOYEES


TODAY = date(2026, 4, 10)
TERMINATIONS = {
    "IT006": date(2025, 12, 20),
    "HR003": date(2025, 8, 29),
    "SL003": date(2025, 11, 15),
    "MK004": date(2026, 1, 31),
    "OP003": date(2025, 9, 19),
    "DS002": date(2025, 10, 10),
}

DEPT_COMMON_EVENTS = {
    "IT": [
        ("review", date(2024, 12, 12), "Техническая оценка года", "По итогам технической оценки обновлены цели развития и зона ответственности."),
        ("training", date(2025, 10, 3), "Внутренняя школа архитектуры", "Команда прошла внутреннюю программу по архитектурным практикам и надежности сервисов."),
    ],
    "HR": [
        ("review", date(2024, 11, 20), "Калибровка HR-процессов", "Проведена калибровка процесса адаптации, ревью и внутренних SLA."),
        ("team_building", date(2025, 6, 18), "Стратегическая сессия HR", "Команда синхронизировала план по найму, удержанию и внутренним коммуникациям."),
    ],
    "Finance": [
        ("review", date(2024, 12, 5), "Финансовое закрытие года", "Команда зафиксировала улучшения в процессе закрытия периода и контроля затрат."),
    ],
    "Sales": [
        ("conference", date(2025, 5, 14), "Коммерческий саммит", "Отдел продаж участвовал в ежегодной сессии по стратегии и ключевым клиентам."),
        ("review", date(2024, 10, 24), "Квартальная оценка воронки", "Подведены итоги квартала и обновлены индивидуальные цели по pipeline."),
    ],
    "Marketing": [
        ("team_building", date(2025, 7, 10), "Маркетинговый offsite", "Команда синхронизировала бренд-приоритеты и контентный план на полугодие."),
    ],
    "Operations": [
        ("training", date(2025, 3, 27), "Обучение по процессной аналитике", "Сотрудники прошли программу по процессной аналитике и оптимизации операций."),
    ],
    "Legal": [
        ("review", date(2025, 2, 11), "Обзор договорного контура", "Обновлены шаблоны договоров и контрольные точки юридического согласования."),
    ],
    "Product": [
        ("conference", date(2025, 9, 16), "Продуктовая конференция", "Команда обновила подход к roadmap и метрикам по результатам конференции."),
    ],
    "Design": [
        ("training", date(2025, 4, 22), "Дизайн-система 2.0", "Команда обновила правила использования дизайн-системы и паттернов интерфейсов."),
    ],
}

NOTIFICATIONS = [
    ("IT001", "headcount_plan", "Утвердить план найма", "До пятницы нужно подтвердить потребность в двух backend-разработчиках и одном QA-инженере.", "high", 4),
    ("IT002", "promotion_packet", "Подготовить материалы на промо-комитет", "Соберите обратную связь за полугодие и обновите пакет на повышение по Марии Павловой.", "high", 6),
    ("HR001", "attrition_review", "Разобрать причины увольнений", "Нужно подготовить краткий разбор увольнений за квартал и вынести предложения по удержанию на встречу HR.", "urgent", 2),
    ("FN004", "payroll_window", "Закрыть payroll-окно", "До расчета зарплаты осталось два дня. Проверьте корректность переменной части для sales и product команд.", "urgent", 2),
    ("SL002", "contract_renewal", "Контроль продления договора", "Нужно согласовать финальную редакцию рамочного договора по ключевому клиенту и обновить дату продления.", "high", 5),
    ("OP002", "milestone_review", "Подтвердить milestone проекта", "Перед демо руководству актуализируйте статус задач, блокеры и сроки следующего этапа.", "normal", 7),
    ("PR002", "roadmap_sync", "Актуализировать roadmap", "Нужно зафиксировать перенос двух задач в следующий спринт и обновить квартальный план релиза.", "normal", 8),
    ("LG001", "policy_update", "Проверить новую редакцию положения", "Требуется юридическая проверка новой редакции положения об удаленной работе перед публикацией.", "high", 9),
]


def add_years(base: date, years: int, month_shift: int) -> date:
    month = base.month + month_shift
    year = base.year + years + (month - 1) // 12
    month = ((month - 1) % 12) + 1
    return date(year, month, min(base.day, 28))


def employee_events(payload: dict, index: int) -> list[tuple[str, date, str, str]]:
    hire = payload["hire_date"]
    end = TERMINATIONS.get(payload["employee_id"], TODAY)
    shift = index % 6
    events = []
    years = max(0, end.year - hire.year - ((end.month, end.day) < (hire.month, hire.day)))
    for step in range(1, years // 2 + 1):
        promo_date = add_years(hire, step * 2, shift)
        if promo_date >= end:
            break
        events.append(("promotion", promo_date, "Повышение по итогам цикла оценки", "Сотрудник расширил зону ответственности и был повышен после оценки результатов за период."))
        if step % 2 == 1:
            salary_date = promo_date + timedelta(days=100 + index % 35)
            if salary_date < end:
                events.append(("salary_change", salary_date, "Пересмотр заработной платы", "Компенсация обновлена после калибровки уровня и изменений в зоне ответственности."))
    if years >= 4:
        transfer_date = add_years(hire, 3, (index % 4) + 1)
        if transfer_date < end:
            events.append(("transfer", transfer_date, "Перевод на новое направление", "Сотрудник подключен к более широкому контуру задач в рамках изменения структуры команды."))
    if payload["employee_id"] in TERMINATIONS:
        events.append(("termination", TERMINATIONS[payload["employee_id"]], "Увольнение", "Трудовые отношения завершены, статус сотрудника обновлен в системе."))
    for event_type, event_date, title, description in DEPT_COMMON_EVENTS.get(payload["department"], []):
        if hire <= event_date <= end:
            events.append((event_type, event_date + timedelta(days=index % 3), title, description))
    return sorted(events, key=lambda item: item[1])


def main() -> None:
    db = SessionLocal()
    try:
        db.execute(text("DELETE FROM notifications"))
        db.execute(text("DELETE FROM timeoffs"))
        db.execute(text("DELETE FROM events"))
        db.execute(text("DELETE FROM employees"))
        db.commit()

        created = {}
        event_count = 0
        for index, payload in enumerate(EMPLOYEES):
            employee = crud.create_employee(db, schemas.EmployeeCreate(**payload))
            created[payload["employee_id"]] = employee.id
            if payload["employee_id"] in TERMINATIONS:
                employee.is_active = False
                employee.termination_date = TERMINATIONS[payload["employee_id"]]
                db.commit()
                db.refresh(employee)
            for event_type, event_date, title, description in employee_events(payload, index):
                crud.create_event(db, schemas.EventCreate(employee_id=employee.id, type=event_type, title=title, description=description, date=event_date, is_certification=False))
                event_count += 1

        for code, kind, title, message, priority, due_in_days in NOTIFICATIONS:
            crud.create_notification(db, schemas.NotificationCreate(employee_id=created[code], type=kind, title=title, message=message, priority=priority, due_date=TODAY + timedelta(days=due_in_days)))

        print("Employees:", len(EMPLOYEES))
        print("Events:", event_count)
        print("Notifications:", len(NOTIFICATIONS))
    finally:
        db.close()


if __name__ == "__main__":
    main()
