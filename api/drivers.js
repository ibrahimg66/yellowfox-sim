export const config = { runtime: 'nodejs20.x' };
import { pool } from '../lib/db.js';
import { requireAuth } from '../lib/auth.js';
import { ok, error, getLimit, unbase64, base64 } from '../lib/utils.js';

export default async function handler(req, res) {
  try{
    requireAuth(req);
    const { cursor } = req.query;
    const limit = getLimit(req.query, 100, 1000);
    let where = '1=1';
    const params = [];
    if (cursor) { const lastId = unbase64(cursor); params.push(lastId); where += ` and id > $${params.length}`; }
    const q = `select id, name, card_id from drivers
      where ${where} order by id asc limit ${limit+1}`;
    const { rows } = await pool.query(q, params);
    const next = rows.length > limit ? rows.pop() : null;
    const next_cursor = next ? base64(String(next.id)) : null;
    return ok(res, { data: rows, next_cursor });
  }catch(e){ return error(res, e.status || 500, e.status ? 'unauthorized' : 'server_error'); }
}
