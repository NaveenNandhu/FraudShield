from typing import Optional, List
from .models import AnalyzeRequest, ShipperHistoryModel, RiskSignal

def evaluate_weight_anomaly(request: AnalyzeRequest, history: ShipperHistoryModel) -> Optional[RiskSignal]:
    """
    Max contribution: 25 points
    Evaluates weight ratio against 30-day baseline average.
    """
    avg_weight = history.averageWeight
    current_weight = request.weight

    if avg_weight <= 0:
        return None

    ratio = current_weight / avg_weight

    if ratio >= 8.0:
        return RiskSignal(
            signalType="WEIGHT_ANOMALY",
            severity="CRITICAL",
            scoreContribution=25,
            title="Extreme Package Weight Anomaly",
            description=f"Current shipment weight ({current_weight} kg) is {ratio:.1f}x higher than shipper's 30-day average.",
            baseline=f"{avg_weight} kg average",
            current=f"{current_weight} kg ({ratio:.1f}x baseline)"
        )
    elif ratio >= 4.0:
        return RiskSignal(
            signalType="WEIGHT_ANOMALY",
            severity="HIGH",
            scoreContribution=20,
            title="Unusual Shipment Weight Deviation",
            description=f"Current shipment weight ({current_weight} kg) is {ratio:.1f}x higher than shipper baseline.",
            baseline=f"{avg_weight} kg average",
            current=f"{current_weight} kg ({ratio:.1f}x baseline)"
        )
    elif ratio >= 2.5:
        return RiskSignal(
            signalType="WEIGHT_ANOMALY",
            severity="MEDIUM",
            scoreContribution=12,
            title="Moderate Weight Deviation",
            description=f"Current shipment weight ({current_weight} kg) is {ratio:.1f}x higher than average.",
            baseline=f"{avg_weight} kg average",
            current=f"{current_weight} kg"
        )
    
    return None


def evaluate_destination_anomaly(request: AnalyzeRequest, history: ShipperHistoryModel) -> Optional[RiskSignal]:
    """
    Max contribution: 20 points
    Evaluates whether destination is in common verified routes.
    """
    current_dest = request.destination.strip().lower()
    known_dests = [d.strip().lower() for d in history.commonDestinations]

    # Check if current destination matches any known destination
    is_known = any(known in current_dest or current_dest in known for known in known_dests)

    if not is_known:
        # Check if overseas/international destination
        is_international = any(country in current_dest for country in ['dubai', 'uae', 'london', 'uk', 'singapore', 'usa', 'heathrow'])
        
        score = 20 if is_international else 15
        severity = "HIGH" if is_international else "MEDIUM"
        
        return RiskSignal(
            signalType="DESTINATION_ANOMALY",
            severity=severity,
            scoreContribution=score,
            title="Unverified Destination Corridor",
            description=f"Destination '{request.destination}' is not present in shipper's historical route profile.",
            baseline=", ".join(history.commonDestinations),
            current=request.destination
        )
    
    return None


def evaluate_velocity_anomaly(request: AnalyzeRequest, history: ShipperHistoryModel) -> Optional[RiskSignal]:
    """
    Max contribution: 20 points
    Evaluates daily booking count velocity spike.
    """
    avg_daily = history.averageDailyBookings
    current_daily = request.currentDailyBookings or 1

    if avg_daily <= 0:
        return None

    ratio = current_daily / avg_daily

    if ratio >= 4.0:
        return RiskSignal(
            signalType="BOOKING_VELOCITY_ANOMALY",
            severity="HIGH",
            scoreContribution=20,
            title="Extreme Booking Velocity Spike",
            description=f"Daily booking frequency ({current_daily} today) is {ratio:.1f}x higher than baseline daily volume.",
            baseline=f"{avg_daily} bookings/day avg",
            current=f"{current_daily} bookings today (+{int((ratio-1)*100)}%)"
        )
    elif ratio >= 2.0:
        return RiskSignal(
            signalType="BOOKING_VELOCITY_ANOMALY",
            severity="MEDIUM",
            scoreContribution=12,
            title="Elevated Booking Frequency",
            description=f"Daily booking count ({current_daily}) exceeds standard account baseline.",
            baseline=f"{avg_daily} bookings/day avg",
            current=f"{current_daily} bookings today"
        )

    return None


