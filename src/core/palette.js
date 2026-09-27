// 32-colour 16-bit-era palette (ENDESGA-32). Everything in the game is drawn from these.
export const C = {
  rust: '#be4a2f', orange: '#d77643', sand: '#ead4aa', tan: '#e4a672', clay: '#b86f50', brown: '#733e39', umber: '#3e2731',
  crimson: '#a22633', red: '#e43b44', flame: '#f77622', gold: '#feae34', yellow: '#fee761',
  lime: '#63c74d', green: '#3e8948', forest: '#265c42', deep: '#193c3e',
  navy: '#124e89', blue: '#0099db', cyan: '#2ce8f5',
  white: '#ffffff', silver: '#c0cbdc', steel: '#8b9bb4', slate: '#5a6988', storm: '#3a4466', night: '#262b44', ink: '#181425',
  hot: '#ff0044', plum: '#68386c', mauve: '#b55088', pink: '#f6757a', peach: '#e8b796', skin: '#c28569',
};

// Shading ramps, dark -> light.
export const RAMP = {
  porcelain: [C.slate, C.steel, C.silver, C.white],
  chrome: [C.night, C.slate, C.steel, C.silver, C.white],
  copper: [C.umber, C.brown, C.clay, C.orange, C.tan],
  brass: [C.brown, C.clay, C.gold, C.yellow],
  pvc: [C.steel, C.silver, C.white],
  abs: [C.ink, C.night, C.storm, C.slate],
  galv: [C.storm, C.slate, C.steel, C.silver],
  red: [C.umber, C.crimson, C.red, C.pink],
  blue: [C.night, C.navy, C.blue, C.cyan],
  wood: [C.umber, C.brown, C.clay, C.skin],
  green: [C.deep, C.forest, C.green, C.lime],
  water: [C.navy, C.blue, C.cyan, C.white],
  gold: [C.brown, C.flame, C.gold, C.yellow],
  purple: [C.ink, C.plum, C.mauve, C.pink],
  concrete: [C.storm, C.slate, C.steel, C.silver],
  grime: [C.ink, C.umber, C.brown, C.clay],
  teal: [C.deep, C.forest, C.green],
  orangeR: [C.brown, C.rust, C.orange, C.tan],
};

export function hex(c) { return parseInt(c.slice(1), 16); }
