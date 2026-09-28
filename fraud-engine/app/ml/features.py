import numpy as np
import pandas as pd
from typing import List, Dict, Any
from app.models import AnalyzeRequest, ShipperHistoryModel

FEATURE_NAMES = [
    "weight_ratio",
    "value_ratio",
    "velocity_ratio",
    "is_after_hours",
    "is_unusual_dest",
    "is_service_escalated",
    "is_unusual_payment",
    "account_age_days",
    "raw_weight",
    "raw_declared_value",
    "raw_booking_hour"
]

def extract_features(request: AnalyzeRequest, history: ShipperHistoryModel) -> np.ndarray:
    """
    Extracts normalized numerical and categorical features for ML model input.
    Preserves exact API schema fields without modifying any model field names.
    """
    avg_w = history.averageWeight if history.averageWeight > 0 else 10.0
    weight_ratio = request.weight / avg_w

    avg_v = history.averageDeclaredValue if history.averageDeclaredValue > 0 else 50000.0
    value_ratio = request.declaredValue / avg_v

    avg_vel = history.averageDailyBookings if history.averageDailyBookings > 0 else 10
    current_vel = request.currentDailyBookings or 1
    velocity_ratio = current_vel / avg_vel

    # Check operational hours
    h = request.bookingHour
    start_h = history.normalBookingHourStart
    end_h = history.normalBookingHourEnd
    if start_h <= end_h:
        is_after_hours = 1.0 if (h < start_h or h > end_h) else 0.0
    else:
        is_after_hours = 1.0 if (h > end_h and h < start_h) else 0.0

    # Destination anomaly
    curr_dest = request.destination.strip().lower()
    known_dests = [d.strip().lower() for d in history.commonDestinations]
    is_unusual_dest = 0.0 if any(known in curr_dest or curr_dest in known for known in known_dests) else 1.0

    # Service tier escalation
    req_svc = request.serviceType.strip().lower()
    common_svc = history.commonServiceType.strip().lower()
    is_service_escalated = 1.0 if (common_svc == "standard" and ("express" in req_svc or "same" in req_svc)) else 0.0

    # Payment anomaly
    curr_pay = request.paymentMethod.strip().lower()
    known_pays = [p.strip().lower() for p in history.knownPaymentMethods]
    is_unusual_payment = 0.0 if any(known in curr_pay or curr_pay in known for known in known_pays) else 1.0

    features = [
        weight_ratio,
        value_ratio,
        velocity_ratio,
        is_after_hours,
        is_unusual_dest,
        is_service_escalated,
        is_unusual_payment,
        float(history.accountAgeDays),
        float(request.weight),
        float(request.declaredValue),
        float(request.bookingHour)
    ]

    return np.array([features], dtype=np.float64)
