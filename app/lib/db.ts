import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || '119.207.76.94',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'amail0722',
  database: process.env.DB_NAME || 'meeting_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
