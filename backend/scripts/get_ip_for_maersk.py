import asyncio
import httpx
import os

async def get_public_ip():
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get("https://api.ipify.org?format=json")
            if resp.status_code == 200:
                ip = resp.json().get('ip')
                print(f"🌍 YOUR PUBLIC IP: {ip}")
                print("\n✅ ACTION REQUIRED:")
                print(f"   Log into Maersk Developer Portal > Edit App > Allowed IPs.")
                print(f"   Add '{ip}' to the whitelist.")
                print("   Then restart your backend.")
            else:
                print("❌ Could not determine public IP.")
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(get_public_ip())
