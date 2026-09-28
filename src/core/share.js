import { W, floatText } from './ui.js';
import { C } from './palette.js';

export const GAME_URL = 'https://plumberwars.timknab.dev';

// Share a brag: the phone's native share sheet when there is one, otherwise copy text + link.
export async function shareScore(scene, text) {
  const data = { title: 'Plumber Wars', text, url: GAME_URL };
  try {
    if (navigator.share && (!navigator.canShare || navigator.canShare(data))) { await navigator.share(data); return; }
    await navigator.clipboard.writeText(`${text} ${GAME_URL}`);
    floatText(scene, W / 2, 140, 'LINK COPIED!', C.lime, 200);
  } catch (e) {
    if (e && e.name === 'AbortError') return; // they closed the share sheet
    floatText(scene, W / 2, 140, 'COPY THIS: ' + GAME_URL.replace('https://', ''), C.yellow, 200);
  }
}
