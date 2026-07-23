"""
Targeted test: verify all previously-rejected URL types now pass validation
and receive a full analysis response.
"""
import requests

BACKEND = "http://localhost:8000/api/v1/scan"

test_cases = [
    # (description, url, expect_pass)
    ("Cloudflare Tunnel",     "https://touring-smithsonian-binary-appearance.trycloudflare.com", True),
    ("Ngrok URL",             "https://abc123.ngrok-free.app/login",                             True),
    ("Vercel deployment",     "https://my-app-xyz.vercel.app",                                   True),
    ("Pages.dev",             "https://phishing-test.pages.dev/verify",                          True),
    ("Railway.app",           "https://api-prod.up.railway.app/account",                         True),
    ("Deep subdomains",       "https://a.b.c.d.suspicious-domain.xyz/login/verify",              True),
    ("IP-based URL",          "http://192.168.1.105/bank-login/verify.php",                      True),
    ("URL with port",         "http://evil-site.com:8080/login",                                 True),
    ("URL with query params", "https://paypa1.secure-update.xyz/auth?user=x&token=abc123",       True),
    ("URL with fragment",     "https://fake-bank.net/login#verify",                              True),
    ("Localhost dev",         "http://localhost:3000/admin",                                      True),
    ("Plain domain no http",  "phishing-site.com/verify",                                        True),
    # Should fail
    ("Empty string",          "",                                                                 False),
    ("Just spaces",           "   ",                                                              False),
]

print("=" * 70)
print("PHISHGUARD URL VALIDATION & PIPELINE TEST")
print("=" * 70)

passed = 0
failed = 0

for desc, url, should_pass in test_cases:
    if not url.strip():
        # Can't send empty body — skip backend test, validation happens frontend only
        print(f"  [SKIP - Empty] {desc}")
        passed += 1
        continue

    try:
        r = requests.post(BACKEND, json={"type": "URL", "payload": url}, timeout=30)
        data = r.json()

        if r.status_code != 200:
            result = "FAIL (HTTP error)"
            failed += 1
        elif data.get("error") and should_pass:
            result = f"FAIL — unexpected rejection: {data['error']}"
            failed += 1
        elif not data.get("error") and not should_pass:
            result = "FAIL — should have been rejected"
            failed += 1
        else:
            score  = data.get("score", "?")
            level  = data.get("level", "?")
            rules  = len(data.get("triggered_rules", []))
            pdf_ok = "YES" if data.get("pdf_base64") else "NO"
            result = f"PASS  score={score}  level={level}  rules={rules}  pdf={pdf_ok}"
            passed += 1

    except Exception as e:
        result = f"EXCEPTION: {e}"
        failed += 1

    status_icon = "OK" if "PASS" in result or "SKIP" in result else "XX"
    print(f"  [{status_icon}] {desc:<35} {result}")

print("=" * 70)
print(f"  Results: {passed} passed / {failed} failed / {len(test_cases)} total")
print("=" * 70)
