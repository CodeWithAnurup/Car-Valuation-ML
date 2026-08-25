import os
import json
import numpy as np
import pandas as pd
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.base import BaseEstimator, TransformerMixin

class CarFeatureEngineer(BaseEstimator, TransformerMixin):
    def __init__(self, current_year=2024):
        self.current_year = current_year

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X_out = X.copy()
        if 'year' in X_out.columns:
            X_out['car_age'] = self.current_year - X_out['year']
        owner_map = {
            'Test Drive Car': 0, 'First Owner': 1, 'Second Owner': 2,
            'Third Owner': 3, 'Fourth & Above Owner': 4
        }
        if 'owner' in X_out.columns:
            X_out['Owner_Count'] = X_out['owner'].map(owner_map).fillna(0)
            X_out['Is_Test_Drive'] = (X_out['owner'] == 'Test Drive Car').astype(int)
        if 'name' in X_out.columns and 'brand' not in X_out.columns:
            X_out['brand'] = X_out['name'].apply(lambda x: str(x).split()[0])
        return X_out

def evaluate():
    print("Loading data and model...")
    data_path = os.path.join("ml", "data", "car_dekho.csv")
    df = pd.read_csv(data_path)
    
    # Apply same filtering as train.py
    price_cap = df['selling_price'].quantile(0.99)
    km_cap = df['km_driven'].quantile(0.99)
    df = df[(df['selling_price'] <= price_cap) & (df['km_driven'] <= km_cap)]
    df = df.drop_duplicates()
    
    # Extract brand for evaluation set
    df['brand'] = df['name'].apply(lambda x: str(x).split()[0])
    
    features = ['year', 'km_driven', 'fuel', 'seller_type', 'transmission', 'owner', 'brand']
    X = df[features]
    y = np.log1p(df['selling_price'])
    
    _, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = joblib.load(os.path.join('models', 'car_price_model_v1.joblib'))
    
    print("Generating predictions...")
    y_pred = model.predict(X_test)
    
    # Convert back from log scale for interpretable metrics
    y_test_real = np.expm1(y_test)
    y_pred_real = np.expm1(y_pred)
    
    mae = mean_absolute_error(y_test_real, y_pred_real)
    rmse = mean_squared_error(y_test_real, y_pred_real) ** 0.5
    r2 = r2_score(y_test, y_pred) # Keep R2 in log space to match training metrics
    r2_real = r2_score(y_test_real, y_pred_real)
    
    print(f"\nReal-world Metrics (in Rs):")
    print(f"MAE:  Rs {mae:,.2f}")
    print(f"RMSE: Rs {rmse:,.2f}")
    print(f"R2 (log space):  {r2:.4f}")
    print(f"R2 (real space): {r2_real:.4f}")
    
    # Plotting
    os.makedirs('ml/experiments', exist_ok=True)
    sns.set_theme(style="whitegrid")
    
    # 1. Actual vs Predicted (Real Prices)
    plt.figure(figsize=(10, 6))
    plt.scatter(y_test_real, y_pred_real, alpha=0.3, color='#10b981')
    
    # Perfect prediction line
    max_val = max(y_test_real.max(), y_pred_real.max())
    plt.plot([0, max_val], [0, max_val], 'r--', label='Perfect Prediction')
    
    plt.title('Actual vs Predicted Selling Price (Test Set)')
    plt.xlabel('Actual Price (Rs)')
    plt.ylabel('Predicted Price (Rs)')
    plt.legend()
    plt.tight_layout()
    plt.savefig('ml/experiments/actual_vs_predicted.png')
    
    # 2. Residuals Plot
    residuals = y_test_real - y_pred_real
    plt.figure(figsize=(10, 6))
    plt.scatter(y_pred_real, residuals, alpha=0.3, color='#f59e0b')
    plt.axhline(y=0, color='r', linestyle='--')
    plt.title('Residuals vs Predicted Price')
    plt.xlabel('Predicted Price (Rs)')
    plt.ylabel('Residual (Actual - Predicted)')
    plt.tight_layout()
    plt.savefig('ml/experiments/residuals.png')
    
    print("\nEvaluation complete. Plots saved to ml/experiments/")

if __name__ == "__main__":
    evaluate()
