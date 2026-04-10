#!/usr/bin/env python3
"""
Простой скрипт миграции через SQLAlchemy
"""

from app.database import SessionLocal
from app import models
from sqlalchemy import text
import sqlite3

def simple_migrate():
    """Простая миграция через прямые SQL команды"""

    # Используем SQLAlchemy сессию для выполнения SQL команд
    db = SessionLocal()

    try:
        # Добавляем новые столбцы через SQLAlchemy
        # Проверяем, существуют ли уже столбцы
        result = db.execute(text("PRAGMA table_info(employees)"))
        existing_columns = [row[1] for row in result]

        new_columns = {
            'employee_id': 'VARCHAR',
            'termination_date': 'DATE',
            'role': 'VARCHAR',
            'hierarchy_level': 'INTEGER',
            'manager_id': 'INTEGER',
            'created_at': 'DATETIME',
            'updated_at': 'DATETIME'
        }

        added = []
        for col_name, col_type in new_columns.items():
            if col_name not in existing_columns:
                try:
                    db.execute(text(f"ALTER TABLE employees ADD COLUMN {col_name} {col_type}"))
                    added.append(col_name)
                    print(f"Добавлен столбец: {col_name}")
                except Exception as e:
                    print(f"Ошибка при добавлении {col_name}: {e}")

        # Создаем таблицу уведомлений
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_id INTEGER NOT NULL,
                type VARCHAR NOT NULL,
                title VARCHAR NOT NULL,
                message TEXT NOT NULL,
                priority VARCHAR DEFAULT 'normal',
                due_date DATE,
                is_read BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """))
        print("Таблица notifications создана")

        # Генерируем employee_id для существующих сотрудников
        employees = [row for row in db.execute(text("SELECT id, first_name, last_name FROM employees WHERE employee_id IS NULL OR employee_id = ''"))]

        for emp in employees:
            emp_id, first_name, last_name = emp
            base_id = f"{first_name[0]}{last_name[0]}".upper()
            counter = 1

            while True:
                candidate_id = f"{base_id}{counter:03d}"
                existing = [row for row in db.execute(text("SELECT COUNT(*) FROM employees WHERE employee_id = ?"), (candidate_id,))][0][0]
                if existing == 0:
                    break
                counter += 1

            db.execute(text("UPDATE employees SET employee_id = ? WHERE id = ?"), (candidate_id, emp_id))
            print(f"Сгенерирован ID {candidate_id} для {first_name} {last_name}")

        # Устанавливаем роли
        departments = {
            'IT': ('manager', 2),
            'HR': ('hr', 3),
            'Management': ('manager', 4),
            'Engineering': ('manager', 2),
            'Development': ('manager', 2)
        }

        for dept, (role, level) in departments.items():
            db.execute(text("""
                UPDATE employees SET role = ?, hierarchy_level = ?
                WHERE department = ? AND (role IS NULL OR role = '')
            """), (role, level, dept))
            print(f"Обновлен отдел {dept}: роль {role}, уровень {level}")

        db.commit()

        # Статистика
        total_emp = [row for row in db.execute(text("SELECT COUNT(*) FROM employees"))][0][0]
        with_id = [row for row in db.execute(text("SELECT COUNT(*) FROM employees WHERE employee_id IS NOT NULL"))][0][0]
        notifications = [row for row in db.execute(text("SELECT COUNT(*) FROM notifications"))][0][0]

        print("\nМиграция завершена!")
        print(f"Всего сотрудников: {total_emp}")
        print(f"С ID: {with_id}")
        print(f"Уведомлений: {notifications}")

    except Exception as e:
        print(f"Ошибка миграции: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    simple_migrate()