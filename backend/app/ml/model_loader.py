import json
import joblib
from pathlib import Path
from sklearn.base import BaseEstimator, TransformerMixin
from app.config import settings

class CarFeatureEngineer(BaseEstimator, TransformerMixin):
    def __init__(self, current_year=2024):
        self.current_year = current_year
    def fit(self, X, y=None): return self
    def transform(self, X):
        X_out = X.copy()
        if 'year' in X_out.columns: X_out['car_age'] = self.current_year - X_out['year']
        owner_map = {'Test Drive Car': 0, 'First Owner': 1, 'Second Owner': 2, 'Third Owner': 3, 'Fourth & Above Owner': 4}
        if 'owner' in X_out.columns:
            X_out['Owner_Count'] = X_out['owner'].map(owner_map).fillna(0)
            X_out['Is_Test_Drive'] = (X_out['owner'] == 'Test Drive Car').astype(int)
        if 'name' in X_out.columns and 'brand' not in X_out.columns:
            X_out['brand'] = X_out['name'].apply(lambda x: str(x).split()[0])
        return X_out

class ModelLoader:
    _instance = None
    _model = None
    _metadata = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
            cls._instance._load_model()
            cls._instance._load_metadata()
        return cls._instance

    def _load_model(self):
        try:
            import __main__
            __main__.CarFeatureEngineer = CarFeatureEngineer
            self._model = joblib.load(settings.MODEL_PATH)
        except Exception as e:
            print(f"Failed to load model: {e}")

    def _load_metadata(self):
        try:
            with open(settings.METADATA_PATH, 'r') as f:
                self._metadata = json.load(f)
        except Exception as e:
            print(f"Failed to load metadata: {e}")
            self._metadata = {}

    @property
    def model(self):
        return self._model

    @property
    def metadata(self):
        return self._metadata

model_loader = ModelLoader()
