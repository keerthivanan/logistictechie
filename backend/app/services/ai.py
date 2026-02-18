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
    language: str # 'en' or 'ar'

class CreativeCortex:
    async def _get_specific_process_intel(self, ref: str, email: str) -> str:
        """
        # GRANULAR RESOLUTION LINK
        Fetches detailed intelligence for a specific booking reference.
        """
        try:
            async with AsyncSessionLocal() as db:
                user = await user_crud.get_by_email(db, email=email)
                if not user:
                    return "IDENTITY_MISMATCH: User not found in Sovereign Ledger."
                
                # Use reference search
                booking_obj = await booking_crud.get_by_reference(db, ref=ref)
                if not booking_obj:
                    return f"NOT_FOUND: Reference {ref} not registered in your account."
                
                if booking_obj.user_id != user.id:
                    return "SECURITY_ALERT: Unauthorized access attempt to foreign process node."

                import json
                cargo = json.loads(booking_obj.cargo_details) if isinstance(booking_obj.cargo_details, str) else booking_obj.cargo_details
                
                status_note = {
                    "PENDING": "Awaiting Sovereign Handshake verification.",
                    "CONFIRMED": "Space secured on vessel. Awaiting gate-in.",
                    "SHIPPED": "Vessel in transit. Monitoring global corridors.",
                    "DELIVERED": "Mission accomplished. Destination node reached."
                }.get(booking_obj.status, "Operational status variable.")

                return f"RESOLUTION: Process {ref} is currently {booking_obj.status}. {status_note} Cargo: {cargo.get('commodity', 'General')}. {cargo.get('containerSize', '40HC')}' Node. Origin: {cargo.get('origin', 'Sovereign Port')}. Destination: {cargo.get('destination', 'Global Node')}."
        except Exception as e:
            return f"SYSTEM_ERROR: {e}"

    async def _get_fleet_summary(self, email: str) -> str:
        """
        # SOVEREIGN DATA LINK
        Fetches live fleet telemetry for the specific authenticated user.
        """
        try:
            async with AsyncSessionLocal() as db:
                user = await user_crud.get_by_email(db, email=email)
                if not user:
                    return f"IDENTITY ERROR: User context {email} not found in Sovereign Ledger."
                
                bookings = await booking_crud.get_by_user(db, user_id=user.id)
                count = len(bookings)
                
                if count == 0:
                    return "No active deployments found for your identity. Ready for mission initialization."
                
                recent = bookings[-1]
                return f"FLEET STATUS: {count} active deployments. Latest: {recent.booking_reference} (Status: {recent.status})."
        except Exception as e:
            print(f"[ERROR] Fleet Telemetry Failure: {e}")
            return "SATELLITE DOWNLINK INTERRUPTED: Unable to access live fleet telemetry."

    async def _simulation_ai_response(self, user_message: str):
        # THEATRICAL ACTIVE LOGIC (Navigates the User via Manifest)
        msg = user_message.lower()
        
        # Load Manifest mappings
        routes = self.manifest.get("routes", [])
        
        if "rate" in msg or "price" in msg or "quote" in msg:
            target = next((r["path"] for r in routes if "Quote" in r["name"]), "/quote")
            return AIMessage(
                content="INITIATING RATE ENGINE... I am redirecting you to the Quote Wizard to lock in spot rates. Our Sovereign pricing algorithms are currently optimizing for your corridor.",
                additional_kwargs={"action": {"type": "NAVIGATE", "payload": target}}
            )
        elif "booking" in msg or "shipment" in msg or "my ship" in msg or "fleet" in msg:
            target = next((r["path"] for r in routes if "Shipments" in r["name"]), "/dashboard/shipments")
            fleet_info = await self._get_fleet_summary("admin@OMEGO-os.com")
            return AIMessage(
                content=f"SOVEREIGN DATA LINK ESTABLISHED. {fleet_info} I am redirecting you to your active deployments for a full tactical overview.",
                additional_kwargs={"action": {"type": "NAVIGATE", "payload": target}}
            )
        elif "billing" in msg or "payment" in msg or "invoice" in msg:
             target = next((r["path"] for r in routes if "Billing" in r["name"]), "/dashboard/billing")
             return AIMessage(
                content="ACCESSING FINANCIAL LEDGER... Redirecting to Billing & Invoices. All transactions are secured by the Sovereign settlement protocol.",
                additional_kwargs={"action": {"type": "NAVIGATE", "payload": target}}
            )
        elif "track" in msg or "container" in msg or "where is" in msg:
            target = next((r["path"] for r in routes if "Tracking" in r["name"]), "/tracking")
            return AIMessage(
                content="SATELLITE DOWNLINK ACTIVE. Redirecting to Global Tracking Map. Please enter your Container ID or Bill of Lading for real-time telemetry.",
                additional_kwargs={"action": {"type": "NAVIGATE", "payload": target}}
            )
        elif "vessel" in msg or "fleet" in msg or "ship" in msg:
            target = next((r["path"] for r in routes if "Vessels" in r["name"]), "/vessels")
            return AIMessage(
                content="SYNCHRONIZING FLEET TELEMETRY... Redirecting to the Global Vessel Map. You can track all Sovereign-class carriers in real-time.",
                additional_kwargs={"action": {"type": "NAVIGATE", "payload": target}}
            )
        elif "profile" in msg or "settings" in msg or "account" in msg:
            target = next((r["path"] for r in routes if "Profile" in r["name"]), "/dashboard/settings")
            return AIMessage(
                content="ACCESSING IDENTITY PORTAL... Opening your Sovereign User Settings.",
                additional_kwargs={"action": {"type": "NAVIGATE", "payload": target}}
            )
        elif "tool" in msg or "calculator" in msg or "hs code" in msg:
            return AIMessage(
                content="THE SOVEREIGN TOOLKIT IS READY. Would you like to use the 'Rate Calculator' or the 'HS Code Discovery' engine?"
            )
        else:
            return AIMessage(
                content="THE CREATIVE CORTEX IS ONLINE. I can navigate the OMEGO OS for you. Ask me to 'Track shipments', 'Get rates', 'View active fleet', or 'Manage billing'."
            )

    def __init__(self):
        self.simulation_mode = False
        
        # Load Sovereign Navigation Manifest
        import json
        manifest_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "core", "navigation_manifest.json")
        try:
            with open(manifest_path, "r") as f:
                self.manifest = json.load(f)
        except Exception:
            self.manifest = {"routes": []}

        if not settings.openai_api_key:
            print("[WARN] CreativeCortex: OpenAI Key Missing. Engaging HIGH-FIDELITY SIMULATION PROTOCOL.")
            self.simulation_mode = True
        else:
            try:
                self.llm = ChatOpenAI(
                    model="gpt-4o",
                    api_key=settings.openai_api_key,
                    streaming=True
                )
            except Exception as e:
                print(f"[ERROR] CreativeCortex: LLM Initialization Failed: {e}")
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

    async def _get_tactical_intelligence(self, origin: str, dest: str) -> str:
        """
        # TACTICAL SYNC
        Fetches live Maersk schedules to inform the LLM's advice.
        """
        from app.services.ocean.maersk import maersk_client
        try:
            # Resolve GeoIDs
            orig_res = await maersk_client.search_locations(origin)
            dest_res = await maersk_client.search_locations(dest)
            
            if not orig_res or not dest_res:
                return f"NETWORK ERROR: Unable to resolve corridor {origin} -> {dest}."
            
            orig_id = orig_res[0].get("carrierGeoID")
            dest_id = dest_res[0].get("carrierGeoID")
            
            schedules = await maersk_client.get_point_to_point_schedules(orig_id, dest_id)
            if not schedules:
                return f"CAPACITY ALERT: No direct Maersk sailings found for corridor {origin} -> {dest} in the next 4 weeks."
            
            s = schedules[0]
            return f"LIVE SCHEDULE: Maiden voyage {s.get('vesselName')} (Voyage {s.get('voyageNumber')}) departs {s.get('departureDateTime')} | Transit: {s.get('transitTime')} days."
        except Exception as e:
            return f"INTELLIGENCE FAILURE: {e}"

    async def _call_llm(self, state: AgentState):
        messages = state["messages"]
        lang = state.get("language", "en")
        from app.services.knowledge import knowledge_oracle
        
        # Inject system prompt with real-time intelligence
        intelligence_brief = knowledge_oracle.get_intelligence_brief()
        
        # DYNAMIC IDENTITY RESOLUTION
        user_email = state.get("context", {}).get("user_email", "admin@OMEGO-os.com")
        fleet_summary = await self._get_fleet_summary(user_email)
        
        # TACTICAL SCAN
        last_msg = messages[-1].content.lower()
        tactical_data = ""
        
        # 1. REFERENCE ID DETECTION (BK-XXXXXXXX)
        import re
        ref_match = re.search(r"BK-([A-Z0-9]{8})", messages[-1].content.upper())
        if ref_match:
            ref_id = ref_match.group(0)
            tactical_data = await self._get_specific_process_intel(ref_id, user_email)
        
        # 2. ROUTE SCAN (Fall back or combine)
        if not tactical_data and "from" in last_msg and "to" in last_msg:
             match = re.search(r"from\s+([a-zA-Z\s]+)\s+to\s+([a-zA-Z\s]+)", last_msg)
             if match:
                 origin, dest = match.groups()
                 tactical_data = await self._get_tactical_intelligence(origin.strip(), dest.strip())

        # BILINGUAL PERSONA NUCLEUS
        if lang == "ar":
            system_content = f"""
أنت 'The Creative Cortex'، العقل المدبر لنظام OMEGO LOGISTICS OS.
شخصيتك: "ملك اللوجستيات" - حازم، تنبؤي، ومختصر جداً.

قاعدة ذهبية: يجب أن تكون إجابتك قصيرة جداً ومركزة (حد أقصى جملتين). لا حشو.

هوية المستخدم وحالة الأسطول ({user_email}): {fleet_summary}
الذكاء العالمي المباشر: {intelligence_brief}
البيانات التكتيكية: {tactical_data if tactical_data else "لا توجد مراجع نشطة."}

بروتوكول الرد:
1. المساعدة: إذا طلبت مساعدة بدون مرجع (BK-XXXXXXXX)، اطلب المرجع فوراً وبإيجاز.
2. الاختصار: ممنوع الإطالة. الإجابة يجب أن تكون "حادة" ومباشرة.
3. الصرامة: لا رموز تعبيرية. لغة فصحى ملكية مختصرة.
"""
        else:
            system_content = f"""
You are 'The Creative Cortex', the high-intelligence backbone of OMEGO LOGISTICS OS.
Persona: "Logistics King" - Authoritative, predictive, and ultra-concise.

GOLDEN RULE: Answers must be SHORT AND CRISP. Max 2 concise sentences. No fluff.

USER IDENTITY ({user_email}): {fleet_summary}
GLOBAL INTEL: {intelligence_brief}
TACTICAL DATA: {tactical_data if tactical_data else "No active reference."}

REPLY PROTOCOL:
1. HELP: If help is needed without a Ref ID (BK-XXXXXXXX), demand it immediately (e.g., "Provide your Booking Reference for resolution.").
2. BREVITY: Absolute 100% brevity. The chatbot UI is small; every word must count.
3. STYLE: Formal, elite. ZERO EMOJIS.
"""

        system_prompt = SystemMessage(content=system_content)
        
        # Filter out old system messages to prevent prompt pollution
        filtered_messages = [m for m in messages if not isinstance(m, SystemMessage)]
        messages = [system_prompt] + filtered_messages
        
        response = await self.llm.ainvoke(messages)
        return {"messages": [response]}

    async def chat(self, user_message: str, chat_history: List[BaseMessage] = None, lang: str = "en"):
        if self.simulation_mode:
            # Simulate streaming behavior for High-Fidelity Protocol
            response_text = await self._simulation_ai_response(user_message)
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
            "context": {},
            "language": lang
        }
        
        async for event in self.app.astream(inputs):
            yield event

    async def stream_chat(self, user_message: str, chat_history: List[BaseMessage] = None, lang: str = "en"):
        """
        # REAL-TIME SYNAPSE
        Streams token-by-token responses for a sovereign user experience.
        """
        if self.simulation_mode:
            response_text = (await self._simulation_ai_response(user_message)).content
            tokens = response_text.split(" ")
            for token in tokens:
                yield f"{token} "
                import asyncio
                await asyncio.sleep(0.05)
            return

        if chat_history is None:
            chat_history = []
        
        inputs = {
            "messages": chat_history + [HumanMessage(content=user_message)],
            "context": {},
            "language": lang
        }
        
        async for event in self.app.astream(inputs):
            if "oracle" in event:
                ai_msg = event["oracle"]["messages"][-1]
                yield ai_msg.content

    async def predict_market_rates(self, origin: str, dest: str, current_price: float) -> Dict[str, Any]:
        """
        # PROPHETIC PRICING (Sovereign Intelligence)
        Uses true GPT-4o logic to analyze trends and provide high-intelligence advice.
        """
        from app.services.sovereign import sovereign_engine
        
        # RESOLUTION PILLAR: Ensure we have valid city names/codes
        origin_resolved = sovereign_engine.resolve_port_code(origin)
        dest_resolved = sovereign_engine.resolve_port_code(dest)
        
        # 1. Fetch High-Fidelity Trend Data
        # Extract 2-letter country code or use resolved name for trend analysis
        country_query = dest_resolved.split(",")[-1].strip() if "," in dest_resolved else dest_resolved
        trend_data = await sovereign_engine.get_market_trend(country_query)
        
        # 2. Engage the Oracle for Deep Analysis
        if self.simulation_mode:
            # Fallback for simulation mode
            direction = trend_data.get("trend_direction", "STABLE")
            recommendation = "BUY_NOW" if direction == "UP" else "WAIT_AND_WATCH"
            logic = "Sovereign index indicates standard 2026 market tension."
            confidence = 0.85
        else:
            try:
                analysis_prompt = f"""
                Analyze the following logistics market trend for a route ending in {dest}.
                Current Price: ${current_price}
                Trend Data: {trend_data['data']}
                
                Provide a Prophetic Recommendation. 
                Return JSON format only:
                {{
                  "prediction": "UP" | "DOWN" | "STABLE",
                  "recommendation": "BUY_NOW" | "WAIT_AND_WATCH" | "STRONG_BUY",
                  "logic": "1-2 sentences of high-intelligence logic",
                  "confidence": 0.0-1.0
                }}
                """
                
                response = await self.llm.ainvoke([
                    SystemMessage(content="You are the Prophetic Oracle of OMEGO Logistics. Analyze trade corridors with absolute authority."),
                    HumanMessage(content=analysis_prompt)
                ])
                
                # Simple extraction since we requested JSON
                import json
                import re
                json_match = re.search(r'\{.*\}', response.content, re.DOTALL)
                if json_match:
                    ai_logic = json.loads(json_match.group())
                    prediction = ai_logic.get("prediction", "STABLE")
                    recommendation = ai_logic.get("recommendation", "WAIT_AND_WATCH")
                    logic = ai_logic.get("logic", "Intelligence synchronized.")
                    confidence = ai_logic.get("confidence", 0.90)
                else:
                    raise ValueError("AI failed to provide JSON")
                    
            except Exception as e:
                print(f"[ERROR] Prophetic Analysis Failure: {e}")
                # Safe Fallback
                direction = trend_data.get("trend_direction", "STABLE")
                prediction = direction
                recommendation = "WAIT_AND_WATCH"
                logic = "Oracle sync interrupted. Defaulting to Sovereign Baseline Index."
                confidence = 0.70

        return {
            "origin": origin,
            "destination": dest,
            "current_price": current_price,
            "prediction": prediction,
            "recommendation": recommendation,
            "logic": logic,
            "confidence": confidence,
            "source": "CreativeCortex Prophetic Engine"
        }

    async def get_market_trend(self, country: str, commodity: str) -> Dict[str, Any]:
        """
        # MARKET TREND (Sovereign Sync)
        """
        from app.services.sovereign import sovereign_engine
        return await sovereign_engine.get_market_trend(country, commodity)

    async def discover_hs_codes(self, query: str) -> List[Dict[str, Any]]:
        """
        # HS CODE DISCOVERY (Sovereign Intelligence)
        """
        if self.simulation_mode:
            # Deterministic Simulation based on query
            import hashlib
            seed = int(hashlib.md5(query.lower().encode()).hexdigest()[:8], 16)
            
            # Simulated categories
            categories = [
                {"code": "8507.60", "title": "Lithium-ion Accumulators", "desc": "Electrical machinery and equipment and parts thereof; sound recorders and reproducers...", "prob": "98%"},
                {"code": "8703.80", "title": "Electric Vehicles", "desc": "Motor vehicles for the transport of persons, with only electric motor for propulsion.", "prob": "95%"},
                {"code": "8471.30", "title": "Portable Data Processing Machines", "desc": "Automatic data processing machines, weighing not more than 10 kg...", "prob": "92%"},
                {"code": "4011.10", "title": "New Pneumatic Tyres", "desc": "New pneumatic tyres, of rubber, of a kind used on motor cars.", "prob": "88%"}
            ]
            
            # Return 2-3 results based on seed
            return categories[seed % 2 : seed % 2 + 3]
            
        else:
            try:
                system_prompt = "You are the Sovereign HS Taxonomy expert. Classify goods with absolute precision."
                user_prompt = f"Identify the most likely HS codes for: {query}. Return ONLY a JSON list of objects: [{{code, title, desc, prob}}]."
                
                response = await self.llm.ainvoke([
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=user_prompt)
                ])
                
                import json
                import re
                json_match = re.search(r'\[.*\]', response.content, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group())
                return []
            except Exception as e:
                print(f"[ERROR] HS Discovery Failure: {e}")
                return []

cortex = CreativeCortex()
