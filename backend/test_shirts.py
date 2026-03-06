import os
from dotenv import load_dotenv
import requests
import json
from urllib.parse import quote

load_dotenv()
key = os.getenv('MAERSK_CONSUMER_KEY')

print("\nTesting CORRECT Commodities API with 'shirts'...")
com_url = f"https://api.maersk.com/commodity-classifications?commodityName={quote('shirts')}"
headers = {'Consumer-Key': key}
r2 = requests.get(com_url, headers=headers)
print("Com Status:", r2.status_code)
if r2.status_code == 200:
    data = r2.json()
    print("Raw Output:", json.dumps(data, indent=2)[:500])
else:
    print("Error:", r2.text)

print("\nTesting CORRECT Commodities API with 'shirt'...")
com_url = f"https://api.maersk.com/commodity-classifications?commodityName={quote('shirt')}"
r3 = requests.get(com_url, headers=headers)
print("Com Status:", r3.status_code)
if r3.status_code == 200:
    data = r3.json()
    print("Raw Output:", json.dumps(data, indent=2)[:500])
else:
    print("Error:", r3.text)

print("\nTesting CORRECT Commodities API with 't-shirt'...")
com_url = f"https://api.maersk.com/commodity-classifications?commodityName={quote('t-shirt')}"
r4 = requests.get(com_url, headers=headers)
print("Com Status:", r4.status_code)
if r4.status_code == 200:
    data = r4.json()
    print("Raw Output:", json.dumps(data, indent=2)[:500])
else:
    print("Error:", r4.text)

print("\nTesting CORRECT Commodities API with 't-shirts'...")
com_url = f"https://api.maersk.com/commodity-classifications?commodityName={quote('t-shirts')}"
r5 = requests.get(com_url, headers=headers)
print("Com Status:", r5.status_code)
if r5.status_code == 200:
    data = r5.json()
    print("Raw Output:", json.dumps(data, indent=2)[:500])
else:
    print("Error:", r5.text)
