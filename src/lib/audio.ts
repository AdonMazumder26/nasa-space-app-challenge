export type SoundPref = { enabled: boolean; volume: number };
export type SoundEffect = "ui" | "flight" | "zoom" | "reset" | "rotate" | "discover" | "transition";

const STORAGE_KEY = "abnf-sound";
const DEFAULT_PREF: SoundPref = { enabled: true, volume: 0.55 };

export function parseSoundPref(raw: string | null): SoundPref {
  if (!raw) return { ...DEFAULT_PREF };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { ...DEFAULT_PREF };
    const record = parsed as { enabled?: unknown; volume?: unknown };
    const volume = typeof record.volume === "number" && record.volume >= 0 && record.volume <= 1 ? record.volume : DEFAULT_PREF.volume;
    return { enabled: record.enabled !== false, volume };
  } catch {
    return { ...DEFAULT_PREF };
  }
}

export function readSoundPref(): SoundPref {
  try {
    return parseSoundPref(localStorage.getItem(STORAGE_KEY));
  } catch {
    return { ...DEFAULT_PREF };
  }
}

function writeSoundPref(pref: SoundPref) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pref));
  } catch {
    /* Private mode can refuse storage. The choice still applies for this visit. */
  }
}

type Bed = { stop: () => void };

function fileBed(ctx: AudioContext, master: GainNode): Bed | null {
  const audio = new Audio("/cosmic-ambient.m4a");
  if (!audio.canPlayType("audio/mp4")) return null;
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 1;
  const restart = () => {
    if (audio.loop) void audio.play().catch(() => undefined);
  };
  audio.addEventListener("ended", restart);
  const source = ctx.createMediaElementSource(audio);
  const gain = ctx.createGain();
  gain.gain.value = 0;
  source.connect(gain);
  gain.connect(master);
  void audio.play().catch(() => undefined);
  gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.8);
  return {
    stop() {
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setTargetAtTime(0, ctx.currentTime, 0.12);
      window.setTimeout(() => {
        audio.loop = false;
        audio.removeEventListener("ended", restart);
        audio.pause();
        source.disconnect();
        gain.disconnect();
      }, 550);
    },
  };
}

function moonBed(ctx: AudioContext, master: GainNode): Bed {
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(master);
  const low = ctx.createOscillator();
  low.type = "sine";
  low.frequency.value = 110;
  const voice = ctx.createOscillator();
  voice.type = "triangle";
  voice.frequency.value = 220;
  const shimmer = ctx.createOscillator();
  shimmer.type = "sine";
  shimmer.frequency.value = 330;
  const shimmerGain = ctx.createGain();
  shimmerGain.gain.value = 0.035;
  const drift = ctx.createOscillator();
  drift.type = "sine";
  drift.frequency.value = 0.08;
  const driftGain = ctx.createGain();
  driftGain.gain.value = 14;
  const thin = ctx.createGain();
  thin.gain.value = 0.22;
  low.connect(gain);
  voice.connect(thin);
  thin.connect(gain);
  shimmer.connect(shimmerGain);
  shimmerGain.connect(gain);
  drift.connect(driftGain);
  driftGain.connect(low.frequency);
  low.start();
  voice.start();
  shimmer.start();
  drift.start();
  gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.6);
  return {
    stop() {
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
      window.setTimeout(() => {
        low.stop();
        voice.stop();
        shimmer.stop();
        drift.stop();
        gain.disconnect();
      }, 400);
    },
  };
}

function marsBed(ctx: AudioContext, master: GainNode): Bed {
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(master);
  const length = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) data[index] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 260;
  const wind = ctx.createOscillator();
  wind.type = "sine";
  wind.frequency.value = 0.045;
  const windGain = ctx.createGain();
  windGain.gain.value = 90;
  const tone = ctx.createOscillator();
  tone.type = "triangle";
  tone.frequency.value = 174;
  const toneGain = ctx.createGain();
  toneGain.gain.value = 0.45;
  noise.connect(filter);
  filter.connect(gain);
  wind.connect(windGain);
  windGain.connect(filter.frequency);
  tone.connect(toneGain);
  toneGain.connect(gain);
  noise.start();
  wind.start();
  tone.start();
  gain.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 0.6);
  return {
    stop() {
      gain.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
      window.setTimeout(() => {
        noise.stop();
        wind.stop();
        tone.stop();
        gain.disconnect();
      }, 700);
    },
  };
}

class Soundscape {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bed: Bed | null = null;
  private bedPlanet: "moon" | "mars" | null = null;
  private planet: "moon" | "mars" | null = null;
  private pref = readSoundPref();
  failed = false;

  preference() {
    return this.pref;
  }

  isRunning() {
    return this.ctx?.state === "running";
  }

  async unlock() {
    if (this.failed) return;
    const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Context) {
      this.failed = true;
      return;
    }
    try {
      if (!this.ctx) {
        this.ctx = new Context();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.pref.enabled ? this.pref.volume : 0;
        this.master.connect(this.ctx.destination);
        this.ctx.addEventListener("statechange", () => this.syncBed());
      }
      if (this.ctx.state === "suspended") await this.ctx.resume();
      this.syncBed();
    } catch {
      this.failed = true;
    }
  }

  configure(pref: SoundPref) {
    this.pref = pref;
    writeSoundPref(pref);
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(pref.enabled ? pref.volume : 0, this.ctx.currentTime, 0.08);
    }
    this.syncBed();
  }

  setPlanet(planet: "moon" | "mars" | null) {
    if (this.planet === planet) return;
    this.planet = planet;
    this.syncBed();
  }

  effect(kind: SoundEffect) {
    if (!this.ctx || !this.master || !this.pref.enabled || this.ctx.state !== "running") return;
    const profiles: Record<SoundEffect, { start: number; end: number; duration: number; peak: number; type: OscillatorType }> = {
      ui: { start: 520, end: 680, duration: 0.08, peak: 0.08, type: "sine" },
      flight: { start: 180, end: 420, duration: 0.28, peak: 0.12, type: "sine" },
      zoom: { start: 320, end: 460, duration: 0.1, peak: 0.07, type: "triangle" },
      reset: { start: 460, end: 220, duration: 0.16, peak: 0.08, type: "sine" },
      rotate: { start: 260, end: 340, duration: 0.12, peak: 0.06, type: "triangle" },
      discover: { start: 520, end: 820, duration: 0.2, peak: 0.1, type: "sine" },
      transition: { start: 140, end: 220, duration: 0.24, peak: 0.08, type: "sine" },
    };
    const profile = profiles[kind];
    const start = this.ctx.currentTime;
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    oscillator.type = profile.type;
    oscillator.frequency.setValueAtTime(profile.start, start);
    oscillator.frequency.exponentialRampToValueAtTime(profile.end, start + profile.duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(profile.peak, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + profile.duration);
    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(start);
    oscillator.stop(start + profile.duration + 0.02);
  }

  private syncBed() {
    const wanted = this.ctx && this.master && this.pref.enabled && this.planet && this.ctx.state === "running" ? this.planet : null;
    if (wanted === this.bedPlanet) return;
    this.bed?.stop();
    this.bed = null;
    this.bedPlanet = wanted;
    if (!wanted || !this.ctx || !this.master) return;
    this.bed = fileBed(this.ctx, this.master) ?? (wanted === "moon" ? moonBed(this.ctx, this.master) : marsBed(this.ctx, this.master));
  }
}

export const soundscape = new Soundscape();
