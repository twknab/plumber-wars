// Game content: crew, rivals, districts, trash talk. Jobs live in jobs.js.

export const HEROES = [
  { id: 'dalton', name: 'DALTON', role: 'THE WHEELMAN', color: '#feae34', stats: { drive: 5, fix: 2, charm: 3 },
    perk: 'VAN HANDLES 25% SHARPER. +1 ARMOR.', assist: 'DALTON: CLEAR THE ROAD', assistShort: 'CLEAR ROAD',
    // Caucasian, 6'0" 180 lb, strong. Short haircut + short beard, brown eyes, white tee, black cap forward, black pants.
    look: { skin: 'light', hair: 'brown', style: 'cap', hat: '#181425', beard: 'short', eyes: 'brown', shirt: '#ffffff', pants: '#181425', build: 'strong', patch: true }, pitch: 1.0,
    barks: ['SUCK IT, NORTHWEST!', 'EAT MY TAILPIPE, RANDY!', 'NICE MULLET, SKEETER!', 'I DRIVE LIKE I PLUNGE: HARD!', 'YOUR TRUCK SMELLS LIKE YOUR BREATH, RANDY!', 'GO FLUSH YOURSELF, SKEETER!'] },
  { id: 'milan', name: 'MILAN', role: 'THE PIPE WHISPERER', color: '#63c74d', stats: { drive: 2, fix: 5, charm: 3 },
    perk: 'WIDER TIMING WINDOWS. FASTER WRENCHING.', assist: 'MILAN: FINISH THIS STEP', assistShort: 'AUTO-FIX',
    // Asian / Pacific Islander, 6'0" 180 lb, strong. Long black hair in a ponytail under a dark red stocking cap,
    // clean-shaven, brown eyes, light-brown skin, white tee, dark red pants.
    look: { skin: 'tan', hair: 'black', style: 'beaniepony', hat: '#a22633', beard: 'none', eyes: 'brown', shirt: '#ffffff', pants: '#a22633', build: 'strong', patch: true }, pitch: 0.85,
    barks: ['YOUR CRACK IS SHOWING, RANDY!', 'EAT A WET WIPE!', 'THE PIPES FEAR ME!', 'I SPEAK FLUENT DRAIN!', 'I\'VE SEEN SMARTER CLOGS THAN YOU, RANDY!', 'NICE PLUNGER, DID YOUR MOM BUY IT?'] },
  { id: 'jared', name: 'JARED', role: 'THE PEOPLE PERSON', color: '#0099db', stats: { drive: 3, fix: 3, charm: 5 },
    perk: 'CUSTOMERS STAY PATIENT 30% LONGER.', assist: 'JARED: SWEET-TALK +12S', assistShort: '+12 SEC',
    // Caucasian, 6'0" 200 lb, stockier build. Blue eyes, smoky blonde hair, white shirt, navy pants, navy cap forward.
    look: { skin: 'fair', hair: 'ash', style: 'cap', hat: '#124e89', beard: 'none', eyes: 'blue', shirt: '#ffffff', pants: '#124e89', build: 'stocky', patch: true }, pitch: 1.2,
    barks: ['BLESS YOUR HEART, DIPSHIT!', 'I WILL LITERALLY FIVE-STAR YOUR MOM!', 'SEE YOU NEVER, NORTHWEST!', 'HONK IF YOU SUCK!', 'YOUR REVIEWS ARE ONE STAR AND A POOP EMOJI!', 'KISS MY GLORIOUS ASS, NORTHWEST!'] },
];

export const RIVALS = {
  randy: { name: 'BIG RANDY', role: 'NORTHWEST DRIVER', look: { skin: 'ruddy', hair: 'brown', style: 'trucker', beard: 'stache', shirt: '#e43b44' } },
  skeeter: { name: 'SKEETER', role: 'NORTHWEST THROWER', look: { skin: 'light', hair: 'blond', style: 'mullet', beard: 'goatee', shirt: '#e43b44' } },
};

