# UrbanSense AI — Mobile Urban Intelligence Platform

> **Smart India Hackathon (SIH) Prototype**  
> **Problem Statement ID:** 26124  
> **Title:** AI-Powered Mobile Urban Intelligence Platform Using Public Transport Fleet  
> **Organization:** Bharat Electronics Limited (BEL)  
> **Category:** Software | **Theme:** Smart Automation  

---

## 🚌 1. Problem & Core Vision

Public transit buses navigate every major urban corridor daily. **UrbanSense AI** transforms municipal public buses into **mobile urban sensing nodes**. 

Onboard Edge AI hardware (NVIDIA Jetson AGX/Orin ready) continuously processes multi-camera bus feeds to detect:
1. **Road Hazards:** Potholes, surface erosion, waterlogging, road obstructions.
2. **Infrastructure Deficiencies:** Missing/damaged median dividers, faded zebra crossings, bent/damaged traffic signboards.
3. **Traffic Intelligence:** Multi-class vehicle classification, congestion hotspots, route delay calculation, aggregated origin-destination flow.
4. **Safety Incidents & ANPR:** Rash driving detection, hit-and-run tracking, Automatic Number Plate Recognition (ANPR) OCR, vulnerable pedestrian alerts.

---

## 🏗️ 2. System Architecture

```text
┌─────────────────────────────┐
│      PUBLIC BUS FLEET       │
│ Front / Rear / Side Cameras │
│ GPS + Vehicle Metadata      │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│       EDGE AI DEVICE        │
│ OpenCV + PyTorch / YOLO     │
│ Object Tracking & Filtering │
│ Local Low-Connectivity Queue│
└──────────────┬──────────────┘
               │ Geo-Tagged High-Confidence JSON
               ▼
┌─────────────────────────────┐
│      SECURE API LAYER       │
│ FastAPI + PyJWT             │
│ WebSocket (/ws/fleet)       │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│       CENTRAL PLATFORM      │
│ PostgreSQL + PostGIS        │
│ Event Ingestion & Analytics │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│     COMMAND DASHBOARD       │
│ GIS Urban Map (Leaflet)     │
│ Incident & Authority System │
│ Validation Feedback Loop    │
└─────────────────────────────┘
```

---

## 🚀 3. Technology Stack

- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS v3 + Leaflet Maps + Recharts + Lucide Icons
- **Backend:** Python FastAPI + SQLAlchemy + SQLite / PostgreSQL (PostGIS) + PyJWT + WebSockets
- **AI / Vision Subsystem:** OpenCV + PyTorch / YOLO Architecture with modular fallback for instant laptop demo execution
- **Edge Simulator:** Real-time bus telemetry, multi-camera FPS simulation, offline low-connectivity event queueing
- **Containerization:** Docker & Docker Compose

---

## 💻 4. Running the Application Locally

### Prerequisites
- Python 3.10+
- Node.js v18+

### Step 1: Start Backend API & Simulation Server
```bash
cd backend
python -m venv venv

# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*API Swagger Docs available at:* `http://localhost:8000/docs`

### Step 2: Start Frontend Command Dashboard
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
*Dashboard accessible at:* `http://localhost:5173`

---

## 🐳 5. Running with Docker Compose

```bash
docker compose up --build
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- PostgreSQL/PostGIS: `localhost:5432`

---

## 🔑 6. Demo Credentials

- **Email:** `admin@urbansense.demo`
- **Password:** `Demo@123`
- **Role:** BEL Command Officer

---

## 🎯 7. 3-Minute SIH Judging Presentation Guide

1. **Step 1 — Login & Overview Dashboard:**  
   Open `http://localhost:5173`. Highlight live fleet telemetry KPI cards (Active Buses, Events Today, Critical Alerts, Resolved Defects).
2. **Step 2 — SIH Judging Demo Control Bar:**  
   Click **`🚧 Generate Pothole`** or **`⚡ Critical Hit & Run`** on the top toolbar. Watch the WebSocket alert fire instantly across the dashboard.
3. **Step 3 — GIS Urban Map:**  
   Navigate to **Urban Map**. Click the newly created marker to view the full **Evidence Viewer Modal**, annotated frame, confidence %, and GPS location.
4. **Step 4 — Authority Dispatch Workflow:**  
   In the modal, assign to **Road Maintenance Department**, change status `New` ➔ `Verified` ➔ `Assigned` ➔ `Resolved`.
5. **Step 5 — Model Validation Feedback Loop:**  
   Click **"Correct Detection"** under Feedback to demonstrate the continuous ML improvement loop.
6. **Step 6 — Edge AI Console & Low-Connectivity Simulation:**  
   Navigate to **Edge AI Console**. Toggle a bus to `Offline` mode to show local queueing, then set back to `Online` to witness batch event restoration.
7. **Step 7 — AI Detection Lab:**  
   Upload an image in the **AI Detection Lab** to showcase the live computer vision inference pipeline with bounding boxes and ANPR OCR overlay.
