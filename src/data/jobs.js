// Fifteen of the most common residential calls in the Seattle area, each broken into the
// steps a plumber actually performs. Step types map to touch gestures (see repair/steps.js):
//   turn   - circle your finger around a valve/nut (dir 1 = clockwise, -1 = counter-clockwise)
//   crank  - turn an auger crank; it binds on the clog - ease off, then push through
//   dial   - turn an adjuster until a gauge sits in the green, then hold it there
//   rhythm - tap when the moving marker is in the green (plunging, crimping, igniting)
//   hold   - press & hold, release in the green (torque, draining, chain slack)
//   drag   - drag a part from the tray onto its spot
//   pull   - drag a stuck part out along an arrow
//   scrub  - scrub back and forth until clean
//   taps   - tap every hotspot (leaks, roots, debris)
//   tap    - tap one thing (a handle, a button)
// Anchor names (target / to) are defined by each scene in art/fixtures.js.

const TOOLS_BASE = ['hand'];

export const TOOL_INFO = {
  hand: { name: 'HANDS', desc: 'YOUR OWN TWO MITTS' },
  wrench: { name: 'ADJ. WRENCH', desc: 'NUTS, FITTINGS, CAPS' },
  pliers: { name: 'CHANNEL LOCKS', desc: 'SLIP NUTS, BIG GRIP' },
  driver: { name: 'SCREWDRIVER', desc: 'SCREWS & PRYING CAPS' },
  plunger: { name: 'FLANGE PLUNGER', desc: 'TOILETS (THE ONE WITH THE LIP)' },
  cupplunger: { name: 'CUP PLUNGER', desc: 'SINKS & TUBS (FLAT)' },
  auger: { name: 'CLOSET AUGER', desc: 'TOILET CLOGS' },
  snake: { name: 'HAND SNAKE', desc: 'SINK & TUB LINES' },
  drum: { name: 'DRUM AUGER', desc: 'MAIN LINES & ROOTS' },
  zipit: { name: 'ZIP-IT STICK', desc: 'HAIR CLOGS. SO MUCH HAIR.' },
  hexkey: { name: 'DISPOSAL KEY', desc: '1/4" HEX FOR DISPOSALS' },
  bucket: { name: 'BUCKET', desc: 'CATCHES THE NASTY' },
  cutter: { name: 'TUBING CUTTER', desc: 'CLEAN CUTS ON PIPE' },
  deburr: { name: 'DEBURR TOOL', desc: 'SMOOTHS CUT PIPE ENDS' },
  gauge: { name: 'PRESSURE GAUGE', desc: 'THREADS ON A HOSE BIB' },
  hose: { name: 'GARDEN HOSE', desc: 'DRAINING TANKS' },
  lighter: { name: 'IGNITER', desc: 'PILOT LIGHTS' },
  scraper: { name: 'PUTTY KNIFE', desc: 'SCRAPING OLD WAX' },
  brush: { name: 'WIRE BRUSH', desc: 'SCRUBBING GUNK' },
  tongs: { name: 'TONGS', desc: 'FISHING THINGS OUT' },
  jetter: { name: 'HYDRO-JETTER', desc: '4000 PSI OF CLEAN' },
  camera: { name: 'SEWER CAMERA', desc: 'SEE INSIDE THE LINE' },
  crimper: { name: 'PRESS TOOL', desc: 'CRIMPS FITTINGS' },
  meterkey: { name: 'METER KEY', desc: 'STREET SHUTOFF' },
  // parts
  flapper: { name: 'NEW FLAPPER', desc: '3" UNIVERSAL', part: true },
  cartridge: { name: 'NEW CARTRIDGE', desc: 'SINGLE-HANDLE', part: true },
  waxring: { name: 'WAX RING', desc: 'EXTRA THICK', part: true },
  supply: { name: 'BRAIDED LINE', desc: '3/8" X 1/2" STAINLESS', part: true },
  coupling: { name: 'PUSH COUPLING', desc: '3/4" PUSH-TO-CONNECT', part: true },
  washer: { name: 'STEM WASHER', desc: 'RUBBER SEAT WASHER', part: true },
  ballvalve: { name: 'BALL VALVE', desc: '3/4" FULL-PORT', part: true },
  foam: { name: 'PIPE FOAM', desc: 'FREEZE INSULATION', part: true },
  // decoys
  drano: { name: 'DRAIN-O-MATIC', desc: 'EATS PIPES. NEVER.', decoy: 'CHEMICAL DRAIN CLEANER? IT EATS OLD PIPES. REAL PROS DON\'T.' },
  hammer: { name: 'HAMMER', desc: 'PERCUSSIVE MAINTENANCE', decoy: 'YOU HIT IT WITH A HAMMER. NOW IT\'S BROKEN *AND* DENTED.' },
  ducttape: { name: 'DUCT TAPE', desc: 'FIXES EVERYTHING?', decoy: 'DUCT TAPE IS NOT A PLUMBING PART, ROOKIE.' },
  beer: { name: 'RAINIER TALLBOY', desc: 'MOUNTAIN FRESH', decoy: 'NOT ON THE CLOCK, HOMIE. ...OKAY ONE SIP.' },
  wd40: { name: 'SPRAY LUBE', desc: 'SQUEAKY STUFF', decoy: 'NOW IT\'S A SLIPPERY BROKEN THING.' },
  gum: { name: 'CHEWING GUM', desc: 'MINTY', decoy: 'NORTHWEST TRIES THAT. DON\'T BE NORTHWEST.' },
};

