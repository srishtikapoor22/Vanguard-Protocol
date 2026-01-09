"use client";

import { ReactNode } from "react";
import { SimulatedAgentInput } from "./SimulatedAgentInput";
import { useSpeechMute } from "../hooks/useSpeechMute";
import { Volume2, VolumeX } from "lucide-react";

interface Tab {
  id: string;
  label: string;
}

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: ReactNode;
}

const tabs: Tab[] = [
  { id: "forensic", label: "Forensic Dashboard" },
  { id: "analytics", label: "Analytics" },
  { id: "policy", label: "Policy Configuration" },
];

export function DashboardTabs({ activeTab, onTabChange, children }: DashboardTabsProps) {
  const { isMuted, toggleMute } = useSpeechMute();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 h-screen sticky top-0">
        <SimulatedAgentInput />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="border-b border-zinc-800">
          <div className="px-8">
            <div className="flex items-center justify-between">
              <nav className="flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`
                      py-4 px-1 border-b-2 font-medium text-sm transition-colors
                      ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-400"
                          : "border-transparent text-zinc-400 hover:text-zinc-300 hover:border-zinc-700"
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
              {/* Mute Toggle */}
              <button
                onClick={toggleMute}
                className="p-2 rounded-md hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-300"
                aria-label={isMuted ? "Unmute speech alerts" : "Mute speech alerts"}
                title={isMuted ? "Unmute speech alerts" : "Mute speech alerts"}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="px-8 py-8 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

