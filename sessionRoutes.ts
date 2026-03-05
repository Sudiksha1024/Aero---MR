import { Router } from 'express';
import { startSession, endSession, addMetrics, getUserSessions } from '../controllers/sessionController.js';

const router = Router();

router.post('/', startSession);
router.put('/:id/end', endSession);
router.post('/:sessionId/metrics', addMetrics);
router.get('/user/:userId', getUserSessions);

export default router;
