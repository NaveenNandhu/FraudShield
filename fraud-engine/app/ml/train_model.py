import os
from pathlib import Path
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.preprocessing import StandardScaler

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_DIR = BASE_DIR / "data" / "models"

def generate_synthetic_dataset(num_samples: int = 2500, random_seed: int = 42) -> pd.DataFrame:
    """
    Generates realistic synthetic shipping data for training ML fraud models.
    """
    np.random.seed(random_seed)
    
    # 75% Legitimate, 15% Suspicious, 10% Fraudulent
    n_legit = int(num_samples * 0.75)
    n_susp = int(num_samples * 0.15)
    n_fraud = num_samples - n_legit - n_susp

    # 1. Legitimate samples
    w_ratio_legit = np.random.normal(loc=1.1, scale=0.3, size=n_legit).clip(0.3, 2.2)
    val_ratio_legit = np.random.normal(loc=1.1, scale=0.3, size=n_legit).clip(0.3, 2.2)
    vel_ratio_legit = np.random.normal(loc=1.0, scale=0.2, size=n_legit).clip(0.5, 1.8)
    after_hours_legit = np.random.choice([0.0, 1.0], size=n_legit, p=[0.95, 0.05])
    unusual_dest_legit = np.random.choice([0.0, 1.0], size=n_legit, p=[0.92, 0.08])
    service_esc_legit = np.random.choice([0.0, 1.0], size=n_legit, p=[0.90, 0.10])
    unusual_pay_legit = np.random.choice([0.0, 1.0], size=n_legit, p=[0.96, 0.04])
    age_legit = np.random.uniform(90, 1000, size=n_legit)
    raw_w_legit = np.random.uniform(2.0, 25.0, size=n_legit)
    raw_val_legit = np.random.uniform(5000.0, 60000.0, size=n_legit)
    hour_legit = np.random.choice(range(8, 20), size=n_legit)
    label_legit = np.zeros(n_legit)

    # 2. Suspicious samples
    w_ratio_susp = np.random.normal(loc=3.2, scale=0.8, size=n_susp).clip(2.3, 5.0)
    val_ratio_susp = np.random.normal(loc=3.0, scale=0.8, size=n_susp).clip(2.2, 4.8)
    vel_ratio_susp = np.random.normal(loc=2.5, scale=0.5, size=n_susp).clip(1.8, 3.8)
    after_hours_susp = np.random.choice([0.0, 1.0], size=n_susp, p=[0.60, 0.40])
    unusual_dest_susp = np.random.choice([0.0, 1.0], size=n_susp, p=[0.40, 0.60])
    service_esc_susp = np.random.choice([0.0, 1.0], size=n_susp, p=[0.50, 0.50])
    unusual_pay_susp = np.random.choice([0.0, 1.0], size=n_susp, p=[0.70, 0.30])
    age_susp = np.random.uniform(30, 300, size=n_susp)
    raw_w_susp = np.random.uniform(25.0, 50.0, size=n_susp)
    raw_val_susp = np.random.uniform(60000.0, 150000.0, size=n_susp)
    hour_susp = np.random.choice(range(0, 24), size=n_susp)
    label_susp = np.ones(n_susp)

    # 3. Fraudulent samples
    w_ratio_fraud = np.random.normal(loc=8.5, scale=2.0, size=n_fraud).clip(5.0, 15.0)
    val_ratio_fraud = np.random.normal(loc=7.5, scale=2.0, size=n_fraud).clip(4.5, 12.0)
    vel_ratio_fraud = np.random.normal(loc=5.5, scale=1.5, size=n_fraud).clip(3.5, 10.0)
    after_hours_fraud = np.random.choice([0.0, 1.0], size=n_fraud, p=[0.15, 0.85])
    unusual_dest_fraud = np.random.choice([0.0, 1.0], size=n_fraud, p=[0.10, 0.90])
    service_esc_fraud = np.random.choice([0.0, 1.0], size=n_fraud, p=[0.10, 0.90])
    unusual_pay_fraud = np.random.choice([0.0, 1.0], size=n_fraud, p=[0.30, 0.70])
    age_fraud = np.random.uniform(1, 60, size=n_fraud)
    raw_w_fraud = np.random.uniform(50.0, 120.0, size=n_fraud)
    raw_val_fraud = np.random.uniform(150000.0, 500000.0, size=n_fraud)
    hour_fraud = np.random.choice([0, 1, 2, 3, 4, 22, 23], size=n_fraud)
    label_fraud = np.ones(n_fraud)

    # Concatenate all sets
    data = {
        "weight_ratio": np.concatenate([w_ratio_legit, w_ratio_susp, w_ratio_fraud]),
        "value_ratio": np.concatenate([val_ratio_legit, val_ratio_susp, val_ratio_fraud]),
        "velocity_ratio": np.concatenate([vel_ratio_legit, vel_ratio_susp, vel_ratio_fraud]),
        "is_after_hours": np.concatenate([after_hours_legit, after_hours_susp, after_hours_fraud]),
        "is_unusual_dest": np.concatenate([unusual_dest_legit, unusual_dest_susp, unusual_dest_fraud]),
        "is_service_escalated": np.concatenate([service_esc_legit, service_esc_susp, service_esc_fraud]),
        "is_unusual_payment": np.concatenate([unusual_pay_legit, unusual_pay_susp, unusual_pay_fraud]),
        "account_age_days": np.concatenate([age_legit, age_susp, age_fraud]),
        "raw_weight": np.concatenate([raw_w_legit, raw_w_susp, raw_w_fraud]),
        "raw_declared_value": np.concatenate([raw_val_legit, raw_val_susp, raw_val_fraud]),
        "raw_booking_hour": np.concatenate([hour_legit, hour_susp, hour_fraud]),
        "is_fraud": np.concatenate([label_legit, label_susp, label_fraud])
    }

    return pd.DataFrame(data)


def train_and_save_models():
    """
    Trains RandomForest and IsolationForest models and saves pipeline artifacts.
    """
    os.makedirs(MODEL_DIR, exist_ok=True)
    df = generate_synthetic_dataset()

    feature_cols = [c for c in df.columns if c != "is_fraud"]
    X = df[feature_cols].values
    y = df["is_fraud"].values

    # Scaler
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # 1. Supervised Random Forest Classifier
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10)
    rf_model.fit(X_scaled, y)

    # 2. Unsupervised Isolation Forest Anomaly Detector
    iso_model = IsolationForest(n_estimators=100, contamination=0.15, random_state=42)
    iso_model.fit(X_scaled)

    # Save artifacts
    joblib.dump(scaler, MODEL_DIR / "scaler.joblib")
    joblib.dump(rf_model, MODEL_DIR / "rf_model.joblib")
    joblib.dump(iso_model, MODEL_DIR / "iso_model.joblib")

    print(f"ML Models successfully trained & saved to {MODEL_DIR}")
    return rf_model, iso_model, scaler

if __name__ == "__main__":
    train_and_save_models()
