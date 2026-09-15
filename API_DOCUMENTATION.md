# Reaching Roots Foundation — API & Database Specification

Complete technical specification for the **Reaching Roots Foundation (Code for Good)** MERN platform.

---

## 1. Team Division (Non-Conflicting Tracks)

To avoid Git merge conflicts, backend development is split into two independent domains:

```
┌────────────────────────────────────────────────────────────┐
│                  Member 1 — Track A                        │
│   Geospatial Map, Discovery, Farmers, Sync & AI Reports    │
├────────────────────────────────────────────────────────────┤
│ Controllers:                                               │
│   • village.controller.js                                  │
│   • farmer.controller.js                                   │
│   • needsAssessment.controller.js                          │
│   • sync.controller.js                                     │
│   • report.controller.js                                   │
│ Routes:                                                    │
│   • village.routes.js                                      │
│   • farmer.routes.js                                       │
│   • needsAssessment.routes.js                              │
│   • sync.routes.js                                         │
│   • report.routes.js                                       │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                  Member 2 — Track B                        │
│      Auth, RBAC, VLE Lifecycle, Rentals & Support          │
├────────────────────────────────────────────────────────────┤
│ Controllers:                                               │
│   • auth.controller.js                                     │
│   • vle.controller.js                                      │
│   • transaction.controller.js                              │
│   • support.controller.js                                  │
│ Routes:                                                    │
│   • auth.routes.js                                         │
│   • vle.routes.js                                          │
│   • transaction.routes.js                                  │
│   • support.routes.js                                      │
└────────────────────────────────────────────────────────────┘
```

---

## 2. Database Models Summary

All models reside in `backend/src/models/` and are registered with MongoDB Atlas:

| Model | Primary Fields | Key Indexes & Behaviors |
| :--- | :--- | :--- |
| **`User`** | `name`, `phone`, `email`, `password`, `role`, `linkedVleId`, `isActive`, `refreshToken` | `phone` (unique), bcrypt pre-save hash, `generateAccessToken()`, `generateRefreshToken()`. Roles: `volunteer`, `admin`, `vle`. |
| **`Village`** | `name`, `district`, `block`, `location` (GeoJSON `Point`), `farmerCount`, `majorCrops`, `waterResources`, `acres`, `communityStructures`, `readinessStage`, `activeVleId`, `createdBy`, `status`, `offlineId` | `location: "2dsphere"`, text index on `name`, compound `{ district: 1, readinessStage: 1 }`. Stages: `identified`, `assessed`, `vle-active`. |
| **`Farmer`** | `villageId`, `name`, `phone`, `contactInfo`, `landSize`, `landholdingType`, `crops`, `isPotentialVLE`, `notes`, `offlineId` | Compound `{ villageId: 1, name: 1 }`, `isPotentialVLE: 1`. Types: `marginal`, `small`, `medium`, `large`. |
| **`NeedsAssessment`** | `villageId`, `processesEvaluated` (`stage`, `challengesFaced`, `currentPractice`, `notes`), `gapsIdentified`, `farmerRequests` (`farmerId`, `farmerName`, `requestType`, `machineTypeNeeded`, `urgency`, `notes`, `status`), `conductedBy`, `status`, `offlineId` | `{ villageId: 1, createdAt: -1 }`, `{ "farmerRequests.status": 1 }`. Powers OpenAI machinery report aggregation. |
| **`VLE`** | `name`, `phone`, `contactInfo`, `villageId`, `userId`, `trainingStatus`, `trainingCompletedAt`, `accountStatus`, `assignedEquipment`, `totalEarnings`, `totalRentalsCount`, `totalAcresServiced`, `createdBy` | `trainingStatus: "pending" \| "completed"`, `accountStatus: "locked" \| "active"`. Ownership of equipment tagged as `"Foundation"`. |
| **`RentalTransaction`**| `vleId`, `villageId`, `farmerName`, `farmerId`, `machineId`, `machineType`, `date`, `durationHours`, `acresCovered`, `feeCharged`, `paymentStatus`, `syncStatus`, `offlineId` | `{ vleId: 1, date: -1 }`. `offlineId` unique index prevents duplicate charges on reconnect sync. |
| **`VLEContactRequest`**| `vleId`, `category`, `subject`, `message`, `urgency`, `status`, `adminResponse`, `resolvedAt`, `resolvedBy` | Categories: `equipment_request`, `maintenance_issue`, `farmer_feedback`, `general_query`. Status: `open`, `in_progress`, `resolved`. |

