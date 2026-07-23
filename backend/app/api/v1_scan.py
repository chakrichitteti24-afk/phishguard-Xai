from fastapi import APIRouter, HTTPException
from app.schemas.payload import ScanRequest, AIAnalysisResult
from app.services.pipeline import execute_scan_pipeline

router = APIRouter()

@router.post("/scan", response_model=AIAnalysisResult)
async def scan_payload(request: ScanRequest):
    try:
        result = await execute_scan_pipeline(request)
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
