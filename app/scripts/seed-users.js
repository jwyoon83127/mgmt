/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const seeds = [
  { id: 'admin-001', email: 'admin',                name: '관리자',     role: 'admin', password: '1234' },
  { id: 'exec-001',  email: 'junchang@humuson.com', name: '전순창 이사', role: 'user',  password: 'humuson1234' },
  { id: 'exec-002',  email: 'heeyong@humuson.com',  name: '원희용 이사', role: 'user',  password: 'humuson1234' },
  { id: 'exec-003',  email: 'hyoseok@humuson.com',  name: '차효석 리더', role: 'user',  password: 'humuson1234' },
  { id: 'exec-004',  email: 'byungho@humuson.com',  name: '김병호 리더', role: 'user',  password: 'humuson1234' },
];

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  try {
    for (const s of seeds) {
      const [rows] = await conn.query('SELECT id FROM users WHERE email = ? LIMIT 1', [s.email]);
      if (rows.length > 0) { console.log(`- ${s.email}: 이미 존재, 건너뜀`); continue; }
      const hash = await bcrypt.hash(s.password, 10);
      await conn.query(
        'INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        [s.id, s.email, s.name, hash, s.role]
      );
      console.log(`✓ ${s.email} (${s.name}) 생성`);
    }
    const [total] = await conn.query('SELECT COUNT(*) as cnt FROM users WHERE deleted_at IS NULL');
    console.log(`총 사용자: ${total[0].cnt}명`);
  } finally {
    await conn.end();
  }
})().catch(e => { console.error(e); process.exit(1); });
