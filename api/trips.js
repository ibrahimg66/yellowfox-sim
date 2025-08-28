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
    if (req.query.vehicle_id){ params.push(req.query.vehicle_id); where += ` and vehicle_id = $${params.length}`; }
    if (req.query.from){ params.push(req.query.from); where += ` and start_at >= $${params.length}`; }
    if (req.query.to){ params.push(req.query.to);   where += ` and end_at <= $${params.length}`; }
    if (cursor) { const [ts] = unbase64(cursor).split(':'); params.push(ts); where += ` and start_at < $${params.length}`; }

    const q = `select id, vehicle_id, driver_id, start_at, end_at, start_lat, start_lon, end_lat, end_lon, distance_km, type
      from trips where ${where} order by start_at desc limit ${limit+1}`;
    const { rows } = await pool.query(q, params);
    const next = rows.length > limit ? rows.pop() : null;
    const next_cursor = next ? base64(String(next.start_at)) : null;
    return ok(res, { data: rows, next_cursor });
  }catch(e){ return error(res, e.status || 500, e.status ? 'unauthorized' : 'server_error'); }
}
