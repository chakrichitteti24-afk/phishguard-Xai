import requests

test_urls = [
    'http://192.168.1.105/bank-login/verify-account.php',
    'https://paypa1-secure-update.xyz/login/verify?user=victim&token=abc123',
    'https://google.com',
]

for url in test_urls:
    print(f'\n[TESTING] {url}')
    try:
        r = requests.post('http://localhost:8000/api/v1/scan', json={'type': 'URL', 'payload': url}, timeout=35)
        if r.status_code == 200:
            d = r.json()
            score = d.get('score', 'N/A')
            level = d.get('level', 'N/A')
            conf = d.get('confidence', 'N/A')
            rules = d.get('triggered_rules', [])
            pdf = 'Generated' if d.get('pdf_base64') else 'Missing'
            intel = d.get('threat_intel_summary', {})
            whois_age = intel.get('whois', {}).get('domain_age_days', 'N/A')
            ssl_ok = intel.get('ssl', {}).get('has_ssl', 'N/A')
            expl = d.get('explanations', [{}])[0].get('reason', 'N/A')[:100]
            
            print(f'  SCORE:  {score}')
            print(f'  LEVEL:  {level}')
            print(f'  CONF:   {conf}%')
            print(f'  RULES:  {len(rules)} triggered')
            print(f'  RULES:  {rules[:3]}')
            print(f'  PDF:    {pdf}')
            print(f'  WHOIS:  {whois_age} days old')
            print(f'  SSL:    has_ssl={ssl_ok}')
            print(f'  AI:     {expl}')
        else:
            print(f'  ERROR: HTTP {r.status_code} - {r.text[:300]}')
    except Exception as e:
        print(f'  EXCEPTION: {e}')

print('\n[DONE]')