export const DISTRICTS = [
  { name: 'BALLARD', art: 'ballard', tag: 'LUTEFISK, LAGERS & LOW-FLOW TOILETS.', weather: 'clear', time: 'day', sky: 'day', road: 'NW MARKET ST', rain: 0 },
  { name: 'FREMONT', art: 'fremont', tag: 'CENTER OF THE UNIVERSE. CENTER OF THE CLOGS.', weather: 'cloudy', time: 'day', sky: 'overcast', road: 'N 36TH ST', rain: 0.25 },
  { name: 'CAPITOL HILL', art: 'capitolhill', tag: 'STEEP HILLS. OLD PIPES. NO PARKING.', weather: 'drizzle', time: 'day', sky: 'overcast', road: 'E PINE ST', rain: 0.55 },
  { name: 'WEST SEATTLE', art: 'westseattle', tag: 'THE BRIDGE IS OPEN. THE SEWERS ARE NOT.', weather: 'storm', time: 'dusk', sky: 'dusk', road: 'CALIFORNIA AVE SW', rain: 1 },
  { name: 'QUEEN ANNE', art: 'queenanne', tag: 'OLD MONEY. OLDER PLUMBING. FINAL SHOWDOWN.', weather: 'storm', time: 'night', sky: 'night', road: 'W HIGHLAND DR', rain: 0.8 },
  { name: 'ALKI BEACH', art: 'alki', tag: 'BEACH VIBES, TIDEPOOLS, GOOD EATS & OCEAN VIEWS.', weather: 'clear', time: 'day', sky: 'day', road: 'ALKI AVE SW', rain: 0 },
];

