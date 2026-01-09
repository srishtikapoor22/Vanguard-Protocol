import { useState, useEffect } from "react";

const MUTE_STORAGE_KEY = "vanguard-speech-mute";

export function useSpeechMute() {
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(MUTE_STORAGE_KEY);
      return stored === "true";
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(MUTE_STORAGE_KEY, String(isMuted));
    }
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return { isMuted, toggleMute };
}

