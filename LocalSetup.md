# 💻 AERO-MR Local Development Setup Guide
**Operational Intelligence Portal | Local Environment Configuration**

This guide is for developers and testers setting up the AERO-MR ecosystem directly on their local workstation for development, debugging, and testing without using Docker.

---

## 🏗️ 1. Development Architecture
AERO-MR consists of three primary components that must be running simultaneously for full functionality:
1.  **PostgreSQL**: Data persistence for telemetry and logs.
2.  **Node.js Backend**: API and real-time socket communications.
3.  **Vite Dashboard**: High-fidelity web interface for monitoring.

---

## 📂 2. Initializing the Repository
Ensure you have the source code extracted and your terminal is pointed at the root directory.

```powershell
# Open terminal in the root
cd "c:\Users\thangs12\OneDrive - Dell Technologies\Desktop\Kanisk\AERO-MR"
```

---

## 🗄️ 3. Database: Local PostgreSQL
If you are NOT using Docker for the database, follow these steps:

1.  **Install PostgreSQL**: Download and install PostgreSQL 14+ from [enterprisedb.com](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads).
2.  **Create Database**: Open `pgAdmin` or `psql` and run:
    ```sql
    CREATE DATABASE aeromr;
    ```
3.  **Environment Sync**: Open `Backend/.env` and ensure your `DATABASE_URL` matches your local credentials:
    ```env
    DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/aeromr?schema=public"
    ```

---

## 🚀 4. Phase 1: Launching the Backend
The Backend must be started first to provide data to the Dashboard.

1.  **Enter Backend**: `cd Backend`
2.  **Install Core**: `npm install`
3.  **Schema Sync**: 
    ```bash
    npx prisma generate
    npx prisma db push
    ```
4.  **Launch Dev Server**: 
    ```bash
    npm run dev
    ```
    *Verification: The terminal should state "Server running on port 5000".*

---

## 📈 5. Phase 2: Launching the Dashboard
Open a **NEW terminal window** for the Dashboard.

1.  **Enter Dashboard**: `cd Dashboard`
2.  **Install Assets**: `npm install`
3.  **Config Check**: Ensure `Dashboard/src/config.ts` has `backendUrl` set to `http://localhost:5000/api`.
4.  **Run Development Mode**: 
    ```bash
    npm run dev
    ```
    *Verification: Access the UI at **http://localhost:5173** (or 5174).*

---

## 🎛️ 6. Phase 3: Flight Simulation (MOCK Mode)
Once the Dashboard is open, you don't need real hardware to test:
1.  Click the **"MOCK"** button in the top header.
2.  This generates simulated telemetry locally so you can test all UI components and charts without a UAV or HoloLens connected.

---

## 🛠️ 7. Local Troubleshooting
- **Port Conflicts**: If port `5000` is busy, change `PORT` in `Backend/.env` and updated `backendUrl` in the Dashboard config.
- **Node Modules Error**: If you see "Module not found", run `npm install` again in the specific subdirectory (Backend or Dashboard).
- **Prisma Error**: Ensure PostgreSQL service is running in your Windows Services manager.

---
*© 2026 AERO-MR Systems | Local Setup Document v1.0*
