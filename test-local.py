import urllib.request
import json
import urllib.error

data = json.dumps({
    "email": "testlocalerror@test.com",
    "password": "testpassword123",
    "role": "TENANT",
    "firstName": "Test",
    "lastName": "User"
}).encode('utf-8')

req = urllib.request.Request("http://localhost:3001/auth/register", data=data, headers={"Content-Type": "application/json"})

try:
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print("Body:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("Status:", e.code)
    print("Body:", e.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
