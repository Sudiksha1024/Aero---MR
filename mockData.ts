export const generateMockFlightData = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        name: `S-${100 + i}`,
        stability: 85 + Math.random() * 12,
        sync: 80 + Math.random() * 15,
        collisions: Math.floor(Math.random() * 3),
        smoothness: 70 + Math.random() * 25,
        battery: 100 - (i * 2),
        timestamp: new Date(Date.now() - (count - i) * 60000).toLocaleTimeString(),
    }));
};

export const getMockStats = () => ({
    avgStability: "96.4%",
    totalSessions: 142,
    collisions: 3,
    activeDrones: 1,
    safetyScore: 98,
    trainingHours: "12.5h"
});
