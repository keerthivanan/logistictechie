import asyncio
import httpx

async def inspect():
    url = "https://api.maersk.com/reference-data/locations"
    # Using the working params (Direct Key, No Limit)
    params = {"cityName": "Shanghai"}
    headers = {"Consumer-Key": "l203GNFNlj6q30l5QbplhuNCW3qOKz5Z", "Accept": "application/json"}
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params, headers=headers)
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list) and len(data) > 0:
                print("KEYS FOUND in first item:")
                print(list(data[0].keys()))
                print("\nSAMPLE ITEM:")
                print(data[0])
            else:
                print(f"Data is {type(data)}: {data}")
        else:
            print(f"Error {resp.status_code}")

if __name__ == "__main__":
    asyncio.run(inspect())
