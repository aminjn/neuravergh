import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// یک Pool واحد برای کل برنامه — مناسب مقیاس و چند اتصال هم‌زمان.
export const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, max: 20 }
    : {
        host: process.env.PGHOST || 'localhost',
        port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER || 'neura',
        password: process.env.PGPASSWORD || 'neura',
        database: process.env.PGDATABASE || 'neura',
        max: 20,
      }
);

export const query = (text, params) => pool.query(text, params);

pool.on('error', (err) => {
  console.error('Unexpected PG pool error:', err);
});
