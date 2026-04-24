/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const migrationsDir = path.join(__dirname, '..', 'lib', 'db', 'migrations');
const files = ['001_auth_smtp_mail.sql', '002_audit_logs.sql'];

(async () => {
  const client = new Client({
    host: process.env.DB_HOST || '10.147.1.219',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'devuser',
    password: process.env.DB_PASSWORD || 'devpass123!',
    database: process.env.DB_NAME || 'devdb',
  });

  await client.connect();
  console.log('Connected to PostgreSQL');

  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`Applying ${file}...`);
      await client.query(sql);
      console.log(`✓ ${file} applied`);
    }

    const { rows } = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('\nTables created:');
    rows.forEach(r => console.log(' -', r.table_name));
  } finally {
    await client.end();
  }
})().catch(e => { console.error(e); process.exit(1); });