---

## 3. Member 1 (Track A) API Specification

### 3.1 Village & Geospatial Endpoints (`/api/villages`)

#### 1. Create Village Record
* **`POST /api/villages`**
* **Access**: `volunteer`, `admin`
* **Request Body**:
  ```json
  {
    "name": "Barkheda",
    "district": "Raisen",
    "block": "Obedullaganj",
    "location": {
      "type": "Point",
      "coordinates": [77.6321, 22.8423]
    },
    "farmerCount": 85,
    "majorCrops": ["Soybean", "Wheat", "Gram"],
    "waterResources": ["Canal", "Borewell"],
    "acres": 350,
    "communityStructures": [
      { "type": "SHG", "name": "Jai Kisan Mahila SHG", "contactPerson": "Sunita Bai", "phone": "9876543210" }
    ],
    "readinessStage": "identified",
    "offlineId": "uuid-local-123"
  }
  ```
* **Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Village created successfully",
    "data": { "_id": "64f1...", "name": "Barkheda", "status": "synced", ... }
  }
  ```

#### 2. Get All Villages (with search & filters)
* **`GET /api/villages?search=Barkheda&district=Raisen&stage=identified&status=synced&page=1&limit=20`**
* **Access**: Authenticated

#### 3. Lightweight Map Pins (Leaflet Rendering)
* **`GET /api/villages/map`**
* **Access**: Authenticated
* **Response**: Returns lightweight array containing only coordinates, readiness stage, and ID for snappy map rendering:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "64f1...",
        "name": "Barkheda",
        "location": { "type": "Point", "coordinates": [77.6321, 22.8423] },
        "readinessStage": "identified",
        "district": "Raisen"
      }
    ]
  }
  ```

#### 4. Geospatial Proximity Check (Prevent Duplicates)
* **`GET /api/villages/nearby?lat=22.8423&lng=77.6321&radiusKm=5`**
* **Access**: `volunteer`, `admin`
* **Query Logic**: Uses `$nearSphere` on `location` with `$maxDistance: radiusKm * 1000`.

#### 5. Get Single Village Detail
* **`GET /api/villages/:id`**
* **Access**: Authenticated

#### 6. Update Village Record
* **`PUT /api/villages/:id`**
* **Access**: `volunteer`, `admin`
* **Use Case**: Update info or advance `readinessStage` (`identified` $\rightarrow$ `assessed` $\rightarrow$ `vle-active`).

---

### 3.2 Farmer Registry (`/api/villages/:villageId/farmers`)

#### 1. Add Farmer under a Village
* **`POST /api/villages/:villageId/farmers`**
* **Access**: `volunteer`, `admin`
* **Request Body**:
  ```json
  {
    "name": "Ramesh Patel",
    "phone": "9876543211",
    "landSize": 3.5,
    "landholdingType": "small",
    "crops": ["Wheat", "Soybean"],
    "isPotentialVLE": true,
    "notes": "Progressive farmer with tractor driving experience",
    "offlineId": "uuid-farmer-456"
  }
  ```

#### 2. List Farmers in Village
* **`GET /api/villages/:villageId/farmers`**
* **Access**: Authenticated

#### 3. Identify Potential VLE Candidates in Village
* **`GET /api/villages/:villageId/candidates`**
* **Access**: `admin`
* **Query Logic**: Retrieves farmers where `isPotentialVLE: true`.

---

### 3.3 Needs Assessment & Demands (`/api/needs-assessment`)

#### 1. Submit Needs Assessment for a Village
* **`POST /api/villages/:villageId/needs-assessment`**
* **Access**: `volunteer`
* **Request Body**:
  ```json
  {
    "processesEvaluated": [
      {
        "stage": "land_preparation",
        "challengesFaced": "High cost of hiring private bullock/tractors",
        "currentPractice": "Manual/bullock",
        "notes": "Delays sowing window by 2 weeks"
      },
      {
        "stage": "spraying",
        "challengesFaced": "No power sprayers; uneven pesticide application",
        "currentPractice": "Manual hand pump"
      }
    ],
    "gapsIdentified": [
      "Machinery for paddy transplantation",
      "Power sprayers for pest management",
      "Labor shortage during harvesting"
    ],
    "farmerRequests": [
      {
        "farmerName": "Ramesh Patel",
        "requestType": "Paddy Transplanter",
        "machineTypeNeeded": "Transplanter 4-Row",
        "urgency": "high",
        "notes": "Needs for 3 acres before rains"
      }
    ],
    "summaryNotes": "Village has strong demand for mechanized sowing.",
    "offlineId": "uuid-survey-789"
  }
  ```

