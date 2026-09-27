import { useEffect, useState } from "react";
import { readSoundPref, soundscape, type SoundPref } from "../lib/audio";

export function useSound() {
  const [pref, setPref] = useState<SoundPref>(() => readSoundPref());
  const [failed, setFailed] = useState(soundscape.failed);

  useEffect(() => {
    const unlock = () => {
      void soundscape.unlock().then(() => setFailed(soundscape.failed));
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const configure = (next: SoundPref) => {
    setPref(next);
    soundscape.configure(next);
  };

  return {
    enabled: pref.enabled,
    volume: pref.volume,
    failed,
    toggle: () => {
      // The icon starts out on, before the browser will play anything. The first press must start audio, not mute it.
      if (!soundscape.isRunning()) {
        if (!pref.enabled) configure({ ...pref, enabled: true });
        void soundscape.unlock().then(() => setFailed(soundscape.failed));
        return;
      }
      configure({ ...pref, enabled: !pref.enabled });
    },
    setVolume: (volume: number) => configure({ ...pref, volume }),
  };
}
