import random
from datetime import datetime
from typing import List, Dict

class GlobalKnowledge:
    """
    Simulates real-time global logistics intelligence.
    In a production scenario, this would connect to maritime news APIs, 
    Linerlytica, or port authority data.
    """
    
    HOT_SPOTS = [
        {"location": "Suez Canal", "status": "Caution", "delay": "2-4 days", "reason": "Draft restrictions & maintenance"},
        {"location": "Port of Long Beach", "status": "Congested", "delay": "5-7 days", "reason": "Labor negotiations & heavy volume"},
        {"location": "Panama Canal", "status": "Critical", "delay": "10-14 days", "reason": "Freshwater level drought restrictions"},
        {"location": "Port of Rotterdam", "status": "Fluid", "delay": "0-1 days", "reason": "Operational efficiency optimized"},
        {"location": "Shanghai Port", "status": "Busy", "delay": "1-2 days", "reason": "Export surge pre-holiday"}
    ]

    @classmethod
    def get_route_alerts(cls, origin: str = None, destination: str = None) -> List[Dict]:
        """
        Fetches relevant alerts for a given route.
        """
        # For now, return a random selection of "Global Events" if no specific route
        return random.sample(cls.HOT_SPOTS, 2)

    @classmethod
    def get_intelligence_brief(cls) -> str:
        """
        Returns a formatted string summary of global maritime intelligence.
        """
        alerts = cls.get_route_alerts()
        brief = "GLOBAL MARITIME INTELLIGENCE BRIEF - " + datetime.now().strftime("%Y-%m-%d %H:%M") + "\n"
        for alert in alerts:
            brief += f"- {alert['location']}: {alert['status']} ({alert['delay']} delay). Reason: {alert['reason']}\n"
        return brief

knowledge_oracle = GlobalKnowledge()
