from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import employee, events, timeoff, notifications
from app.database import Base, engine, DB_FILE
from app import models
import sqlite3
from datetime import datetime

app = FastAPI()

def ensure_schema_compatibility():
    """Bring legacy SQLite tables up to the columns expected by the ORM."""
    table_columns = {
        "employees": {
            "email": "VARCHAR",
            "phone": "VARCHAR",
            "salary": "FLOAT",
        },
        "events": {
            "is_certification": "BOOLEAN DEFAULT FALSE",
            "created_at": "DATETIME DEFAULT CURRENT_TIMESTAMP",
        },
        "timeoffs": {
            "status": "VARCHAR DEFAULT 'pending'",
            "notes": "TEXT",
            "created_at": "DATETIME DEFAULT CURRENT_TIMESTAMP",
        },
    }

    conn = sqlite3.connect(DB_FILE)
    try:
        cursor = conn.cursor()
        for table_name, columns in table_columns.items():
            cursor.execute(f"PRAGMA table_info({table_name})")
            existing_columns = {row[1] for row in cursor.fetchall()}

            for column_name, column_type in columns.items():
                if column_name in existing_columns:
                    continue
                cursor.execute(
                    f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}"
                )

        conn.commit()
    finally:
        conn.close()

ensure_schema_compatibility()
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employee.router)
app.include_router(events.router)
app.include_router(timeoff.router)
app.include_router(notifications.router)

@app.get("/")
def root():
    return {"status": "running"}

@app.post("/migrate")
def migrate_database():
    """Выполняет миграцию базы данных"""
    try:
        # Подключаемся к базе данных
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()

        print("Начинаем миграцию базы данных...")

        # Добавляем новые столбцы к таблице employees
        new_columns = [
            ("employee_id", "VARCHAR UNIQUE"),
            ("termination_date", "DATE"),
            ("role", "VARCHAR DEFAULT 'employee'"),
            ("hierarchy_level", "INTEGER DEFAULT 1"),
            ("manager_id", "INTEGER REFERENCES employees(id)"),
            ("created_at", "DATETIME DEFAULT CURRENT_TIMESTAMP"),
            ("updated_at", "DATETIME DEFAULT CURRENT_TIMESTAMP")
        ]

        added_columns = []
        for column_name, column_type in new_columns:
            try:
                cursor.execute(f"ALTER TABLE employees ADD COLUMN {column_name} {column_type}")
                added_columns.append(column_name)
                print(f"Добавлен столбец: {column_name}")
            except sqlite3.OperationalError as e:
                if "duplicate column name" in str(e):
                    print(f"Столбец {column_name} уже существует, пропускаем")
                else:
                    print(f"Ошибка при добавлении столбца {column_name}: {e}")

        # Создаем таблицу notifications
        create_notifications_table = """
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL REFERENCES employees(id),
            type VARCHAR NOT NULL,
            title VARCHAR NOT NULL,
            message TEXT NOT NULL,
            priority VARCHAR DEFAULT 'normal',
            due_date DATE,
            is_read BOOLEAN DEFAULT FALSE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """
        cursor.execute(create_notifications_table)
        print("Таблица notifications создана или уже существует")

        # Генерируем уникальные employee_id для существующих сотрудников
        cursor.execute("SELECT id, first_name, last_name FROM employees WHERE employee_id IS NULL OR employee_id = ''")
        employees_without_id = cursor.fetchall()

        generated_ids = []
        for emp_id, first_name, last_name in employees_without_id:
            # Генерируем уникальный ID
            base_id = f"{first_name[0]}{last_name[0]}".upper()
            counter = 1

            while True:
                candidate_id = f"{base_id}{counter:03d}"
                cursor.execute("SELECT COUNT(*) FROM employees WHERE employee_id = ?", (candidate_id,))
                if cursor.fetchone()[0] == 0:
                    break
                counter += 1

            cursor.execute("UPDATE employees SET employee_id = ? WHERE id = ?", (candidate_id, emp_id))
            generated_ids.append(candidate_id)
            print(f"Сгенерирован employee_id {candidate_id} для сотрудника {first_name} {last_name}")

        # Устанавливаем роли и уровни иерархии для существующих сотрудников
        departments = {}
        cursor.execute("SELECT DISTINCT department FROM employees")
        dept_rows = cursor.fetchall()

        for dept_row in dept_rows:
            dept = dept_row[0]
            # Определяем роли по отделам
            if dept and dept.lower() in ['hr', 'human resources']:
                role = 'hr'
                level = 3
            elif dept and dept.lower() in ['management', 'executive']:
                role = 'manager'
                level = 4
            elif dept and dept.lower() in ['it', 'engineering', 'development']:
                role = 'manager'
                level = 2
            else:
                role = 'employee'
                level = 1

            departments[dept] = {'role': role, 'level': level}

        updated_departments = []
        for dept, info in departments.items():
            cursor.execute("""
                UPDATE employees
                SET role = ?, hierarchy_level = ?
                WHERE department = ? AND (role IS NULL OR role = '' OR role = 'employee')
            """, (info['role'], info['level'], dept))
            updated_count = cursor.rowcount
            if updated_count > 0:
                updated_departments.append(f"{dept}: {info['role']} (уровень {info['level']}) - {updated_count} сотрудников")
                print(f"Обновлены роли для отдела {dept}: {info['role']} (уровень {info['level']}) - {updated_count} сотрудников")

        # Устанавливаем created_at и updated_at для существующих записей
        now = datetime.now().isoformat()
        cursor.execute("UPDATE employees SET created_at = ?, updated_at = ? WHERE created_at IS NULL", (now, now))
        timestamps_updated = cursor.rowcount
        print(f"Установлены временные метки для {timestamps_updated} сотрудников")

        # Сохраняем изменения
        conn.commit()

        # Выводим статистику
        cursor.execute("SELECT COUNT(*) FROM employees")
        total_employees = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM employees WHERE employee_id IS NOT NULL AND employee_id != ''")
        employees_with_id = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM notifications")
        total_notifications = cursor.fetchone()[0]

        conn.close()

        return {
            "status": "success",
            "message": "Миграция завершена успешно!",
            "statistics": {
                "total_employees": total_employees,
                "employees_with_id": employees_with_id,
                "total_notifications": total_notifications
            },
            "details": {
                "added_columns": added_columns,
                "generated_ids": generated_ids,
                "updated_departments": updated_departments,
                "timestamps_updated": timestamps_updated
            }
        }

    except Exception as e:
        return {
            "status": "error",
            "message": f"Ошибка миграции: {str(e)}"
        }

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="127.0.0.1", port=8001, reload=True)


