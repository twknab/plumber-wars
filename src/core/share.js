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

// Share the score card image + brag text. Phones get the share sheet with the picture attached; browsers that
// can't share files share the text; desktop saves the card and copies the text + link.
export async function shareCard(scene, canvas, text) {
  const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
  const file = new File([blob], 'plumber-wars-score.png', { type: 'image/png' });
  const withFile = { title: 'Plumber Wars', text: `${text} ${GAME_URL}`, files: [file] };
  try {
    if (navigator.canShare && navigator.canShare(withFile)) { await navigator.share(withFile); return 'shared'; }
    if (navigator.share) { await navigator.share({ title: 'Plumber Wars', text, url: GAME_URL }); return 'shared'; }
  } catch (e) { if (e && e.name === 'AbortError') return 'cancelled'; }
  // desktop: save the card and copy the brag
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  try { await navigator.clipboard.writeText(`${text} ${GAME_URL}`); } catch (e) { /* clipboard blocked: the saved card still has the link */ }
  floatText(scene, W / 2, 140, 'CARD SAVED + LINK COPIED!', C.lime, 400);
  return 'saved';
}
