import pytest
from app.models import AnalyzeRequest
from app.risk_engine import calculate_risk
from app.ml.predictor import ml_predictor
from app.historical_data import historical_data_service

def test_ml_feature_extraction():
    """Verify ML feature extraction and prediction output format"""
    req = AnalyzeRequest(
        shipperId="SHP-1024",
        origin="Chennai",
        destination="Dubai",
        weight=71.0,
        declaredValue=250000,
        serviceType="Express",
        bookingHour=2,
        paymentMethod="Crypto Wallet",
        currentDailyBookings=63
    )
    history = historical_data_service.get_shipper_history(req.shipperId)
    ml_signal = ml_predictor.evaluate_ml_anomaly(req, history)
    
    assert ml_signal is not None
    assert ml_signal.signalType == "ML_ANOMALY_DETECTION"
    assert ml_signal.scoreContribution in [12, 20]
    assert "ML" in ml_signal.title

def test_ml_integration_in_risk_engine():
    """Verify ML signal appears in calculate_risk output for high risk booking"""
    req = AnalyzeRequest(
        shipperId="SHP-1024",
        origin="Chennai",
        destination="Dubai",
        weight=85.0,
        declaredValue=350000,
        serviceType="Express",
        bookingHour=3,
        paymentMethod="Crypto Wallet",
        currentDailyBookings=80
    )
    res = calculate_risk(req)
    signal_types = [s.signalType for s in res.signals]
    assert "ML_ANOMALY_DETECTION" in signal_types
    assert res.engineVersion == "fraud-engine-v2-ml"