#### 2. Get Assessments for Village
* **`GET /api/villages/:villageId/needs-assessment`**
* **Access**: Authenticated

#### 3. Update Assessment
* **`PUT /api/needs-assessment/:id`**
* **Access**: `volunteer`, `admin`

#### 4. View Cross-Village Open Farmer Requests
* **`GET /api/requests/open`**
* **Access**: `admin`
* **Query Logic**: Aggregates all `farmerRequests` with `status: "open"` across all villages.

#### 5. Update Request Status (Fulfill / Cancel)
* **`PATCH /api/requests/:requestId/status`**
* **Access**: `admin`
* **Request Body**: `{ "status": "fulfilled" }`

---

### 3.4 Offline Batch Sync (`/api/sync`)

#### 1. Batch Push Queued Offline Records
* **`POST /api/sync/batch`**
* **Access**: `volunteer`, `vle`
* **Request Body**:
  ```json
  {
    "villages": [ { "offlineId": "...", "name": "...", ... } ],
    "farmers": [ { "offlineId": "...", "name": "...", "villageId": "...", ... } ],
    "assessments": [ { "offlineId": "...", "villageId": "...", ... } ],
    "transactions": [ { "offlineId": "...", "feeCharged": 500, ... } ]
  }
  ```
* **Execution**: Iterates through each array and executes idempotent `findOneAndUpdate({ offlineId }, update, { upsert: true })`.
* **Response**: Returns count of records successfully synced and any conflict warnings.

---

### 3.5 AI Machinery Demand Report (`/api/reports`)

#### 1. Generate AI Machinery-Need Summary
* **`GET /api/reports/machinery-need`**
* **Access**: `admin`
* **Execution Flow**:
  1. MongoDB aggregation pipeline extracts `gapsIdentified` and `farmerRequests` (grouped by village and district).
  2. Server formats data prompt and sends it to OpenAI Chat Completions (`gpt-4o-mini`).
  3. Returns a plain-language executive summary highlighting critical machinery shortages and recommended allocations.

---

## 4. Member 2 (Track B) API Specification

### 4.1 Auth & RBAC Endpoints (`/api/auth`)

#### 1. Admin Registers New User
* **`POST /api/auth/register`**
* **Access**: `admin`
* **Request Body**:
  ```json
  {
    "name": "Suresh VLE",
    "phone": "9826012345",
    "password": "Password@123",
    "role": "vle",
    "email": "suresh@example.com"
  }
  ```

#### 2. User Login
* **`POST /api/auth/login`**
* **Access**: Public
* **Request Body**:
  ```json
  {
    "phone": "9826012345",
    "password": "Password@123"
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "accessToken": "eyJhbGciOi...",
    "user": {
      "_id": "64f...",
      "name": "Suresh VLE",
      "phone": "9826012345",
      "role": "vle",
      "linkedVleId": "64f9..."
    }
  }
  ```

#### 3. Get Current Profile
* **`GET /api/auth/me`**
* **Access**: Authenticated

#### 4. Logout
* **`POST /api/auth/logout`**
* **Access**: Authenticated

---

### 4.2 VLE Onboarding & Equipment Lifecycle (`/api/vle`)

#### 1. Create VLE Profile
* **`POST /api/vle`**
* **Access**: `admin`
* **Request Body**:
  ```json
  {
    "name": "Suresh Sharma",
    "phone": "9826012345",
    "villageId": "64f1...",
    "userId": "64f2...",
    "contactInfo": {
      "phone": "9826012345",
      "address": "Near Panchayat Bhavan, Barkheda"
    }
  }
  ```

#### 2. List All VLEs (Dashboard & Leaderboard)
* **`GET /api/vle`**
* **Access**: `admin`
* **Response**: Returns VLEs with `totalEarnings`, `totalRentalsCount`, `trainingStatus`, and `assignedEquipment`.

#### 3. Get Single VLE Details
* **`GET /api/vle/:id`**
* **Access**: `admin`

#### 4. Mark VLE Training Completed (Account Unlock Gate)
* **`PUT /api/vle/:id/training`**
* **Access**: `admin`
* **Action**: Sets `trainingStatus = "completed"`, `trainingCompletedAt = Date.now()`, and `accountStatus = "active"`. Unlocks VLE login access.

