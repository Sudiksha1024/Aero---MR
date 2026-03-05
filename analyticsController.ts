import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export const getSummary = async (req: Request, res: Response) => {
    try {
        const summary = await prisma.session.aggregate({
            _avg: {
                avgStabilityScore: true,
                totalCollisions: true
            },
            _count: {
                id: true
            }
        });
        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
};

export const getTrends = async (req: Request, res: Response) => {
    try {
        const trends = await prisma.session.findMany({
            take: 10,
            orderBy: { startTime: 'desc' },
            select: {
                startTime: true,
                totalCollisions: true,
                avgStabilityScore: true
            }
        });
        res.json(trends);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch trends' });
    }
};
