from pydantic import BaseModel, HttpUrl
from typing import Optional, Dict, List, Any
from enum import Enum

class ScanType(str, Enum):
    URL = "URL"
    EMAIL = "Email"
    SMS = "SMS"
    WHATSAPP = "WhatsApp"
    QR = "QR"
    IMAGE = "Image"

class ScanRequest(BaseModel):
    type: ScanType
    payload: str
    metadata: Optional[Dict[str, Any]] = None

class ExplanationItem(BaseModel):
    id: str
    reason: str
    severity: str

class AIAnalysisResult(BaseModel):
    score: float
    level: str
    confidence: float
    explanations: List[ExplanationItem]
    recommendations: List[str]
    threat_intel_summary: Optional[Dict[str, Any]] = None
    features: Optional[Dict[str, Any]] = None
    risk_components: Optional[Dict[str, float]] = None
    triggered_rules: Optional[List[str]] = None
    error: Optional[str] = None
    pdf_base64: Optional[str] = None