#### 5. Assign Machinery / Equipment to VLE
* **`PUT /api/vle/:id/equipment`**
* **Access**: `admin`
* **Request Body**:
  ```json
  {
    "machineId": "EQ-ROT-001",
    "machineType": "Rotavator",
    "model": "Shaktiman 6ft",
    "serialNumber": "SHK-2024-8841",
    "ownership": "Foundation",
    "hourlyRate": 450,
    "dailyRate": 3200,
    "condition": "excellent"
  }
  ```

#### 6. VLE View Own Profile
* **`GET /api/vle/me`**
* **Access**: `vle`
* **Gate**: If `accountStatus === "locked"`, returns `403 Forbidden: Training incomplete. Account is locked.`

#### 7. VLE View Assigned Equipment
* **`GET /api/vle/me/equipment`**
* **Access**: `vle`

---

### 4.3 Rental Transactions & Running Earnings (`/api/transactions`)

#### 1. Log New Rental Transaction
* **`POST /api/vle/me/transactions`**
* **Access**: `vle`
* **Request Body**:
  ```json
  {
    "villageId": "64f1...",
    "farmerName": "Ramesh Patel",
    "machineId": "EQ-ROT-001",
    "machineType": "Rotavator",
    "date": "2026-09-15T10:00:00Z",
    "durationHours": 3.5,
    "acresCovered": 2.0,
    "feeCharged": 1575,
    "paymentStatus": "paid",
    "offlineId": "uuid-rental-991"
  }
  ```
* **Side-Effect**: Automatically increments the VLE's `totalEarnings`, `totalRentalsCount`, and `totalAcresServiced`.

#### 2. VLE View Own Transactions
* **`GET /api/vle/me/transactions?page=1&limit=20`**
* **Access**: `vle`

#### 3. Admin View VLE Transaction Audit Logs
* **`GET /api/vle/:id/logs`**
* **Access**: `admin`

#### 4. VLE Running Earnings Summary
* **`GET /api/vle/me/earnings/summary`**
* **Access**: `vle`
* **Response**:
  ```json
  {
    "success": true,
    "data": {
      "totalEarnings": 42500,
      "totalRentals": 28,
      "acresServiced": 64.5,
      "estimatedUtilizationPercent": 72
    }
  }
  ```

#### 5. Weekly Stats for Frontend Charts
* **`GET /api/vle/me/earnings/weekly`**
* **Access**: `vle`
* **Response**: Groups transactions by week and returns array of `{ week: "Week 36", earnings: 5200, hours: 14 }`.

---

### 4.4 VLE Support & Contact Tickets (`/api/support`)

#### 1. VLE Sends Support Request to Admin
* **`POST /api/vle/me/contact-admin`**
* **Access**: `vle`
* **Request Body**:
  ```json
  {
    "category": "maintenance_issue",
    "subject": "Blade wear on Rotavator EQ-ROT-001",
    "message": "Blades are worn out after 50 hours of operation in rocky soil. Replacement set required.",
    "urgency": "high"
  }
  ```

#### 2. VLE View Own Support Tickets
* **`GET /api/vle/me/contact-requests`**
* **Access**: `vle`

#### 3. Admin List All Support Requests
* **`GET /api/support/requests?status=open`**
* **Access**: `admin`

#### 4. Admin Respond to Ticket
* **`PATCH /api/support/requests/:id/respond`**
* **Access**: `admin`
* **Request Body**:
  ```json
  {
    "adminResponse": "Replacement blades dispatched from Bhopal warehouse. Expected arrival tomorrow.",
    "status": "in_progress"
  }
  ```

---

## 5. Standard HTTP Status Codes

| Code | Meaning | When Used |
| :--- | :--- | :--- |
| `200 OK` | Success | Standard successful GET, PUT, PATCH. |
| `201 Created` | Resource Created | Successful POST creation. |
| `400 Bad Request` | Validation Error | Missing required fields, invalid coordinates. |
| `401 Unauthorized` | Missing / Invalid Token | Token expired or absent. |
| `403 Forbidden` | Insufficient Permissions | Role mismatch (e.g. volunteer accessing admin endpoint) or locked VLE account. |
| `404 Not Found` | Resource Not Found | ID does not match any record. |
| `409 Conflict` | Duplicate Record | Unique constraint violation (e.g. phone already registered). |
| `500 Server Error` | Internal Failure | Unhandled database or external service error. |
