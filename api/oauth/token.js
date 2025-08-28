export const config = { runtime: 'nodejs20.x' };
import { issueToken } from '../../lib/auth.js';

export default async function handler(req, res) {
  try{
    if (req.method !== 'POST') return res.status(405).end();
    const ct = (req.headers['content-type']||'').toLowerCase();
    const body = ct.includes('application/x-www-form-urlencoded')
      ? Object.fromEntries(new URLSearchParams(req.body))
      : req.body;
    const { grant_type, client_id, client_secret } = body || {};
    if (grant_type !== 'client_credentials') return res.status(400).json({ error: 'unsupported_grant_type' });
    if (client_id !== process.env.CLIENT_ID || client_secret !== process.env.CLIENT_SECRET)
      return res.status(401).json({ error: 'invalid_client' });
    return res.json({ access_token: issueToken(client_id), token_type: 'Bearer', expires_in: 3600 });
  }catch(e){ return res.status(500).json({ error: 'server_error', detail: String(e) }); }
}
