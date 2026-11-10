// Cloudflare Worker: videresender kall til MET Frost og legger på klient-ID-en.
// Nettleseren kaller denne i stedet for frost.met.no, så CORS blir ikke et problem og ID-en slipper å ligge i siden.
// Sett miljøvariabelen FROST_ID (Settings > Variables and Secrets) til din klient-ID.
export default {
  async fetch(req, env) {
    const cors = { 'Access-Control-Allow-Origin': '*' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: { ...cors, 'Access-Control-Allow-Methods': 'GET', 'Access-Control-Allow-Headers': '*' } });
    if (req.method !== 'GET') return new Response('Method not allowed', { status: 405, headers: cors });
    const url = new URL(req.url);
    if (!/^\/(sources|observations)\//.test(url.pathname)) return new Response('Not found', { status: 404, headers: cors });
    const r = await fetch('https://frost.met.no' + url.pathname + url.search, {
      headers: { Authorization: 'Basic ' + btoa(env.FROST_ID + ':') },
      cf: { cacheTtl: 300, cacheEverything: true }
    });
    return new Response(r.body, { status: r.status, headers: { ...cors, 'Content-Type': r.headers.get('Content-Type') || 'application/json' } });
  }
};
