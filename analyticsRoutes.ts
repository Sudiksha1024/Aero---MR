import { Router } from 'express';
import { getSummary, getTrends } from '../controllers/analyticsController.js';

const router = Router();

router.get('/summary', getSummary);
router.get('/trends', getTrends);

export default router;
