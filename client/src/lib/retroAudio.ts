// Web Audio API Synthesizer for Retro System Sound Effects
// No external MP3 downloads required, lightweight and runs completely in client.

let audioCtx: AudioContext | null = null;

// Initialize or retrieve the active AudioContext
function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    // Standard AudioContext initialization
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  
  // Resume context if suspended (common browser security behavior)
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// Global Sound State Utilities
export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("retronotes-sounds") !== "false";
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("retronotes-sounds", String(enabled));
  // Trigger context init on toggle
  if (enabled) {
    getAudioContext();
  }
}

// Sound 1: Mechanical Keyboard Key Click (Oscillator Pitch Drop + Noise click)
export function playKeyClick(pitchMultiplier = 1.0): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Sine pitch drop representing vintage key snap
  osc.type = "sine";
  const startFreq = (550 + Math.random() * 150) * pitchMultiplier;
  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(100 * pitchMultiplier, now + 0.035);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.045);
}

// Sound 2: Mechanical Keyboard Spacebar Click (Lower frequency click)
export function playSpacebar(): void {
  playKeyClick(0.65);
}

// Sound 3: Vintage 5.25" Floppy Disk Drive Write (Motor Hum + Cylinder Head Click)
export function playFloppySave(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. Motor Hum: low frequency sawtooth with a low-pass filter
  const motorOsc = ctx.createOscillator();
  const motorGain = ctx.createGain();
  const motorFilter = ctx.createBiquadFilter();

  motorOsc.type = "sawtooth";
  motorOsc.frequency.setValueAtTime(60, now); // 60Hz hum

  motorFilter.type = "lowpass";
  motorFilter.frequency.setValueAtTime(130, now);

  motorGain.gain.setValueAtTime(0.0, now);
  motorGain.gain.linearRampToValueAtTime(0.18, now + 0.08); // fade in motor
  motorGain.gain.setValueAtTime(0.18, now + 0.8);
  motorGain.gain.linearRampToValueAtTime(0.0, now + 1.0); // stop motor

  motorOsc.connect(motorFilter);
  motorFilter.connect(motorGain);
  motorGain.connect(ctx.destination);

  motorOsc.start(now);
  motorOsc.stop(now + 1.0);

  // 2. Cylinder Clicks: sharp head movements every 0.15 seconds
  const clicks = [0.15, 0.3, 0.45, 0.6, 0.75, 0.9];
  clicks.forEach((delay) => {
    const clickTime = now + delay;
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();

    clickOsc.type = "triangle";
    clickOsc.frequency.setValueAtTime(260, clickTime);
    clickOsc.frequency.exponentialRampToValueAtTime(30, clickTime + 0.04);

    clickGain.gain.setValueAtTime(0.08, clickTime);
    clickGain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.04);

    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);

    clickOsc.start(clickTime);
    clickOsc.stop(clickTime + 0.045);
  });
}

// Sound 4: Retro BIOS Check Beep (POST sound check)
export function playBootBeep(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(800, now); // Standard 800Hz BIOS tone

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.18);
}

// Sound 5: Select / Toggle Switch Beep
export function playToggleBeep(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  // Pitch slide from 1300Hz to 900Hz
  osc.frequency.setValueAtTime(1300, now);
  osc.frequency.setValueAtTime(900, now + 0.015);

  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.035);
}
