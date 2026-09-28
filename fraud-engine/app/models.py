from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone

class AnalyzeRequest(BaseModel):
    shipperId: str = Field(..., json_schema_extra={"example": "SHP-1024"}, description="Shipper account identifier")
    origin: str = Field(..., json_schema_extra={"example": "Chennai"}, description="Shipment origin city/facility")
    destination: str = Field(..., json_schema_extra={"example": "Dubai"}, description="Shipment destination city/country")
    weight: float = Field(..., gt=0, json_schema_extra={"example": 71.0}, description="Package weight in kilograms")
    declaredValue: float = Field(..., ge=0, json_schema_extra={"example": 250000.0}, description="Declared monetary value in INR")
    serviceType: str = Field(..., json_schema_extra={"example": "Express"}, description="Service tier (Standard, Express, Same Day)")
    bookingHour: int = Field(..., ge=0, le=23, json_schema_extra={"example": 2}, description="Hour of booking in 24-hour format (0-23)")
    paymentMethod: str = Field(..., json_schema_extra={"example": "UPI"}, description="Payment instrument used")
    currentDailyBookings: Optional[int] = Field(default=1, ge=1, description="Number of bookings initiated today by shipper")

class RiskSignal(BaseModel):
    signalType: str = Field(..., description="Anomaly code identifier")
    severity: str = Field(..., description="Severity level: LOW, MEDIUM, HIGH, CRITICAL")
    scoreContribution: int = Field(..., description="Contribution to total risk score (0-35)")
    title: str = Field(..., description="Human readable signal title")
    description: str = Field(..., description="Detailed explanation of anomaly")
    baseline: str = Field(..., description="30-day shipper historical baseline")
    current: str = Field(..., description="Current booking metric value")

class AnalyzeResponse(BaseModel):
    shipmentId: str = Field(..., description="Unique generated shipment identifier")
    shipperId: str = Field(..., description="Shipper ID evaluated")
    riskScore: int = Field(..., ge=0, le=100, description="Calculated risk score between 0 and 100")
    riskLevel: str = Field(..., description="Risk level: LOW, MEDIUM, HIGH, CRITICAL")
    decision: str = Field(..., description="Operational decision: ALLOW, VERIFY, HOLD, BLOCK")
    signals: List[RiskSignal] = Field(default_factory=list, description="List of detected adverse risk signals")
    recommendedAction: str = Field(..., description="Operational action recommendation")
    engineVersion: str = Field(default="fraud-engine-v1", description="Engine version tag")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat(), description="ISO-8601 timestamp")

class ShipperHistoryModel(BaseModel):
    shipperId: str
    shipperName: str
    averageWeight: float
    averageDailyBookings: int
    commonDestinations: List[str]
    normalBookingHourStart: int
    normalBookingHourEnd: int
    commonServiceType: str
    averageDeclaredValue: float
    accountAgeDays: int
    knownPaymentMethods: List[str]
