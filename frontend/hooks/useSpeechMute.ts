import { useState, useEffect, useRef } from "react";

const MUTE_STORAGE_KEY = "vanguard-speech-mute";

export function useSpeechMute() {
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(MUTE_STORAGE_KEY);
      return stored === "true";
    }
    return false;
  });

  const lastSpokenIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(MUTE_STORAGE_KEY, String(isMuted));
    }
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  /**
   * Trigger a voice alert with a custom message.
   * Prevents duplicate announcements by tracking the alertId.
   * 
   * @param message - The message to speak
   * @param alertId - Unique identifier for this alert (prevents repeats)
   * @param force - Force the alert even if muted (default: false)
   */
  const triggerVoiceAlert = (message: string, alertId: string, force: boolean = false) => {
    console.log("[Voice Alert] triggerVoiceAlert called with:", { message, alertId, isMuted, force });
    
    // Check if muted (unless forced)
    if (isMuted && !force) {
      console.log("[Voice Alert] ❌ Muted, skipping:", message);
      return;
    }

    // Check if this alert was already spoken
    if (lastSpokenIdRef.current === alertId) {
      console.log("[Voice Alert] ❌ Already spoken, skipping:", alertId);
      return;
    }

    // Check if speech synthesis is available
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      console.error("[Voice Alert] ❌ Speech synthesis not available");
      return;
    }

    console.log("[Voice Alert] ✅ All checks passed, preparing to speak:", message);

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Small delay to ensure speech synthesis is ready (fixes some browser issues)
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        console.log("[Voice Alert] 🔊 Speech started:", message);
      };

      utterance.onend = () => {
        lastSpokenIdRef.current = alertId;
        console.log("[Voice Alert] ✅ Speech completed:", alertId);
      };

      utterance.onerror = (error) => {
        console.error("[Voice Alert] ❌ Speech error:", error);
        lastSpokenIdRef.current = alertId; // Mark as announced to prevent loops
      };

      console.log("[Voice Alert] 📢 Calling speechSynthesis.speak()");
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  /**
   * Reset the voice alert state (useful when starting a new session)
   */
  const resetVoiceAlert = () => {
    lastSpokenIdRef.current = null;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    console.log("[Voice Alert] State reset");
  };

  return { isMuted, toggleMute, triggerVoiceAlert, resetVoiceAlert };
}

