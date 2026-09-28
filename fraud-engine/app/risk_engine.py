import random
from datetime import datetime, timezone
from .models import AnalyzeRequest, AnalyzeResponse
from .historical_data import historical_data_service
from .rules import evaluate_all_rules
from .config import settings

def calculate_risk(request: AnalyzeRequest) -> AnalyzeResponse:
    """
    Main deterministic risk calculation pipeline.
    1. Fetch historical baseline profile for shipperId.
    2. Evaluate all 7 rule detectors.
    3. Aggregate signal contribution points (0 - 100).
    4. Map score to risk level and decision.
    5. Return structured response.
    """
    history = historical_data_service.get_shipper_history(request.shipperId)
    signals = evaluate_all_rules(request, history)

    # Calculate total score
    raw_score = sum(signal.scoreContribution for signal in signals)
    score = min(max(raw_score, 0), 100)

    # Determine Risk Level based on configured thresholds
    if score <= settings.low_max:
        risk_level = "LOW"
        decision = "ALLOW"
        recommended_action = "Allow shipment to enter regular sorting and network transit workflow."
    elif score <= settings.medium_max:
        risk_level = "MEDIUM"
        decision = "VERIFY"
        recommended_action = "Request routine shipper verification or review booking details."
    elif score <= settings.high_max:
        risk_level = "HIGH"
        decision = "HOLD"
        recommended_action = "Hold shipment at origin facility and request additional OTP/document verification."
    else:
        risk_level = "CRITICAL"
        decision = "BLOCK"
        recommended_action = "Block shipment immediately, freeze booking pipeline, and initiate fraud analyst investigation."

    # Generate unique shipment ID
    shipment_id = f"FS-{random.randint(10000, 99999)}"

    return AnalyzeResponse(
        shipmentId=shipment_id,
        shipperId=request.shipperId,
        riskScore=score,
        riskLevel=risk_level,
        decision=decision,
        signals=signals,
        recommendedAction=recommended_action,
        engineVersion=settings.engine_version,
        timestamp=datetime.now(timezone.utc).isoformat()
    )
