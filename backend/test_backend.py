import requests

print("Testing Python Backend...")
try:
    # 1. Root
    resp = requests.get("http://localhost:3000/")
    print(f"Root: {resp.status_code} {resp.json()}")

    # 2. Login (using the credentials we set earlier)
    # The new backend expects JSON body: {username, password}
    # It checks existing DB.
    # We should have user 'Aylton Yh' with password '12345678' (hashed)
    # But wait, the hashing algorithm is bcrypt. Passlib supports it.
    
    login_data = {"username": "Aylton Yh", "password": "12345678"}
    resp = requests.post("http://localhost:3000/api/auth/login", json=login_data)
    print(f"Login: {resp.status_code}")
    if resp.status_code == 200:
        print("Login Success!")
        token = resp.json()['token']
        print(f"Token received. Length: {len(token)}")
        
        # 3. Get Dashboard Data (Categories/Transactions)
        headers = {"Authorization": f"Bearer {token}"}
        
        resp = requests.get("http://localhost:3000/api/categories/", headers=headers)
        print(f"Categories: {resp.status_code} Count: {len(resp.json())}")
        
        resp = requests.get("http://localhost:3000/api/transactions/", headers=headers)
        print(f"Transactions: {resp.status_code} Count: {len(resp.json())}")
        
    else:
        print(f"Login Failed: {resp.text}")

except Exception as e:
    print(f"Error: {e}")
