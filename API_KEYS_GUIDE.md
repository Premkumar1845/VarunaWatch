# 🌊 VarunaWatch — External APIs & Services Configuration Guide

This guide provides step-by-step instructions for acquiring and configuring all external API keys and services required for **VarunaWatch** (Production & Demo modes).

---

## 🔑 Summary of External Services

| Service | Category | Required for Hackathon? | Free Tier Limits |
| :--- | :--- | :---: | :--- |
| **Google Gemini 3.7 API** | AI Reasoning / SOP Generation | **Yes** | 15 RPM / 1M tokens/min free tier |
| **Google Earth Engine (GEE)** | Coastal Elevation DEM & SAR | Optional (Demo data included) | Free for academic/research |
| **Supabase / PostgreSQL** | PostGIS Geospatial Database | Optional (SQLite/Memory fallback) | 500 MB Free Tier + PostGIS |
| **Open-Meteo Marine / Weather** | Real-time GFS/ECMWF Telemetry | Optional (Live fallback included) | 100% Free / No key needed |
| **Carto Dark Matter Tiles** | MapLibre GIS Basemap | Optional (Built-in) | 100% Free / No key needed |

---

## 1. 🤖 Google Cloud / Gemini 3.7 API

### Purpose:
Powers the **VarunaWatch Gemini Copilot**, automated Standard Operating Procedure (SOP) generation for District Collectors, hospital contingency advisory synthesis, and parametric consensus verification.

### Step-by-Step Setup:
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click **"Create API Key"**.
4. Select an existing Google Cloud project or create a new project named `VarunaWatch`.
5. Copy your generated API key.
6. Open `backend/.env` in the repository and configure:
   ```env
   GEMINI_API_KEY=AIzaSyD-Your-Actual-Gemini-Key-Here
   GEMINI_MODEL=gemini-3.7-flash
   ```

---

## 2. 🌍 Google Earth Engine (GEE)

### Purpose:
Fetches 30-meter high-resolution digital elevation models (SRTM/Copernicus DEM) to calculate flood depth against coastal storm surge vectors.

### Step-by-Step Setup:
1. Visit [Google Earth Engine Signup](https://earthengine.google.com/signup/).
2. Select **Non-Commercial / Research / Hackathon** project.
3. In [Google Cloud Console](https://console.cloud.google.com/), navigate to **IAM & Admin → Service Accounts**.
4. Create a service account named `varuna-gee-reader` and grant the role `Earth Engine Resource Viewer`.
5. Click **Keys → Add Key → Create new key (JSON)**.
6. Save the downloaded JSON key file to `backend/secrets/gee-key.json`.
7. Configure `backend/.env`:
   ```env
   GEE_PROJECT_ID=your-gcp-project-id
   GEE_SERVICE_ACCOUNT=varuna-gee-reader@your-gcp-project-id.iam.gserviceaccount.com
   GEE_PRIVATE_KEY_PATH=./secrets/gee-key.json
   ```
*(Note: If GEE credentials are not provided, VarunaWatch automatically defaults to the built-in high-precision Coastal AP bathymetry & DEM data matrix).*

---

## 3. 🗄️ Supabase / PostgreSQL PostGIS Database

### Purpose:
Provides spatial indexing (`ST_DWithin`, `ST_Intersects`) for hospitals, high-tension power lines, and evacuation route vectors.

### Step-by-Step Setup:
1. Navigate to [Supabase](https://supabase.com) and create a free account.
2. Click **"New Project"** and select Region `ap-south-1 (Mumbai)` for minimal latency in India.
3. Once the database is provisioned, go to **Database → Extensions** in the Supabase sidebar.
4. Search for `postgis` and toggle **Enable**.
5. Go to **Project Settings → Database → Connection String → URI**.
6. Copy the connection string and add it to `backend/.env`:
   ```env
   DATABASE_URL=postgresql://postgres.xxx:YOUR_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
   ```

---

## 4. 🛰️ Open-Meteo & IMD Telemetry

### Purpose:
Fetches live wind speeds, atmospheric central pressure, wave height, and astronomical tides.

### Setup:
- **No API key required!** Open-Meteo provides open REST APIs for cyclone and marine models.
- The backend automatically queries:
  ```env
  OPEN_METEO_BASE_URL=https://api.open-meteo.com/v1
  ```
- Responses are cached for 15 minutes in memory to prevent rate limits.

---

## 5. 🗺️ MapLibre GIS Basemap

### Purpose:
High-contrast tactical dark basemap for GIS visualization across Visakhapatnam, Kakinada, Amalapuram, and Machilipatnam.

### Configuration in `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_MAP_TILE_URL=https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png
```

---

## 🚀 Running the Platform

### Backend:
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend:
```bash
cd frontend
npm install
npm run dev
```

Visit: **http://localhost:3000**
