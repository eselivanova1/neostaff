#!/usr/bin/env python3
"""
Простой скрипт миграции через прямые SQL команды
"""

import os
import sqlite3
from datetime import datetime

def simple_migrate():
    """Простая миграция через прямые SQL команды"""

    db_file = os.path.abspath(os.path.join(os.path.dirname(__file__), 'hr.db'))
    # Подключаемся напрямую к SQLite
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()

    try:
        # Проверяем существующие столбцы
        cursor.execute("PRAGMA table_info(employees)")
        existing_columns = [row[1] for row in cursor.fetchall()]

        new_columns = [
            ("employee_id", "VARCHAR"),
            ("termination_date", "DATE"),
            ("role", "VARCHAR"),
            ("hierarchy_level", "INTEGER"),
            ("manager_id", "INTEGER"),
            ("created_at", "DATETIME"),
            ("updated_at", "DATETIME")
        ]

        added = []
        for col_name, col_type in new_columns:
            if col_name not in existing_columns:
                try:
                    cursor.execute(f"ALTER TABLE employees ADD COLUMN {col_name} {col_type}")
                    added.append(col_name)
                    print(f"Добавлен столбец: {col_name}")
                except Exception as e:
                    print(f"Ошибка при добавлении {col_name}: {e}")

        # Создаем таблицу уведомлений
        cursor.execute("""
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
        """)
        print("Таблица notifications создана")

        # Генерируем employee_id для существующих сотрудников
        cursor.execute("SELECT id, first_name, last_name FROM employees WHERE employee_id IS NULL OR employee_id = ''")
        employees = cursor.fetchall()

        for emp_id, first_name, last_name in employees:
            base_id = f"{first_name[0]}{last_name[0]}".upper()
            counter = 1

            while True:
                candidate_id = f"{base_id}{counter:03d}"
                cursor.execute("SELECT COUNT(*) FROM employees WHERE employee_id = ?", (candidate_id,))
                existing = cursor.fetchone()[0]
                if existing == 0:
                    break
                counter += 1

            cursor.execute("UPDATE employees SET employee_id = ? WHERE id = ?", (candidate_id, emp_id))
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
            cursor.execute("""
                UPDATE employees SET role = ?, hierarchy_level = ?
                WHERE department = ? AND (role IS NULL OR role = '')
            """, (role, level, dept))
            print(f"Обновлен отдел {dept}: роль {role}, уровень {level}")

        # Устанавливаем значения по умолчанию для новых столбцов
        now = datetime.now().isoformat()
        cursor.execute("UPDATE employees SET role = 'employee' WHERE role IS NULL OR role = ''")
        cursor.execute("UPDATE employees SET hierarchy_level = 1 WHERE hierarchy_level IS NULL")
        cursor.execute("UPDATE employees SET created_at = ? WHERE created_at IS NULL", (now,))
        cursor.execute("UPDATE employees SET updated_at = ? WHERE updated_at IS NULL", (now,))

        conn.commit()

        # Статистика
        cursor.execute("SELECT COUNT(*) FROM employees")
        total_emp = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM employees WHERE employee_id IS NOT NULL")
        with_id = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM notifications")
        notifications_count = cursor.fetchone()[0]

        print("\nМиграция завершена!")
        print(f"Всего сотрудников: {total_emp}")
        print(f"С ID: {with_id}")
        print(f"Уведомлений: {notifications_count}")

    except Exception as e:
        print(f"Ошибка миграции: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    simple_migrate()