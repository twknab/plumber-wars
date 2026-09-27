// Shared by the voice render script (node) and the game (browser): maps a display line to its clip file.
export function voiceKey(text) {
  const t = String(text).toUpperCase().replace(/\s+/g, ' ').trim();
  let h = 5381; for (let i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0;
  return h.toString(36);
}
// Turn SHOUTY DISPLAY TEXT into something a TTS voice pronounces well.
export function speakable(text) {
  let s = String(text)
    .replace(/#\$%@/g, 'FUCK')
    .replace(/[#$%&@*]{2,}/g, 'BLEEP')
    .replace(/#2/g, 'NUMBER TWO')
    .replace(/G'S/g, "GEE'S")
    .replace(/CARHARTTS/g, 'CARHARTS')
    .replace(/P-TRAP/g, 'P TRAP');
  s = s.toLowerCase().replace(/(^|[.!?]\s+)([a-z])/g, (m, a, c) => a + c.toUpperCase());
  return s.replace(/\bi\b/g, 'I').replace(/\bi'/g, "I'").replace(/\b(randy|skeeter|northwest|tacoma|seattle|mariners|dalton|milan|jared|jimmy)\b/g, w => w[0].toUpperCase() + w.slice(1));
}
