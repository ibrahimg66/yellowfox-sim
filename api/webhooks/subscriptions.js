export const config = { runtime: 'nodejs20.x' };
import { pool } from '../../lib/db.js';
import { requireAuth } from '../../lib/auth.js';
import { created, error } from '../../lib/utils.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  try{
    requireAuth(req);
    if (req.method !== 'POST') return res.status(405).end();
    const { url, event_types, secret } = req.body || {};
    if (!url || !Array.isArray(event_types) || event_types.length===0)
      return res.status(400).json({ error: 'invalid_request', detail: 'url + event_types erforderlich' });
    const sec = secret && String(secret).length >= 16 ? secret : crypto.randomBytes(16).toString('hex');
    const { rows } = await pool.query(
      'insert into webhook_subscriptions(url, event_types, secret) values ($1,$2,$3) returning id, url, event_types, secret',
      [url, event_types, sec]
    );
    return created(res, rows[0]);
  }catch(e){ return error(res, e.status || 500, e.status ? 'unauthorized' : 'server_error'); }
}