// Difficulty curve per job index (0..14).
export const BONUS = 15; // Alki Beach (Timmy's tub): stored last, but played between West Seattle and Queen Anne
// Campaign order (job indexes). Alki is required: Queen Anne stays locked until Timmy's tub drains.
export const ORDER = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, BONUS, 12, 13, 14];
export const jobNo = ji => ORDER.indexOf(ji) + 1;                 // 1-based number shown to the player
export const nextJob = ji => ORDER[ORDER.indexOf(ji) + 1];        // undefined after the finale job
export const districtJobs = d => (d === 5 ? [BONUS] : [d * 3, d * 3 + 1, d * 3 + 2]);
export function difficulty(i) {
  const t = (i === BONUS ? 10 : i) / 14; const d = Math.floor(i / 3);
  return {
    district: d, t,
    raceLength: Math.round(14000 + Math.min(i, 14) * 480),          // px of road to the house
    rivalSpeed: 0.9 + t * 0.14,                      // fraction of player top speed
    rivalRamEvery: 7 - t * 4.2,                      // seconds between ram attempts
    rivalThrowEvery: 6.5 - t * 3.8,
    traffic: 0.95 + t * 0.55,                          // spawn density (capped: at 1.5x the late game was a wall of cars)
    oncoming: d >= 1,                                // left lanes carry oncoming traffic from Fremont on
    hazards: 0.35 + t * 0.7,
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
    "THIS AIN'T CALIFORNIA! LEARN TO MERGE, ASSHOLE!", 'GO BACK TO TACOMA!', "I'LL PLUNGE YOUR FACE, YOU FLAPPER-FONDLING FREAK!",
    'HEY HOMIES! HOW DOES MY BUMPER TASTE?', 'SLOWER THAN A HAIR CLOG IN JANUARY!', 'YOU DRIVE LIKE YOU WIPE: BACKWARDS!',
    'DAMN IT, THE MARINERS LOST AND NOW YOU?!', '#$%@ OFF, HOMIES!', "YOUR MOMMA CALLED. HER DRAIN IS SLOW. I'M ON IT.",
    'OUT OF MY LANE, CRACK FLASHERS!', 'SMELL YA LATER, SEWER RATS!', "I'M GONNA BILL YOU FOR THIS ASS-KICKING!",
    "YOU FLUSH LIKE A GIRL SCOUT AND DRIVE LIKE A GODDAMN GLACIER!", 'I SHIT BIGGER THAN YOUR WHOLE COMPANY!',
    "EAT A BAG OF WET WIPES, YOU CLOG-CODDLING BUTTMUNCHES!", "I'VE PULLED SMARTER THINGS OUT OF A GREASE TRAP!",
    "YOUR BUTT CRACK HAS MORE CUSTOMERS THAN YOU DO!", 'SUCK MY SUMP PUMP, HOMIES!', 'HONK IF YOU LOVE SNIFFING SEWER GAS!',
    "YOU COULDN'T FIND A LEAK IF IT PISSED IN YOUR COFFEE!", "I'LL SNAKE YOUR GRANDMA'S DRAIN AND CHARGE HER DOUBLE!",
    'KISS MY HAIRY WAX RING!', "I'M GONNA PARK THIS TRUCK SO FAR UP YOUR TAILPIPE YOU'LL TASTE DIESEL!",
    'NICE PIPES, NERDS! TOO BAD THEY LEAK!', "GO SNIFF A P-TRAP, YOU SEWER-SUCKING SUCKERS!",
    "I'VE HAD BOWEL MOVEMENTS WITH MORE HUSTLE THAN YOU!", 'YOUR SNAKE IS SHORT AND YOUR VAN IS SLOW!',
    "YOU'RE THE REASON THEY PUT 'DO NOT FLUSH' SIGNS UP!", 'FRESH OUT OF THE BOWL AND STILL SMELLING LIKE IT!',
    "YOUR MOMMA'S SO WIDE SHE CLOGGED THE SHIP CANAL!", "IS THAT A VAN OR A PORTA-POTTY ON WHEELS?!",
  ],
  ram: ['RAMMING SPEED, SKEETER!', 'HOLD MY COFFEE!', 'SAY HELLO TO MY BUMPER, BITCH!', 'SIDESWIPE THE SUCKERS!', 'INCOMING, DUMBASS!', 'GET IN THE DITCH!',
    'KISS THE CURB, CRAPHEADS!', "BRACE YOUR BUTTHOLES, HOMIES!", 'TIME TO SWIRLY THIS VAN!', "SKEETER, HIT 'EM WHERE THE SHIT GOES!"],
  hurt: ['MY TRUCK! YOU SON OF A PLUMBER!', 'SON OF A BITCH, I JUST WAXED THAT!', "OW! MY COFFEE! IT'S IN MY CRACK!", "YOU'RE PAYING FOR THAT, ASSHAT!", 'SKEETER, GET THEIR PLATE!', 'MY MUSTACHE! YOU BENT MY MUSTACHE!',
    'I JUST SHAT MY CARHARTTS!', 'WHAT THE HELL, YOU TOILET GOBLINS?!', "THAT'S IT, I'M TELLING MY MOM!", 'SKEETER, I THINK I PEED A LITTLE!', 'MY TRUCK PAYMENT! YOU ABSOLUTE TURDS!'],
  throw: ['CATCH, DIPSHIT!', 'SPECIAL DELIVERY FROM THE SEPTIC TANK!', 'HERE, HAVE A USED PLUNGER!', 'BOMBS AWAY, BUTTHEADS!', 'EAT IT, HOMIES!', 'FRESH FROM THE BOWL!',
    "SKEETER'S BEEN SAVING THAT ONE SINCE TUESDAY!", 'STILL WARM, BABY!', 'TASTE THE RAINBOW, BUTTNUGGETS!', 'INCOMING DEUCE!', 'HAND-DELIVERED, HAND-WIPED!'],
  win: ["HAHA! WE'LL TELL THE CUSTOMER YOU SAID HI! AND CHARGE TRIPLE!", 'TOO SLOW, TURD TOSSERS! THIS HOUSE IS NORTHWEST COUNTRY!', 'GO HOME AND CRY INTO YOUR P-TRAP!',
    "WE'RE GONNA DUCT TAPE THIS WHOLE HOUSE AND BILL 'EM A GRAND! THANKS, LOSERS!", 'ENJOY SUCKING OUR EXHAUST, YOU CLOG-HUGGING CLOWNS!'],
  lose: ["THIS AIN'T OVER, G'S! ...SKEETER, WHERE'S THE NEXT JOB?", 'DAMN IT! DAMN IT ALL TO HELL!', "WE'LL GET YOU NEXT TIME, YOU CLOG-HUGGING HIPPIES!",
    'I HATE YOU. I HATE YOUR VAN. I HATE YOUR STUPID FACES!', 'SKEETER, GET OUT AND PUSH, YOU USELESS TURD!'],
  steal: ['OUT OF THE WAY, AMATEURS. REAL PLUMBERS COMING THROUGH!', 'TOLD YA. NORTHWEST ALWAYS WINS!', "WE'LL HAVE THAT TOILET FIXED BEFORE YOU FIND YOUR ASS WITH BOTH HANDS!",
    'SIT BACK, SUCKERS. DADDY RANDY IS ON THE CASE!'],
};

