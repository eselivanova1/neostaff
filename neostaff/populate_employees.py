#!/usr/bin/env python3
"""
Скрипт для добавления реалистичных сотрудников в базу данных
"""

from app.database import SessionLocal
from app import crud, schemas
from datetime import date, timedelta
import random

def create_realistic_employees():
    """Создает реалистичных сотрудников с различными должностями и департаментами"""

    db = SessionLocal()

    try:
        # Удаляем существующих сотрудников кроме тестовых
        existing_employees = crud.get_employees(db, show_terminated=True)
        for emp in existing_employees:
            # Удаляем только если это не тестовые данные
            if emp.first_name not in ['John', 'Николай', 'коля']:
                db.delete(emp)
        db.commit()

        # Реалистичные сотрудники
        employees_data = [
            # IT Department
            {
                "first_name": "Алексей",
                "last_name": "Иванов",
                "department": "IT",
                "position": "Senior Software Engineer",
                "hire_date": date.today() - timedelta(days=365*2 + 30),  # 2 года 1 месяц
                "about": "Опытный разработчик с экспертизой в Python и JavaScript. Руководит командой из 5 человек."
            },
            {
                "first_name": "Мария",
                "last_name": "Петрова",
                "department": "IT",
                "position": "Frontend Developer",
                "hire_date": date.today() - timedelta(days=365*1 + 180),  # 1.5 года
                "about": "Специалист по React и TypeScript. Отвечает за пользовательский интерфейс."
            },
            {
                "first_name": "Дмитрий",
                "last_name": "Сидоров",
                "department": "IT",
                "position": "DevOps Engineer",
                "hire_date": date.today() - timedelta(days=365*3 + 60),  # 3 года 2 месяца
                "about": "Эксперт по инфраструктуре и автоматизации развертывания."
            },
            {
                "first_name": "Елена",
                "last_name": "Козлова",
                "department": "IT",
                "position": "QA Engineer",
                "hire_date": date.today() - timedelta(days=365*1 + 90),  # 1 год 3 месяца
                "about": "Тестировщик с опытом автоматизации тестирования."
            },
            {
                "first_name": "Андрей",
                "last_name": "Новиков",
                "department": "IT",
                "position": "System Administrator",
                "hire_date": date.today() - timedelta(days=365*4 + 120),  # 4 года 4 месяца
                "about": "Администратор систем и сетевой инфраструктуры."
            },

            # HR Department
            {
                "first_name": "Ольга",
                "last_name": "Смирнова",
                "department": "HR",
                "position": "HR Director",
                "hire_date": date.today() - timedelta(days=365*5 + 200),  # 5 лет 7 месяцев
                "about": "Директор по персоналу. Отвечает за стратегию управления персоналом."
            },
            {
                "first_name": "Татьяна",
                "last_name": "Васильева",
                "department": "HR",
                "position": "HR Manager",
                "hire_date": date.today() - timedelta(days=365*3 + 150),  # 3 года 5 месяцев
                "about": "Менеджер по персоналу. Занимается наймом и адаптацией сотрудников."
            },
            {
                "first_name": "Ирина",
                "last_name": "Морозова",
                "department": "HR",
                "position": "HR Specialist",
                "hire_date": date.today() - timedelta(days=365*2 + 45),  # 2 года 1.5 месяца
                "about": "Специалист по персоналу. Ведет кадровое делопроизводство."
            },

            # Sales Department
            {
                "first_name": "Сергей",
                "last_name": "Кузнецов",
                "department": "Sales",
                "position": "Sales Director",
                "hire_date": date.today() - timedelta(days=365*6 + 90),  # 6 лет 3 месяца
                "about": "Директор по продажам. Руководит отделом продаж и маркетинга."
            },
            {
                "first_name": "Наталья",
                "last_name": "Попова",
                "department": "Sales",
                "position": "Sales Manager",
                "hire_date": date.today() - timedelta(days=365*4 + 30),  # 4 года 1 месяц
                "about": "Менеджер по продажам. Отвечает за ключевых клиентов."
            },
            {
                "first_name": "Владимир",
                "last_name": "Лебедев",
                "department": "Sales",
                "position": "Business Development Manager",
                "hire_date": date.today() - timedelta(days=365*2 + 270),  # 2 года 9 месяцев
                "about": "Менеджер по развитию бизнеса. Ищет новые рынки и партнеров."
            },
            {
                "first_name": "Анна",
                "last_name": "Соколова",
                "department": "Sales",
                "position": "Account Manager",
                "hire_date": date.today() - timedelta(days=365*1 + 120),  # 1 год 4 месяца
                "about": "Аккаунт-менеджер. Работает с существующими клиентами."
            },

            # Marketing Department
            {
                "first_name": "Роман",
                "last_name": "Федоров",
                "department": "Marketing",
                "position": "Marketing Director",
                "hire_date": date.today() - timedelta(days=365*4 + 180),  # 4 года 6 месяцев
                "about": "Директор по маркетингу. Разрабатывает маркетинговую стратегию."
            },
            {
                "first_name": "Юлия",
                "last_name": "Михайлова",
                "department": "Marketing",
                "position": "Content Manager",
                "hire_date": date.today() - timedelta(days=365*2 + 60),  # 2 года 2 месяца
                "about": "Контент-менеджер. Создает и управляет контентом для всех каналов."
            },
            {
                "first_name": "Павел",
                "last_name": "Алексеев",
                "department": "Marketing",
                "position": "Digital Marketing Specialist",
                "hire_date": date.today() - timedelta(days=365*1 + 240),  # 1 год 8 месяцев
                "about": "Специалист по цифровому маркетингу. Ведет соцсети и рекламу."
            },

            # Finance Department
            {
                "first_name": "Виктор",
                "last_name": "Орлов",
                "department": "Finance",
                "position": "CFO",
                "hire_date": date.today() - timedelta(days=365*7 + 30),  # 7 лет 1 месяц
                "about": "Финансовый директор. Отвечает за финансовую стратегию компании."
            },
            {
                "first_name": "Екатерина",
                "last_name": "Николаева",
                "department": "Finance",
                "position": "Financial Analyst",
                "hire_date": date.today() - timedelta(days=365*3 + 90),  # 3 года 3 месяца
                "about": "Финансовый аналитик. Анализирует финансовые показатели."
            },
            {
                "first_name": "Максим",
                "last_name": "Зайцев",
                "department": "Finance",
                "position": "Accountant",
                "hire_date": date.today() - timedelta(days=365*5 + 60),  # 5 лет 2 месяца
                "about": "Бухгалтер. Ведет бухгалтерский учет и отчетность."
            },

            # Operations Department
            {
                "first_name": "Александр",
                "last_name": "Григорьев",
                "department": "Operations",
                "position": "Operations Manager",
                "hire_date": date.today() - timedelta(days=365*4 + 270),  # 4 года 9 месяцев
                "about": "Менеджер по операциям. Оптимизирует бизнес-процессы."
            },
            {
                "first_name": "София",
                "last_name": "Андреева",
                "department": "Operations",
                "position": "Project Manager",
                "hire_date": date.today() - timedelta(days=365*2 + 180),  # 2 года 6 месяцев
                "about": "Проектный менеджер. Координирует выполнение проектов."
            },
            {
                "first_name": "Кирилл",
                "last_name": "Борисов",
                "department": "Operations",
                "position": "Business Analyst",
                "hire_date": date.today() - timedelta(days=365*1 + 60),  # 1 год 2 месяца
                "about": "Бизнес-аналитик. Анализирует бизнес-процессы и требования."
            },

            # Legal Department
            {
                "first_name": "Валерия",
                "last_name": "Кравченко",
                "department": "Legal",
                "position": "Legal Counsel",
                "hire_date": date.today() - timedelta(days=365*3 + 240),  # 3 года 8 месяцев
                "about": "Юрисконсульт. Занимается правовыми вопросами компании."
            }
        ]

        # Добавляем новых сотрудников
        employees_data.extend([
            # HR Department
            {
                "first_name": "Екатерина",
                "last_name": "Смирнова",
                "department": "HR",
                "position": "HR Manager",
                "hire_date": date.today() - timedelta(days=365*4),  # 4 года
                "about": "Отвечает за подбор персонала и развитие сотрудников."
            },
            {
                "first_name": "Иван",
                "last_name": "Кузнецов",
                "department": "HR",
                "position": "Recruiter",
                "hire_date": date.today() - timedelta(days=365*2 + 90),  # 2 года 3 месяца
                "about": "Специалист по поиску и найму талантов."
            },
            # Marketing Department
            {
                "first_name": "Ольга",
                "last_name": "Васильева",
                "department": "Marketing",
                "position": "Marketing Specialist",
                "hire_date": date.today() - timedelta(days=365*1 + 60),  # 1 год 2 месяца
                "about": "Занимается продвижением бренда и рекламными кампаниями."
            },
            {
                "first_name": "Сергей",
                "last_name": "Михайлов",
                "department": "Marketing",
                "position": "Content Manager",
                "hire_date": date.today() - timedelta(days=365*3),  # 3 года
                "about": "Создает контент для социальных сетей и сайта компании."
            }
        ])

        created_count = 0
        for emp_data in employees_data:
            try:
                # Создаем сотрудника
                employee = schemas.EmployeeCreate(
                    **{key: value if not isinstance(value, Column) else value.value for key, value in emp_data.items()}
                )
                crud.create_employee(db, employee)

                # Добавляем некоторые события для реализма
                if random.choice([True, False]):  # 50% шанс
                    # Добавляем повышение или аттестацию
                    event_date = employee.hire_date + timedelta(days=random.randint(180, 365))
                    if event_date < date.today():
                        crud.create_event(db, schemas.EventCreate(
                            employee_id=employee.id,
                            type="certification",
                            title="Annual Review",
                            description=f"Annual performance review for {employee.first_name} {employee.last_name}",
                            date=event_date,
                            is_certification=True
                        ))

                # Добавляем отпуск для некоторых сотрудников
                if random.choice([True, False]):  # 50% шанс
                    timeoff_start = date.today() + timedelta(days=random.randint(30, 180))
                    crud.create_timeoff(db, schemas.TimeOffCreate(
                        employee_id=employee.id,
                        type="vacation",
                        start_date=timeoff_start,
                        end_date=timeoff_start + timedelta(days=random.randint(7, 21)),
                        notes="Annual vacation"
                    ))

                created_count += 1
                print(f"Создан сотрудник: {employee.first_name} {employee.last_name} ({employee.employee_id}) - {employee.position}")

            except Exception as e:
                print(f"Ошибка при создании сотрудника {emp_data['first_name']} {emp_data['last_name']}: {e}")

        # Запускаем проверку сертификаций для создания уведомлений
        crud.check_certification_notifications(db)

        print(f"\nСоздано {created_count} сотрудников")
        print("Запущена проверка сертификаций")

    except Exception as e:
        print(f"Ошибка: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_realistic_employees()