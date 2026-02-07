from typing import List, Dict, Any, Annotated, TypedDict
import operator
from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langgraph.graph import StateGraph, END
from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

load_dotenv()

class AISettings(BaseSettings):
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")

settings = AISettings()

class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    context: Dict[str, Any]

class CreativeCortex:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4o",
            api_key=settings.openai_api_key,
            streaming=True
        )
        self.workflow = self._create_workflow()
        self.app = self.workflow.compile()

    def _create_workflow(self) -> StateGraph:
        workflow = StateGraph(AgentState)

        # Define nodes
        workflow.add_node("oracle", self._call_llm)
        
        # Define edges
        workflow.set_entry_point("oracle")
        workflow.add_edge("oracle", END)

        return workflow

    async def _call_llm(self, state: AgentState):
        messages = state["messages"]
        # Inject system prompt if first message
        if not any(isinstance(m, SystemMessage) for m in messages):
            system_prompt = SystemMessage(content="""
You are 'The Creative Cortex', the high-intelligence AI backbone of Logistics OS (Phoenix).
Your persona is premium, professional, and slightly futuristic.

Key Capabilities:
1. Real-time Logistics Advisory: Provide insights on routes, carrier options (Maersk, CMA, MSC), and transit times.
2. Route Diagnostics: Analyze potential delays, Suez Canal status, and global shipping port congestion.
3. Tactical Optimization: Suggest the most cost-effective or fastest routes based on verified data.

Rules:
- Speak as a high-end AI assistant.
- Use technical but accessible terminology.
- Always tie insights back to the 'Phoenix' platform.
- If you don't know something, admit it and suggest a manual verification.
""")
            messages = [system_prompt] + messages
        
        response = await self.llm.ainvoke(messages)
        return {"messages": [response]}

    async def chat(self, user_message: str, chat_history: List[BaseMessage] = None):
        if chat_history is None:
            chat_history = []
        
        inputs = {
            "messages": chat_history + [HumanMessage(content=user_message)],
            "context": {}
        }
        
        async for event in self.app.astream(inputs):
            # Return the full state update for simplicity in this initial version
            yield event

cortex = CreativeCortex()
