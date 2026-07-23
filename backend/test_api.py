import httpx
import asyncio
import json

async def test_api():
    print("Testing Backend API...")
    async with httpx.AsyncClient() as client:
        # Test 1: URL Scan
        print("\n--- Test 1: URL Scan ---")
        payload = {
            "type": "URL",
            "payload": "http://192.168.1.1/login-update",
            "metadata": {}
        }
        try:
            res = await client.post("http://localhost:8000/api/v1/scan", json=payload, timeout=10.0)
            print(f"Status: {res.status_code}")
            print(json.dumps(res.json(), indent=2))
        except Exception as e:
            print(f"URL Test Failed: {e}")

        # Test 2: Email Scan
        print("\n--- Test 2: Email Scan ---")
        payload = {
            "type": "Email",
            "payload": "Urgent! Verify your bank account immediately or it will be suspended. Click here: http://secure-update-login.com",
            "metadata": {}
        }
        try:
            res = await client.post("http://localhost:8000/api/v1/scan", json=payload, timeout=10.0)
            print(f"Status: {res.status_code}")
            print(json.dumps(res.json(), indent=2))
        except Exception as e:
            print(f"Email Test Failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_api())
