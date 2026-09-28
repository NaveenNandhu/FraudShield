# FraudShield Rule-Based Behavioral Fraud Detection Engine (V1)

Production-grade, transparent, explainable fraud detection engine built with Python 3, FastAPI, Pydantic, Pandas, and Scikit-learn.

## 🚀 Quick Start

### 1. Installation & Environment

```bash
cd fraud-engine

# Create virtual environment (optional)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Running the API Server

```bash
uvicorn app.main:app --reload --port 8000
```

- API Base URL: `http://127.0.0.1:8000`
- Interactive Swagger Documentation: `http://127.0.0.1:8000/docs`

---

## 📡 API Endpoint: `POST /api/fraud/analyze`

### Request Example

```json
{
  "shipperId": "SHP-1024",
  "origin": "Chennai",
  "destination": "Dubai",
  "weight": 71,
  "declaredValue": 250000,
  "serviceType": "Express",
  "bookingHour": 2,
  "paymentMethod": "UPI"
}
```

### Response Example

```json
{
  "shipmentId": "FS-84920",
  "shipperId": "SHP-1024",
  "riskScore": 91,
  "riskLevel": "CRITICAL",
  "decision": "BLOCK",
  "signals": [
    {
      "signalType": "WEIGHT_ANOMALY",
      "severity": "CRITICAL",
      "scoreContribution": 25,
      "title": "Extreme Package Weight Anomaly",
      "description": "Current shipment weight (71.0 kg) is 8.5x higher than shipper's 30-day average.",
      "baseline": "8.4 kg average",
      "current": "71.0 kg (8.5x baseline)"
    },
    {
      "signalType": "DESTINATION_ANOMALY",
      "severity": "HIGH",
      "scoreContribution": 20,
      "title": "Unverified Destination Corridor",
      "description": "Destination 'Dubai' is not present in shipper's historical route profile.",
      "baseline": "Chennai, Mumbai, Bangalore, Coimbatore",
      "current": "Dubai"
    }
  ],
  "recommendedAction": "Block shipment immediately, freeze booking pipeline, and initiate fraud analyst investigation.",
  "engineVersion": "fraud-engine-v1",
  "timestamp": "2026-09-27T20:30:00Z"
}
```

---

## 📐 Risk Scoring Logic & Thresholds

Total Score = Sum of triggered signal score contributions (clamped between 0 and 100):

| Signal Detector | Max Contribution | Description |
|---|---|---|
| `WEIGHT_ANOMALY` | +25 pts | Package weight ratio vs 30-day historical average |
| `DESTINATION_ANOMALY` | +20 pts | Route check against verified shipper destination list |
| `BOOKING_VELOCITY_ANOMALY` | +20 pts | Daily booking count velocity spike |
| `BOOKING_TIME_ANOMALY` | +10 pts | Booking hour outside shipper operational window |
| `SERVICE_ANOMALY` | +10 pts | Tier escalation (e.g. Standard to Express Air) |
| `DECLARED_VALUE_ANOMALY` | +10 pts | Declared monetary value ratio vs average |
| `PAYMENT_ANOMALY` | +5 pts | Payment instrument check against 30-day record |

### Risk Level & Decision Mapping

- **0 – 30**: `LOW` → `ALLOW`
- **31 – 60**: `MEDIUM` → `VERIFY`
- **61 – 80**: `HIGH` → `HOLD`
- **81 – 100**: `CRITICAL` → `BLOCK`

---

## 🧪 Testing

Run Pytest suite:

```bash
pytest
```

---

## 🌐 Angular Frontend Integration

The Angular frontend at `http://localhost:4200` connects to this FastAPI service via `FraudDetectionService`.
CORS is explicitly configured for local development.
