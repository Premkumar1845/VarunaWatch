# VarunaWatch PowerShell Launcher
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting VarunaWatch (Backend + Frontend)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\venv\Scripts\python -m uvicorn main:app --reload --port 8000 --app-dir backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm --prefix frontend run dev"

Write-Host ""
Write-Host "[VarunaWatch] Backend:  http://localhost:8000/docs" -ForegroundColor Green
Write-Host "[VarunaWatch] Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host ""
