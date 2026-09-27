// 20x20 tray icons for every tool, part and decoy. Also used as the "in hand" cursor sprite.
import { C, RAMP } from '../core/palette.js';
import { mk } from './sprites.js';

const D = {
  hand(p) { // work glove
    p.rect(5, 8, 10, 9, C.gold); p.rect(5, 15, 10, 3, C.flame);
    for (let i = 0; i < 4; i++) { p.rect(5 + i * 2.5, 2 + (i === 0 || i === 3 ? 2 : 0), 2, 7, C.gold); p.px(5 + i * 2.5, 2 + (i === 0 || i === 3 ? 2 : 0), C.yellow); }
    p.rect(14, 9, 3, 2, C.gold); p.rect(16, 7, 2, 3, C.gold); p.dither(5, 9, 10, 6, C.flame, 0.2); p.hline(5, 15, 10, C.brown);
  },
  wrench(p) { p.thick(5, 16, 13, 7, 3, C.steel); p.thick(5, 15, 12, 7, 1, C.silver); p.ellipse(15, 5, 4, 4, C.silver); p.rect(15, 1, 3, 5, 0); p.ellipse(14, 5, 1.5, 1.5, 0); p.rect(13, 5, 1, 1, C.white); p.rect(8, 11, 3, 2, C.slate); },
  pliers(p) { p.thick(4, 17, 10, 9, 2, C.blue); p.thick(9, 17, 12, 10, 2, C.navy); p.thick(10, 9, 14, 3, 2, C.steel); p.thick(12, 10, 17, 5, 2, C.silver); p.ellipse(11, 9, 1.5, 1.5, C.white); },
  driver(p) { p.rect(8, 11, 4, 8, C.red); p.rect(8, 11, 1, 8, C.pink); p.rect(9, 18, 2, 1, C.crimson); p.rect(9, 2, 2, 9, C.silver); p.vline(9, 2, 9, C.white); p.rect(8, 1, 4, 1, C.steel); },
  plunger(p) { p.rect(9, 1, 2, 10, C.clay); p.vline(9, 1, 10, C.tan); p.ellipse(10, 13, 7, 4, C.crimson); p.ellipse(9, 12, 5, 2.5, C.red); p.rect(8, 16, 4, 3, C.crimson); p.px(6, 11, C.pink); },
  cupplunger(p) { p.rect(9, 1, 2, 11, C.clay); p.vline(9, 1, 11, C.tan); p.ellipse(10, 14, 7, 4, C.ink); p.ellipse(10, 13, 6, 3, C.storm); p.hline(4, 16, 12, C.ink); p.px(7, 12, C.slate); },
  auger(p) { p.rect(3, 2, 2, 15, C.steel); p.vline(3, 2, 15, C.silver); p.rect(3, 2, 8, 2, C.steel); p.rect(9, 1, 3, 4, C.red); p.ring(12, 13, 5, 5, C.slate); p.ring(12, 13, 3, 3, C.steel); p.rect(2, 16, 5, 3, C.ink); },
  snake(p) { p.ellipse(10, 9, 7, 7, C.red); p.ellipse(10, 9, 3, 3, C.crimson); p.ring(10, 9, 5, 5, C.crimson); p.line(10, 16, 16, 19, C.steel); p.rect(15, 2, 2, 5, C.gold); p.px(7, 5, C.pink); },
  drum(p) { p.blob(10, 11, 8, 7, RAMP.red); p.ellipse(10, 11, 3, 3, C.ink); p.ring(10, 11, 5, 5, C.crimson); p.rect(2, 3, 16, 2, C.steel); p.line(10, 11, 18, 18, C.silver); },
  zipit(p) { p.rect(9, 1, 2, 18, C.lime); p.rect(8, 1, 4, 3, C.green); for (let j = 6; j < 19; j += 3) { p.px(8, j, C.forest); p.px(11, j + 1, C.forest); } },
  hexkey(p) { p.thick(5, 4, 5, 15, 2, C.silver); p.thick(5, 15, 14, 15, 2, C.silver); p.vline(4, 4, 11, C.white); p.rect(12, 14, 3, 3, C.steel); },
  bucket(p) { p.poly([[3, 6], [17, 6], [15, 19], [5, 19]], C.flame); p.poly([[3, 6], [7, 6], [7, 19], [5, 19]], C.gold); p.rect(3, 5, 14, 2, C.gold); p.ring(10, 6, 7, 5, C.steel); p.rect(2, 7, 16, 14, 0); p.poly([[3, 7], [17, 7], [15, 19], [5, 19]], C.flame); p.poly([[3, 7], [7, 7], [7, 19], [5, 19]], C.gold); p.hline(3, 7, 14, C.yellow); p.rect(6, 11, 8, 3, C.white); },
  cutter(p) { p.ring(10, 8, 6, 6, C.steel); p.ellipse(10, 8, 4, 4, 0); p.ellipse(10, 3, 2, 2, C.silver); p.rect(9, 14, 3, 6, C.red); p.rect(9, 14, 1, 6, C.pink); p.rect(3, 7, 3, 3, C.orange); p.rect(15, 7, 3, 3, C.orange); },
  deburr(p) { p.rect(8, 8, 5, 11, C.gold); p.vline(8, 8, 11, C.yellow); p.rect(10, 2, 2, 6, C.silver); p.line(11, 2, 15, 1, C.silver); p.px(15, 2, C.white); },
  gauge(p) { p.blob(10, 9, 7, 7, RAMP.chrome); p.ellipse(10, 9, 5, 5, C.white); p.line(10, 9, 13, 6, C.red); p.px(6, 9, C.ink); p.px(14, 9, C.ink); p.px(10, 5, C.ink); p.rect(8, 16, 4, 3, C.gold); },
  hose(p) { p.ring(10, 10, 7, 7, C.green); p.ring(10, 10, 6, 6, C.lime); p.ring(10, 10, 4, 4, C.green); p.ring(10, 10, 3, 3, C.forest); p.rect(14, 15, 4, 3, C.gold); },
  lighter(p) { p.rect(3, 8, 7, 5, C.red); p.rect(3, 8, 7, 1, C.pink); p.rect(10, 9, 9, 2, C.steel); p.rect(5, 13, 3, 5, C.crimson); p.px(18, 7, C.gold); p.px(19, 8, C.yellow); p.px(18, 9, C.flame); },
  scraper(p) { p.rect(8, 11, 4, 8, C.clay); p.vline(8, 11, 8, C.tan); p.poly([[5, 2], [15, 2], [13, 11], [7, 11]], C.silver); p.vline(7, 3, 7, C.white); p.hline(5, 2, 10, C.white); },
  brush(p) { p.rect(3, 12, 14, 5, C.clay); p.hline(3, 12, 14, C.tan); for (let i = 4; i < 17; i += 2) p.vline(i, 6, 6, C.steel); p.rect(16, 13, 3, 3, C.brown); },
  tongs(p) { p.line(6, 18, 8, 2, C.silver); p.line(7, 18, 9, 2, C.steel); p.line(13, 18, 11, 2, C.silver); p.line(14, 18, 12, 2, C.steel); p.rect(7, 1, 3, 2, C.silver); p.rect(10, 1, 3, 2, C.steel); p.rect(5, 14, 3, 5, C.red); p.rect(12, 14, 3, 5, C.red); p.hline(8, 12, 4, C.steel); },
  jetter(p) { p.rect(3, 6, 10, 9, C.gold); p.vline(3, 6, 9, C.yellow); p.rect(13, 9, 6, 2, C.steel); p.rect(5, 15, 3, 4, C.ink); p.rect(9, 15, 3, 4, C.ink); p.px(19, 8, C.cyan); p.px(19, 11, C.cyan); p.rect(4, 3, 3, 3, C.storm); },
  camera(p) { p.rect(2, 3, 13, 10, C.storm); p.rect(3, 4, 11, 8, C.forest); p.px(5, 6, C.lime); p.line(4, 10, 8, 7, C.lime); p.ring(14, 15, 4, 3, C.gold); p.rect(15, 5, 3, 4, C.slate); },
  crimper(p) { p.rect(3, 9, 9, 6, C.red); p.rect(3, 9, 9, 1, C.pink); p.ellipse(15, 8, 4, 4, C.steel); p.ellipse(15, 8, 2, 2, C.ink); p.rect(4, 15, 4, 4, C.ink); },
  meterkey(p) { p.rect(9, 3, 2, 15, C.slate); p.vline(9, 3, 15, C.steel); p.rect(3, 3, 14, 2, C.slate); p.hline(3, 3, 14, C.steel); p.rect(8, 17, 4, 2, C.storm); },
  flapper(p) { p.ellipse(10, 12, 7, 5, C.red); p.ellipse(10, 11, 5, 3, C.pink); p.rect(3, 6, 3, 3, C.crimson); p.rect(14, 6, 3, 3, C.crimson); p.line(10, 7, 10, 2, C.steel); p.px(10, 1, C.silver); },
  cartridge(p) { p.rect(7, 3, 6, 15, C.white); p.vline(7, 3, 15, C.silver); p.rect(8, 1, 4, 2, C.gold); p.rect(6, 12, 8, 2, C.ink); p.rect(6, 7, 8, 1, C.blue); p.rect(6, 9, 8, 1, C.red); },
  waxring(p) { p.ellipse(10, 10, 8, 6, C.gold); p.ellipse(10, 10, 4, 3, 0); p.ring(10, 10, 6.5, 4.5, C.yellow); p.ellipse(10, 11, 3, 2, C.ink); },
  supply(p) { p.thick(4, 16, 16, 4, 2, C.silver); for (let i = 5; i < 16; i += 2) p.px(i, 20 - i, C.steel); p.rect(2, 15, 4, 4, C.steel); p.rect(14, 2, 4, 4, C.steel); p.px(3, 16, C.white); },
  coupling(p) { p.rect(3, 7, 14, 7, C.gold); p.hline(3, 7, 14, C.yellow); p.hline(3, 13, 14, C.brown); p.rect(2, 6, 3, 9, C.silver); p.rect(15, 6, 3, 9, C.silver); p.rect(9, 7, 2, 7, C.flame); },
  washer(p) { p.ellipse(10, 10, 7, 7, C.ink); p.ellipse(10, 10, 6, 6, C.storm); p.ellipse(10, 10, 2, 2, 0); p.px(7, 7, C.slate); },
  ballvalve(p) { p.rect(2, 8, 16, 6, C.gold); p.hline(2, 8, 16, C.yellow); p.blob(10, 11, 5, 5, RAMP.brass); p.rect(8, 2, 10, 3, C.red); p.rect(8, 2, 10, 1, C.pink); p.rect(9, 5, 2, 3, C.steel); },
  foam(p) { p.rect(2, 6, 16, 8, C.slate); p.rect(2, 6, 16, 2, C.steel); p.ellipse(3, 10, 2, 4, C.storm); p.ellipse(3, 10, 1, 2, C.ink); p.hline(4, 12, 14, C.storm); },
  drano(p) { p.rect(5, 6, 10, 13, C.hot); p.vline(5, 6, 13, C.pink); p.rect(7, 2, 6, 4, C.white); p.rect(6, 10, 8, 4, C.yellow); p.px(8, 11, C.ink); p.px(11, 11, C.ink); p.hline(8, 13, 4, C.ink); },
  hammer(p) { p.rect(9, 7, 2, 12, C.clay); p.vline(9, 7, 12, C.tan); p.rect(3, 3, 14, 5, C.steel); p.hline(3, 3, 14, C.silver); p.rect(15, 2, 3, 3, C.slate); },
  ducttape(p) { p.ellipse(10, 10, 8, 8, C.silver); p.ring(10, 10, 8, 8, C.steel); p.ellipse(10, 10, 4, 4, C.clay); p.ellipse(10, 10, 3, 3, 0); p.rect(12, 16, 7, 3, C.silver); },
  beer(p) { p.rect(6, 3, 8, 16, C.silver); p.vline(6, 3, 16, C.white); p.rect(6, 7, 8, 8, C.red); p.art(8, 9, ['.#.', '###', '#.#'], { '#': C.white }); p.rect(7, 2, 6, 1, C.steel); },
  wd40(p) { p.rect(6, 5, 8, 14, C.navy); p.vline(6, 5, 14, C.blue); p.rect(6, 9, 8, 5, C.gold); p.rect(8, 2, 4, 3, C.red); p.hline(12, 3, 6, C.red); },
  gum(p) { p.rect(3, 7, 14, 7, C.pink); p.hline(3, 7, 14, C.white); p.rect(3, 9, 14, 2, C.cyan); p.ellipse(15, 15, 3, 2, C.pink); },
  plugIn(p) { p.rect(5, 6, 10, 9, C.ink); p.rect(6, 7, 8, 7, C.storm); p.rect(7, 2, 2, 5, C.silver); p.rect(11, 2, 2, 5, C.silver); p.rect(9, 15, 2, 5, C.ink); },
  pumpIn(p) { p.blob(10, 11, 7, 7, RAMP.chrome); p.rect(8, 1, 4, 6, C.slate); p.ellipse(10, 14, 5, 2, C.ink); },
};

export function buildToolIcons(scene) {
  for (const [k, fn] of Object.entries(D)) mk(scene, 'tool_' + k, 20, 20, fn);
}
