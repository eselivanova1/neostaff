import urllib.request
import json

try:
    req = urllib.request.Request('http://127.0.0.1:8001/migrate', method='POST')
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode())
        print("Migration result:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
except Exception as e:
    print(f"Error: {e}")