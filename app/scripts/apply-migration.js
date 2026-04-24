/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

(async () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db', 'migrations', '001_auth_smtp_mail.sql'), 'utf8');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });
  try {
    console.log('Applying migration 001_auth_smtp_mail.sql...');
    await conn.query(sql);
    console.log('✓ migration applied');

    const [t] = await conn.query("SHOW TABLES LIKE 'users'");
    console.log('users table:', t);
    const [s] = await conn.query("SHOW TABLES LIKE 'smtp_settings'");
    console.log('smtp_settings table:', s);
    const [m] = await conn.query("SHOW TABLES LIKE 'mail_send_logs'");
    console.log('mail_send_logs table:', m);
  } finally {
    await conn.end();
  }
})().catch(e => { console.error(e); process.exit(1); });
