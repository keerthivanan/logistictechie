import asyncio
import httpx

async def inspect():
    url = "https://api.maersk.com/commodity-classifications"
    params = {"commodityName": "Cars"}
    headers = {"Consumer-Key": "l203GNFNlj6q30l5QbplhuNCW3qOKz5Z", "Accept": "application/json"}
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params, headers=headers)
        if resp.status_code == 200:
            data = resp.json()
            print(f"TYPE: {type(data)}")
            if isinstance(data, dict):
                print(f"KEYS: {list(data.keys())}")
            else:
                print(f"LIST LEN: {len(data)}")
        else:
            print(f"Error {resp.status_code}")

if __name__ == "__main__":
    asyncio.run(inspect())
