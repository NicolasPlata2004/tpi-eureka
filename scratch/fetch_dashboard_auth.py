import urllib.request
import urllib.error

req = urllib.request.Request('http://localhost:3000/dashboard')
req.add_header('Cookie', 'eureka_session=val-123')

try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        print("Status Code: 200 OK")
        print("HTML Length:", len(html))
        if "cargando" in html.lower():
            print("Found 'cargando' in page (showing loading state is correct)")
        else:
            print("Page HTML:", html[:500])
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code, e.reason)
    print("Response:", e.read().decode('utf-8'))
except Exception as e:
    print("Exception:", str(e))
