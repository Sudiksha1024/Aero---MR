export interface FlightData {
  name: string;
  stability: number;
  sync: number;
  collisions: number;
  smoothness: number;
  battery: number;
  timestamp: string;
}

export interface DashboardStats {
  avgStability: string;
  totalSessions: number;
  collisions: number;
  activeDrones: number;
  safetyScore: number;
  trainingHours: string;
}

class SimulationService {
  private flightData: FlightData[] = [];
  private stats: DashboardStats;
  private isRunning = false;

  constructor() {
    this.flightData = this.generateInitialData();
    this.stats = this.calculateStats();
  }

  private generateInitialData(): FlightData[] {
    return Array.from({ length: 8 }).map((_, i) => ({
      name: `S-${100 + i}`,
      stability: 85 + Math.random() * 12,
      sync: 80 + Math.random() * 15,
      collisions: Math.floor(Math.random() * 3),
      smoothness: 70 + Math.random() * 25,
      battery: 100 - (i * 2),
      timestamp: new Date().toLocaleTimeString(),
    }));
  }

  private calculateStats(): DashboardStats {
    const avgStability = (
      this.flightData.reduce((sum, d) => sum + d.stability, 0) / this.flightData.length
    ).toFixed(1);

    return {
      avgStability: `${avgStability}%`,
      totalSessions: 142,
      collisions: this.flightData.reduce((sum, d) => sum + d.collisions, 0),
      activeDrones: this.flightData.length,
      safetyScore: Math.round(parseFloat(avgStability) + 2),
      trainingHours: "12.5h",
    };
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
  }

  stop(): void {
    this.isRunning = false;
  }

  updateData(): { flightData: FlightData[]; stats: DashboardStats } {
    if (this.isRunning) {
      // Update existing data with slight variations
      this.flightData = this.flightData.map((drone) => ({
        ...drone,
        stability: Math.max(50, Math.min(100, drone.stability + (Math.random() - 0.5) * 5)),
        sync: Math.max(50, Math.min(100, drone.sync + (Math.random() - 0.5) * 5)),
        smoothness: Math.max(50, Math.min(100, drone.smoothness + (Math.random() - 0.5) * 5)),
        battery: Math.max(0, drone.battery - Math.random() * 0.5),
        collisions: drone.collisions + (Math.random() > 0.95 ? 1 : 0),
        timestamp: new Date().toLocaleTimeString(),
      }));

      this.stats = this.calculateStats();
    }

    return {
      flightData: this.flightData,
      stats: this.stats,
    };
  }
}

export const simulationService = new SimulationService();
