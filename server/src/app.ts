import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import documentRoutes from './routes/documentRoutes';
import conversationRoutes from './routes/conversationRoutes';
import chatRoutes from './routes/chatRoutes';
import comparisonRoutes from './routes/comparisonRoutes';
import researchRoutes from './routes/researchRoutes';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Root & Health Check Endpoints
app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Legal Contract Analyzer API is running', health: '/api/health' });
});

app.get('/api', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Legal Contract Analyzer API', health: '/api/health' });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/documents', documentRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/comparison', comparisonRoutes);
app.use('/api/research', researchRoutes);

// Global Error Handler Middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected internal server error occurred',
  });
});

export default app;
