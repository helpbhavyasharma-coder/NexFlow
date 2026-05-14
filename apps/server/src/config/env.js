import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || process.env.SERVER_PORT || 5000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
};