// The crew answering the customer's call on the job briefing. Speakers rotate Dalton -> Milan -> Jared
// call to call; {WHO} is the customer, {HOOD} the neighborhood. Shown as text (not recorded).
export const CALL_REPLIES = {
  dalton: [
    "SAY LESS. THE HOMIES ARE ON THE WAY.",
    "{HOOD}? I KNOW A SHORTCUT. SEE YOU IN TEN.",
    "KEYS IN HAND, VAN'S WARM. HANG TIGHT, {WHO}.",
    'SHUT THE MAIN VALVE IF YOU CAN FIND IT. I AM ALREADY IN THE VAN.',
    'TOWELS DOWN, WATER OFF, DALTON INBOUND.',
    'GIVE ME FIFTEEN MINUTES AND ONE GREEN LIGHT.',
    'IF A RED TRUCK SHOWS UP FIRST, DO NOT OPEN THE DOOR.',
    "DON'T TOUCH ANYTHING. I'M DRIVING LIKE IT'S THE LAST LAP.",
  ],
  milan: [
    "SOUNDS LIKE A CLOG PAST THE TRAP. I'VE GOT THE RIGHT SNAKE.",
    "DON'T POUR ANYTHING IN IT. CHEMICALS JUST MAKE IT ANGRY.",
    'I CAN HEAR THE PROBLEM FROM HERE. BE RIGHT OVER.',
    "WATER ALWAYS SHOWS YOU WHERE IT WANTS TO GO. I'LL LISTEN.",
    "{WHO}, BREATHE. PIPES ARE JUST PHYSICS. I'M GOOD AT PHYSICS.",
    "IT'S NOT A DISASTER, IT'S A PUZZLE. ROLLING OUT.",
    'NO GUESSWORK. WE FIND THE CAUSE, THEN WE FIX IT FOR GOOD.',
    'PACKING THE GOOD WRENCH. THE PIPES KNOW WHICH ONE.',
  ],
  jared: [
    'FIFTEEN MINUTES. PUT THE KETTLE ON.',
    "G'S PLUMBING, WE'RE ROLLING. KEEP IT CALM, WE GOT YOU.",
    "{WHO}! YOU DID THE RIGHT THING CALLING US. WE'RE ON THE WAY.",
    "HEY, DEEP BREATH. YOU'RE IN GOOD HANDS NOW.",
    "I'LL EXPLAIN EVERYTHING WHEN I GET THERE. NO SURPRISES ON THE BILL.",
    'HOLD TIGHT, {WHO}. HELP IS ON THE WAY, AND IT BRINGS SNACKS.',
    "WE'VE SEEN WORSE. WAY WORSE. YOU'RE GONNA BE FINE.",
    'BEST CALL YOU WILL MAKE ALL WEEK. SEE YOU IN {HOOD}.',
  ],
};

// One-off spoken lines (title, finale) that also get recorded by scripts/voices.mjs.
// Big Randy welcomes you to each district (shown on the district intro).
export const DISTRICT_WELCOME = [
  "WELCOME TO BALLARD, HOMIES. SMELLS LIKE FISH AND FAILURE.",
  'WELCOME TO FREMONT. THE TROLL WORKS FOR US NOW.',
  "WELCOME TO CAPITOL HILL. YOU CAN'T AFFORD TO PARK HERE.",
  'WELCOME TO WEST SEATTLE. HOPE YOU LIKE BRIDGES, SUCKERS.',
  "WELCOME TO QUEEN ANNE. THIS IS NORTHWEST'S HOUSE. LITERALLY, WE OWN A HOUSE HERE.",
  'WELCOME TO ALKI BEACH. GO BUILD A SANDCASTLE, LOSERS.',
];
export const VOICE_EXTRA = { randy: ['WELCOME TO PLUMBER WARS!', "FINE! WE'RE MOVING TO TACOMA! YOU WIN, YOU BEAUTIFUL BASTARDS!", 'GET OUT OF OUR LANE, HOMIES!', ...DISTRICT_WELCOME] };

export const pick = a => a[Math.floor(Math.random() * a.length)];
