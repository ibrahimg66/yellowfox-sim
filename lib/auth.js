import jwt from 'jsonwebtoken';

export function issueToken(clientId) {
  return jwt.sign({ sub: clientId }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

export function requireAuth(req) {
  const hdr = req.headers.authorization || '';
  const token = hdr.replace(/^Bearer\s+/i,'');
  try { return jwt.verify(token, process.env.JWT_SECRET); }
  catch {
    const e = new Error('unauthorized');
    e.status = 401;
    throw e;
  }
}