export const JOBS = [
  // ----------------------------------------------------------------- BALLARD
  { title: 'CLOGGED TOILET', scene: 'toilet', variant: 'clog', address: '1422 NW 65TH ST',
    who: 'SVEN LINDQVIST', look: { skin: 'fair', hair: 'white', style: 'bald', beard: 'viking', shirt: '#124e89', glasses: false },
    house: { style: 'craftsman', body: '#124e89', trim: '#ead4aa', roof: '#3a4466', door: '#e43b44', extra: 'flag' },
    call: "UFF DA! I ATE THE WHOLE LUTEFISK PLATTER AND THE TOILET SURRENDERED. IT'S RISING!", decoys: ['drano', 'hammer'],
    steps: [
      { t: 'SHUT OFF THE TOILET SUPPLY', tool: 'hand', type: 'turn', target: 'valve', dir: 1, turns: 1.25, tip: 'STOP THE TANK REFILLING SO THE BOWL CAN\'T OVERFLOW. RIGHTY-TIGHTY.', early: 'THE TANK REFILLS AND THE BOWL OVERFLOWS ONTO YOUR BOOTS!' },
      { t: 'PLUNGE: FLANGE PLUNGER', tool: 'plunger', type: 'rhythm', target: 'bowl', hits: 4, tip: 'SEAL THE FLANGE IN THE HOLE, PUSH-PULL STEADY. THE PULL DOES THE WORK.', early: 'YOU PLUNGED A FULL BOWL. EVERYONE IS WEARING LUTEFISK NOW.' },
      { t: 'FEED THE CLOSET AUGER', tool: 'auger', type: 'crank', target: 'bowl', turns: 3, jams: 1, tip: 'A CLOSET AUGER\'S RUBBER BOOT PROTECTS THE PORCELAIN. CRANK AND FEED.' , fx: ['clean:bowlwater'] },
      { t: 'TURN THE WATER BACK ON', tool: 'hand', type: 'turn', target: 'valve', dir: -1, turns: 1.25, tip: 'LEFTY-LOOSEY. OPEN IT ALL THE WAY SO THE FILL VALVE WORKS RIGHT.', early: 'WATER ON BEFORE IT\'S CLEAR? THE BOWL CREEPS UP AGAIN...' },
      { t: 'TEST FLUSH', tool: 'hand', type: 'tap', target: 'handle', tip: 'WATCH IT DRAIN FULLY AND REFILL TO THE WATERLINE. DONE!' , fx: ['flush'] },
    ] },
  { title: 'DRIPPING FAUCET', scene: 'sink', variant: 'kitchen', leak: { x: 166, y: 30, until: 0, kind: 'drip' }, address: '6019 24TH AVE NW',
    who: 'CAPTAIN MARGE', look: { skin: 'light', hair: 'grey', style: 'bun', beard: 'none', shirt: '#f77622', glasses: true },
    house: { style: 'bungalow', body: '#ead4aa', trim: '#124e89', roof: '#733e39', door: '#124e89', extra: 'anchor' },
    call: 'DRIP. DRIP. DRIP. FORTY YEARS ON A CRAB BOAT AND THIS IS WHAT BREAKS ME.', decoys: ['ducttape', 'hammer'],
    steps: [
      { t: 'SHUT OFF BOTH ANGLE STOPS', tool: 'hand', type: 'turn', target: 'stopC', dir: 1, turns: 1, tip: 'THE LITTLE OVAL VALVES UNDER THE SINK. CLOCKWISE TO CLOSE.', early: 'YOU PULLED THE CARTRIDGE WITH THE WATER ON. GEYSER! MARGE IS SOAKED.' },
      { t: 'PLUG THE SINK DRAIN', tool: 'hand', type: 'tap', target: 'drain', tip: 'PLUG THE DRAIN SO TINY SCREWS DON\'T VANISH FOREVER.' , fx: ['show:stopper'] },
      { t: 'REMOVE THE HANDLE SCREW', tool: 'driver', type: 'turn', target: 'fscrew', dir: -1, turns: 1.5, tip: 'POP THE DECORATIVE CAP, THEN UNSCREW. LEFTY-LOOSEY.' , fx: ['hide:fscrew', 'away:fhandle'] },
      { t: 'UNSCREW THE RETAINING NUT', tool: 'wrench', type: 'turn', target: 'fnut', dir: -1, turns: 1.5, tip: 'THE NUT HOLDS THE CARTRIDGE DOWN. WRAP THE JAWS IN TAPE TO SAVE THE FINISH.' , fx: ['away:fnut'] },
      { t: 'PULL THE OLD CARTRIDGE', tool: 'pliers', type: 'pull', target: 'cart', dir: [0, -1], dist: 46, tip: 'OLD CARTRIDGES STICK. PULL STRAIGHT UP - DON\'T TWIST.' },
      { t: 'DROP IN THE NEW CARTRIDGE', tool: 'cartridge', type: 'drag', to: 'fnut', tip: 'MATCH THE HOT/COLD ORIENTATION TABS OR YOUR SHOWER GETS SPICY.' },
      { t: 'OPEN THE ANGLE STOPS', tool: 'hand', type: 'turn', target: 'stopC', dir: -1, turns: 1, tip: 'OPEN SLOWLY AND CHECK FOR DRIPS. NO DRIP = HAPPY CAPTAIN.' , fx: ['restore:fnut', 'restore:fhandle', 'restore:fscrew', 'hide:stopper'] },
    ] },
  { title: 'SLOW SHOWER DRAIN', scene: 'shower', variant: 'hair', address: '5518 BARNES AVE NW',
    who: 'TYLER & BRI', look: { skin: 'tan', hair: 'brown', style: 'manbun', beard: 'lumber', shirt: '#3e8948', glasses: false },
    house: { style: 'modern', body: '#3e8948', trim: '#ffffff', roof: '#262b44', door: '#feae34', extra: 'bikes' },
    call: "TYLER'S BEARD OIL + BRI'S EXTENSIONS + OUR HUSKY = ANKLE-DEEP SHOWERS. HELP.", decoys: ['drano', 'gum'],
    steps: [
      { t: 'UNSCREW THE DRAIN COVER', tool: 'driver', type: 'turn', target: 'cover', dir: -1, turns: 1.5, tip: 'MOST SHOWER GRATES HAVE ONE OR TWO SCREWS. KEEP THEM OUT OF THE DRAIN!' , fx: ['away:cover'] },
      { t: 'FISH OUT THE HAIR MONSTER', tool: 'zipit', type: 'pull', target: 'hair', dir: [0, -1], dist: 70, tip: 'BARBED ZIP-IT STICKS GRAB HAIR. PULL SLOW AND STEADY, DON\'T LET IT SNAP.' , fx: ['show:grime'] },
      { t: 'SCRUB THE DRAIN BASKET', tool: 'brush', type: 'scrub', target: 'grime', amount: 1, tip: 'SOAP SCUM + HAIR = NEXT MONTH\'S CLOG. SCRUB IT OUT.' },
      { t: 'FLUSH WITH HOT WATER', tool: 'hand', type: 'hold', target: 'pool', zone: [0.72, 0.95], label: 'FLOW', tip: 'RUN HOT WATER A FEW MINUTES TO CLEAR THE REST. RELEASE WHEN IT\'S FLOWING FREE.' , fx: ['fade:pool'] },
      { t: 'SCREW THE COVER BACK ON', tool: 'driver', type: 'turn', target: 'cover', dir: 1, turns: 1.25, tip: 'SNUG, NOT CRANKED. YOU\'LL BE BACK IN A YEAR. TYLER\'S BEARD IS FOREVER.' , pre: ['restore:cover'] },
    ] },

  // ----------------------------------------------------------------- FREMONT
  { title: 'RUNNING TOILET', scene: 'toilet', variant: 'tank', leak: { x: 135, y: 112, until: 0, kind: 'bubble' }, address: '3510 FREMONT AVE N',
    who: 'MOONBEAM', look: { skin: 'light', hair: 'purple', style: 'long', beard: 'none', shirt: '#b55088', glasses: true },
    house: { style: 'funky', body: '#b55088', trim: '#fee761', roof: '#265c42', door: '#2ce8f5', extra: 'art' },
    call: 'MY TOILET HAS BEEN RUNNING FOR THREE DAYS. IT IS WASTING MOTHER GAIA\'S TEARS, MAN.', decoys: ['ducttape', 'beer'],
    steps: [
      { t: 'SHUT OFF THE SUPPLY VALVE', tool: 'hand', type: 'turn', target: 'valve', dir: 1, turns: 1.25, tip: 'ALWAYS FIRST. RIGHTY-TIGHTY.', early: 'THE TANK KEEPS REFILLING WHILE YOU WORK. WET SLEEVES!' },
      { t: 'FLUSH TO DRAIN THE TANK', tool: 'hand', type: 'hold', target: 'handle', zone: [0.8, 1.0], label: 'DRAIN', tip: 'HOLD THE HANDLE DOWN SO THE TANK EMPTIES. MORE WATER OUT = LESS MESS.' , fx: ['lower:tankwater'] },
      { t: 'UNHOOK & PULL THE OLD FLAPPER', tool: 'hand', type: 'pull', target: 'flapper', dir: [0, -1], dist: 40, tip: 'A WARPED FLAPPER LEAKS INTO THE BOWL NONSTOP. THAT\'S YOUR RUNNING TOILET.' },
      { t: 'SEAT THE NEW FLAPPER', tool: 'flapper', type: 'drag', to: 'flapper', tip: 'HOOK THE EARS ON THE OVERFLOW TUBE PEGS AND CENTER IT ON THE SEAT.' },
      { t: 'SET THE CHAIN SLACK', tool: 'hand', type: 'hold', target: 'chain', zone: [0.35, 0.6], label: 'SLACK', tip: 'ABOUT 1/2" OF SLACK. TOO TIGHT = LEAK. TOO LOOSE = WEAK FLUSH.' },
      { t: 'OPEN THE SUPPLY VALVE', tool: 'hand', type: 'turn', target: 'valve', dir: -1, turns: 1.25, tip: 'LISTEN: IT FILLS, THEN GOES QUIET. SILENCE IS GOLDEN.' , fx: ['raise:tankwater'] },
    ] },
  { title: 'GREASE-CLOGGED SINK', scene: 'sink', variant: 'kitchen', address: '4409 PHINNEY AVE N',
    who: 'CHEF DMITRI', look: { skin: 'light', hair: 'black', style: 'chef', beard: 'stache', shirt: '#ffffff', glasses: false },
    house: { style: 'victorian', body: '#e43b44', trim: '#ead4aa', roof: '#262b44', door: '#193c3e', extra: 'lights' },
    call: 'SUPPER CLUB IN ONE HOUR. SOMEONE POURED BACON GREASE DOWN MY SINK. IT WAS ME. I POURED IT.', decoys: ['drano', 'plunger'],
    steps: [
      { t: 'BUCKET UNDER THE P-TRAP', tool: 'bucket', type: 'drag', to: 'under', tip: 'THE TRAP IS FULL OF NASTY WATER. ALWAYS BUCKET FIRST.', early: 'NO BUCKET. GREASE SLUDGE ALL OVER THE CABINET FLOOR. DMITRI WEEPS.' },
      { t: 'LOOSEN THE SLIP NUTS', tool: 'pliers', type: 'turn', target: 'slip', dir: -1, turns: 1.25, tip: 'CHANNEL LOCKS ON THE BIG PLASTIC NUTS. LEFTY-LOOSEY.' },
      { t: 'DROP THE P-TRAP', tool: 'hand', type: 'pull', target: 'trap', dir: [0, 1], dist: 36, tip: 'LOWER IT INTO THE BUCKET. SMELL THAT? THAT\'S JOB SECURITY.' , keep: true, fx: ['show:grime'] },
      { t: 'SCRUB OUT THE TRAP', tool: 'brush', type: 'scrub', target: 'grime', amount: 1.1, tip: 'CONGEALED GREASE LINES THE PIPE. NEVER POUR GREASE DOWN A DRAIN.' },
      { t: 'SNAKE THE TRAP ARM', tool: 'snake', type: 'crank', target: 'arm', turns: 3, jams: 2, tip: 'THE REAL CLOG IS OFTEN PAST THE TRAP, IN THE WALL. FEED THE SNAKE IN.' },
      { t: 'REINSTALL: HAND-TIGHT + 1/4', tool: 'pliers', type: 'hold', target: 'slip', zone: [0.6, 0.78], label: 'TORQUE', tip: 'PLASTIC SLIP NUTS CRACK IF YOU CRANK THEM. HAND-TIGHT PLUS A QUARTER TURN.' , pre: ['restore:trap', 'hide:grime'] },
    ] },
  { title: 'JAMMED DISPOSAL', scene: 'sink', variant: 'disposal', address: '720 N 34TH ST',
    who: 'KEVIN (TECH BRO)', look: { skin: 'fair', hair: 'blond', style: 'swoop', beard: 'none', shirt: '#262b44', glasses: true, vest: true },
    house: { style: 'townhouse', body: '#5a6988', trim: '#262b44', roof: '#181425', door: '#f77622', extra: 'cyber' },
    call: 'SO I PUT A WHOLE PINEAPPLE AND MY SMARTWATCH IN THE DISPOSAL. IT\'S HUMMING. IS THAT BAD?', decoys: ['hammer', 'wd40'],
    steps: [
      { t: 'UNPLUG THE DISPOSAL', tool: 'hand', type: 'pull', target: 'plug', dir: [-1, 0], dist: 34, tip: 'NEVER PUT HANDS OR TOOLS NEAR A LIVE DISPOSAL. KILL THE POWER FIRST.', early: 'YOU REACHED IN WITH THE POWER ON. KEVIN SCREAMS. YOU SCREAM. EVERYONE SCREAMS.' },
      { t: 'WORK THE FLYWHEEL FREE', tool: 'hexkey', type: 'scrub', target: 'hex', amount: 0.8, tip: 'A 1/4" HEX KEY IN THE BOTTOM SOCKET. WORK IT BACK AND FORTH TILL IT SPINS.' },
      { t: 'FISH OUT THE SMARTWATCH', tool: 'tongs', type: 'pull', target: 'junk', dir: [0, -1], dist: 50, tip: 'TONGS OR PLIERS - NEVER YOUR HAND. EVEN UNPLUGGED, THOSE BLADES BITE.' , fx: [] },
      { t: 'PRESS THE RESET BUTTON', tool: 'hand', type: 'tap', target: 'reset', tip: 'THE LITTLE RED BUTTON ON THE BOTTOM. THE MOTOR\'S OVERLOAD TRIPPED.' },
      { t: 'PLUG IN & TEST WITH COLD WATER', tool: 'hand', type: 'drag', item: 'plugIn', to: 'outlet', tip: 'RUN COLD WATER, FLIP IT ON. SMOOTH WHIRR = VICTORY. TELL KEVIN: NO WATCHES.' , fx: ['motor'] },
    ] },

  // ----------------------------------------------------------------- CAPITOL HILL
  { title: 'LOW WATER PRESSURE', scene: 'basement', variant: 'prv', address: '1531 BELMONT AVE E',
    who: 'MISS ROSALIND', look: { skin: 'dark', hair: 'pink', style: 'bighair', beard: 'none', shirt: '#ff0044', glasses: false, lipstick: true },
    house: { style: 'victorian', body: '#68386c', trim: '#f6757a', roof: '#181425', door: '#fee761', extra: 'pride' },
    call: 'HONEY, RINSING THIS WIG TAKES FORTY MINUTES. MY SHOWER HAS THE PRESSURE OF A SAD SIGH.', decoys: ['hammer', 'drano'],
    steps: [
      { t: 'THREAD THE GAUGE ON THE BIB', tool: 'gauge', type: 'drag', to: 'bibg', tip: 'A $10 GAUGE ON ANY HOSE BIB TELLS YOU HOUSE PRESSURE. MEASURE FIRST.' },
      { t: 'OPEN THE BIB & READ IT', tool: 'hand', type: 'turn', target: 'bibg', dir: -1, turns: 1, tip: '25 PSI. YIKES. THE PRESSURE-REDUCING VALVE IS SET WAY TOO LOW.' , fx: ['show:needle'] },
      { t: 'LOOSEN THE PRV LOCK NUT', tool: 'wrench', type: 'turn', target: 'prvnut', dir: -1, turns: 1, tip: 'THE LOCK NUT HOLDS THE ADJUSTING SCREW. LOOSEN IT FIRST.' },
      { t: 'DIAL IN 55-65 PSI', tool: 'driver', type: 'dial', target: 'prvscrew', zone: [0.55, 0.65], tip: 'CLOCKWISE RAISES PRESSURE. 50-70 PSI IS THE SWEET SPOT. 80+ HURTS FIXTURES.' },
      { t: 'SNUG THE LOCK NUT', tool: 'wrench', type: 'turn', target: 'prvnut', dir: 1, turns: 0.75, tip: 'LOCK IT SO THE SETTING DOESN\'T DRIFT. SHOWER PRESSURE: RESTORED, HONEY.' },
    ] },
  { title: 'LEAKY SUPPLY LINE', scene: 'sink', variant: 'vanity', leak: { x: 206, y: 142, until: 0, kind: 'spray' }, address: '412 E ROY ST',
    who: 'PROF. AKANA', look: { skin: 'brown', hair: 'black', style: 'bob', beard: 'none', shirt: '#5a6988', glasses: true, cat: true },
    house: { style: 'foursquare', body: '#3e8948', trim: '#ead4aa', roof: '#733e39', door: '#a22633', extra: 'cats' },
    call: 'THE OLD PLASTIC LINE UNDER MY BATHROOM SINK POPPED. FOURTEEN CATS ARE NOW WATER-ADJACENT.', decoys: ['ducttape', 'gum'],
    steps: [
      { t: 'SHUT OFF THE ANGLE STOP', tool: 'hand', type: 'turn', target: 'stopC', dir: 1, turns: 1, tip: 'STOP THE LEAK AT THE SOURCE.', early: 'YOU UNSCREWED A PRESSURIZED LINE. FOURTEEN VERY WET, VERY ANGRY CATS.' },
      { t: 'OPEN THE FAUCET TO RELIEVE', tool: 'hand', type: 'tap', target: 'fhandle', tip: 'BLEEDS OFF PRESSURE SO THE LINE COMES OFF DRY-ISH.' , fx: ['splashsfx'] },
      { t: 'UNSCREW LINE FROM THE VALVE', tool: 'wrench', type: 'turn', target: 'stopNut', dir: -1, turns: 1.25, tip: 'HOLD THE VALVE BODY STILL WITH YOUR OTHER HAND SO IT DOESN\'T TWIST.' },
      { t: 'UNSCREW LINE FROM FAUCET', tool: 'pliers', type: 'turn', target: 'tail', dir: -1, turns: 1.25, tip: 'UP IN THE DARK ZONE BEHIND THE BOWL. A BASIN WRENCH HELPS.' , fx: ['away:line'] },
      { t: 'INSTALL THE BRAIDED LINE', tool: 'supply', type: 'drag', to: 'lineSpot', tip: 'STAINLESS BRAIDED LINES OUTLAST PLASTIC FOR YEARS. MATCH THE THREAD SIZES.' },
      { t: 'SNUG IT - DON\'T CRANK IT', tool: 'wrench', type: 'hold', target: 'stopNut', zone: [0.55, 0.72], label: 'TORQUE', tip: 'COMPRESSION NUTS SEAL WITH A SNUG FIT. OVER-TIGHTENING CRUSHES THE SEAL.' },
      { t: 'OPEN IT & CHECK FOR DRIPS', tool: 'hand', type: 'turn', target: 'stopC', dir: -1, turns: 1, tip: 'DRY PAPER TOWEL UNDER THE JOINTS FOR A MINUTE. DRY = DONE.' },
    ] },
  { title: 'ROCKING TOILET / WAX RING', scene: 'toilet', variant: 'base', address: '1822 10TH AVE E',
    who: 'BRAD & CHAD', look: { skin: 'light', hair: 'blond', style: 'backcap', beard: 'none', shirt: '#e43b44', glasses: false, sunnies: true },
    house: { style: 'foursquare', body: '#c0cbdc', trim: '#e43b44', roof: '#3a4466', door: '#262b44', extra: 'couch' },
    call: 'BRO. THE FLOOR AROUND THE TOILET GOES *SQUISH*. AND IT SMELLS LIKE... BRO.', decoys: ['ducttape', 'beer'],
    steps: [
      { t: 'SHUT OFF THE SUPPLY', tool: 'hand', type: 'turn', target: 'valve', dir: 1, turns: 1.25, tip: 'SHUT OFF, THEN FLUSH AND SPONGE THE TANK & BOWL DRY.', early: 'YOU DISCONNECTED A LIVE LINE. BRAD CALLS IT "A SICK WATER SLIDE".' },
      { t: 'DISCONNECT THE SUPPLY LINE', tool: 'wrench', type: 'turn', target: 'supplyNut', dir: -1, turns: 1, tip: 'THE COUPLING NUT UNDER THE TANK. A TOWEL CATCHES THE DRIBBLE.' , fx: ['away:supplyLine'] },
      { t: 'REMOVE THE CLOSET BOLT NUTS', tool: 'wrench', type: 'turn', target: 'bolts', dir: -1, turns: 1.5, tip: 'POP THE CAPS AT THE BASE. RUSTY? THAT\'S WHY IT ROCKS.' },
      { t: 'LIFT THE TOILET OFF', tool: 'hand', type: 'pull', target: 'toilet', dir: [0, -1], dist: 60, tip: 'ROCK IT GENTLY TO BREAK THE WAX SEAL, THEN LIFT STRAIGHT UP. LIFT WITH THE LEGS!' },
      { t: 'SCRAPE THE OLD WAX', tool: 'scraper', type: 'scrub', target: 'wax', amount: 1.2, tip: 'EVERY BIT OF OLD WAX OFF THE FLANGE. STUFF A RAG IN THE PIPE FOR SEWER GAS.' , fx: ['fade:puddle'] },
      { t: 'SET THE NEW WAX RING', tool: 'waxring', type: 'drag', to: 'flange', tip: 'CENTER IT ON THE FLANGE. YOU ONLY GET ONE SHOT - DON\'T SMOOSH IT TWICE.' },
      { t: 'SET TOILET & TIGHTEN EVENLY', tool: 'wrench', type: 'hold', target: 'bolts', zone: [0.55, 0.72], label: 'TORQUE', tip: 'ALTERNATE SIDES. OVER-TIGHTEN AND YOU CRACK THE PORCELAIN.' , pre: ['restore:toilet'] },
      { t: 'RECONNECT & TURN IT ON', tool: 'hand', type: 'turn', target: 'valve', dir: -1, turns: 1.25, tip: 'FLUSH A FEW TIMES AND CHECK THE BASE. NO SQUISH, BRO.' , pre: ['restore:supplyLine'] },
    ] },

  // ----------------------------------------------------------------- WEST SEATTLE
  { title: 'NO HOT WATER', scene: 'heater', variant: 'gas', address: '4520 CALIFORNIA AVE SW',
    who: 'GRANDMA NGUYEN', look: { skin: 'tan', hair: 'grey', style: 'perm', beard: 'none', shirt: '#a22633', glasses: true },
    house: { style: 'rambler', body: '#ead4aa', trim: '#a22633', roof: '#3e2731', door: '#a22633', extra: 'garden' },
    call: 'NO HOT WATER! HOW I MAKE PHO FOR 30 GRANDKIDS WITH COLD WATER? YOU FIX. NOW. PLEASE.', decoys: ['hammer', 'wd40'],
    steps: [
      { t: 'GAS CONTROL TO PILOT', tool: 'hand', type: 'turn', target: 'gas', dir: 1, turns: 0.5, tip: 'TURN THE GAS CONTROL KNOB TO "PILOT" BEFORE ANY WORK.', early: 'YOU OPENED THE DRAIN WITH THE BURNER RUNNING. THE TANK SCREAMS. GRANDMA SCREAMS LOUDER.' },
      { t: 'CLOSE THE COLD INLET', tool: 'hand', type: 'turn', target: 'cold', dir: 1, turns: 1.25, tip: 'THE VALVE ON THE COLD PIPE ON TOP. STOPS THE TANK REFILLING WHILE YOU FLUSH.' },
      { t: 'HOOK A HOSE TO THE DRAIN', tool: 'hose', type: 'drag', to: 'drain', tip: 'RUN THE HOSE TO A FLOOR DRAIN OR OUTSIDE. THE WATER IS HOT - CAREFUL!' },
      { t: 'OPEN DRAIN & FLUSH SEDIMENT', tool: 'hand', type: 'hold', target: 'drain', zone: [0.75, 0.95], label: 'CLEAR', tip: 'PNW WATER IS SOFT, BUT SEDIMENT STILL BUILDS UP. FLUSH TILL IT RUNS CLEAR.' },
      { t: 'CLOSE DRAIN & REFILL', tool: 'hand', type: 'turn', target: 'cold', dir: -1, turns: 1.25, tip: 'REFILL COMPLETELY BEFORE RELIGHTING - A DRY BURN RUINS THE TANK.' , pre: ['hide:hose'] },
      { t: 'RELIGHT THE PILOT', tool: 'lighter', type: 'rhythm', target: 'ignite', hits: 3, tip: 'HOLD THE PILOT BUTTON, CLICK THE IGNITER. HOLD 30 SEC SO THE THERMOCOUPLE HEATS.' , fx: ['show:flame'] },
    ] },
  { title: 'SUMP PUMP DEAD', scene: 'sump', variant: 'storm', rising: 'sumpwater', address: '3257 BEACH DR SW',
    who: 'THE OKAFORS', look: { skin: 'dark', hair: 'black', style: 'afro', beard: 'full', shirt: '#feae34', glasses: false },
    house: { style: 'rambler', body: '#265c42', trim: '#fee761', roof: '#262b44', door: '#feae34', extra: 'drums' },
    call: 'ATMOSPHERIC RIVER! THE BASEMENT IS FLOODING AND OUR DRUM KIT IS FLOATING. WE HAVE A GIG TONIGHT!', decoys: ['ducttape', 'drano'],
    steps: [
      { t: 'UNPLUG THE PUMP', tool: 'hand', type: 'pull', target: 'plug', dir: [1, 0], dist: 30, tip: 'WATER + ELECTRICITY. UNPLUG BEFORE YOU TOUCH ANYTHING IN THE PIT.', early: 'YOU STUCK YOUR HAND IN A LIVE SUMP PIT. YOUR HAIR IS NOW STRAIGHT UP. BZZT.' },
      { t: 'LIFT THE PUMP OUT', tool: 'hand', type: 'pull', target: 'pump', dir: [0, -1], dist: 100, tip: 'LIFT BY THE DISCHARGE PIPE OR HANDLE - NEVER BY THE CORD.' , keep: true, fx: ['show:screen'] },
      { t: 'CLEAR THE INTAKE SCREEN', tool: 'brush', type: 'scrub', target: 'screen', amount: 1, tip: 'GRAVEL, SILT AND PNW MOSS CLOG THE INTAKE. SCRUB IT CLEAR.' },
      { t: 'PULL DEBRIS OFF THE FLOAT', tool: 'hand', type: 'taps', target: 'pit', count: 4, tip: 'A STUCK FLOAT SWITCH NEVER TELLS THE PUMP TO RUN. CLEAR EVERYTHING AROUND IT.' },
      { t: 'SET PUMP BACK IN THE PIT', tool: 'hand', type: 'drag', item: 'pumpIn', to: 'pit', tip: 'LEVEL ON THE PIT FLOOR, FLOAT FREE TO MOVE, NOT TOUCHING THE WALLS.' , fx: ['hide:screen'] },
      { t: 'PLUG IN & TEST', tool: 'hand', type: 'drag', item: 'plugIn', to: 'outlet', tip: 'IT SHOULD KICK ON AS THE WATER RISES. ADD A BATTERY BACKUP IN STORM SEASON!' , fx: ['lower:sumpwater', 'motor'] },
    ] },
  { title: 'BURST PIPE (FREEZE)', scene: 'crawl', variant: 'burst', leak: { x: 160, y: 146, until: 0, kind: 'spray' }, address: '5906 44TH AVE SW',
    who: 'PREPPER DEREK', look: { skin: 'light', hair: 'brown', style: 'buzz', beard: 'full', shirt: '#3e8948', glasses: false, camo: true },
    house: { style: 'rambler', body: '#3a4466', trim: '#8b9bb4', roof: '#181425', door: '#3e8948', extra: 'bunker' },
    call: "FIVE-YEAR FOOD SUPPLY IN THE CRAWLSPACE AND THE COLD SNAP SPLIT A PIPE. MY BEANS ARE DROWNING!", decoys: ['ducttape', 'gum'],
    steps: [
      { t: 'KILL THE MAIN SHUTOFF', tool: 'hand', type: 'turn', target: 'main', dir: 1, turns: 2, tip: 'KNOW WHERE YOUR MAIN IS BEFORE THE FREEZE. CLOCKWISE TILL IT STOPS.', early: 'YOU CUT A LIVE PIPE. FIRE HOSE TO THE FACE. DEREK SALUTES YOUR SACRIFICE.' },
      { t: 'CUT OUT THE SPLIT SECTION', tool: 'cutter', type: 'turn', target: 'split', dir: 1, turns: 2.5, tip: 'A TUBING CUTTER GIVES A SQUARE CUT. TIGHTEN A LITTLE EACH SPIN.' , fx: ['hide:split'] },
      { t: 'DEBURR THE PIPE ENDS', tool: 'deburr', type: 'scrub', target: 'ends', amount: 0.8, tip: 'BURRS SLICE THE O-RING IN A PUSH FITTING. SMOOTH INSIDE AND OUT.' },
      { t: 'PUSH ON THE COUPLING', tool: 'coupling', type: 'drag', to: 'split', tip: 'MARK THE INSERTION DEPTH, THEN PUSH TILL IT HITS THE MARK. CLICK!' },
      { t: 'OPEN THE MAIN - SLOWLY', tool: 'hand', type: 'turn', target: 'main', dir: -1, turns: 2, tip: 'SLOWLY! A SUDDEN SLAM OF PRESSURE CAN BLOW WEAK JOINTS.' },
      { t: 'WRAP IT IN PIPE FOAM', tool: 'foam', type: 'drag', to: 'split', tip: 'INSULATE CRAWLSPACE PIPES AND DRIP FAUCETS ON FREEZING NIGHTS.' },
    ] },

  // ----------------------------------------------------------------- QUEEN ANNE
  { title: 'ROOTS IN THE SEWER', scene: 'yard', variant: 'roots', address: '2310 QUEEN ANNE AVE N',
    who: 'MRS. WORTHINGTON', look: { skin: 'fair', hair: 'white', style: 'updo', beard: 'none', shirt: '#68386c', glasses: true, pearls: true },
    house: { style: 'mansion', body: '#ead4aa', trim: '#265c42', roof: '#193c3e', door: '#265c42', extra: 'cedar' },
    call: 'EVERY DRAIN IN THE HOUSE GURGLES. THE BASEMENT SMELLS OF... POOR PEOPLE. KINDLY REMEDY THIS.', decoys: ['drano', 'hammer'],
    steps: [
      { t: 'OPEN THE CLEANOUT CAP', tool: 'wrench', type: 'turn', target: 'cap', dir: -1, turns: 1.5, tip: 'CAREFUL - A BACKED-UP LINE WILL BURP WHEN THE CAP COMES OFF. STAND TO THE SIDE.' , fx: ['away:cap'] },
      { t: 'CAMERA: FIND THE ROOTS', tool: 'camera', type: 'taps', target: 'screen', count: 4, tip: 'OLD CLAY PIPE + 100-YEAR-OLD CEDARS = ROOTS IN EVERY JOINT. SPOT THEM ALL.' },
      { t: 'DRUM AUGER + ROOT CUTTER', tool: 'drum', type: 'crank', target: 'cap', turns: 4, jams: 3, tip: 'FEED SLOWLY. WHEN IT GRABS, BACK OFF AND LET THE CUTTER CHEW.' },
      { t: 'HYDRO-JET THE LINE', tool: 'jetter', type: 'rhythm', target: 'cap', hits: 4, tip: 'HIGH-PRESSURE WATER SCOURS ROOT HAIR OFF THE PIPE WALLS.' },
      { t: 'CAP THE CLEANOUT', tool: 'wrench', type: 'turn', target: 'cap', dir: 1, turns: 1.25, tip: 'RECOMMEND A LINER OR REPLACEMENT. THE ROOTS WILL BE BACK. THEY ALWAYS COME BACK.' , pre: ['restore:cap'] },
    ] },
  { title: 'LEAKY HOSE BIB', scene: 'bib', variant: 'frostfree', leak: { x: 178, y: 176, until: 0, kind: 'drip' }, address: '810 W HIGHLAND DR',
    who: 'JUDGE HARLAN', look: { skin: 'dark', hair: 'white', style: 'bald', beard: 'stache', shirt: '#181425', glasses: true, bowtie: true },
    house: { style: 'tudor', body: '#ead4aa', trim: '#3e2731', roof: '#3e2731', door: '#3e2731', extra: 'hedge' },
    call: 'MY OUTDOOR SPIGOT DRIPS INCESSANTLY. THE GARDEN CLUB ARRIVES IN AN HOUR. THIS COURT DEMANDS SWIFT JUSTICE.', decoys: ['ducttape', 'wd40'],
    steps: [
      { t: 'SHUT THE INSIDE VALVE', tool: 'hand', type: 'turn', target: 'inside', dir: 1, turns: 1.5, tip: 'FROST-FREE BIBS HAVE A LONG STEM - THE SHUTOFF IS INSIDE THE HOUSE.', early: 'YOU OPENED A LIVE BIB. THE JUDGE HOLDS YOU IN CONTEMPT (AND IN A PUDDLE).' },
      { t: 'REMOVE THE HANDLE SCREW', tool: 'driver', type: 'turn', target: 'bibhandle', dir: -1, turns: 1, tip: 'THE HANDLE COMES OFF TO EXPOSE THE PACKING NUT.' , fx: ['away:bibhandle'] },
      { t: 'UNSCREW THE PACKING NUT', tool: 'wrench', type: 'turn', target: 'packing', dir: -1, turns: 1.5, tip: 'HOLD THE BIB BODY STEADY SO YOU DON\'T TWIST THE PIPE INSIDE THE WALL.' , fx: ['away:packing', 'show:stem'] },
      { t: 'PULL OUT THE LONG STEM', tool: 'pliers', type: 'pull', target: 'stem', dir: [1, 0], dist: 60, tip: 'FROST-FREE STEMS ARE 6-12" LONG. THE WASHER IS WAY DOWN AT THE END.' , keep: true },
      { t: 'SWAP THE SEAT WASHER', tool: 'washer', type: 'drag', to: 'stemTip', tip: 'A WORN WASHER IS 90% OF DRIPPY BIBS. BRING THE OLD ONE TO MATCH IT.' },
      { t: 'REINSTALL & SNUG PACKING', tool: 'wrench', type: 'hold', target: 'packing', zone: [0.55, 0.75], label: 'TORQUE', tip: 'SNUG THE PACKING NUT JUST ENOUGH TO STOP STEM WEEPING.' , pre: ['restore:stem', 'restore:packing'] },
      { t: 'OPEN THE INSIDE VALVE', tool: 'hand', type: 'turn', target: 'inside', dir: -1, turns: 1.5, tip: 'IN FALL: DISCONNECT HOSES OR THE BIB CAN STILL FREEZE AND SPLIT.' , pre: ['restore:bibhandle'] },
    ] },
  { title: 'SEIZED MAIN SHUTOFF', scene: 'basement', variant: 'main', address: '1 KERRY PARK PL (THE GALA)',
    who: 'THE GALA HOST', look: { skin: 'brown', hair: 'black', style: 'slick', beard: 'goatee', shirt: '#181425', glasses: false, bowtie: true },
    house: { style: 'mansion', body: '#ffffff', trim: '#124e89', roof: '#262b44', door: '#feae34', extra: 'gala' },
    call: 'NORTHWEST SNAPPED MY MAIN VALVE HANDLE OFF AND LEFT. 300 GUESTS. ONE HOUR. SAVE US, THE HOMIES!', decoys: ['ducttape', 'hammer', 'beer'],
    steps: [
      { t: 'STREET SHUTOFF: METER KEY', tool: 'meterkey', type: 'turn', target: 'curb', dir: 1, turns: 0.5, tip: 'THE CURB STOP IN THE METER BOX. A QUARTER TO HALF TURN, NO MUSCLE NEEDED.', early: 'YOU CUT A LIVE MAIN. THE GALA NOW HAS AN INDOOR FOUNTAIN.' },
      { t: 'DRAIN THE LINES', tool: 'hand', type: 'tap', target: 'lowtap', tip: 'OPEN THE LOWEST FAUCET IN THE HOUSE TO DRAIN THE PIPES.' },
      { t: 'CUT OUT THE OLD GATE VALVE', tool: 'cutter', type: 'turn', target: 'main', dir: 1, turns: 3, tip: 'OLD GATE VALVES SEIZE AND SNAP. BALL VALVES ARE THE MODERN FIX.' , fx: ['hide:main'] },
      { t: 'DEBURR & CLEAN THE PIPE', tool: 'deburr', type: 'scrub', target: 'ends', amount: 1, tip: 'CLEAN, SMOOTH ENDS ARE EVERYTHING FOR A GOOD SEAL.' },
      { t: 'FIT THE NEW BALL VALVE', tool: 'ballvalve', type: 'drag', to: 'main', tip: 'FLOW ARROW POINTS AWAY FROM THE STREET. DOUBLE-CHECK. THEN CHECK AGAIN.' },
      { t: 'PRESS THE FITTINGS', tool: 'crimper', type: 'rhythm', target: 'main', hits: 4, tip: 'A PRESS TOOL SEALS COPPER IN SECONDS - NO TORCH NEEDED IN A MANSION.' },
      { t: 'STREET WATER ON - SLOWLY', tool: 'meterkey', type: 'turn', target: 'curb', dir: -1, turns: 0.5, tip: 'SLOWLY. LET THE PIPES FILL WITHOUT A HAMMER BANG.' },
      { t: 'BLEED THE AIR', tool: 'hand', type: 'taps', target: 'faucets', count: 3, tip: 'OPEN FAUCETS UNTIL THE SPUTTERING STOPS. THE GALA IS SAVED!' },
    ] },

  // ----------------------------------------------------------------- ALKI BEACH (bonus)
  { title: 'HAIR-CLOGGED BATHROOM SINK', scene: 'sink', variant: 'alki', address: '2600 ALKI AVE SW, APT 3', bonus: true,
    who: 'JIMMY', look: { skin: 'tan', hair: 'brown', style: 'long', beard: 'stubble', shirt: '#e43b44', jacked: true },
    house: { style: 'townhouse', body: '#feae34', trim: '#ffffff', roof: '#124e89', door: '#0099db', extra: 'alki' },
    call: "BRO. MY SINK WON'T DRAIN. I RINSE MY HAIR IN IT AFTER KAYAKING. ALSO BOY - MY SQUIRREL - MIGHT'VE STASHED AN ACORN IN THERE. HE DOES THAT.", decoys: ['drano', 'beer', 'gum'],
    steps: [
      { t: 'UNSCREW THE PIVOT NUT', tool: 'pliers', type: 'turn', target: 'pivot', dir: -1, turns: 1, tip: 'BEHIND THE DRAIN PIPE UNDER THE SINK. IT HOLDS THE POP-UP ROD IN PLACE.', early: 'YOU YANKED THE STOPPER WITH THE ROD STILL HOOKED. SNAP. JIMMY FLEXES SADLY.' },
      { t: 'SLIDE OUT THE PIVOT ROD', tool: 'hand', type: 'pull', target: 'rod', dir: [1, 0], dist: 28, tip: 'THE ROD HOOKS THROUGH THE STOPPER. PULL IT BACK AND THE STOPPER COMES FREE.' },
      { t: 'LIFT OUT THE POP-UP STOPPER', tool: 'hand', type: 'pull', target: 'popup', dir: [0, -1], dist: 26, keep: true, tip: 'NINE TIMES OUT OF TEN THE CLOG IS WRAPPED RIGHT AROUND THE STOPPER.', fx: ['show:popGrime', 'show:hairS'] },
      { t: 'SCRUB THE STOPPER', tool: 'brush', type: 'scrub', target: 'popGrime', amount: 0.9, tip: 'SOAP SCUM + TOOTHPASTE + HAIR = THE GRAY STUFF. SCRUB IT OFF.' },
      { t: 'ZIP-IT: HAIR + ONE ACORN', tool: 'zipit', type: 'pull', target: 'hairS', dir: [0, -1], dist: 56, tip: "LONG HAIR MAKES ROPE IN THE DRAIN. A ZIP-IT PULLS IT OUT. (BOY WANTS HIS ACORN BACK.)" },
      { t: 'SNUG THE PIVOT NUT', tool: 'pliers', type: 'hold', target: 'pivot', zone: [0.55, 0.75], label: 'TORQUE', pre: ['restore:popup', 'hide:popGrime', 'restore:rod'], tip: 'STOPPER BACK IN, ROD THROUGH THE HOLE, NUT SNUG. TOO TIGHT AND THE STOPPER WON\'T MOVE.' },
      { t: 'RUN THE WATER', tool: 'hand', type: 'tap', target: 'fhandle', tip: 'DRAINS LIKE A RIPTIDE. TELL JIMMY TO USE A HAIR CATCHER. HE WILL NOT.' },
    ] },
];

// Tray contents for a job: every required tool/part + decoys + distractor tools, max 10.
const DISTRACT = ['wrench', 'pliers', 'driver', 'plunger', 'bucket', 'snake', 'brush', 'tongs', 'cupplunger', 'scraper'];
export function trayFor(job) {
  const need = [...new Set(['hand', ...job.steps.filter(s => !s.item).map(s => s.tool)])];
  const out = [...need];
  for (const d of job.decoys) if (out.length < 10) out.push(d);
  for (const d of DISTRACT) if (out.length < 10 && !out.includes(d)) out.push(d);
  return out;
}

JOBS.forEach((j, i) => { j.id = i; j.district = Math.floor(i / 3); });
export const MAIN_JOBS = 15;
