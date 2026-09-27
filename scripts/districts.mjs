// Downloads the openly licensed Wikimedia Commons photos behind the district intro art and records
// their credits. The in-browser tool (/?districts=1) turns them into palette pixel art.
// Usage: node scripts/districts.mjs
import { mkdirSync, writeFileSync } from 'node:fs';

export const SOURCES = {
  ballard: { title: 'File:Hiram M Chittenden Locks pano 03.jpg', crop: [0.46, 0, 0.36, 1] },        // fishing fleet at the Locks
  fremont: { title: 'File:Fremont troll.jpg', crop: [0.08, 0, 0.84, 1] },                           // the Troll
  capitolhill: { title: 'File:Rainbow crosswalk Capitol Hill, Seattle.jpg', crop: [0, 0.08, 0.82, 0.84] }, // rainbow crosswalk
  westseattle: { title: 'File:Seattle Skyline from Alki (4230478801).jpg', crop: [0, 0.12, 1, 0.84] }, // downtown from Alki, Space Needle included
  queenanne: { title: 'File:Seattle Kerry Park Skyline.jpg', crop: [0, 0, 1, 1] },                   // Kerry Park view
  alki: { title: 'File:Alki Beach, Seattle, April 2012.JPG', crop: [0, 0.14, 1, 0.42] },             // the beach itself
};
const UA = 'PlumberWarsGame/1.0 (https://timknab.dev; pixel-art district intros)';
const strip = h => String(h || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const credits = {};
mkdirSync('tools/district-src', { recursive: true });
for (const [key, s] of Object.entries(SOURCES)) {
  const api = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1400&titles=${encodeURIComponent(s.title)}`;
  const page = Object.values((await (await fetch(api, { headers: { 'User-Agent': UA } })).json()).query.pages)[0];
  const ii = page.imageinfo[0], m = ii.extmetadata;
  const img = await fetch(ii.thumburl, { headers: { 'User-Agent': UA } });
  writeFileSync(`tools/district-src/${key}.jpg`, Buffer.from(await img.arrayBuffer()));
  credits[key] = { title: s.title.replace(/^File:/, ''), artist: strip(m.Artist?.value), license: m.LicenseShortName?.value, licenseUrl: m.LicenseUrl?.value || null, source: ii.descriptionurl, crop: s.crop };
  console.log(key.padEnd(12), credits[key].license.padEnd(14), credits[key].artist);
  await new Promise(r => setTimeout(r, 1500));
}
writeFileSync('public/districts/credits.json', JSON.stringify(credits, null, 2) + '\n');
