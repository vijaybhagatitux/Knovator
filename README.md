# 🚀 Job Importer — Full Stack Application

A scalable, production-ready system that automatically imports job listings from external XML feeds, queues them in Redis for background processing, stores them in MongoDB, and exposes APIs for a Next.js admin dashboard.

This project demonstrates end-to-end architecture design, asynchronous job processing, and data consistency tracking with Import History.

---

## 📁 Project Structure

/client → Next.js (Admin Dashboard)
/server → Node.js (Express + MongoDB + Redis)
/docs → Architecture & Design Notes 


---

## ⚙️ Technologies

### 🖥 Backend
- **Node.js (TypeScript + Express)** — REST API server  
- **MongoDB (Mongoose)** — Persistent storage for jobs and logs  
- **Redis + BullMQ** — Queue-based background processing  
- **Pino** — Structured logging  
- **Cron** — Scheduled imports  

### 🌐 Frontend
- **Next.js 14** — Dashboard UI  
- **TailwindCSS** — UI styling  
- **Axios** — API communication  

---

## 🧠 Key Features

✅ Fetch jobs from real XML feeds (Jobicy, HigherEdJobs, etc.)  
✅ Convert XML → JSON before storing  
✅ Run automated hourly imports via cron  
✅ Use Redis queue (BullMQ) for background workers  
✅ Store logs (new, updated, failed) in MongoDB  
✅ View data via a responsive Next.js dashboard  

---

## ⚙️ Environment Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/vijaybhagatitux/Knovator.git
cd Knovator

🧰 Backend Setup
cd server
cp .env.example .env
npm install
npm run dev

🖥 Frontend Setup
cd ../client
npm install
npm run dev

🧱 Folder Structure (Server)


🧠 System Flow
External XML Feed
       ↓
   Fetch & Parse (XML → JSON)
       ↓
   Redis Queue (BullMQ)
       ↓
   Worker Processes
       ↓
   MongoDB (Jobs + Logs)
       ↓
   Express REST API
       ↓
   Next.js Dashboard

🧰 Local Development (with Docker) 
docker run -d --name mongodb -p 27017:27017 mongo:6
docker run -d --name redis -p 6379:6379 redis:7-alpine

cd server && npm run dev
cd ../client && npm run dev

🧾 Summary

Tech Stack:
Node.js + Express + MongoDB + Redis + BullMQ + Next.js

📡 Flow:
XML Feed → Queue → Worker → MongoDB → API → Dashboard

This project demonstrates strong understanding of:

Asynchronous job processing

Queue-based architecture

System design for scalability

Logging, monitoring, and data consistency tracking

👨‍💻 Author: Vijay Ganesh Bhagat

📧 email: vijaybhagatitux@gmail.com