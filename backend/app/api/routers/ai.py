from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.ai import cortex
from langchain_core.messages import HumanMessage, AIMessage

router = APIRouter(prefix="/ai", tags=["AI"])

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []

class ChatResponse(BaseModel):
    response: str
    steps: List[str] = []

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    try:
        # Convert history dicts to LangChain messages
        history = []
        for msg in request.history:
            if msg["role"] == "user":
                history.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                history.append(AIMessage(content=msg["content"]))
        
        # Call the cortex service
        full_response = ""
        steps = []
        
        async for event in cortex.chat(request.message, history):
            # In LangGraph, events are dicts representing node updates
            if "oracle" in event:
                ai_msg = event["oracle"]["messages"][-1]
                full_response = ai_msg.content
                steps.append("AI Oracle synthesized response.")
            
        return ChatResponse(response=full_response, steps=steps)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-route")
async def analyze_route(origin: str, destination: str):
    # Specialized analysis endpoint
    query = f"Analyze the logistics route from {origin} to {destination}. Mention potential risks, Suez Canal status, and port congestion."
    try:
        full_response = ""
        async for event in cortex.chat(query):
            if "oracle" in event:
                ai_msg = event["oracle"]["messages"][-1]
                full_response = ai_msg.content
        return {"analysis": full_response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
