import urllib.request
import json

req = urllib.request.Request('http://localhost:8000/api/users/')
try:
    with urllib.request.urlopen(req) as response:
        users = json.loads(response.read().decode())
        print(f"Total users: {len(users['results'])}")
        if len(users['results']) > 0:
            user = users['results'][0]
            print(f"Selected user: {user['id']} (Role: {user['role']})")
            
            # Now try to PATCH the role
            patch_req = urllib.request.Request(
                f"http://localhost:8000/api/users/{user['id']}/",
                data=json.dumps({"role": "Lecteur"}).encode('utf-8'),
                headers={'Content-Type': 'application/json'},
                method='PATCH'
            )
            with urllib.request.urlopen(patch_req) as patch_res:
                patched = json.loads(patch_res.read().decode())
                print(f"After PATCH: (Role: {patched['role']})")
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code}")
    print(e.read().decode())
