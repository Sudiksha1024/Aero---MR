# AERO-MR Real-Time Telemetry Guide

## 1. Overview
The AERO-MR system supports end-to-end real-time telemetry from the Unity MR Application (HoloLens 2) to the Web Dashboard via the Node.js Backend.

## 2. Enabling Real-Time Data

### 2.1 Unity Setup
1. Open the project in Unity.
2. Locate the `PerformanceTracker` script attached to the Drone object.
3. Set the `Backend URL` to your server's address (e.g., `http://192.168.1.50:5000/api`).
4. Ensure `Sampling Rate` is set to `0.1` (10Hz).
5. Start the mission. The drone will automatically begin POSTing metrics to the backend.

### 2.2 Dashboard Setup
1. Launch the Dashboard.
2. In the top-right corner, toggle the mode from **MOCK** to **REALTIME**.
3. The dashboard will now poll the `/api/analytics/trends` endpoint every 1 second.
4. The **LIVE TELEMETRY** indicator will turn red and pulse.

## 3. Data Flow
`UAV (Unity) -> [POST /metrics] -> Backend (Express/Prisma) -> [STORE] -> PostgreSQL`
`Dashboard (React) -> [GET /trends] -> Backend -> [QUERY] -> Dashboard Visualization`

## 4. Hardware Connectivity
- **RC Transmitter**: Must be connected via Serial (COM) for real-time pilot inputs.
- **HoloLens 2**: Must be on the same network as the Backend.

## 5. Performance Targets
- **Unity Frame Rate**: 60 FPS (HL2 Target).
- **Backend Latency**: < 15ms per request.
- **Dashboard Refresh**: 1Hz (Configurable in `config.ts`).
