import type { Lang } from "../features/localization/strings";

type VoiceLike = { lang: string };

export function pickNarrationVoice<T extends VoiceLike>(voices: readonly T[], lang: Lang): T | null {
  const prefix = lang === "bn" ? "bn" : "en";
  return voices.find((voice) => voice.lang.toLowerCase().replaceAll("_", "-").startsWith(prefix)) ?? null;
}

/** The volume slider also feeds the quiet ambient bed. Speech needs a higher floor to be heard. */
export function narrationVolume(slider: number): number {
  if (slider <= 0) return 0;
  return Math.min(1, 0.55 + slider * 0.45);
}

export type NarrationResult = "spoken" | "unavailable" | "no-voice" | "muted";

export function stopNarration() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

/**
 * Reads an existing catalog sentence.
 * Must stay synchronous: a browser only allows speech in the same turn as the click.
 * Bangla is skipped when the voice list is loaded and contains no Bangla voice.
 */
export function speakCatalogLine(text: string, lang: Lang, sliderVolume: number): NarrationResult {
  if (typeof window === "undefined" || !window.speechSynthesis) return "unavailable";
  const volume = narrationVolume(sliderVolume);
  if (volume <= 0) return "muted";
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  const voice = pickNarrationVoice(voices, lang);
  if (lang === "bn" && voices.length > 0 && !voice) return "no-voice";
  const line = new SpeechSynthesisUtterance(text);
  line.lang = lang === "bn" ? "bn-BD" : "en-US";
  line.rate = 0.96;
  line.volume = volume;
  if (voice) line.voice = voice;
  if (synth.speaking) synth.cancel();
  synth.speak(line);
  if (synth.paused) synth.resume();
  return "spoken";
}
