import pytest
from app.models import AnalyzeRequest
from app.risk_engine import calculate_risk
from app.historical_data import historical_data_service

def test_legitimate_shipment():
    """CASE 1 — LEGITIMATE: Expect LOW / ALLOW"""
    req = AnalyzeRequest(
        shipperId="SHP-1024",
        origin="Chennai",
        destination="Mumbai",
        weight=8.0,
        declaredValue=35000,
        serviceType="Standard",
        bookingHour=10,
        paymentMethod="Credit Card (xxxx-4921)"
    )
    res = calculate_risk(req)
    assert res.riskScore <= 30
    assert res.riskLevel == "LOW"
    assert res.decision == "ALLOW"
    assert len(res.signals) == 0

def test_weight_anomaly():
    """Test weight deviation detector"""
    req = AnalyzeRequest(
        shipperId="SHP-1024",
        origin="Chennai",
        destination="Mumbai",
        weight=71.0,  # 8.4x baseline
        declaredValue=35000,
        serviceType="Standard",
        bookingHour=14,
        paymentMethod="Credit Card (xxxx-4921)"
    )
    res = calculate_risk(req)
    signal_types = [s.signalType for s in res.signals]
    assert "WEIGHT_ANOMALY" in signal_types

def test_destination_anomaly():
    """Test unverified destination detector"""
    req = AnalyzeRequest(
        shipperId="SHP-1024",
        origin="Chennai",
        destination="Dubai (UAE)",
        weight=8.0,
        declaredValue=35000,
        serviceType="Standard",
        bookingHour=14,
        paymentMethod="Credit Card (xxxx-4921)"
    )
    res = calculate_risk(req)
    signal_types = [s.signalType for s in res.signals]
    assert "DESTINATION_ANOMALY" in signal_types

def test_velocity_anomaly():
    """Test booking frequency burst detector"""
    req = AnalyzeRequest(
        shipperId="SHP-1024",
        origin="Chennai",
        destination="Mumbai",
        weight=8.0,
        declaredValue=35000,
        serviceType="Standard",
        bookingHour=14,
        paymentMethod="Credit Card (xxxx-4921)",
        currentDailyBookings=60 # 5x baseline
    )
    res = calculate_risk(req)
    signal_types = [s.signalType for s in res.signals]
    assert "BOOKING_VELOCITY_ANOMALY" in signal_types

def test_time_anomaly():
    """Test after-hours booking detector"""
    req = AnalyzeRequest(
        shipperId="SHP-1024",
        origin="Chennai",
        destination="Mumbai",
        weight=8.0,
        declaredValue=35000,
        serviceType="Standard",
        bookingHour=2, # 2 AM outside 8-21 window
        paymentMethod="Credit Card (xxxx-4921)"
    )
    res = calculate_risk(req)
    signal_types = [s.signalType for s in res.signals]
    assert "BOOKING_TIME_ANOMALY" in signal_types

def test_payment_anomaly():
    """Test unrecognized payment method detector"""
    req = AnalyzeRequest(
        shipperId="SHP-1024",
        origin="Chennai",
        destination="Mumbai",
        weight=8.0,
        declaredValue=35000,
        serviceType="Standard",
        bookingHour=14,
        paymentMethod="Crypto Wallet"
    )
    res = calculate_risk(req)
    signal_types = [s.signalType for s in res.signals]
    assert "PAYMENT_ANOMALY" in signal_types

def test_fraudulent_critical_case():
    """CASE 3 — FRAUDULENT: Expect CRITICAL / BLOCK"""
    req = AnalyzeRequest(
        shipperId="SHP-1024",
        origin="Chennai",
        destination="Dubai (UAE)",
        weight=71.0,
        declaredValue=250000,
        serviceType="Express",
        bookingHour=2,
        paymentMethod="Crypto Wallet",
        currentDailyBookings=63
    )
    res = calculate_risk(req)
    assert res.riskScore >= 81
    assert res.riskLevel == "CRITICAL"
    assert res.decision == "BLOCK"

def test_score_boundary_clamping():
    """Verify score is bounded between 0 and 100"""
    req = AnalyzeRequest(
        shipperId="SHP-1024",
        origin="Chennai",
        destination="Dubai",
        weight=200.0,
        declaredValue=1000000,
        serviceType="Express",
        bookingHour=3,
        paymentMethod="Unknown offshore card",
        currentDailyBookings=100
    )
    res = calculate_risk(req)
    assert 0 <= res.riskScore <= 100
