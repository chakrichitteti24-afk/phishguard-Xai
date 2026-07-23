from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from app.schemas.payload import ScanRequest, AIAnalysisResult
from app.services.pipeline import execute_scan_pipeline
from app.services.groq_engine import run_copilot_chat

router = APIRouter()

class CopilotRequest(BaseModel):
    messages: List[Dict[str, str]]

@router.post("/scan", response_model=AIAnalysisResult)
async def scan_payload(request: ScanRequest):
    try:
        result = await execute_scan_pipeline(request)
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/copilot")
async def copilot_chat(request: CopilotRequest):
    try:
        reply = run_copilot_chat(request.messages)
        return {"reply": reply}
    except Exception as e:
        return {"reply": f"Copilot Error: {str(e)}", "error": str(e)}

