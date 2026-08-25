from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes_health import router as health_router
from app.api.routes_prediction import router as prediction_router
from app.config import settings

app = FastAPI(title="Car Price Prediction API", version=settings.MODEL_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, tags=["Health"])
app.include_router(prediction_router, tags=["Prediction"])
