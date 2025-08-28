export function ok(res, data) { res.status(200).json(data); }
export function created(res, data) { res.status(201).json(data); }
export function noContent(res) { res.status(204).end(); }
export function error(res, status=500, message='server_error') { res.status(status).json({ error: message }); }
export function getLimit(query, def=100, max=1000) {
  const n = parseInt(query.limit ?? def, 10);
  return Math.min(Math.max(n,1), max);
}
export function base64(v){ return Buffer.from(v,'utf8').toString('base64'); }
export function unbase64(v){ return Buffer.from(v,'base64').toString('utf8'); }
