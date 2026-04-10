import urllib.request
import json

try:
    response = urllib.request.urlopen('http://127.0.0.1:8001/employees/')
    data = json.loads(response.read().decode())
    print(f'✅ API работает! Найдено {len(data)} сотрудников')
    if data:
        emp = data[0]
        print(f'Пример: {emp["first_name"]} {emp["last_name"]} - {emp["position"]} ({emp["department"]})')
        print(f'Employee ID: {emp["employee_id"]}, Role: {emp["role"]}')
except Exception as e:
    print(f'❌ Ошибка API: {e}')