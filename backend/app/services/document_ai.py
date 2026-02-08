import os
from typing import Dict, Any
from google.cloud import documentai_v1 as documentai
from app.core.config import settings

class DocumentAIService:
    def __init__(self):
        self.project_id = settings.GOOGLE_CLOUD_PROJECT
        self.location = "us" # Default location
        self.processor_id = os.getenv("GOOGLE_DOC_AI_PROCESSOR_ID", "")

    async def process_logistics_document(self, file_content: bytes) -> Dict[str, Any]:
        """
        Processes a logistics document (PDF/Image) and extracts structured shipping data.
        """
        if not self.project_id or not self.processor_id:
            # Placeholder/Mock if keys are not yet provided
            return {
                "status": "simulation",
                "message": "Enabling Google Document AI... Use real keys for production extraction.",
                "data": {
                    "origin": "Shanghai, China",
                    "destination": "Dubai, UAE",
                    "cargo": "High-End Electronics",
                    "weight": "2500kg",
                    "volume": "12 CBM"
                }
            }

        client = documentai.DocumentProcessorServiceClient()
        name = client.processor_path(self.project_id, self.location, self.processor_id)

        raw_document = documentai.RawDocument(content=file_content, mime_type="application/pdf")
        request = documentai.ProcessRequest(name=name, raw_document=raw_document)

        result = client.process_document(request=request)
        document = result.document

        # Logic to map Google Doc AI entities to PHOENIX schema
        extracted_data = {}
        for entity in document.entities:
            extracted_data[entity.type_] = entity.mention_text

        return {
            "status": "success",
            "data": extracted_data
        }

document_ai = DocumentAIService()
