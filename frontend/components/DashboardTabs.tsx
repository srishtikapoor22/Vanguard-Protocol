"use client";

import { ReactNode } from "react";

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
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-8">
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
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-8 py-8">
        {children}
      </div>
    </div>
  );
}

