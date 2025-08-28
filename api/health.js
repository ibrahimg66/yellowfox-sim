import { pool } from '../lib/db.js';

export default async function handler(req, res) {
  try {
    // 1) einfache DB-Probe
    const ping = await pool.query('select current_database() as db, current_user as usr, 1 as ok');

    // 2) prüfen, ob Tabelle 'vehicles' existiert
    const rel = await pool.query(`
      select to_regclass('public.vehicles') as vehicles_tbl,
             to_regclass('public.drivers')  as drivers_tbl
    `);

    res.status(200).json({
      status: 'up',
      db: ping.rows[0],
      tables: rel.rows[0]
    });
  } catch (e) {
    res.status(500).json({ status: 'down', error: String(e) });
  }
}
