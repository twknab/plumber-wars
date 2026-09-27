import Phaser from 'phaser';
import { W, setH } from './core/ui.js';
import { Boot } from './scenes/Boot.js';
import { Gallery } from './scenes/Gallery.js';
import { Title } from './scenes/Title.js';
import { Crew } from './scenes/Crew.js';
import { MapScene } from './scenes/Map.js';
import { Brief } from './scenes/Brief.js';
import { Drive } from './scenes/Drive.js';
import { Arrival } from './scenes/Arrival.js';
import { Repair } from './scenes/Repair.js';
import { Result } from './scenes/Result.js';
import { Finale } from './scenes/Finale.js';
import { Pause } from './scenes/Pause.js';
import { About } from './scenes/About.js';
import { Splash } from './scenes/Splash.js';

// Portrait, mobile-first: fixed 270px-wide pixel canvas; height stretches to fill tall phones.
const aspect = Math.max(1.5, Math.min(2.2, window.innerHeight / Math.max(1, window.innerWidth)));
// Phones held sideways at load still get a portrait-shaped game (the CSS asks them to rotate).
const touchLandscape = window.innerWidth > window.innerHeight && matchMedia('(pointer: coarse)').matches;
// Never shorter than 560: below that the title skyline collides with the logo and buttons.
const MIN_H = 560;
const H = Math.max(MIN_H, window.innerWidth > window.innerHeight ? (touchLandscape ? Math.round(W * Math.min(2.2, window.innerWidth / Math.max(1, window.innerHeight))) : MIN_H) : Math.round(W * aspect));
setH(H);

const scenes = [Boot, Splash, Title, Crew, MapScene, Brief, Drive, Arrival, Repair, Result, Finale, Pause, About];
if (import.meta.env.DEV) scenes.push(Gallery);
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  width: W,
  height: H,
  backgroundColor: '#181425',
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  input: { activePointers: 3 },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: scenes,
});
window.__game = game;

// Pause everything when the tab/app is backgrounded.
// Keep tap -> game coordinates exact. Phones shift the page (address bar, safe areas) without always
// firing a resize, which leaves Phaser's cached canvas position stale and makes buttons miss.
// Pointer events fire before the touch/mouse events Phaser listens to, so refresh bounds here first.
const freshBounds = () => game.scale && game.scale.updateBounds();
window.addEventListener('pointerdown', freshBounds, { capture: true, passive: true });
window.addEventListener('touchstart', freshBounds, { capture: true, passive: true });
window.addEventListener('mousedown', freshBounds, { capture: true, passive: true });
window.visualViewport && window.visualViewport.addEventListener('resize', () => setTimeout(() => game.scale.refresh(), 50));
window.addEventListener('orientationchange', () => setTimeout(() => game.scale.refresh(), 300));
window.addEventListener('load', () => setTimeout(() => game.scale.refresh(), 100));

// Pause the action while the phone is sideways.
const mqLand = matchMedia('(orientation: landscape) and (pointer: coarse) and (max-height: 540px)');
mqLand.addEventListener?.('change', e => { if (e.matches) game.scene.getScenes(true).forEach(s => s.events.emit('app-hidden')); });
document.addEventListener('visibilitychange', () => {
  game.scene.getScenes(true).forEach(s => s.events.emit(document.hidden ? 'app-hidden' : 'app-visible'));
});

if (import.meta.env.DEV && new URLSearchParams(location.search).has('smoke')) {
  import('./dev/smoke.js').then(m => setTimeout(() => m.runSmoke(game), 1500));
}
if (import.meta.env.DEV && new URLSearchParams(location.search).has('og')) {
  import('./dev/og.js').then(m => setTimeout(() => m.makeOg(game).then(r => { window.__og = r; console.log('og', r); }), 1500));
}
