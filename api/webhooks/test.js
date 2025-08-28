export const config = { runtime: 'nodejs' };
import { pool } from '../../lib/db.js';
import { requireAuth } from '../../lib/auth.js';
import { noContent } from '../../lib/utils.js';
import { fetch } from 'undici';
import crypto from 'crypto';

export default async function handler(req, res) {
  try{
    requireAuth(req);
    if (req.method !== 'POST') return res.status(405).end();
    const { subscription_id, sample='position' } = req.body || {};
    const subs = subscription_id
      ? (await pool.query('select * from webhook_subscriptions where id=$1',[subscription_id])).rows
      : (await pool.query('select * from webhook_subscriptions order by created_at desc limit 10')).rows;

    const payload = buildSample(sample);
    for (const s of subs){
      const sig = crypto.createHmac('sha256', s.secret).update(JSON.stringify(payload)).digest('hex');
      await fetch(s.url, { method:'POST', headers:{ 'content-type':'application/json', 'x-yfsig': sig }, body: JSON.stringify(payload) }).catch(()=>{});
    }
    return noContent(res);
  }catch(e){
    return res.status(e.status||500).json({ error: e.status? 'unauthorized':'server_error', detail:String(e) });
  }
}

function buildSample(sample){
  const now = new Date().toISOString();
  if (sample==='event') return { type:'event', occurred_at:now, vehicle_id:'veh_berlin_1', event_type:'overspeed', payload:{ limit:50, speed:72 } };
  if (sample==='trip') return { type:'trip', id:'trip_demo', vehicle_id:'veh_berlin_1', start_at:now, end_at:now, distance_km: 4.2 };
  return { type:'position', vehicle_id:'veh_berlin_1', occurred_at: now, lat:52.52, lon:13.405, speed_kmh: 31, ignition: true };
}
