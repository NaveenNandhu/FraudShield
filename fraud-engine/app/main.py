from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .models import AnalyzeRequest, AnalyzeResponse, ShipperHistoryModel
from .risk_engine import calculate_risk
from .historical_data import historical_data_service

app = FastAPI(
    title=settings.app_name,
    version=settings.engine_version,
    description="Rule-based behavioral fraud detection engine for shipping bookings."
)

# Configure CORS explicitly for Angular frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "engine": settings.app_name,
        "version": settings.engine_version,
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "version": settings.engine_version}

@app.post("/api/fraud/analyze", response_model=AnalyzeResponse)
def analyze_booking(request: AnalyzeRequest):
    try:
        response = calculate_risk(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk engine evaluation error: {str(e)}")

@app.get("/api/shippers/{shipper_id}", response_model=ShipperHistoryModel)
def get_shipper_profile(shipper_id: str):
    return historical_data_service.get_shipper_history(shipper_id)
