import os
import sqlite3

def main():
    db_file = os.path.abspath(os.path.join(os.path.dirname(__file__), 'hr.db'))
    conn = sqlite3.connect(db_file)
    cur = conn.cursor()
    try:
        cur.execute('SELECT COUNT(*) FROM employees')
        total = cur.fetchone()[0]
    except Exception as e:
        print('Error reading total:', e)
        total = None
    try:
        cur.execute('SELECT COUNT(*) FROM employees WHERE is_active = 1')
        active = cur.fetchone()[0]
    except Exception as e:
        print('Error reading active:', e)
        active = None
    print(f'Total employees in DB: {total}')
    print(f'Active employees in DB: {active}')
    conn.close()

if __name__ == '__main__':
    main()
