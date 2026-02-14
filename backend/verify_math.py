import asyncio
import re
from app.services.sovereign import SovereignEngine

async def verify_global_logic():
    print("PHOENIX OS: GLOBAL FORENSIC STRESS TEST")
    print("=======================================")
    
    test_cases = [
        {"origin": "Shanghai", "dest": "Jeddah", "target": "KSA 15%", "tax_rate": 0.15},
        {"origin": "Dubai", "dest": "Rotterdam", "target": "EU 21%", "tax_rate": 0.21},
        {"origin": "Mumbai", "dest": "London", "target": "UK 20%", "tax_rate": 0.20},
        {"origin": "Shanghai", "dest": "Jebel Ali", "target": "UAE 5%", "tax_rate": 0.05},
        {"origin": "Qingdao", "dest": "Mumbai", "target": "India 18%", "tax_rate": 0.18},
        {"origin": "Hong Kong", "dest": "Los Angeles", "target": "US 0%", "tax_rate": 0.00},
        {"origin": "Ningbo", "dest": "Hamburg", "target": "EU 21%", "tax_rate": 0.21},
        {"origin": "Shenzhen", "dest": "Felixstowe", "target": "UK 20%", "tax_rate": 0.20},
        {"origin": "Singapore", "dest": "Dubai", "target": "UAE 5%", "tax_rate": 0.05},
        {"origin": "Santos", "dest": "Savannah", "target": "US 0%", "tax_rate": 0.00}
    ]
    
    success_count = 0
    
    for test in test_cases:
        print(f"\n[STRESS] {test['origin']} -> {test['dest']} (Target: {test['target']})")
        res = SovereignEngine.generate_market_rate(test['origin'], test['dest'], "40HC")
        
        # Extract tax rate from wisdom string: e.g. "(15%)"
        match = re.search(r"tax node \((\d+)%\)", res['wisdom'])
        extracted_rate = match.group(1) if match else "0"
        
        if int(test['tax_rate'] * 100) == int(extracted_rate):
            print(f"[SUCCESS] {test['target']} Tax Node: Verified.")
            success_count += 1
        else:
            print(f"[FAILURE] {test['target']} Tax Node: Expected {test['tax_rate']*100}%, got {extracted_rate}%")
            print(f"   Full Wisdom: {res['wisdom']}")
            
    print("\n=======================================")
    print(f"STRESS TEST COMPLETE: {success_count}/{len(test_cases)} SUCCESS")
    print("=======================================")

if __name__ == "__main__":
    asyncio.run(verify_global_logic())
