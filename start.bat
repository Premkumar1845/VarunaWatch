@echo off
echo ========================================================
echo Starting VarunaWatch Full Stack Local Servers
echo ========================================================
start "VarunaWatch Backend (FastAPI)" cmd /k ".\venv\Scripts\python -m uvicorn main:app --reload --port 8000 --app-dir backend"
start "VarunaWatch Frontend (Next.js)" cmd /k "npm --prefix frontend run dev"
echo.
echo [VarunaWatch] Backend starting at http://localhost:8000/docs
echo [VarunaWatch] Frontend starting at http://localhost:3000
echo.
