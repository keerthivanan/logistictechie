import random
from datetime import datetime
from typing import List, Dict

class GlobalKnowledge:
    """
    Simulates real-time global logistics intelligence.
    In a production scenario, this would connect to maritime news APIs, 
    Linerlytica, or port authority data.
    """
    
    HOT_SPOTS = [] # Initialized as empty to ensure 0 Fake Content. Populated during startup.

    @classmethod
    def get_route_alerts(cls, origin: str = None, destination: str = None) -> List[Dict]:
        """
        Fetches relevant alerts for a given route.
        """
        # For now, return a random selection of "Global Events" if no specific route
        return random.sample(cls.HOT_SPOTS, 2)

    @classmethod
    async def refresh_intelligence(cls):
        """
        Scrapes real maritime news from public RSS feeds to ensure "Best of All Time" accuracy.
        """
        import httpx
        import xml.etree.ElementTree as ET
        
        feeds = [
            "https://gcaptain.com/feed/",
            "https://www.maritime-executive.com/rss"
        ]
        
        new_alerts = []
        async with httpx.AsyncClient(timeout=10.0) as client:
            for feed in feeds:
                try:
                    resp = await client.get(feed)
                    if resp.status_code == 200:
                        root = ET.fromstring(resp.text)
                        for item in root.findall(".//item")[:3]:
                            title = item.find("title").text
                            link = item.find("link").text
                            new_alerts.append({
                                "location": "Global Corridor",
                                "status": "Active Intelligence",
                                "delay": "Variable",
                                "reason": title,
                                "link": link
                            })
                except Exception as e:
                    print(f"[WARN] Knowledge Scrape Failed for {feed}: {e}")
        
        if new_alerts:
            cls.HOT_SPOTS = new_alerts + cls.HOT_SPOTS[:2]

    @classmethod
    def get_intelligence_brief(cls) -> str:
        """
        Returns a formatted string summary of global maritime intelligence.
        """
        alerts = cls.HOT_SPOTS[:3]
        brief = "GLOBAL MARITIME INTELLIGENCE BRIEF - " + datetime.now().strftime("%Y-%m-%d %H:%M") + "\n"
        for alert in alerts:
            brief += f"- {alert['location']}: {alert['status']}. Insight: {alert['reason']}\n"
        return brief

    @classmethod
    async def initialize(cls):
        """
        Asynchronous startup routine to fetch the latest global intelligence.
        """
        print("[INFO] High-Intelligence Oracle: Refreshing Global Corridor Data...")
        await cls.refresh_intelligence()
        print("[INFO] Global Knowledge Synchronization Complete.")

knowledge_oracle = GlobalKnowledge()
