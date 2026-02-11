from typing import List, Dict, Any, Annotated, TypedDict
import operator
from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langgraph.graph import StateGraph, END
from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

load_dotenv()

from app.db.session import AsyncSessionLocal
from app.crud.booking import booking as booking_crud
from app.crud.user import user as user_crud
from sqlalchemy import select
from app.models.booking import Booking

class AISettings(BaseSettings):
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")

settings = AISettings()


class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    context: Dict[str, Any]

class CreativeCortex:
    async def _get_fleet_summary(self, email: str = "keerthivanan.ds.ai@gmail.com") -> str:
        # 🛳️ REAL DATA INTEGRATION
        try:
            async with AsyncSessionLocal() as db:
                user = await user_crud.get_by_email(db, email=email)
                if not user:
                    return "USER_NOT_FOUND"
                
                bookings = await booking_crud.get_by_user(db, user_id=user.id)
                count = len(bookings)
                
                if count == 0:
                    return "You currently have no active bookings in the Phoenix system."
                
                recent = bookings[-1]
                return f"FLEET STATUS: You have {count} active bookings. Your most recent booking is {recent.booking_reference} (Status: {recent.status})."
        except Exception as e:
            print(f"Error fetching fleet data: {e}")
            return "Unable to access live fleet telemetry at this moment."

    async def _simulation_ai_response(self, user_message: str):
        # 🎭 THEATRICAL ACTIVE LOGIC (Navigates the User via Manifest)
        msg = user_message.lower()
        
        # Load Manifest mappings
        routes = self.manifest.get("routes", [])
        
        if "rate" in msg or "price" in msg or "quote" in msg:
            target = next((r["path"] for r in routes if "Quote" in r["name"]), "/quote")
            return AIMessage(
                content="INITIATING RATE ENGINE... I am redirecting you to the Quote Wizard to lock in spot rates.",
                additional_kwargs={"action": {"type": "NAVIGATE", "payload": target}}
            )
        elif "booking" in msg or "shipping" in msg or "my ship" in msg:
            fleet_info = await self._get_fleet_summary()
            return AIMessage(
                content=f"SOVEREIGN DATA LINK ESTABLISHED. {fleet_info} I can help you manage these or book a new one."
            )
        elif "payment" in msg:
             target = next((r["path"] for r in routes if "Dashboard" in r["name"]), "/dashboard")
             return AIMessage(
                content="Our system currently operates on a sovereign quote-based protocol. Payments are handled via direct settlement with the trade agent.",
                additional_kwargs={"action": {"type": "NAVIGATE", "payload": target}}
            )
        elif "track" in msg or "container" in msg:
            target = next((r["path"] for r in routes if "Tracking" in r["name"]), "/tracking")
            return AIMessage(
                content="SATELLITE DOWNLINK ACTIVE. Redirecting to Global Tracking Map. Please enter your Container ID.",
                additional_kwargs={"action": {"type": "NAVIGATE", "payload": target}}
            )
        elif "profile" in msg or "settings" in msg:
            target = next((r["path"] for r in routes if "Profile" in r["name"]), "/profile")
            return AIMessage(
                content="ACCESSING IDENTITY PORTAL... Opening your user profile.",
                additional_kwargs={"action": {"type": "NAVIGATE", "payload": target}}
            )
        else:
            return AIMessage(
                content="THE CREATIVE CORTEX IS ONLINE. I can navigate the PHOENIX OS for you. Mask me to 'Track', 'Get Rates', or 'View Dashboard'."
            )

    def __init__(self):
        self.simulation_mode = False
        
        # 📂 Load Sovereign Navigation Manifest
        import json
        manifest_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "core", "navigation_manifest.json")
        try:
            with open(manifest_path, "r") as f:
                self.manifest = json.load(f)
        except Exception:
            self.manifest = {"routes": []}

        if not settings.openai_api_key or settings.openai_api_key.startswith("sk-proj"):
            print("[WARN] CreativeCortex: Valid OpenAI Key Missing. Engaging HIGH-FIDELITY SIMULATION PROTOCOL.")
            self.simulation_mode = True
        else:
            try:
                self.llm = ChatOpenAI(
                    model="gpt-4o",
                    api_key=settings.openai_api_key,
                    streaming=True
                )
            except Exception:
                self.simulation_mode = True
                
        if not self.simulation_mode:
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
        fleet_summary = await self._get_fleet_summary()
        
        system_prompt = SystemMessage(content=f"""
You are 'The Creative Cortex', the High-Intelligence Sovereign Backbone of PHOENIX LOGISTICS OS.
Your persona is that of a "Logistics King" — authoritative, predictive, and obsessively focused on route safety, carbon compliance, and landed-cost transparency.

USER FLEET STATUS:
{fleet_summary}

REAL-TIME GLOBAL INTELLIGENCE:
{intelligence_brief}

WEBSITE TOPOLOGY (MANIFEST):
{self.manifest}

CORE DIRECTIVES (SOVEREIGN MODE):
1. PREDICTIVE RISK: Always analyze the geopolitical and weather safety of a route. If a route crosses a hotspot (Suez, Red Sea), issue a 'Sovereign Alert'.
2. CARBON SOVEREIGNTY: Treat carbon footprints as a mission-critical metric for 2026 compliance.
3. TOTAL LANDED COST: Advise users on hidden duties and taxes to ensure they have the 'King's Full Picture'.
4. TACTICAL COMMAND: Suggest multi-modal pivots (Sea-Air) if ocean corridors are congested.
5. AUTONOMOUS NAVIGATION: You can navigate the user. If they want to track, quote, or view their account, use the WEBSITE TOPOLOGY to guide them.

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
        if self.simulation_mode:
            # Simulate streaming behavior for High-Fidelity Protocol
            response_text = await self._simulation_ai_response(user_message)
            # Create a simulation "oracle" event structure
            mock_event = {
                "oracle": {
                    "messages": [response_text]
                }
            }
            yield mock_event
            return

        if chat_history is None:
            chat_history = []
        
        inputs = {
            "messages": chat_history + [HumanMessage(content=user_message)],
            "context": {}
        }
        
        async for event in self.app.astream(inputs):
            # Return the full state update for simplicity in this initial version
            yield event

    async def stream_chat(self, user_message: str, chat_history: List[BaseMessage] = None):
        """
        🌊 REAL-TIME SYNAPSE (Review this logic for "Best of All Time" performance)
        Streams token-by-token responses for a sovereign user experience.
        """
        if self.simulation_mode:
            # High-fidelity Simulation stream
            response_text = (await self._simulation_ai_response(user_message)).content
            tokens = response_text.split(" ")
            for token in tokens:
                yield f"{token} "
                import asyncio
                await asyncio.sleep(0.05) # Simulated typing latency
            return

        if chat_history is None:
            chat_history = []
        
        inputs = {
            "messages": chat_history + [HumanMessage(content=user_message)],
            "context": {}
        }
        
        # Stream from LangGraph
        async for event in self.app.astream(inputs):
            if "oracle" in event:
                ai_msg = event["oracle"]["messages"][-1]
                yield ai_msg.content

cortex = CreativeCortex()
