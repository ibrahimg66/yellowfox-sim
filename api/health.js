import { pool } from '../lib/db.js';

export default async function handler(req, res) {
  try {
    const u = process.env.DATABASE_URL || '';
    // sicher parsen ohne Benutzer/Passwort zu verraten
    let parsed = null;
    try {
      const url = new URL(u);
      parsed = { protocol: url.protocol, host: url.host, pathname: url.pathname };
    } catch { parsed = { protocol: null, host: null, pathname: null }; }

    // DB-Ping und Tabellen-Check
    const ping = await pool.query('select current_database() as db, current_user as usr, 1 as ok');
    const rel = await pool.query(`
      select to_regclass('public.vehicles') as vehicles_tbl,
             to_regclass('public.drivers')  as drivers_tbl
    `);

    res.status(200).json({
      status: 'up',
      url: parsed,                 // zeigt z.B. host: "ep-rapid-water-...neon.tech"
      db: ping.rows[0],
      tables: rel.rows[0]
    });
  } catch (e) {
    // auch im Fehlerfall die (maskierten) URL-Infos mitgeben
    let parsed = null;
    try {
      const url = new URL(process.env.DATABASE_URL||'');
      parsed = { protocol: url.protocol, host: url.host, pathname: url.pathname };
    } catch { parsed = { protocol: null, host: null, pathname: null }; }
    res.status(500).json({ status: 'down', url: parsed, error: String(e) });
  }
}
