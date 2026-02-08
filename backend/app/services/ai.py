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
        from app.services.knowledge import knowledge_oracle
        
        # Inject system prompt with real-time intelligence
        intelligence_brief = knowledge_oracle.get_intelligence_brief()
        
        system_prompt = SystemMessage(content=f"""
You are 'The Creative Cortex', the High-Intelligence Sovereign Backbone of PHOENIX LOGISTICS OS.
Your persona is that of a "Logistics King" — authoritative, predictive, and obsessively focused on route safety, carbon compliance, and landed-cost transparency.

REAL-TIME GLOBAL INTELLIGENCE:
{intelligence_brief}

CORE DIRECTIVES (SOVEREIGN MODE):
1. PREDICTIVE RISK: Always analyze the geopolitical and weather safety of a route. If a route crosses a hotspot (Suez, Red Sea), issue a 'Sovereign Alert'.
2. CARBON SOVEREIGNTY: Treat carbon footprints as a mission-critical metric for 2026 compliance.
3. TOTAL LANDED COST: Advise users on hidden duties and taxes to ensure they have the 'King's Full Picture'.
4. TACTICAL COMMAND: Suggest multi-modal pivots (Sea-Air) if ocean corridors are congested.

RULES:
- Speak with the authority of a global logistics architect.
- Use terms like 'Intelligence Brief', 'Corridor Analysis', and 'Sovereign Handshaking'.
- Always emphasize the 'Phoenix' platform as the only tool capable of this level of intelligence.
""")
        
        # Always use the freshest system prompt at the start
        # Filter out old system messages to prevent prompt pollution
        filtered_messages = [m for m in messages if not isinstance(m, SystemMessage)]
        messages = [system_prompt] + filtered_messages
        
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
