# UrbanSense AI — AI-Powered Mobile Urban Intelligence Platform

<p align="center">
  <img src="frontend/public/favicon.svg" width="90" alt="UrbanSense AI Logo" />
</p>

<p align="center">
  <strong>Turning Public Transport Buses into Mobile Urban Sensing Units</strong>
</p>

<p align="center">
  <a href="https://github.com/Naraj29/urbansense_ai"><img src="https://img.shields.io/badge/SIH%20Problem%20ID-26124-blue?style=for-the-badge&logo=gov" alt="SIH PS 26124" /></a>
  <a href="https://github.com/Naraj29/urbansense_ai"><img src="https://img.shields.io/badge/Organization-Bharat%20Electronics%20Limited%20(BEL)-004B87?style=for-the-badge" alt="BEL" /></a>
  <a href="https://github.com/Naraj29/urbansense_ai"><img src="https://img.shields.io/badge/Category-Software-orange?style=for-the-badge" alt="Software Category" /></a>
  <a href="https://github.com/Naraj29/urbansense_ai"><img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Ready" /></a>
</p>

---

## 📋 Table of Contents
- [Executive Overview](#-executive-overview)
- [Problem Statement Context (BEL PS #26124)](#-problem-statement-context-bel-ps-26124)
- [End-to-End System Architecture](#-end-to-end-system-architecture)
- [Key Product Features](#-key-product-features)
- [Edge AI Simulation & Jetson Compatibility](#-edge-ai-simulation--jetson-compatibility)
- [Technology Stack](#-technology-stack)
- [Quick Start Guide](#-quick-start-guide)
  - [Option A: Docker Compose (Recommended)](#option-a-docker-compose-recommended)
  - [Option B: Local Development Setup](#option-b-local-development-setup)
- [SIH Presentation & Judge Demo Guide](#-sih-presentation--judge-demo-guide)
- [API & WebSocket Specification](#-api--websocket-specification)
- [Privacy & Security by Design](#-privacy--security-by-design)
- [License](#-license)

---

## 🏙️ Executive Overview

**UrbanSense AI** is a full-stack, enterprise-grade mobile urban intelligence platform built for **Bharat Electronics Limited (BEL)** under **Smart India Hackathon Problem Statement 26124**.

By transforming existing municipal public-transport buses into **moving urban sensing units**, the platform continuously captures, processes, and acts upon city infrastructure hazards without requiring expensive static CCTV networks across every kilometer of city roads.

---

## 🎯 Problem Statement Context (BEL PS #26124)

- **Title:** AI-Powered Mobile Urban Intelligence Platform Using Public Transport Fleet
- **Organization:** Bharat Electronics Limited (BEL)
- **Theme:** Smart Automation

### The Workflow:
```text
BUS CAMERAS (Front/Rear/Side/Cabin)
               ↓
    EDGE AI PROCESSING (NVIDIA Jetson AGX/Orin Architecture)
               ↓
 OBJECT / ROAD / TRAFFIC / INCIDENT DETECTION (YOLOv8 + OpenCV)
               ↓
    LOW-CONNECTIVITY EVENT FILTERING & LOCAL QUEUEING
               ↓
 GPS + TIMESTAMP + CONFIDENCE + ANPR METADATA TRANSMISSION
               ↓
   CENTRAL URBAN INTELLIGENCE PLATFORM (FastAPI + PostGIS)
               ↓
 GIS MAP + COMMAND DASHBOARD + INTER-DEPARTMENT DISPATCH
               ↓
     AUTHORITY REMEDIATION ACTION & FEEDBACK LOOP
               ↓
      CONTINUOUS MODEL ACCURACY IMPROVEMENT
```

---

## 🏗️ End-to-End System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    PUBLIC BUS FLEET                         │
│  Front / Rear / Side / Cabin Cameras + GPS + OBD Telemetry   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     EDGE AI DEVICE                          │
│  OpenCV Frame Ingestion | YOLOv8 Detection | DEEP SORT Tracker│
│  Low-Connectivity Queue Buffer (Batch Upload on Reconnect) │
└──────────────────────────────┬──────────────────────────────┘
                               │ Geo-Tagged High-Confidence JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    SECURE API LAYER                         │
│  FastAPI (Python) | PyJWT Auth | WebSocket (/ws/fleet)      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    CENTRAL PLATFORM                         │
│  PostgreSQL 15 + PostGIS | Event Processing & Storage       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   COMMAND DASHBOARD                         │
│  GIS Urban Map (Leaflet) | Traffic Analytics | ANPR Tracker │
│  Department Dispatch Workflow | Model Validation Feedback   │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Product Features

| Feature Module | Capabilities & Technical Highlights |
| :--- | :--- |
| **Command Center Overview** | Real-time KPI summary cards (Active Buses, Events Today, Critical Alerts, Road Issues, Traffic Hotspots, Resolved Defects) + Live Alerts feed. |
| **SIH Demo Control Bar** | Top presentation toolbar with 1-click trigger buttons (`⚡ Hit & Run`, `🚧 Pothole`, `🚦 Congestion`, `💧 Waterlogging`, `🚨 Rash Driving`) emitting instant WebSocket alerts. |
| **GIS Urban Map** | Fullscreen interactive Leaflet map featuring color-coded hazard markers, live bus positions, and multi-layer filters across the Prayagraj metropolitan area. |
| **Road Conditions Index** | Prototype Road Condition Index (RCI) multi-factor score (`Good`, `Moderate`, `Poor`, `Critical`) + high-defect cluster density table. |
| **Traffic Intelligence** | Multi-class vehicle classification (Cars, Buses, Trucks, Motorcycles, Bicycles, Pedestrians), hourly trends, route travel delays, and anonymized Origin-Destination (OD) flow. |
| **Incident & ANPR Tracker** | Modular Automatic Number Plate Recognition (ANPR) pipeline tracking vehicle license plates with OCR confidence metrics and event timeline. |
| **Authority Workflow** | 5-stage inter-departmental dispatch workflow (`NEW` ➔ `VERIFY` ➔ `ASSIGN` ➔ `IN PROGRESS` ➔ `RESOLVED`) for Road Maintenance, Traffic Authority, and Municipal Corporations. |
| **Model Validation Loop** | Feedback mechanism ("Was detection correct? YES / NO") feeding into model validation accuracy statistics. |
| **Edge AI Console** | Onboard device emulator displaying multi-camera 30 FPS feeds, inference latency, network state switcher (`Online`, `Weak`, `Offline`), and local queue buffer size. |
| **AI Detection Lab** | Interactive sandbox allowing image/video upload to trigger YOLO object detection & ANPR OCR with bounding box visual overlays. |

---

## ⚡ Edge AI Simulation & Jetson Compatibility

The Edge AI subsystem is architected to run directly on **NVIDIA Jetson AGX / Orin** onboard bus computers. For development and SIH evaluation:
- The system includes a built-in **Edge AI Simulator** broadcasting realistic vehicle trajectories across 5 Prayagraj urban routes.
- **Low-Connectivity / Offline Queueing:** When network status drops to `Offline`, raw video is NOT transmitted. Edge AI filters high-confidence defect metadata into a localized queue buffer, transmitting batch JSON payloads immediately upon network restoration.

---

## 🛠️ Technology Stack

### Frontend Command Center
- **Framework:** React 19 + Vite + TypeScript
- **Styling:** Tailwind CSS v3 (Vanilla CSS utility extensions)
- **Mapping:** Leaflet + OpenStreetMap (`react-leaflet`)
- **Charts:** Recharts
- **Icons:** Lucide React

### Backend & Database Services
- **API Framework:** Python 3.11 + FastAPI
- **ORM & DB:** SQLAlchemy + PostgreSQL 15 / PostGIS (SQLite fallback supported)
- **Security:** PyJWT + Passlib (bcrypt)
- **Real-Time:** WebSockets (`/ws/fleet`, `/ws/alerts`)
- **Computer Vision:** OpenCV + PyTorch / YOLOv8 Detection Architecture

### Infrastructure
- **Containerization:** Docker + Docker Compose + Nginx (Production Reverse Proxy)

---

## 🚀 Quick Start Guide

### Option A: Docker Compose (Recommended)

Run the full stack (PostGIS + FastAPI Backend + Production Nginx Frontend) with a single command:

```bash
docker compose up --build
```

- **Frontend Command Center:** [`http://localhost`](http://localhost) (or [`http://localhost:5173`](http://localhost:5173))
- **FastAPI Backend REST API:** [`http://localhost:8000`](http://localhost:8000)
- **API Documentation (Swagger):** [`http://localhost:8000/docs`](http://localhost:8000/docs)

---

### Option B: Local Development Setup

#### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Activate Virtualenv:
# Windows PowerShell: .\venv\Scripts\activate
# Linux / macOS:      source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open [`http://localhost:5173`](http://localhost:5173) in your browser.

---

## 🔑 Demo Credentials

- **Email:** `admin@urbansense.demo`
- **Password:** `Demo@123`
- **Role:** BEL Command Officer

---

## 🎬 SIH Presentation & Judge Demo Guide

1. **Overview Dashboard:**  
   Open [`http://localhost:5173`](http://localhost:5173). Point out live fleet telemetry KPI cards (Active Buses, Events Today, Critical Alerts, Resolved Defects).
2. **Instant Event Trigger:**  
   Click **`🚧 Generate Pothole`** on the top **SIH JUDGING DEMO BAR**. Show the instant WebSocket alert notification.
3. **GIS Map Inspection:**  
   Navigate to **Urban Map**. Click the new marker to open the **Evidence Viewer Modal**, annotated frame, confidence %, and GPS telemetry.
4. **Authority Workflow Dispatch:**  
   In the modal, select **Road Maintenance Department**, assign a field unit, and transition status `New` ➔ `Verified` ➔ `Assigned` ➔ `Resolved`.
5. **Validation Feedback Loop:**  
   Click **"Correct Detection"** under Feedback to demonstrate continuous model validation metrics.
6. **Low-Connectivity Offline Buffer:**  
   Open **Edge AI Console**. Set a bus to `Offline` mode to demonstrate local queueing, then switch to `Online` to witness batch event restoration.
7. **AI Detection Lab Sandbox:**  
   Upload a test image in **AI Detection Lab** to showcase computer vision bounding box output & ANPR OCR extraction.

---

## 🛰️ API & WebSocket Specification

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user and issue JWT token |
| `GET` | `/api/buses` | Retrieve list of active fleet buses with GPS telemetry |
| `GET` | `/api/events` | Query detection events with filters (`event_type`, `severity`, `status`) |
| `POST` | `/api/events/{id}/assign` | Assign event to municipal authority department |
| `POST` | `/api/events/{id}/resolve` | Resolve event and log remediation status |
| `POST` | `/api/events/{id}/feedback` | Submit model validation accuracy feedback |
| `GET` | `/api/road-conditions` | Retrieve Prototype Road Condition Index (RCI) metrics |
| `GET` | `/api/traffic` | Retrieve multi-class vehicle counts, delays & OD flow |
| `POST` | `/api/edge/trigger-event` | SIH Demo trigger endpoint for instant event generation |
| `POST` | `/api/ai/inference` | Run YOLO object detection and ANPR OCR on uploaded media |
| `WS` | `/ws/fleet` | Live WebSocket broadcast for fleet GPS positions |
| `WS` | `/ws/alerts` | Live WebSocket broadcast for real-time detection alerts |

---

## 🔒 Privacy & Security by Design

- **Edge-First Data Minimization:** Raw video streams remain on the onboard Edge device. Only geo-tagged JSON metadata and small cropped evidence frames are transmitted.
- **No Passenger PII Tracking:** Passenger privacy is preserved; no facial recognition or individual identity tracking is implemented.
- **Role-Based Access Control (RBAC):** Access to dispatch workflows is governed via JWT authentication.

---

## 📜 License

Distributed under the MIT License. Developed for Smart India Hackathon (SIH) for Bharat Electronics Limited (BEL).
