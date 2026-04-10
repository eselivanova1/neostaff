import urllib.request
import json

try:
    response = urllib.request.urlopen('http://127.0.0.1:8001/employees/')
    data = json.loads(response.read().decode())
    print(f'Всего сотрудников: {len(data)}')
    print('Примеры сотрудников:')
    for i, emp in enumerate(data[:5]):
        print(f'{i+1}. {emp["first_name"]} {emp["last_name"]} - {emp["position"]} ({emp["department"]}) - ID: {emp["employee_id"]}')
except Exception as e:
    print('Error:', e)