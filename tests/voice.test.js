// Guards the "voices only work after toggling" bug: the voice list must start downloading at page
// load (before any tap), and a line spoken before it arrives must wait for the recording instead
// of falling back to browser speech (which is often silent on phones).
import test from 'node:test';
import assert from 'node:assert/strict';

let releaseManifest;
const fetched = [];
const manifestReady = new Promise(r => { releaseManifest = r; });
const spokenByBrowser = [];

globalThis.window = { speechSynthesis: { speak: u => spokenByBrowser.push(u.text), cancel() {}, getVoices: () => [] } };
globalThis.speechSynthesis = globalThis.window.speechSynthesis;
globalThis.SpeechSynthesisUtterance = function (t) { this.text = t; };
globalThis.fetch = async (url) => {
  fetched.push(url);
  if (url === '/voice/manifest.json') {
    const { voiceKey } = await import('../src/core/voicekey.js');
    await manifestReady;
    return { ok: true, json: async () => ({ [voiceKey('WELCOME TO PLUMBER WARS!')]: { f: 'welcome.mp3', who: 'randy' } }) };
  }
  return { ok: true, arrayBuffer: async () => new ArrayBuffer(8) };
};

const { audio } = await import('../src/core/audio.js');

function fakeAudioContext(started) {
  return {
    currentTime: 0, state: 'running',
    decodeAudioData: (buf, ok) => ok({ duration: 1.3 }),
    createBufferSource: () => ({ connect() {}, stop() {}, start() { started.push(this.buffer); }, onended: null }),
  };
}

test('voice list starts downloading at page load, before any tap', () => {
  assert.ok(fetched.includes('/voice/manifest.json'));
  assert.equal(audio.ctx, null, 'no AudioContext yet: nothing has been tapped');
});

test('a line spoken before the voice list arrives plays the recording, not browser speech', async () => {
  const started = [];
  audio.ctx = fakeAudioContext(started);                         // first tap just happened
  audio.voiceBus = {}; audio.musicBus = { gain: { setTargetAtTime() {} } };
  audio.enabled = true; audio.voices = true;
  audio.say('WELCOME TO PLUMBER WARS!');                         // ...and the splash speaks immediately
  await new Promise(r => setTimeout(r, 20));
  assert.equal(started.length, 0, 'still waiting on the voice list');
  releaseManifest();
  await new Promise(r => setTimeout(r, 50));
  assert.equal(started.length, 1, 'the recorded clip played');
  assert.deepEqual(spokenByBrowser, [], 'no robot-voice fallback');
});
