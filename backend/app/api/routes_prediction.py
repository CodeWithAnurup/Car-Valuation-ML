import numpy as np
import pandas as pd
from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.ml.model_loader import model_loader
from app.config import settings

router = APIRouter()

class PredictRequest(BaseModel):
    year: int
    km_driven: int
    fuel: str
    seller_type: str
    transmission: str
    owner: str
    brand: str
    name: str = ""

class PredictResponse(BaseModel):
    predicted_price: float
    predicted_price_formatted: str
    confidence_note: str
    ood_warnings: List[str]
    version: str

def format_price(price: float) -> str:
    if price >= 100000:
        return f"₹{price / 100000:.2f} Lakh"
    return f"₹{int(price):,}"

def check_ood(req: PredictRequest) -> List[str]:
    warnings = []
    if req.year < 1980 or req.year > 2025:
        warnings.append(f"Year {req.year} is unusual.")
    if req.km_driven < 0 or req.km_driven > 500000:
        warnings.append(f"km_driven {req.km_driven} is outside typical bounds.")
    return warnings

def predict_single(req: PredictRequest) -> PredictResponse:
    if not model_loader.model:
        raise HTTPException(status_code=503, detail="Model is currently unavailable")

    df = pd.DataFrame([req.model_dump()])
    
    try:
        pred_log = model_loader.model.predict(df)[0]
        actual_price = float(np.expm1(pred_log))
        
        warnings = check_ood(req)
        
        return PredictResponse(
            predicted_price=actual_price,
            predicted_price_formatted=format_price(actual_price),
            confidence_note="High" if not warnings else "Low (OOD)",
            ood_warnings=warnings,
            version=settings.MODEL_VERSION
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error during prediction")

@router.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    return predict_single(request)

@router.post("/scenario", response_model=List[PredictResponse])
def scenario(requests: List[PredictRequest]):
    return [predict_single(req) for req in requests]

@router.get("/model-info")
def get_model_info():
    if not model_loader.metadata:
        raise HTTPException(status_code=503, detail="Metadata unavailable")
    return model_loader.metadata

@router.get("/model-comparison")
def get_model_comparison():
    metadata = model_loader.metadata
    if not metadata:
        raise HTTPException(status_code=503, detail="Metadata unavailable")
    
    cv_results = metadata.get("cv_results", {})
    test_results = metadata.get("test_results", {})
    
    models = []
    for name in cv_results.keys():
        cv = cv_results.get(name, {})
        test = test_results.get(name, {})
        models.append({
            "name": name,
            "r2": test.get("r2", 0),
            "mae": np.expm1(test.get("mae", 0)), # approximate real value mapping since they are log
            "rmse": np.expm1(test.get("rmse", 0)),
            "cv_mae_mean": np.expm1(cv.get("mae_mean", 0)),
            "cv_mae_std": np.expm1(cv.get("mae_std", 0))
        })
        
    return {"models": models}

@router.get("/data-quality")
def get_data_quality():
    metadata = model_loader.metadata
    if not metadata:
        raise HTTPException(status_code=503, detail="Metadata unavailable")
    return metadata.get("data_quality", {})
