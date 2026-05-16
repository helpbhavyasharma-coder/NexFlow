import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../../.env'), override: false });

export const env = {
  port: Number(process.env.PORT || process.env.SERVER_PORT || 5000),
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((url) => url.trim()),
  accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  adminEmail: process.env.ADMIN_EMAIL || 'owner@nexflow.dev',
  adminPassword: process.env.ADMIN_PASSWORD || 'bhauu@owner',
};
