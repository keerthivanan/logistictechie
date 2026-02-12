import os
import asyncio
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

load_dotenv()

async def verify_ai():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("X OPENAI_API_KEY not found in .env")
        return
    
    print(f"Testing API Key: {api_key[:10]}...")
    
    try:
        llm = ChatOpenAI(model="gpt-4o", api_key=api_key)
        response = await llm.ainvoke([HumanMessage(content="Hello, verify your system status.")])
        print("V OpenAI Connection Successful!")
        print(f"AI Response: {response.content}")
    except Exception as e:
        print(f"X OpenAI Connection Failed: {e}")

if __name__ == "__main__":
    asyncio.run(verify_ai())
