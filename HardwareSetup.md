# AERO-MR Hardware Setup Guide

## 1. Microsoft HoloLens 2
- **Enable Developer Mode**: `Settings > Update & Security > For developers`.
- **Enable Device Portal**: `Settings > Update & Security > For developers > Remote Management`.
- **Calibration**: Ensure eye tracking and IPD calibration are completed for accurate 6-DoF tracking.

## 2. RC Transmitter Setup
### 2.1 USB Connection (Simulators)
- Connect your transmitter (e.g., FrSky, RadioMaster) to the PC/HoloLens via USB.
- Select `Gamepad/Joystick` mode on the transmitter.
- Unity will detect it as a standard HID device.

### 2.2 Serial/COM Connection
- Use a USB-to-TTL adapter if connecting directly to a PC.
- For HoloLens 2, use a Bluetooth-to-Serial module or a network bridge.
- Default settings: `115200 Baud, 8N1`.

## 3. Network Configuration
- Both HoloLens 2 and the Backend server must be on the same network.
- Use the server's IP address instead of `localhost` in the `PerformanceTracker` Unity script.
- Ensure ports `5000` (Backend) and `5173` (Dashboard) are open on the firewall.
