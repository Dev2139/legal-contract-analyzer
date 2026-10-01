import app from './app';
import { config } from './config/env';
import { connectDatabase } from './config/database';

async function startServer() {
  try {
    await connectDatabase();
    app.listen(config.port, () => {
      console.log(`===================================================`);
      console.log(`Legal Contract Analyzer API Server running on port ${config.port}`);
      console.log(`MongoDB URI: ${config.mongodbUri}`);
      console.log(`OpenAI Model: ${config.openaiModel}`);
      console.log(`===================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
