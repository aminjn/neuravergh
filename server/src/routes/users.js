import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { authRequired, roleRequired } from '../auth.js';

const router = express.Router();
const adminGuard = [authRequired, roleRequired('admin', 'superadmin')];

const PUBLIC_COLS = 'id, username, name, email, role, company, status, meta, created_at';

// لیست کاربران — صفحه‌بندی و جستجو (هرگز کل ۳M ردیف را نمی‌خوانیم)
router.get('/', ...adminGuard, async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 25, 100);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const q = (req.query.q || '').toString().trim();

  let where = '';
  const params = [];
  if (q) {
    params.push(`%${q}%`);
    where = `WHERE username ILIKE $1 OR email ILIKE $1 OR name ILIKE $1`;
  }
  params.push(limit, offset);
  const list = await query(
    `SELECT ${PUBLIC_COLS} FROM app_users ${where} ORDER BY id DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  const count = await query(`SELECT count(*)::int AS total FROM app_users ${where}`, q ? [params[0]] : []);
  res.json({ items: list.rows, total: count.rows[0].total, limit, offset });
});

// ساخت کاربر
router.post('/', ...adminGuard, async (req, res) => {
  const { username, password, name, email, role = 'user', company, meta } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username_password_required' });
  if (!['user', 'admin', 'superadmin'].includes(role)) return res.status(400).json({ error: 'bad_role' });
  // فقط سوپر‌ادمین می‌تواند سوپر‌ادمین/ادمین بسازد
  if (role !== 'user' && req.user.role !== 'superadmin') return res.status(403).json({ error: 'forbidden' });

  const hash = await bcrypt.hash(password, 10);
  try {
    const { rows } = await query(
      `INSERT INTO app_users (username, password_hash, name, email, role, company, meta)
         VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb) RETURNING ${PUBLIC_COLS}`,
      [username.trim(), hash, name || null, email || null, role, company || null, JSON.stringify(meta || {})]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'duplicate' });
    throw e;
  }
});

// به‌روزرسانی کاربر
router.put('/:id', ...adminGuard, async (req, res) => {
  const { name, email, role, company, status, password, meta } = req.body || {};
  if (role && req.user.role !== 'superadmin') return res.status(403).json({ error: 'forbidden' });

  const sets = [];
  const params = [];
  const add = (col, val) => { params.push(val); sets.push(`${col} = $${params.length}`); };
  if (name !== undefined) add('name', name);
  if (email !== undefined) add('email', email);
  if (role !== undefined) add('role', role);
  if (company !== undefined) add('company', company);
  if (status !== undefined) add('status', status);
  if (password) add('password_hash', await bcrypt.hash(password, 10));
  if (meta !== undefined) { params.push(JSON.stringify(meta)); sets.push(`meta = meta || $${params.length}::jsonb`); }
  if (!sets.length) return res.status(400).json({ error: 'nothing_to_update' });

  params.push(req.params.id);
  const { rows } = await query(
    `UPDATE app_users SET ${sets.join(', ')}, updated_at = now() WHERE id = $${params.length} RETURNING ${PUBLIC_COLS}`,
    params
  );
  if (!rows[0]) return res.status(404).json({ error: 'not_found' });
  res.json(rows[0]);
});

// حذف — فقط سوپر‌ادمین
router.delete('/:id', authRequired, roleRequired('superadmin'), async (req, res) => {
  const { rowCount } = await query('DELETE FROM app_users WHERE id = $1', [req.params.id]);
  if (!rowCount) return res.status(404).json({ error: 'not_found' });
  res.json({ ok: true });
});

export default router;
