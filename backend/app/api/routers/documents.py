from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.document_ai import document_ai
from typing import Dict, Any

router = APIRouter()

@router.post("/process")
async def process_document(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Elite Endpoint: Accepts a logistics document and returns structured shipping data.
    """
    try:
        content = await file.read()
        result = await document_ai.process_logistics_document(content)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
