# AERO-MR Testing Strategy

## 1. Unit Testing
### 1.1 Backend
- **Framework**: Jest + Supertest.
- **Scope**: Controller logic, API endpoints, Prisma schema validation.
- **Command**: `npm test`.

### 1.2 Unity
- **Framework**: Unity Test Framework (EditMode & PlayMode).
- **Scope**: Flight physics verification, Drone state transitions, Scenario completion logic.

## 2. Integration Testing
- **Backend-Database**: Verify data persistence and transaction integrity with PostgreSQL.
- **App-Backend**: Verify telemetry transmission reliability under 20ms latency constraints.

## 3. Mixed Reality Testing (On Device)
- **Spatial Mapping Accuracy**: Verify mesh alignment with real-world objects.
- **Performance**: Monitor FPS on HoloLens 2 (Target: stable 60 FPS).
- **Latency**: Measure end-to-end signal delay from RC Transmitter to Drone response.

## 4. User Acceptance Testing (UAT)
- **Pilot Feedback**: Evaluate "flight feel" and control responsiveness.
- **Dashboard Usability**: Verify clarity of Recharts visualizations.
