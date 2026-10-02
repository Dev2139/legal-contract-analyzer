import app from '../src/app';
import { connectDatabase } from '../src/config/database';

export default async function handler(req: any, res: any) {
  await connectDatabase();
  return app(req, res);
}
