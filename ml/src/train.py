import os
import json
import warnings
from datetime import datetime
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import KFold, cross_validate, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler, OrdinalEncoder
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

warnings.filterwarnings('ignore')

# Custom Transformer for Car Feature Engineering
class CarFeatureEngineer(BaseEstimator, TransformerMixin):
    def __init__(self, current_year=2024):
        self.current_year = current_year

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X_out = X.copy()
        # Calculate car age
        if 'year' in X_out.columns:
            X_out['car_age'] = self.current_year - X_out['year']
        
        # Owner count logic
        owner_map = {
            'Test Drive Car': 0,
            'First Owner': 1,
            'Second Owner': 2,
            'Third Owner': 3,
            'Fourth & Above Owner': 4
        }
        if 'owner' in X_out.columns:
            X_out['Owner_Count'] = X_out['owner'].map(owner_map).fillna(0)
            X_out['Is_Test_Drive'] = (X_out['owner'] == 'Test Drive Car').astype(int)
            
        # Ensure brand exists (if 'name' is provided instead of brand)
        if 'name' in X_out.columns and 'brand' not in X_out.columns:
            X_out['brand'] = X_out['name'].apply(lambda x: str(x).split()[0])
            
        return X_out

def build_pipeline(model):
    # Features required from raw input
    # year, km_driven, fuel, seller_type, transmission, owner, brand
    
    # Feature engineering step
    feature_engineer = CarFeatureEngineer(current_year=2024) # Hardcoding 2024 to match original notebook's context
    
    # Column transformations after engineering
    numeric_features = ['km_driven', 'car_age', 'Owner_Count', 'Is_Test_Drive']
    categorical_features = ['fuel', 'seller_type', 'transmission', 'brand']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ]
    )
    
    return Pipeline(steps=[
        ('engineer', feature_engineer),
        ('preprocessor', preprocessor),
        ('model', model)
    ])

def train():
    print("Loading data...")
    data_path = os.path.join("ml", "data", "car_dekho.csv")
    df = pd.read_csv(data_path)
    
    # Original notebook capping (approximate based on README)
    # Removing extreme outliers for better model performance
    price_cap = df['selling_price'].quantile(0.99)
    km_cap = df['km_driven'].quantile(0.99)
    df = df[(df['selling_price'] <= price_cap) & (df['km_driven'] <= km_cap)]
    df = df.drop_duplicates()
    
    # Extract brand for training set
    df['brand'] = df['name'].apply(lambda x: str(x).split()[0])
    
    # Raw features used for pipeline
    features = ['year', 'km_driven', 'fuel', 'seller_type', 'transmission', 'owner', 'brand']
    X = df[features]
    y = np.log1p(df['selling_price']) # Log transform target
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    models = {
        'Linear Regression': build_pipeline(LinearRegression()),
        'Random Forest': build_pipeline(RandomForestRegressor(n_estimators=100, random_state=42, max_depth=15, min_samples_leaf=2)),
        'XGBoost': build_pipeline(XGBRegressor(n_estimators=100, random_state=42))
    }
    
    kf = KFold(n_splits=10, shuffle=True, random_state=42)
    cv_results = {}
    test_results = {}
    
    print("Starting cross-validation (this may take a minute)...")
    for name, model in models.items():
        print(f"Training {name}...")
        # Cross validation
        cv = cross_validate(model, X_train, y_train, cv=kf,
                          scoring=('neg_mean_absolute_error', 'neg_root_mean_squared_error', 'r2'),
                          return_train_score=False, n_jobs=-1)
        
        cv_results[name] = {
            'mae_mean': float(-cv['test_neg_mean_absolute_error'].mean()),
            'mae_std': float(cv['test_neg_mean_absolute_error'].std()),
            'rmse_mean': float(-cv['test_neg_root_mean_squared_error'].mean()),
            'rmse_std': float(cv['test_neg_root_mean_squared_error'].std()),
            'r2_mean': float(cv['test_r2'].mean()),
            'r2_std': float(cv['test_r2'].std())
        }
        
        # Train on full training set and evaluate on test set
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        
        test_results[name] = {
            'mae': float(mean_absolute_error(y_test, y_pred)),
            'rmse': float(mean_squared_error(y_test, y_pred) ** 0.5),
            'r2': float(r2_score(y_test, y_pred))
        }
        print(f"  {name} Test R2: {test_results[name]['r2']:.4f}")

    # Best model is XGBoost based on notebook and R2
    best_model_name = 'XGBoost'
    best_model = models[best_model_name]
    
    print(f"Selected Model: {best_model_name}")
    
    # Save the model
    os.makedirs('models', exist_ok=True)
    joblib.dump(best_model, os.path.join('models', 'car_price_model_v1.joblib'))
    
    # Generate metadata
    metadata = {
        'model_name': 'xgboost_regressor',
        'display_name': 'XGBoost (Gradient Boosting)',
        'target_transform': 'log1p',
        'features': features,
        'feature_names_api': features,
        'total_rows': len(df),
        'training_rows': len(X_train),
        'version': '1.0.0',
        'training_ranges': {
            'year': {'min': int(X_train['year'].min()), 'max': int(X_train['year'].max())},
            'km_driven': {'min': int(X_train['km_driven'].min()), 'max': int(X_train['km_driven'].max())},
        },
        'options': {
            'fuel': sorted(df['fuel'].unique().tolist()),
            'transmission': sorted(df['transmission'].unique().tolist()),
            'seller_type': sorted(df['seller_type'].unique().tolist()),
            'owner': ['First Owner', 'Second Owner', 'Third Owner', 'Fourth & Above Owner', 'Test Drive Car'],
            'brand': sorted(df['brand'].unique().tolist())
        },
        'cv_results': cv_results,
        'test_results': test_results,
        'selected_model': best_model_name,
        'trained_at': datetime.now().isoformat(),
        'data_quality': {
            'rows': len(df),
            'columns': df.shape[1],
            'missing_values': int(df.isnull().sum().sum()),
            'duplicates': 0, # removed earlier
            'feature_stats': {
                'selling_price': {
                    'min': float(df['selling_price'].min()),
                    'max': float(df['selling_price'].max()),
                    'mean': float(df['selling_price'].mean()),
                    'std': float(df['selling_price'].std()),
                    'median': float(df['selling_price'].median())
                },
                'km_driven': {
                    'min': float(df['km_driven'].min()),
                    'max': float(df['km_driven'].max()),
                    'mean': float(df['km_driven'].mean()),
                    'std': float(df['km_driven'].std()),
                    'median': float(df['km_driven'].median())
                },
                'year': {
                    'min': int(df['year'].min()),
                    'max': int(df['year'].max()),
                    'mean': float(df['year'].mean()),
                    'std': float(df['year'].std()),
                    'median': float(df['year'].median())
                }
            }
        }
    }
    
    with open(os.path.join('models', 'metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=2)
        
    print("Training complete. Model and metadata saved to models/")

if __name__ == "__main__":
    train()
