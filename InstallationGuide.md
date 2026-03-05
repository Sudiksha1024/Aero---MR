# 🛸 AERO-MR Systems: Professional Installation Guide
**Version 2.4.0 | Operational Intelligence Portal**

This guide provides a comprehensive, step-by-step workflow for setting up the AERO-MR ecosystem, including the Backend API, the Premium Tactical Dashboard, and the Unity MR Simulation environment.

---

## 📋 1. System Requirements
Before starting, ensure your workstation meets the following specifications:
- **Operating System**: Windows 10/11 (with WSL2 recommended for Backend)
- **Node.js**: v18.0.0 or higher
- **Unity**: Unity 2022.3 LTS (Silicon/Intel as applicable)
- **Database**: PostgreSQL 14+ or Docker Desktop
- **Hardware**: HoloLens 2 (Developer Mode Enabled) & UAV Controller (Serial Support)

---

## 🛠️ 2. Backend & Repository Setup
The Backend serves as the central telemetry hub for all MR and UAV data.

1.  **Clone & Initialise**:
    ```bash
    git clone https://github.com/your-repo/AERO-MR.git
    cd AERO-MR/Backend
    ```
2.  **External Dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Calibration**:
    Create or verify the `.env` file in the `Backend` directory:
    ```env
    PORT=5000
    DATABASE_URL="postgresql://postgres:password@localhost:5432/aeromr?schema=public"
    JWT_SECRET="aeromr_secret_key_2026"
    ```
4.  **Database Migration**:
    Push the tactical schema to your PostgreSQL instance:
    ```bash
    npx prisma db push
    ```
5.  **Launch Uplink**:
    ```bash
    npm run dev
    ```
    *The API will be live at `http://localhost:5000`.*

---

## 📈 3. Premium Tactical Dashboard
The Dashboard is the operational control center for the system.

1.  **Enter Directory**:
    ```bash
    cd ../Dashboard
    ```
2.  **Asset Installation**:
    ```bash
    npm install
    ```
3.  **Configuration**:
    Verify `src/config.ts` points to your Backend URL.
4.  **Start Operational Portal**:
    ```bash
    npm run dev
    ```
5.  **Accessing the UI**:
    Open your browser to: **[http://localhost:5173](http://localhost:5173)** (or **5174** if 5173 is occupied).

---

## 🎮 4. Unity MR Application
The simulation environment for HoloLens and PC-VR.

1.  **Project Loading**:
    - Open **Unity Hub**.
    - Click **Add** and select the `UnityApp` folder.
    - Ensure the editor version is set to **Unity 2022.3 LTS**.
2.  **MRTK Configuration**:
    - Navigate to `Mixed Reality > Toolkit > Utilities`.
    - Run the **Project Configurator** to ensure OpenXR and XR SDKs are active.
3.  **Build Settings**:
    - Switch platform to **Universal Windows Platform** (for HoloLens) or **Standalone** (for PC Sim).
    - Set Target Device to **HoloLens** and Architecture to **ARM64**.
4.  **Telemetry Link**:
    - Locate the `TelemetryManager` script in the hierarchy.
    - Set the **API Endpoint** to `http://YOUR_PC_IP:5000/api`.

---

## 🐋 5. Containerized Deployment (Production)
For rapid deployment of the full tactical stack:

```bash
cd AERO-MR/DevOps
docker-compose up -d --build
```
This will automatically spin up:
- **PostgreSQL Instance** (Port 5432)
- **AERO-MR Backend** (Port 5000)
- **Intelligence Dashboard** (Port 80)

---

## 🚨 6. Troubleshooting & Support
- **Dashboard "Broken" Styling**: Ensure `index.css` font imports are at the very top. Check that `npm install` finished successfully.
- **Connection Failure**: Check that the Backend server is running before launching the Dashboard or UnityApp. Ensure your firewall allows traffic on ports `5000` and `5173`.
- **Zipping Source**: Use the root-level `AERO-MR_Source_Setup.zip` if you need to migrate the entire pre-configured environment.

---
*© 2026 AERO-MR Systems | Tactical Grade Mixed Reality*
