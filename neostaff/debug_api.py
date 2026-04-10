import urllib.request, json
urls = [
    'http://127.0.0.1:8001/employees/',
    'http://127.0.0.1:8001/employees/1',
    'http://127.0.0.1:8001/employees/2',
]
for url in urls:
    try:
        r = urllib.request.urlopen(url)
        data = json.loads(r.read().decode())
        print(url, 'OK', r.getcode())
        if isinstance(data, list):
            print(' len', len(data))
        else:
            print(' data keys', list(data.keys()))
    except Exception as e:
        print(url, 'ERROR', e)
