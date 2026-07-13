# Quick Setup Guide

## Backend Setup (Python)

1. Open a terminal in `ai-traffic-analysis/backend`
2. Run the startup script:
   ```cmd
   start.bat
   ```
   
   This will:
   - Install all Python dependencies (takes 2-3 minutes)
   - Start the FastAPI server on http://localhost:8000

## Frontend Setup (React)

**Note: Node.js is not installed on your system.**

To install Node.js:
1. Download from https://nodejs.org/ (LTS version recommended)
2. Run the installer
3. Restart your terminal

Once Node.js is installed:
1. Open a NEW terminal in `ai-traffic-analysis/frontend`
2. Run:
   ```cmd
   npm install
   npm run dev
   ```
3. Open http://localhost:3000

## Testing the Backend Only

You can test the backend API without the frontend:

1. Start the backend (see above)
2. Open http://localhost:8000/docs in your browser
3. You'll see the interactive API documentation (Swagger UI)
4. Click "Try it out" on `/api/upload` to test file uploads

## Project Structure

```
ai-traffic-analysis/
├── backend/          # FastAPI + YOLOv8 detection
│   ├── main.py      # Server entry point
│   ├── ml/          # AI detection logic
│   ├── routes/      # API endpoints
│   └── database/    # SQLite database
└── frontend/        # React dashboard
    └── src/
        ├── pages/   # Upload, Results, Dashboard
        └── components/
```

## What the System Does

1. **Upload**: Drag & drop traffic images/videos
2. **AI Detection**: YOLOv8 detects vehicles (car, bike, bus, truck)
3. **Violation Detection**: Identifies overcrowding, congestion
4. **Dashboard**: Shows stats, charts, violation logs

## Troubleshooting

**Backend won't start?**
- Make sure you're in the `backend` folder
- Check that Python 3.10+ is installed: `python --version`

**"Module not found" errors?**
- Dependencies didn't install. Run: `venv\Scripts\pip install -r requirements.txt`

**Frontend won't start?**
- Install Node.js first (see above)
- Delete `node_modules` and run `npm install` again
