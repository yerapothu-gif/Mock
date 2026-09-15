# Reaching Roots — Rural Data & VLE Management Platform

An offline-first MERN stack platform built for **Reaching Roots Foundation** as part of the Code for Good hackathon, digitizing village data collection, needs assessment, VLE (Village Level Entrepreneur) onboarding, and machinery rental tracking across rural Bhopal (Ratapani wildlife sanctuary area).

---

## 🌾 Problem

Reaching Roots operates in a low/no-connectivity region and currently relies on paper forms, spreadsheets, and WhatsApp to manage village identification, farmer needs assessments, and VLE machinery rentals — a process that is slow, error-prone, and offers no real-time visibility into demand or income.

## ✅ What This Project Does

- Captures village and farmer data **offline**, syncing automatically when connectivity returns
- Runs needs assessments and logs farmer machinery requests in the field
- Onboards VLEs and tracks their equipment, rentals, and income
- Plots villages on an interactive map (with offline tile support)
- Generates AI-assisted machinery-demand summary reports for admins

---

## 👥 Roles & Core Features

| Role | Key Features |
|---|---|
| **Field Volunteer** | Create/edit village records, capture GPS/map pins, add farmers, conduct needs assessments, log farmer requests — all offline |
| **Admin / NGO Staff** | Review synced data, view region map, onboard VLEs, assign equipment, view rental logs, view AI machinery-need reports, manage open requests |
| **VLE** | Log rental transactions, auto-tracked earnings, weekly stats, contact admin for support |
| **Farmer** | Not a direct app user — represented as a data record only |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (PWA, offline-capable) |
| Maps | Leaflet.js + OpenStreetMap (with offline tile caching) |
| Offline Storage | IndexedDB via Dexie.js |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas (cloud cluster) |
| Auth | JWT + Role-Based Access Control |
| AI Reports | OpenAI API (server-side only) |
| Hosting | Vercel/Netlify (frontend), Render/Railway (backend) |

---

## 📁 Project Structure (suggested)

```
reaching-roots/
├── client/               # React frontend (PWA)
│   ├── src/
│   │   ├── volunteer/
│   │   ├── admin/
│   │   ├── vle/
│   │   └── shared/
├── server/               # Express backend
│   ├── models/           # Mongoose schemas
│   ├── routes/
│   ├── controllers/
│   ├── middleware/        # auth, RBAC
│   └── services/          # OpenAI integration, sync logic
├── .env.example
└── README.md
```

---

## ⚙️ Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster (connection URI)
- OpenAI API key

### 1. Clone & Install
```bash
git clone <repo-url>
cd reaching-roots
cd server && npm install
cd ../client && npm install
```

### 2. Environment Variables
Create a `.env` file in `/server`:
```
MONGODB_URI=mongodb+srv://<your-cluster-uri>
OPENAI_API_KEY=sk-xxxxxxxxxxxx
JWT_SECRET=your-secret-key
PORT=5000
```
> ⚠️ Never commit `.env` or expose the OpenAI key in frontend code — all AI report calls are made server-side.

### 3. Run
```bash
# Backend
cd server && npm run dev

# Frontend
cd client && npm start
```

---

## 🔌 API Overview

| Group | Example Endpoints |
|---|---|
| Auth | `POST /api/auth/login`, `POST /api/auth/register` |
| Villages | `POST /api/villages`, `GET /api/villages/map`, `GET /api/villages/nearby` |
| Needs Assessment | `POST /api/villages/:villageId/needs-assessment` |
| VLE | `POST /api/vle`, `PUT /api/vle/:id/equipment`, `GET /api/vle/:id/logs` |
| Transactions | `POST /api/vle/me/transactions`, `GET /api/vle/me/earnings/summary` |
| Reports | `GET /api/reports/machinery-need` |
| Sync | `POST /api/sync/batch` |

Full endpoint list and request/response schemas are in `docs/Reaching-Roots-Full-Requirements-Doc.pdf`.

---

## 📡 Offline-First Design

- All Volunteer and VLE writes save to **IndexedDB first**, tagged `pending`
- A background `SyncManager` pushes queued records to `/api/sync/batch` when connectivity returns
- Map tiles for known operating districts are pre-cached for offline use
- Conflict resolution: simplified **last-write-wins** (documented limitation, not production-grade)

---

## ⚠️ Known Limitations

- Demand discovery relies on a volunteer/VLE being physically present to log a farmer request
- AI reports are aggregation + LLM summarization, not predictive forecasting
- No verification mechanism for self-reported rental income
- GPS may be unreliable in dense sanctuary terrain (manual pin fallback provided)

---

## 🙌 Built For
Code for Good — Tech for Social Good Program, in partnership with **Reaching Roots Foundation**.
