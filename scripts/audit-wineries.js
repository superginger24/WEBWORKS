// Prospecting audit: checks winery websites for objective signs of a dated site.
// Run:  node scripts/audit-wineries.js
const ids = {
  'Renteria Wines': '11015/renteria-wines', 'Revana Family Vineyard': '11069/revana-family-vineyard',
  'Reverie Winery': '17731/reverie-winery', 'Revival Made': '11076/revival-made',
  'Reynolds Family Winery': '11083/reynolds-family-winery', 'Richard Perry Vineyards': '11105/richard-perry-vineyards',
  'Ritchie Creek Vineyard': '11159/ritchie-creek-vineyard', 'Robert Biale Vineyards': '11222/robert-biale-vineyards',
  'Robert Craig Winery': '11226/robert-craig-winery', 'Robinson Family Vineyards': '11262/robinson-family-vineyards',
  'Romeo Vineyards & Cellars': '11348/romeo-vineyards-cellars', 'RustRidge Ranch & Winery': '11467/rustridge-ranch-winery',
  'Rutherford Ranch Winery': '11491/rutherford-ranch-winery', 'Sabina Vineyards': '11498/sabina-vineyards',
  'Saddleback Cellars': '11503/saddleback-cellars', 'Salvestrin': '11588/salvestrin',
  'Scarecrow Wine': '11885/scarecrow-wine', 'Schrader Cellars': '11901/schrader-cellars-llc',
  'Schweiger Vineyards': '11904/schweiger-vineyards', 'Sciandri Family Vineyards': '11905/sciandri-family-vineyards',
  'Seven Apart Winery': '43242/seven-apart-winery', 'Shadowbox Cellars': '43222/shadowbox-cellars',
  'Shadybrook Estate Winery': '42916/shadybrook-estate-winery', 'Silenus Winery': '12197/silenus-winery',
  'Silver Trident Winery': '17227/silver-trident-winery', 'Sinegal Estate Winery': '17981/sinegal-estate-winery',
  'Smith-Madrone Vineyard': '12349/smith-madrone-vineyard', 'Sequoia Grove Winery': '17747/sequoia-grove-winery',
  'Rudd Oakville Estate': '11433/rudd-oakville-estate', 'Goosecross Cellars': '5614/goosecross-cellars',
  'Prager Winery & Port Works': '10595/prager-winery-port-works', 'Bennett Lane Winery': '1242/bennett-lane-winery',
  'Canard Vineyard': '2385/canard-vineyard', 'Bell Wine Cellars': '1185/bell-wine-cellars'
};

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';
const thisYear = 2026;

async function get(url, ms = 15000) {
  const t0 = Date.now();
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { redirect: 'follow', signal: ctl.signal, headers: { 'user-agent': UA, accept: 'text/html' } });
    const text = await r.text();
    return { ok: r.ok, status: r.status, url: r.url, text, ms: Date.now() - t0 };
  } catch (e) {
    return { ok: false, status: 0, url, text: '', ms: Date.now() - t0, err: String(e.name || e) };
  } finally { clearTimeout(timer); }
}

async function findSite(path) {
  const r = await get('https://www.napavalley.com/businesses/' + path);
  if (!r.text) return null;
  const m = r.text.match(/href="(https?:\/\/[^"]*utm_campaign=visitwebsite[^"]*)"/i)
         || r.text.match(/href="(https?:\/\/[^"]+)"[^>]*>\s*(?:<[^>]+>\s*)*(?:VISIT WEBSITE|Visit Website|Website)/i);
  if (!m) return null;
  return m[1].replace(/&amp;/g, '&').split('?')[0];
}

function audit(r) {
  const h = r.text;
  const found = []; let score = 0;
  const add = (pts, why) => { score += pts; found.push(why); };

  if (!r.ok) return { score: -1, found: ['could not load (' + (r.status || r.err) + ')'] };
  if (!/^https:/i.test(r.url)) add(3, 'no HTTPS (browser shows "Not secure")');
  if (!/<meta[^>]+name=["']viewport["']/i.test(h)) add(4, 'no mobile viewport tag (not mobile-friendly)');
  const years = [...h.matchAll(/(?:&copy;|©|copyright)[^<]{0,40}?(19\d\d|20\d\d)(?:\s*[-–]\s*(20\d\d))?/gi)]
    .map(m => parseInt(m[2] || m[1], 10));
  if (years.length) {
    const y = Math.max(...years);
    if (y <= thisYear - 3) add(3, 'footer copyright stuck at ' + y);
  }
  if (/<table[^>]*(width|cellpadding|cellspacing|border)=/i.test(h) && (h.match(/<table/gi) || []).length >= 3) add(3, 'table-based layout (old-school build)');
  if (/<font[\s>]|<center>|<marquee|<frameset|<blink/i.test(h)) add(3, 'ancient HTML tags (font/center/marquee/frames)');
  if (/swfobject|\.swf|shockwave-flash/i.test(h)) add(4, 'Flash content');
  if (/jquery[-.]?(1\.[0-9]|2\.)/i.test(h)) add(1, 'very old jQuery version');
  if (/under construction|coming soon/i.test(h) && h.length < 20000) add(2, 'looks unfinished ("coming soon"/"under construction")');
  if (r.ms > 4000) add(2, 'slow to load (' + (r.ms / 1000).toFixed(1) + 's)');
  const title = (h.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, ''])[1].trim();
  if (!title) add(1, 'missing page title');
  else if (/^(home|welcome|untitled)/i.test(title)) add(1, 'generic page title: "' + title.slice(0, 40) + '"');
  if (!/<meta[^>]+name=["']description["']/i.test(h)) add(1, 'no meta description (weak for Google)');
  if (!/og:image/i.test(h)) add(1, 'no social share image set');
  const imgs = [...h.matchAll(/<img\b[^>]*>/gi)].map(m => m[0]);
  const noAlt = imgs.filter(t => !/\balt=/i.test(t)).length;
  if (imgs.length >= 5 && noAlt / imgs.length > 0.6) add(1, noAlt + ' of ' + imgs.length + ' images missing alt text');
  const builder = /wix\.com|wixstatic/i.test(h) ? 'Wix' : /squarespace/i.test(h) ? 'Squarespace'
    : /godaddy|wsimg\.com/i.test(h) ? 'GoDaddy builder' : /weebly/i.test(h) ? 'Weebly'
    : /wp-content/i.test(h) ? 'WordPress' : /shopify/i.test(h) ? 'Shopify' : '';
  if (/godaddy|wsimg\.com|weebly/i.test(h)) add(2, 'built on a basic DIY builder (' + builder + ')');
  return { score, found, title: title.slice(0, 60), builder, kb: Math.round(h.length / 1024) };
}

(async () => {
  const names = Object.keys(ids);
  const out = [];
  const queue = names.slice();
  async function worker() {
    while (queue.length) {
      const name = queue.shift();
      const site = await findSite(ids[name]);
      if (!site) { out.push({ name, site: null, score: -2, found: ['no website link found'] }); continue; }
      const r = await get(site);
      const a = audit(r);
      out.push({ name, site, finalUrl: r.url, ...a });
      process.stderr.write('.');
    }
  }
  await Promise.all(Array.from({ length: 5 }, worker));
  out.sort((a, b) => b.score - a.score);
  require('fs').writeFileSync('/tmp/winery-audit.json', JSON.stringify(out, null, 2));
  for (const o of out) {
    console.log(`\n[${o.score}] ${o.name}  ${o.site || ''}`);
    if (o.builder) console.log('    built on: ' + o.builder);
    (o.found || []).forEach(f => console.log('    - ' + f));
  }
})();
