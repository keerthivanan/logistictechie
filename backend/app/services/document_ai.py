from typing import Dict, Any

class DocumentAIService:
    def __init__(self):
        self.project_id = "stub-project"
        self.location = "us" 
        self.processor_id = "stub-processor"

    async def process_logistics_document(self, file_content: bytes) -> Dict[str, Any]:
        """
        STUB: Returns simulation data to bypass missing Google Cloud libraries.
        """
        return {
            "status": "simulation",
            "message": "Google Document AI Stub Active (Backend Verification Mode)",
            "data": {
                "origin": "Shanghai, China",
                "destination": "Dubai, UAE",
                "cargo": "Simulation Cargo",
                "weight": "1000kg",
                "volume": "10 CBM"
            }
        }

document_ai = DocumentAIService()
