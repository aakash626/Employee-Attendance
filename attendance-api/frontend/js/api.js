/* Talking to the server: fetch wrapper, error text, toast messages, and the run() error guard. */
function errText(d, code) {
  if (d && typeof d.detail === 'string') return d.detail;
  if (d && Array.isArray(d.detail)) return d.detail.map(e => `${(e.loc || []).slice(1).join('.')}: ${e.msg}`).join('; ');
  return `Request failed (${code})`;
}
async function api(path, {method = 'GET', body, params} = {}) {
  const u = new URL(API + path);
  Object.entries(params || {}).forEach(([k, v]) => v !== '' && v != null && u.searchParams.set(k, v));
  let r;
  try { r = await fetch(u, {method, headers: body ? {'Content-Type': 'application/json'} : {}, body: body ? JSON.stringify(body) : undefined}); }
  catch { throw new Error('Cannot reach the API. Check that the server is running and the address above is right.'); }
  const d = await r.json().catch(() => null);
  if (!r.ok) throw new Error(errText(d, r.status));
  return d;
}
let tt;
function toast(msg, bad) { const t = $('toast'); t.textContent = msg; t.className = bad ? 'err' : ''; t.style.display = 'block'; clearTimeout(tt); tt = setTimeout(() => t.style.display = 'none', 4000); }
const run = fn => async (...a) => { try { await fn(...a); } catch (e) { toast(e.message, true); } };