from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import cyclones, infrastructure, simulation, satellite, advisories
from .services.weather import get_current

app = FastAPI(
    title="VarunaWatch API",
    description="Deterministic AI-Powered Cyclone Impact & Infrastructure Resilience Engine",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in (cyclones, infrastructure, simulation, satellite, advisories):
    app.include_router(r.router)

@app.get("/health")
async def health():
    return {
        "ok": True,
        "service": "VarunaWatch",
        "region": "Coastal Andhra Pradesh",
        "version": "1.0.0"
    }

@app.get("/weather/current")
async def live_weather(lon: float = 82.23, lat: float = 16.98):
    return await get_current(lon=lon, lat=lat)