def evaluate_time_anomaly(request: AnalyzeRequest, history: ShipperHistoryModel) -> Optional[RiskSignal]:
    """
    Max contribution: 10 points
    Evaluates booking hour against shipper's normal operational window.
    """
    hour = request.bookingHour
    start_h = history.normalBookingHourStart
    end_h = history.normalBookingHourEnd

    is_after_hours = False
    if start_h <= end_h:
        is_after_hours = hour < start_h or hour > end_h
    else: # Overnight window
        is_after_hours = hour > end_h and hour < start_h

    if is_after_hours:
        return RiskSignal(
            signalType="BOOKING_TIME_ANOMALY",
            severity="MEDIUM",
            scoreContribution=10,
            title="After-Hours Booking Time Anomaly",
            description=f"Booking submitted at {hour:02d}:00, outside shipper's normal operating window ({start_h:02d}:00 - {end_h:02d}:00).",
            baseline=f"{start_h:02d}:00 - {end_h:02d}:00 window",
            current=f"{hour:02d}:00 booking time"
        )

    return None


def evaluate_service_anomaly(request: AnalyzeRequest, history: ShipperHistoryModel) -> Optional[RiskSignal]:
    """
    Max contribution: 10 points
    Evaluates requested service tier against historical standard.
    """
    req_service = request.serviceType.strip().lower()
    common_service = history.commonServiceType.strip().lower()

    if common_service == "standard" and ("express" in req_service or "same" in req_service):
        return RiskSignal(
            signalType="SERVICE_ANOMALY",
            severity="MEDIUM",
            scoreContribution=10,
            title="Unusual Service Tier Escalation",
            description=f"Requested '{request.serviceType}' tier differs from shipper's baseline '{history.commonServiceType}' service.",
            baseline=f"{history.commonServiceType} tier",
            current=f"{request.serviceType} tier"
        )

    return None


def evaluate_value_anomaly(request: AnalyzeRequest, history: ShipperHistoryModel) -> Optional[RiskSignal]:
    """
    Max contribution: 10 points
    Evaluates declared monetary value ratio against baseline average.
    """
    avg_val = history.averageDeclaredValue
    curr_val = request.declaredValue

    if avg_val <= 0:
        return None

    ratio = curr_val / avg_val

    if ratio >= 5.0:
        return RiskSignal(
            signalType="DECLARED_VALUE_ANOMALY",
            severity="HIGH",
            scoreContribution=10,
            title="High Monetary Exposure Spike",
            description=f"Declared shipment value (₹{curr_val:,.0f}) is {ratio:.1f}x higher than account average.",
            baseline=f"₹{avg_val:,.0f} avg",
            current=f"₹{curr_val:,.0f} ({ratio:.1f}x baseline)"
        )
    elif ratio >= 2.5:
        return RiskSignal(
            signalType="DECLARED_VALUE_ANOMALY",
            severity="MEDIUM",
            scoreContribution=6,
            title="Elevated Declared Value",
            description=f"Declared value (₹{curr_val:,.0f}) is higher than baseline parcel average.",
            baseline=f"₹{avg_val:,.0f} avg",
            current=f"₹{curr_val:,.0f}"
        )

    return None


def evaluate_payment_anomaly(request: AnalyzeRequest, history: ShipperHistoryModel) -> Optional[RiskSignal]:
    """
    Max contribution: 5 points
    Evaluates payment instrument against known account payment methods.
    """
    curr_pay = request.paymentMethod.strip().lower()
    known_pays = [p.strip().lower() for p in history.knownPaymentMethods]

    is_known = any(known in curr_pay or curr_pay in known for known in known_pays)

    if not is_known:
        return RiskSignal(
            signalType="PAYMENT_ANOMALY",
            severity="MEDIUM",
            scoreContribution=5,
            title="Unrecognized Payment Method",
            description=f"Payment instrument '{request.paymentMethod}' is not present in shipper's 30-day billing record.",
            baseline=", ".join(history.knownPaymentMethods),
            current=request.paymentMethod
        )

    return None


from app.ml.predictor import ml_predictor

def evaluate_all_rules(request: AnalyzeRequest, history: ShipperHistoryModel) -> List[RiskSignal]:
    """
    Evaluates all rule detectors and Phase 2 ML anomaly predictor, returning array of triggered signals.
    """
    evaluators = [
        evaluate_weight_anomaly,
        evaluate_destination_anomaly,
        evaluate_velocity_anomaly,
        evaluate_time_anomaly,
        evaluate_service_anomaly,
        evaluate_value_anomaly,
        evaluate_payment_anomaly
    ]

    triggered: List[RiskSignal] = []
    for evaluator in evaluators:
        signal = evaluator(request, history)
        if signal is not None:
            triggered.append(signal)

    # Phase 2 ML Anomaly Predictor
    ml_signal = ml_predictor.evaluate_ml_anomaly(request, history)
    if ml_signal is not None:
        triggered.append(ml_signal)

    return triggered

