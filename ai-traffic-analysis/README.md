# AI-Based Traffic Analysis System

Detects vehicles, classifies types, counts them, and identifies traffic violations from images and videos using YOLOv8 + FastAPI + React.

---

## Project Structure

```
ai-traffic-analysis/
├── backend/
│   ├── main.py               # FastAPI app entry point
│   ├── requirements.txt
│   ├── .env.example
│   ├── database/
│   │   └── db.py             # SQLAlchemy models + DB init
│   ├── ml/
│   │   └── detector.py       # YOLOv8 detection + violation logic
│   └── routes/
│       └── upload.py         # REST API endpoints
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── services/api.js
        ├── components/
        │   ├── Navbar.jsx
        │   ├── StatCard.jsx
        │   ├── DensityBadge.jsx
        │   ├── VehicleChart.jsx
        │   └── ViolationList.jsx
        └── pages/
            ├── Dashboard.jsx
            ├── Upload.jsx
            ├── Results.jsx
            └── ResultDetail.jsx
```

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL running locally (or update DATABASE_URL to use SQLite for quick testing)

---

## Backend Setup

```bash
cd ai-traffic-analysis/backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your DATABASE_URL

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The YOLOv8 model (`yolov8n.pt`) downloads automatically on first run (~6MB).

### Quick SQLite alternative (no PostgreSQL needed)

In `.env`, set:
```
DATABASE_URL=sqlite:///./traffic.db
```
And in `database/db.py`, replace `psycopg2-binary` usage — SQLAlchemy handles SQLite natively.

---

## Frontend Setup

```bash
cd ai-traffic-analysis/frontend

npm install
npm run dev
```

Open http://localhost:3000

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload image/video, run detection |
| GET | `/api/results` | List all past results |
| GET | `/api/results/{id}` | Get single result with violations |
| GET | `/api/media/{filename}` | Serve annotated output file |
| GET | `/api/stats` | Aggregate dashboard statistics |
| GET | `/health` | Health check |

---

## Detected Vehicle Types

- Car, Bike (motorcycle/bicycle), Bus, Truck

## Violation Detection

- Overcrowding on two-wheelers (bounding box heuristic)
- High traffic congestion (density threshold)

Extend `ml/detector.py` → `check_violations()` to add:
- Red light detection (requires traffic light class + color detection)
- Wrong lane (requires lane mask overlay)
- Helmet detection (requires a helmet-specific model or fine-tuned YOLOv8)

---

## Example Dataset

Use any traffic footage. Public datasets:
- [UA-DETRAC](https://detrac-db.rit.albany.edu/) — vehicle detection benchmark
- [VIRAT](https://viratdata.org/) — surveillance video
- [Kaggle Traffic datasets](https://www.kaggle.com/search?q=traffic+vehicle+detection)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Chart.js |
| Backend | Python, FastAPI, SQLAlchemy |
| AI/ML | YOLOv8 (Ultralytics), OpenCV |
| Database | PostgreSQL (or SQLite) |
