import { useState, useEffect } from 'react'
import './App.css'
import { DASHBOARD_CONFIG } from './config.ts'
import { simulationService, FlightData, DashboardStats } from './simulationService.ts'
import { DroneVisualization } from './DroneVisualization.tsx'

function App() {
  const [dataMode, setDataMode] = useState<'MOCK' | 'SIMULATOR' | 'REALTIME'>(DASHBOARD_CONFIG.dataSourceMode)
  const [flightData, setFlightData] = useState<FlightData[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const { flightData: data, stats: newStats } = simulationService.updateData()
      setFlightData(data)
      setStats(newStats)
    }, DASHBOARD_CONFIG.refreshInterval)

    return () => clearInterval(interval)
  }, [])

  const handleModeChange = (mode: string) => {
    const newMode = mode as 'MOCK' | 'SIMULATOR' | 'REALTIME'
    setDataMode(newMode)

    if (newMode === 'SIMULATOR') {
      simulationService.start()
      setIsSimulating(true)
    } else {
      simulationService.stop()
      setIsSimulating(false)
    }
  }

  return (
    <div className="App">
      <header>
        <h1>AERO-MR Operational Intelligence Portal</h1>
        <div className="mode-selector">
          <select 
            value={dataMode} 
            onChange={(e) => handleModeChange(e.target.value)}
            className="mode-button"
          >
            <option value="MOCK">MOCK MODE</option>
            <option value="SIMULATOR">SIMULATOR</option>
            <option value="REALTIME">REALTIME</option>
          </select>
          {isSimulating && <span className="status-indicator">● SIMULATING</span>}
        </div>
      </header>
      <main>
        <section className="drone-visualization-container">
          <DroneVisualization isSimulating={isSimulating} dataMode={dataMode} />
        </section>

        <section className="stats-grid">
          {stats && (
            <>
              <div className="stat-card">
                <div className="stat-label">Avg Stability</div>
                <div className="stat-value">{stats.avgStability}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Safety Score</div>
                <div className="stat-value">{stats.safetyScore}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Active Drones</div>
                <div className="stat-value">{stats.activeDrones}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Collisions</div>
                <div className="stat-value">{stats.collisions}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Sessions</div>
                <div className="stat-value">{stats.totalSessions}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Training Hours</div>
                <div className="stat-value">{stats.trainingHours}</div>
              </div>
            </>
          )}
        </section>

        <section className="flight-data">
          <h2>Flight Telemetry</h2>
          <div className="data-table">
            <div className="table-header">
              <div>Drone</div>
              <div>Stability</div>
              <div>Sync</div>
              <div>Smoothness</div>
              <div>Battery</div>
              <div>Collisions</div>
              <div>Time</div>
            </div>
            {flightData.map((drone) => (
              <div key={drone.name} className="table-row">
                <div className="drone-name">{drone.name}</div>
                <div className={`metric ${drone.stability > 85 ? 'good' : 'warning'}`}>
                  {drone.stability.toFixed(1)}%
                </div>
                <div className={`metric ${drone.sync > 85 ? 'good' : 'warning'}`}>
                  {drone.sync.toFixed(1)}%
                </div>
                <div className={`metric ${drone.smoothness > 75 ? 'good' : 'warning'}`}>
                  {drone.smoothness.toFixed(1)}%
                </div>
                <div className={`metric ${drone.battery > 30 ? 'good' : 'danger'}`}>
                  {drone.battery.toFixed(1)}%
                </div>
                <div className={`metric ${drone.collisions === 0 ? 'good' : 'danger'}`}>
                  {drone.collisions}
                </div>
                <div className="timestamp">{drone.timestamp}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
