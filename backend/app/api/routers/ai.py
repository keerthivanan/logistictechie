from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.services.ai import cortex
from langchain_core.messages import HumanMessage, AIMessage
from sse_starlette.sse import EventSourceResponse
import json

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []
    context: Optional[dict] = {}

class ChatResponse(BaseModel):
    response: str
    steps: List[str] = []
    action: Optional[dict] = None # { type: "NAVIGATE", payload: "/path" }

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
        action = None
        
        async for event in cortex.chat(request.message, history):
            # In LangGraph, events are dicts representing node updates
            if "oracle" in event:
                ai_msg = event["oracle"]["messages"][-1]
                full_response = ai_msg.content
                steps.append("AI Oracle synthesized response.")
                
                # Check for actions (Navigation)
                if hasattr(ai_msg, "additional_kwargs") and "action" in ai_msg.additional_kwargs:
                    action = ai_msg.additional_kwargs["action"]
            
        # If mock returned an action via our custom AIMessage structure
        if not action and hasattr(full_response, "additional_kwargs"): # Handle edge case if mock returns weirdly
             pass

        return ChatResponse(response=full_response, steps=steps, action=action)
        
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

@router.post("/predict", response_model=Dict)
async def predict_rates(request: Dict[str, Any]):
    """
    🔮 PROPHETIC PRICING ENDPOINT
    Input: origin, destination, current_price
    Output: AI Prediction (Buy/Wait)
    """
    origin = request.get("origin", "CNSHA")
    dest = request.get("destination", "SAJED")
    price = request.get("price", 2000.0)
    
    prediction = await cortex.predict_market_rates(origin, dest, price)
    return {"success": True, "data": prediction}

@router.get("/trend", response_model=Dict)
async def get_market_trends(country: str = "GLOBAL", commodity: str = "General Cargo"):
    """
    📈 DASHBOARD TREND ENDPOINT
    Returns 12-month rate history + forecast for a specific market.
    """
    try:
        data = await cortex.get_market_trend(country, commodity)
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat/stream")
async def stream_chat(message: str, history: str = "[]"):
    """
    🌊 SOVEREIGN SYNAPSE STREAM
    Real-time SSE endpoint for token-by-token AI responses.
    """
    try:
        # Parse history from query param
        history_list = json.loads(history)
        langchain_history = []
        for msg in history_list:
             if msg["role"] == "user":
                langchain_history.append(HumanMessage(content=msg["content"]))
             elif msg["role"] == "assistant":
                langchain_history.append(AIMessage(content=msg["content"]))
        
        async def event_generator():
            async for token in cortex.stream_chat(message, langchain_history):
                # Format as SSE data
                yield {"data": token}
            
            # End of stream signal
            yield {"data": "[DONE]"}

        return EventSourceResponse(event_generator())

    except Exception as e:
        print(f"Stream Error: {e}")
        return EventSourceResponse(iter([]))
