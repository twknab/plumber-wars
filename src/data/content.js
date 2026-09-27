// Game content: crew, rivals, districts, trash talk. Jobs live in jobs.js.

export const HEROES = [
  { id: 'dalton', name: 'DALTON', role: 'THE WHEELMAN', color: '#feae34', stats: { drive: 5, fix: 2, charm: 3 },
    perk: 'VAN HANDLES 25% SHARPER. +1 ARMOR.', assist: 'DALTON: CLEAR THE ROAD', assistShort: 'CLEAR ROAD',
    look: { skin: 'light', hair: 'brown', style: 'cap', beard: 'stubble', shirt: '#feae34', patch: true }, pitch: 1.0,
    barks: ['SUCK IT, NORTHWEST!', 'EAT MY TAILPIPE, RANDY!', 'NICE MULLET, SKEETER!', 'I DRIVE LIKE I PLUNGE: HARD!'] },
  { id: 'milan', name: 'MILAN', role: 'THE PIPE WHISPERER', color: '#63c74d', stats: { drive: 2, fix: 5, charm: 3 },
    perk: 'WIDER TIMING WINDOWS. FASTER WRENCHING.', assist: 'MILAN: FINISH THIS STEP', assistShort: 'AUTO-FIX',
    look: { skin: 'tan', hair: 'black', style: 'beanie', beard: 'full', shirt: '#63c74d', patch: true }, pitch: 0.85,
    barks: ['YOUR CRACK IS SHOWING, RANDY!', 'EAT A WET WIPE!', 'THE PIPES FEAR ME!', 'I SPEAK FLUENT DRAIN!'] },
  { id: 'jared', name: 'JARED', role: 'THE PEOPLE PERSON', color: '#0099db', stats: { drive: 3, fix: 3, charm: 5 },
    perk: 'CUSTOMERS STAY PATIENT 30% LONGER.', assist: 'JARED: SWEET-TALK +12S', assistShort: '+12 SEC',
    look: { skin: 'fair', hair: 'ginger', style: 'swoop', beard: 'none', shirt: '#0099db', patch: true }, pitch: 1.2,
    barks: ['BLESS YOUR HEART, DIPSHIT!', 'I WILL LITERALLY FIVE-STAR YOUR MOM!', 'SEE YOU NEVER, NORTHWEST!', 'HONK IF YOU SUCK!'] },
];

export const RIVALS = {
  randy: { name: 'BIG RANDY', role: 'NORTHWEST DRIVER', look: { skin: 'ruddy', hair: 'brown', style: 'trucker', beard: 'stache', shirt: '#e43b44' } },
  skeeter: { name: 'SKEETER', role: 'NORTHWEST THROWER', look: { skin: 'light', hair: 'blond', style: 'mullet', beard: 'goatee', shirt: '#e43b44' } },
};

export const DISTRICTS = [
  { name: 'BALLARD', tag: 'LUTEFISK, LAGERS & LOW-FLOW TOILETS.', weather: 'clear', time: 'day', sky: 'day', road: 'NW MARKET ST', rain: 0 },
  { name: 'FREMONT', tag: 'CENTER OF THE UNIVERSE. CENTER OF THE CLOGS.', weather: 'cloudy', time: 'day', sky: 'overcast', road: 'N 36TH ST', rain: 0.25 },
  { name: 'CAPITOL HILL', tag: 'STEEP HILLS. OLD PIPES. NO PARKING.', weather: 'drizzle', time: 'day', sky: 'overcast', road: 'E PINE ST', rain: 0.55 },
  { name: 'WEST SEATTLE', tag: 'THE BRIDGE IS OPEN. THE SEWERS ARE NOT.', weather: 'storm', time: 'dusk', sky: 'dusk', road: 'CALIFORNIA AVE SW', rain: 1 },
  { name: 'QUEEN ANNE', tag: 'OLD MONEY. OLDER PLUMBING. FINAL SHOWDOWN.', weather: 'storm', time: 'night', sky: 'night', road: 'W HIGHLAND DR', rain: 0.8 },
  { name: 'ALKI BEACH', tag: 'BONUS: VOLLEYBALL, FISH & CHIPS & ONE ENORMOUS DUDE.', weather: 'clear', time: 'day', sky: 'day', road: 'ALKI AVE SW', rain: 0, bonus: true },
];

