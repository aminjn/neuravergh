import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { pool, query } from './db.js';
import { collections } from './seed-data.js';

dotenv.config();

async function seedSuperAdmin() {
  const username = process.env.SUPERADMIN_USERNAME || 'superadmin';
  const password = process.env.SUPERADMIN_PASSWORD || 'Admin@12345';
  const email = process.env.SUPERADMIN_EMAIL || 'admin@neura.app';
  const hash = await bcrypt.hash(password, 10);
  // فقط اگر وجود ندارد ساخته شود — تا رمز/تغییرات بعدی با هر دیپلوی پاک نشود
  await query(
    `INSERT INTO app_users (username, password_hash, name, email, role, company)
       VALUES ($1, $2, 'مدیر ارشد', $3, 'superadmin', 'alpha')
     ON CONFLICT (username) DO NOTHING`,
    [username, hash, email]
  );
  console.log(`✓ superadmin ready (username: ${username})`);
}

async function seedDocuments() {
  let total = 0;
  for (const [collection, items] of Object.entries(collections)) {
    for (const item of items) {
      // insert-if-missing — تا ویرایش‌های کاربر (نام مدل‌ها، کلید API، انتساب‌ها) با re-seed پاک نشود
      await query(
        `INSERT INTO documents (collection, id, company, data)
           VALUES ($1, $2, $3, $4::jsonb)
         ON CONFLICT (collection, id) DO NOTHING`,
        [collection, String(item.id), item.company || null, JSON.stringify(item)]
      );
      total++;
    }
    console.log(`  • ${collection}: ${items.length}`);
  }
  console.log(`✓ documents seeded (${total})`);
}

async function run() {
  await seedSuperAdmin();
  await seedDocuments();
  await pool.end();
  console.log('✓ seed done');
}

run().catch((e) => {
  console.error('seed failed:', e);
  process.exit(1);
});
