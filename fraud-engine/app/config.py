from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
CSV_FILE_PATH = DATA_DIR / "shipper_history.csv"

class Settings(BaseModel):
    app_name: str = "FraudShield Rule & ML-Powered Fraud Detection Engine"
    engine_version: str = "fraud-engine-v2-ml"
    cors_allowed_origins: list[str] = [
        "http://localhost:4200",
        "http://127.0.0.1:4200",
        "http://localhost:3000"
    ]
    low_max: int = 30
    medium_max: int = 60
    high_max: int = 80
    critical_max: int = 100

settings = Settings()
