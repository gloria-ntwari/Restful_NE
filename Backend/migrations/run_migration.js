const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../auth_service/.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'gloria_2007',
  database: process.env.DB_NAME || 'car_parking',
});

async function run() {
  try {
    console.log('Connecting to database and running migration...');
    const sql = fs.readFileSync(path.join(__dirname, 'add_otp_fields.sql'), 'utf8');
    await pool.query(sql);
    console.log('✅ Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await pool.end();
  }
}

run();
