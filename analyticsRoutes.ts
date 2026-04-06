import { Router } from 'express';
import { getSummary, getTrends } from './analyticsController.js';

const router = Router();

router.get('/summary', getSummary);
router.get('/trends', getTrends);

export default router;
