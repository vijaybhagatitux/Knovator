
⚙️ Technologies

🖥 Backend
- **Node.js (TypeScript + Express)** — REST API server
- **MongoDB (Mongoose)** — Persistent storage for jobs and logs
- **Redis + BullMQ** — Queue-based background processing
- **Pino** — Structured logging
- **Cron** — Scheduled imports

🌐 Frontend
- **Next.js 14** — Dashboard UI
- **TailwindCSS** — UI styling
- **Axios** — API communication

---

🧠 Key Features

✅ Fetch jobs from real XML feeds (Jobicy, HigherEdJobs, etc.)  
✅ Convert XML → JSON before storing  
✅ Run automated hourly imports via cron  
✅ Use Redis queue (BullMQ) for background workers  
✅ Store logs (new, updated, failed) in MongoDB  
✅ View data via a responsive Next.js dashboard  

⚙️ Environment Setup

## ⚙️ Environment Setup

### 1️⃣ Clone Repository
```bash
git clone https://github.com/vijaybhagatitux/Knovator.git
cd Knovator

2️⃣ Backend Setup  
cd server
cp .env.example .env
npm install
npm run dev
Runs at:
🟢 http://localhost:4000

3️⃣ Frontend Setup
cd ../client
npm install
npm run dev

🧠 System Flow
External Feed (XML)
        ↓
     Fetch & Parse
        ↓
      Queue (Redis)
        ↓
  Worker (BullMQ)
        ↓
   MongoDB (Jobs + Logs)
        ↓
  Express REST API
        ↓
  Next.js Dashboard

🧭 Future Enhancements

Real-time updates using Socket.IO

Job retry tracking + exponential backoff

Pagination and filtering for large datasets

Worker health & metrics dashboard

👨‍💻 Author

Your vijay Bhagat
📧 vijaybhagatitux@example.com

🧱 Summary

💡 Stack: Node.js + Express + MongoDB + Redis + BullMQ + Next.js
🧩 Design: Queue-based architecture for scalable async job processing
📊 Outcome: Fully automated job importer with detailed import logs


## Overview
The Job Importer system is designed to **automate job imports** from external feeds, **process them asynchronously** through queues, and **persist results** in MongoDB — providing complete visibility through an admin dashboard.

It emphasizes **scalability, modularity, and observability**.

---

## ⚙️ Components Overview

| Component | Description |
|------------|--------------|
| **Feed Fetcher** | Fetches XML job feeds and converts to JSON |
| **Queue System (BullMQ)** | Manages background job processing |
| **MongoDB** | Stores job listings and import logs |
| **Workers** | Handle insertion, updates, and retry logic |
| **Cron Jobs** | Schedule imports every hour |
| **API Layer (Express)** | Exposes endpoints for jobs and logs |
| **Frontend (Next.js)** | Displays job data and import history |

---

## 🧩 Data Flow



External XML Feed
↓
Feed Parser (XML → JSON)
↓
Redis Queue (BullMQ)
↓
Worker Processes
↓
MongoDB (Jobs + Logs)
↓
Express REST API
↓
Next.js Admin UI


---

## 🧱 Core Entities

### 🧾 Job
Represents a single job fetched from the external API.
- `title`
- `company`
- `location`
- `description`
- `link`
- `pubDate`

### 🧾 ImportLog
Tracks each import attempt:
- `sourceUrl`
- `timestamp`
- `totalFetched`
- `newJobs`
- `updatedJobs`
- `failedJobs`
- `status`

---

## 🧠 Key Design Decisions

### 1. **Queue-based Processing**
- Redis + BullMQ chosen for distributed scalability.
- Decouples fetching from importing.
- Enables concurrent processing (configurable via `WORKER_CONCURRENCY`).

### 2. **XML → JSON Conversion**
- External feeds return XML.
- XML parsed using `xml2js` or similar libraries.
- Normalized into job schema before persistence.

### 3. **Resiliency**
- Retry logic via BullMQ retry settings.
- Error handling + logging through Pino.

### 4. **Scalability**
- Each worker runs independently (can scale horizontally).
- MongoDB supports horizontal sharding for data growth.
- Queue-based design ready for future microservice split.

---

## 🕓 Scheduling

- Controlled via environment variable `CRON_EVERY`
- Example: `0 * * * *` → every hour
- Can also trigger manually via `/api/imports/run`

---

## 🧩 Observability & Monitoring

- **Logs:** Stored via Pino (structured JSON logs)
- **Import Logs:** MongoDB collection tracks each import
- **Error Alerts:** Failed jobs visible in logs and BullMQ dashboard

---

## 🧭 Scalability Notes

| Concern | Strategy |
|----------|-----------|
| High job volume | Redis queue + concurrency workers |
| Feed downtime | Retry + exponential backoff |
| Duplicate jobs | MongoDB upsert on job ID |
| Data growth | Indexing + TTL on old import logs |
| Multi-feed support | FEEDS list in `.env` variable |

---
