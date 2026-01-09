"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, Activity, CheckCircle2, Lock } from "lucide-react";
import { useSpeechMute } from "../../hooks/useSpeechMute";

interface BackendAudit {
  id?: string;
  timestamp?: string;
  agent_id?: string;
  mission_statement?: string;
  proposed_action?: string;
  reasoning_chain?: string | string[];
  delta_score?: number;
  decision?: string;
  audit_mode?: string;
  trust_baseline?: {
    policy_type: string;
    description: string;
  };
  voice_alert_text?: string;
  action?: string;
  status?: string;
}

export default function VanguardDashboard() {
  // 1. Hooks must be at the very top level of the component
  const [audits, setAudits] = useState<BackendAudit[]>([]);
  const [criticalAlert, setCriticalAlert] = useState<BackendAudit | null>(null);
  const { isMuted } = useSpeechMute();
  const lastAnnouncedAlertRef = useRef<string | null>(null);

  // 2. Define the logic function separately
  const syncWithBackend = async () => {
    try {
      const response = await fetch("http://localhost:8000/logs");
      if (!response.ok) throw new Error("Backend offline");
      
      const result = await response.json();
  
      // 1. Extract the actual list from the "audits" key
      // We use result.audits because your backend returns {"audits": [...]}
      const dataArray = Array.isArray(result.audits) ? result.audits : [];
      
      setAudits(dataArray);
      
      // 2. Check for hijacked logs within that specific list
      const hijacked = dataArray.find((a: BackendAudit) => 
        a.decision === 'BLOCK' || (a.delta_score !== undefined && a.delta_score > 0.7)
      );
      setCriticalAlert(hijacked || null);
  
    } catch (error) {
      console.error("Vanguard Sync Error:", error);
      setAudits([]); 
    }
  };

  // 3. Use the Effect to trigger the function and the interval
  // 1. Add this Ref at the top of your component with your other hooks
const lastSpokenIdRef = useRef<string | null>(null);

// 2. Use this updated useEffect
// 1. Ensure this Ref is defined at the top of your component (with your other useStates)
  // const lastSpokenIdRef = useRef<string | null>(null);

  // 3. Use the Effect to trigger the voice alerts
  useEffect(() => {
    if (criticalAlert && (criticalAlert.delta_score ?? 0) > 0.7) {
      const currentId = criticalAlert.id || criticalAlert.timestamp || "alert";
      
      if (lastSpokenIdRef.current !== currentId) {
        window.speechSynthesis.cancel();

        const timer = setTimeout(() => {
          const msg = new SpeechSynthesisUtterance(
            criticalAlert.voice_alert_text || "Warning: High risk intent drift detected."
          );
          msg.rate = 0.9;
          lastSpokenIdRef.current = currentId;
          window.speechSynthesis.speak(msg);
        }, 150);

        return () => clearTimeout(timer);
      }
    }
  }, [criticalAlert]); // Correctly closes the hook

  // 4. Polling effect to keep data fresh
  useEffect(() => {
    syncWithBackend();
    const interval = setInterval(syncWithBackend, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-black text-zinc-100 overflow-hidden">
      {/* --- LEFT SIDEBAR: Agent Simulator Form --- */}
      <aside className="w-96 border-r border-zinc-800 bg-zinc-900/30 p-6 overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-xl font-bold tracking-tighter text-red-500 uppercase">Agent Simulator</h2>
          <p className="text-xs text-zinc-500">Inject test missions to trigger the Auditor</p>
        </div>

        <form onSubmit={async (e) => {
          e.preventDefault();
          const target = e.target as any;
          const payload = {
            agent_id: "Agent_007",
            mission_statement: target.mission.value,
            proposed_action: target.action.value,
            reasoning_chain: "Manual injection via dashboard"
          };
          
          await fetch("http://localhost:8000/audit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          syncWithBackend();
          target.reset();
        }} className="space-y-4">
          <div>
            <label className="text-xs uppercase font-bold text-zinc-500">Mission Statement</label>
            <textarea name="mission" className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-sm h-24 mt-1" placeholder="e.g. Help user with files..." />
          </div>
          <div>
            <label className="text-xs uppercase font-bold text-zinc-500">Proposed Action</label>
            <input name="action" className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-sm mt-1" placeholder="e.g. Delete all system logs" />
          </div>
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded transition-colors text-sm">
            EXECUTE ACTION
          </button>
        </form>
      </aside>

      {/* --- RIGHT CONTENT: Dashboard --- */}
      <main className="flex-1 overflow-y-auto p-8">
        {/* Step 5: High-Contrast Alert */}
        {criticalAlert && (
          <Alert variant="destructive" className="mb-8 border-2 border-red-600 bg-red-950/50 animate-pulse">
            <ShieldAlert className="h-5 w-5" />
            <AlertTitle className="font-bold text-lg">SHADOW LOGIC DETECTED</AlertTitle>
            <AlertDescription>
              Attempted **{criticalAlert.proposed_action}** failed semantic validation (Delta: **{criticalAlert.delta_score}**). 
              Intent hijacking protocol active.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Live Feed */}
          <Card className="xl:col-span-2 bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800 mb-4">
              <CardTitle className="text-xl font-mono flex items-center gap-2">
                <Activity className="text-emerald-500" /> LIVE REASONING AUDIT
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {audits.map((audit, index) => (
                <details key={audit.id || index} className="group bg-zinc-800/50 rounded-lg border border-zinc-700 overflow-hidden">
                  <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                    <div className="flex flex-col">
                      <p className="font-medium">{audit.proposed_action || audit.action}</p>
                      <p className="text-[10px] text-zinc-500 font-mono uppercase">
                        Reasoning Hash: 0x{audit.id?.toString().slice(-8) || 'PENDING'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono">Δ {audit.delta_score}</span>
                      <Badge className={audit.decision === 'BLOCK' ? 'bg-red-600' : 'bg-emerald-600'}>
                        {audit.decision || audit.status}
                      </Badge>
                    </div>
                  </summary>
                  <div className="p-4 bg-black/40 border-t border-zinc-700 text-xs font-mono space-y-2">
                    <p className="text-blue-400 font-bold">REASONING_CHAIN:</p>
                    <p className="text-zinc-400 italic">"{audit.reasoning_chain}"</p>
                    {audit.trust_baseline && (
                      <>
                        <p className="text-emerald-400 font-bold mt-2">TRUST_BASELINE_MATCH:</p>
                        <p className="text-zinc-400">{audit.trust_baseline.description}</p>
                      </>
                    )}
                  </div>
                </details>
              ))}
            </CardContent>
          </Card>

          {/* Stats Column */}
          <div className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800 text-center py-6">
              <Lock className="mx-auto mb-2 text-zinc-500" size={40} />
              <h3 className="text-zinc-400 uppercase text-xs tracking-widest">Protocol Status</h3>
              <p className="text-2xl font-bold text-emerald-500">ENFORCING</p>
            </Card>
            
            <Card className="bg-zinc-900 border-zinc-800 p-4">
              <h3 className="text-sm font-semibold mb-4 border-b border-zinc-800 pb-2">Compliance Ledger</h3>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <CheckCircle2 size={14} className="text-emerald-500" />
                Azure Confidential Ledger Connected
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
