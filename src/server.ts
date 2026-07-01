import { env } from './config/env';
import { connectDB } from './config/db';
import app from './app';

const start = async (): Promise<void> => {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT}`);
    console.log(`📋 Health check: http://localhost:${env.PORT}/health`);
  });
};

start();
