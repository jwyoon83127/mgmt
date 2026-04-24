import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || '10.147.1.219',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'devuser',
  password: process.env.DB_PASSWORD || 'devpass123!',
  database: process.env.DB_NAME || 'devdb',
  max: 10,
  idleTimeoutMillis: 30000,
});

export default pool;
