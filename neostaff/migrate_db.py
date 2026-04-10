#!/usr/bin/env python3
"""
Скрипт миграции базы данных для добавления новых полей к сотрудникам
и создания таблицы уведомлений.
"""

import os
import sqlite3
from datetime import date, datetime
import random

def migrate_database():
    """Выполняет миграцию базы данных"""

    db_file = os.path.abspath(os.path.join(os.path.dirname(__file__), 'hr.db'))
    # Подключаемся к базе данных
    conn = sqlite3.connect(db_file)
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

    for column_name, column_type in new_columns:
        try:
            cursor.execute(f"ALTER TABLE employees ADD COLUMN {column_name} {column_type}")
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
    cursor.execute("SELECT id, first_name, last_name FROM employees WHERE employee_id IS NULL")
    employees_without_id = cursor.fetchall()

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
        print(f"Сгенерирован employee_id {candidate_id} для сотрудника {first_name} {last_name}")

    # Устанавливаем роли и уровни иерархии для существующих сотрудников
    departments = {}
    cursor.execute("SELECT DISTINCT department FROM employees")
    dept_rows = cursor.fetchall()

    for dept_row in dept_rows:
        dept = dept_row[0]
        # Определяем роли по отделам
        if dept.lower() in ['hr', 'human resources']:
            role = 'hr'
            level = 3
        elif dept.lower() in ['management', 'executive']:
            role = 'manager'
            level = 4
        elif dept.lower() in ['it', 'engineering', 'development']:
            role = 'manager'
            level = 2
        else:
            role = 'employee'
            level = 1

        departments[dept] = {'role': role, 'level': level}

    for dept, info in departments.items():
        cursor.execute("""
            UPDATE employees
            SET role = ?, hierarchy_level = ?
            WHERE department = ? AND (role IS NULL OR role = '')
        """, (info['role'], info['level'], dept))
        print(f"Обновлены роли для отдела {dept}: {info['role']} (уровень {info['level']})")

    # Устанавливаем created_at и updated_at для существующих записей
    now = datetime.now().isoformat()
    cursor.execute("UPDATE employees SET created_at = ?, updated_at = ? WHERE created_at IS NULL", (now, now))
    print("Установлены временные метки для существующих сотрудников")

    # Сохраняем изменения
    conn.commit()
    print("Миграция завершена успешно!")

    # Выводим статистику
    cursor.execute("SELECT COUNT(*) FROM employees")
    total_employees = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM employees WHERE employee_id IS NOT NULL")
    employees_with_id = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM notifications")
    total_notifications = cursor.fetchone()[0]

    print("\nСтатистика после миграции:")
    print(f"Всего сотрудников: {total_employees}")
    print(f"Сотрудников с employee_id: {employees_with_id}")
    print(f"Всего уведомлений: {total_notifications}")

    conn.close()

if __name__ == "__main__":
    migrate_database()