@echo off
echo Installing dependencies...
venv\Scripts\pip install -r requirements.txt --quiet

echo.
echo Starting FastAPI server...
venv\Scripts\uvicorn main:app --reload --host 0.0.0.0 --port 8000
