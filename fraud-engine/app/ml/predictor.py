import os
from pathlib import Path
from typing import Optional
import joblib
import numpy as np

from app.models import AnalyzeRequest, ShipperHistoryModel, RiskSignal
from app.ml.features import extract_features
from app.ml.train_model import train_and_save_models, MODEL_DIR

class MLPredictor:
    def __init__(self):
        self.scaler = None
        self.rf_model = None
        self.iso_model = None
        self._load_or_train_models()

    def _load_or_train_models(self):
        scaler_path = MODEL_DIR / "scaler.joblib"
        rf_path = MODEL_DIR / "rf_model.joblib"
        iso_path = MODEL_DIR / "iso_model.joblib"

        if not (scaler_path.exists() and rf_path.exists() and iso_path.exists()):
            self.rf_model, self.iso_model, self.scaler = train_and_save_models()
        else:
            self.scaler = joblib.load(scaler_path)
            self.rf_model = joblib.load(rf_path)
            self.iso_model = joblib.load(iso_path)

    def evaluate_ml_anomaly(self, request: AnalyzeRequest, history: ShipperHistoryModel) -> Optional[RiskSignal]:
        """
        Evaluates multivariate ML anomaly risk using Random Forest & Isolation Forest ensemble.
        Max contribution: 20 points.
        Preserves 100% backward compatibility of existing API schemas and request fields.
        """
        if self.rf_model is None or self.scaler is None:
            self._load_or_train_models()

        # Extract features
        X_raw = extract_features(request, history)
        X_scaled = self.scaler.transform(X_raw)

        # 1. Random Forest probability of fraud
        fraud_prob = float(self.rf_model.predict_proba(X_scaled)[0][1])

        # 2. Isolation Forest anomaly score
        iso_decision = float(self.iso_model.decision_function(X_scaled)[0])  # Negative value = anomaly

        # Determine signal contribution & severity
        if fraud_prob >= 0.80 or iso_decision < -0.10:
            contribution = 20
            severity = "CRITICAL" if fraud_prob >= 0.85 else "HIGH"
            title = "Multivariate ML Fraud Anomaly Detected"
            desc = (
                f"Scikit-Learn ML Ensemble flagged transaction as multivariate outlier "
                f"({int(fraud_prob * 100)}% fraud risk probability)."
            )
        elif fraud_prob >= 0.55 or iso_decision < -0.02:
            contribution = 12
            severity = "MEDIUM"
            title = "Elevated ML Anomaly Score"
            desc = (
                f"Statistical ML model detected moderate behavioral deviation "
                f"({int(fraud_prob * 100)}% fraud risk probability)."
            )
        else:
            return None

        return RiskSignal(
            signalType="ML_ANOMALY_DETECTION",
            severity=severity,
            scoreContribution=contribution,
            title=title,
            description=desc,
            baseline="Normal historical behavior cluster",
            current=f"ML Risk Probability: {int(fraud_prob * 100)}%"
        )

# Global singleton predictor instance
ml_predictor = MLPredictor()