// Difficulty curve per job index (0..14).
export const BONUS = 15; // Alki Beach bonus job (unlocks with West Seattle, not needed for the finale)
export function difficulty(i) {
  const t = (i === BONUS ? 10 : i) / 14; const d = Math.floor(i / 3);
  return {
    district: d, t,
    raceLength: Math.round(14000 + i * 800),          // px of road to the house
    rivalSpeed: 0.9 + t * 0.14,                      // fraction of player top speed
    rivalRamEvery: 7 - t * 4.2,                      // seconds between ram attempts
    rivalThrowEvery: 6.5 - t * 3.8,
    traffic: 0.95 + t * 1.5,                          // spawns per second-ish
    oncoming: d >= 1,                                // left lanes carry oncoming traffic from Fremont on
    hazards: 0.35 + t * 0.9,
    repairFactor: 1.55 - t * 0.62,                   // multiplier on repair clock
    window: 1 - t * 0.45,                            // timing window scale
    toolHints: d === 0,                              // Ballard: correct tool glows
    stepChoice: d >= 2,                              // Capitol Hill on: pick the next step yourself
    penalty: 5 + d * 1.5,                            // seconds lost per mistake
  };
}

export const TRASH = {
  taunt: [
    'EAT MY EXHAUST, YOU PIPE-LICKING PISSANTS!', "THAT JOB'S OURS, TURD BURGLARS!", 'YOUR VAN SMELLS LIKE A BACKED-UP SHITTER!',
    "G'S PLUMBING? MORE LIKE G'S DUMB-ING!", "I'VE SEEN BETTER DRIVING FROM A FLOATING DEUCE!", 'MOVE IT, DIPSHIT! I GOT CLOGS TO OVERCHARGE!',
    'WHO TAUGHT YOU TO DRIVE, A RACCOON ON METH?', 'NICE VAN. YOU FIND IT IN A SEPTIC TANK?', "YOU COULDN'T SNAKE A DRAIN IF IT BIT YOUR ASS!",
    "WE'RE #2 AT #2, BABY! YOU'RE DEAD LAST!", 'PULL OVER AND GO CRY IN A BIDET!', 'FLUSH YOURSELVES, LOSERS!',
    'THIS AIN\'T CALIFORNIA! LEARN TO MERGE, ASSHOLE!', 'GO BACK TO TACOMA!', "I'LL PLUNGE YOUR FACE, YOU FLAPPER-FONDLING FREAK!",
    'HEY HOMIES! HOW DOES MY BUMPER TASTE?', 'SLOWER THAN A HAIR CLOG IN JANUARY!', 'YOU DRIVE LIKE YOU WIPE: BACKWARDS!',
    'DAMN IT, THE MARINERS LOST AND NOW YOU?!', '#$%@ OFF, THE HOMIES!', 'YOUR MOMMA CALLED. HER DRAIN IS SLOW. I\'M ON IT.',
    'OUT OF MY LANE, CRACK FLASHERS!', 'SMELL YA LATER, SEWER RATS!', "I'M GONNA BILL YOU FOR THIS ASS-KICKING!",
  ],
  ram: ['RAMMING SPEED, SKEETER!', 'HOLD MY COFFEE!', 'SAY HELLO TO MY BUMPER, BITCH!', 'SIDESWIPE THE SUCKERS!', 'INCOMING, DUMBASS!', 'GET IN THE DITCH!'],
  hurt: ['MY TRUCK! YOU SON OF A PLUMBER!', 'SON OF A BITCH, I JUST WAXED THAT!', "OW! MY COFFEE! IT'S IN MY CRACK!", "YOU'RE PAYING FOR THAT, ASSHAT!", 'SKEETER, GET THEIR PLATE!', 'MY MUSTACHE! YOU BENT MY MUSTACHE!'],
  throw: ['CATCH, DIPSHIT!', 'SPECIAL DELIVERY FROM THE SEPTIC TANK!', 'HERE, HAVE A USED PLUNGER!', 'BOMBS AWAY, BUTTHEADS!', 'EAT IT, HOMIES!', 'FRESH FROM THE BOWL!'],
  win: ['HAHA! WE\'LL TELL THE CUSTOMER YOU SAID HI! AND CHARGE TRIPLE!', 'TOO SLOW, TURD TOSSERS! THIS HOUSE IS NORTHWEST COUNTRY!', 'GO HOME AND CRY INTO YOUR P-TRAP!'],
  lose: ["THIS AIN'T OVER, G'S! ...SKEETER, WHERE'S THE NEXT JOB?", 'DAMN IT! DAMN IT ALL TO HELL!', 'WE\'LL GET YOU NEXT TIME, YOU CLOG-HUGGING HIPPIES!'],
  steal: ['OUT OF THE WAY, AMATEURS. REAL PLUMBERS COMING THROUGH!', 'TOLD YA. NORTHWEST ALWAYS WINS!'],
};

export const pick = a => a[Math.floor(Math.random() * a.length)];
