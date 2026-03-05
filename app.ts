import express from 'express';
// Note: If this fails, try: import * as express from 'express';

import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import sessionRoutes from './routes/sessionRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/session', sessionRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'AERO-MR API is online' });
});

app.use(errorHandler);

export default app;
