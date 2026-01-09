"use client";
import * as React from "react";

export default function AudioAlertMute({muted, setMuted}:{muted:boolean,setMuted:(m:boolean)=>void}) {
  return (
    <button
      className="ml-2 text-blue-300 hover:text-blue-500 focus:outline-none"
      aria-label={muted ? "Unmute speech alerts" : "Mute speech alerts"}
      onClick={() => setMuted(m => !m)}
      title={muted ? "Unmute Voice Alerts" : "Mute Voice Alerts"}
      type="button"
      style={{ fontSize: 22 }}
    >
      {muted ? (
        // Muted (Slash speaker)
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.364 5.636l-12.728 12.728M9 9v6h4l5 5V5l-5 5H9zm0 6l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      ) : (
        // Unmuted (Speaker)
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 9v6h4l5 5V5l-5 5H9zm0 6l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      )}
    </button>
  );
}

