from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_analyze_api_legitimate():
    payload = {
        "shipperId": "SHP-1024",
        "origin": "Chennai",
        "destination": "Mumbai",
        "weight": 8.0,
        "declaredValue": 35000,
        "serviceType": "Standard",
        "bookingHour": 10,
        "paymentMethod": "Credit Card (xxxx-4921)"
    }
    response = client.post("/api/fraud/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "riskScore" in data
    assert "riskLevel" in data
    assert "decision" in data
    assert data["decision"] == "ALLOW"

def test_analyze_api_fraudulent():
    payload = {
        "shipperId": "SHP-1024",
        "origin": "Chennai",
        "destination": "Dubai",
        "weight": 71.0,
        "declaredValue": 250000,
        "serviceType": "Express",
        "bookingHour": 2,
        "paymentMethod": "UPI"
    }
    response = client.post("/api/fraud/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["riskScore"] >= 61
    assert data["decision"] in ["HOLD", "BLOCK"]

def test_pydantic_validation_error():
    # Invalid weight (-5) and booking hour (25)
    payload = {
        "shipperId": "SHP-1024",
        "origin": "Chennai",
        "destination": "Dubai",
        "weight": -5.0,
        "declaredValue": 250000,
        "serviceType": "Express",
        "bookingHour": 25,
        "paymentMethod": "UPI"
    }
    response = client.post("/api/fraud/analyze", json=payload)
    assert response.status_code == 422
