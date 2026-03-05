import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const startSession = async (req: Request, res: Response) => {
    try {
        const { userId, missionId } = req.body;
        const session = await prisma.session.create({
            data: {
                userId,
                missionId,
                startTime: new Date(),
            }
        });
        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ error: 'Failed to start session' });
    }
};

export const endSession = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { totalCollisions, avgStabilityScore } = req.body;
        const session = await prisma.session.update({
            where: { id },
            data: {
                endTime: new Date(),
                totalCollisions,
                avgStabilityScore
            }
        });
        res.json(session);
    } catch (error) {
        res.status(500).json({ error: 'Failed to end session' });
    }
};

export const addMetrics = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const metricsData = req.body.metrics; // Array of metrics

        const count = await prisma.metric.createMany({
            data: metricsData.map((m: any) => ({
                ...m,
                sessionId
            }))
        });

        res.json({ message: 'Metrics added', count: count.count });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add metrics' });
    }
};

export const getUserSessions = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const sessions = await prisma.session.findMany({
            where: { userId },
            include: { mission: true },
            orderBy: { startTime: 'desc' }
        });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
};
