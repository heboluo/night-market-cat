let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function unlockAudio(): void {
  audio();
}

function beep(frequency: number, duration: number, type: OscillatorType, gain = 0.05): void {
  const c = audio();
  if (!c) return;
  const osc = c.createOscillator();
  const amp = c.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  amp.gain.value = gain;
  amp.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  osc.connect(amp);
  amp.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
}

export function eatSound(radius: number): void {
  const pitch = Math.max(180, 620 - radius * 1.6);
  beep(pitch, 0.12, "triangle", 0.06);
  beep(pitch * 1.5, 0.08, "sine", 0.03);
}

export function startSound(): void {
  beep(320, 0.1, "square", 0.04);
  beep(480, 0.16, "triangle", 0.05);
}

export function closingSound(): void {
  beep(240, 0.2, "sine", 0.05);
  beep(160, 0.28, "triangle", 0.04);
}
