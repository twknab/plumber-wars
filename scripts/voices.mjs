// Pre-renders every spoken line with Google Cloud Text-to-Speech (Chirp 3 HD voices) into public/voice/.
// Usage: node scripts/voices.mjs [PROJECT_ID]   (needs `gcloud auth login`; only renders lines that are missing)
import { execSync } from 'node:child_process';
import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'node:fs';
import { TRASH, HEROES, VOICE_EXTRA } from '../src/data/content.js';
import { voiceKey, speakable } from '../src/core/voicekey.js';

const project = process.argv[2] || 'twk-experiments';
const VOICES = { randy: 'en-US-Chirp3-HD-Algenib', skeeter: 'en-US-Chirp3-HD-Puck', dalton: 'en-US-Chirp3-HD-Orus', milan: 'en-US-Chirp3-HD-Charon', jared: 'en-US-Chirp3-HD-Achird' };

const lines = [];
const add = (who, arr) => arr.forEach(t => lines.push({ who, text: t }));
add('randy', [...TRASH.taunt, ...TRASH.ram, ...TRASH.hurt, ...TRASH.win, ...TRASH.lose, ...TRASH.steal, ...VOICE_EXTRA.randy]);
add('skeeter', TRASH.throw);
for (const h of HEROES) add(h.id, h.barks);

mkdirSync('public/voice', { recursive: true });
const manPath = 'public/voice/manifest.json';
const manifest = existsSync(manPath) ? JSON.parse(readFileSync(manPath, 'utf8')) : {};
const token = execSync('gcloud auth print-access-token').toString().trim();
let made = 0;
for (const { who, text } of lines) {
  const key = voiceKey(text), file = `${key}.mp3`;
  if (manifest[key] && existsSync('public/voice/' + file)) continue;
  const body = { input: { text: speakable(text) }, voice: { languageCode: 'en-US', name: VOICES[who] }, audioConfig: { audioEncoding: 'MP3', speakingRate: who === 'skeeter' ? 1.12 : 1.05, volumeGainDb: 4 } };
  const res = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'x-goog-user-project': project, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) { console.error('FAILED', who, text, res.status, (await res.text()).slice(0, 200)); continue; }
  writeFileSync('public/voice/' + file, Buffer.from((await res.json()).audioContent, 'base64'));
  manifest[key] = { f: file, who }; made++;
  process.stdout.write('.');
}
writeFileSync(manPath, JSON.stringify(manifest));
console.log(`\n${made} new clips, ${Object.keys(manifest).length} total`);
