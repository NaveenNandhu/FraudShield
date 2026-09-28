import pandas as pd
from typing import Dict
from .config import CSV_FILE_PATH
from .models import ShipperHistoryModel

class HistoricalDataReader:
    def __init__(self, csv_path=CSV_FILE_PATH):
        self.csv_path = csv_path
        self._history_cache: Dict[str, ShipperHistoryModel] = {}
        self.reload_data()

    def reload_data(self):
        self._history_cache = {}
        if not self.csv_path.exists():
            return

        df = pd.read_csv(self.csv_path)
        for _, row in df.iterrows():
            shipper_id = str(row['shipperId']).strip()
            
            # Parse comma-separated lists
            destinations = [d.strip() for d in str(row['commonDestinations']).split(',') if d.strip()]
            payments = [p.strip() for p in str(row['knownPaymentMethods']).split(',') if p.strip()]

            profile = ShipperHistoryModel(
                shipperId=shipper_id,
                shipperName=str(row['shipperName']),
                averageWeight=float(row['averageWeight']),
                averageDailyBookings=int(row['averageDailyBookings']),
                commonDestinations=destinations,
                normalBookingHourStart=int(row['normalBookingHourStart']),
                normalBookingHourEnd=int(row['normalBookingHourEnd']),
                commonServiceType=str(row['commonServiceType']),
                averageDeclaredValue=float(row['averageDeclaredValue']),
                accountAgeDays=int(row['accountAgeDays']),
                knownPaymentMethods=payments
            )
            self._history_cache[shipper_id] = profile

    def get_shipper_history(self, shipper_id: str) -> ShipperHistoryModel:
        clean_id = shipper_id.strip()
        if clean_id in self._history_cache:
            return self._history_cache[clean_id]

        # Default baseline for new/unknown shippers
        return ShipperHistoryModel(
            shipperId=clean_id,
            shipperName="Standard Shipper Account",
            averageWeight=10.0,
            averageDailyBookings=10,
            commonDestinations=["Chennai", "Mumbai", "Bangalore", "Delhi"],
            normalBookingHourStart=8,
            normalBookingHourEnd=20,
            commonServiceType="Standard",
            averageDeclaredValue=35000.0,
            accountAgeDays=90,
            knownPaymentMethods=["Credit Card", "UPI", "Net Banking"]
        )

historical_data_service = HistoricalDataReader()
