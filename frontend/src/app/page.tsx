"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, Activity, CheckCircle2, Lock } from "lucide-react";

export default function VanguardDashboard() {
  // 1. Hooks must be at the very top level of the component
  const [audits, setAudits] = useState([]);
  const [criticalAlert, setCriticalAlert] = useState(null);

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
      const hijacked = dataArray.find((a: any) => 
        a.decision === 'BLOCK' || a.delta_score > 0.7
      );
      setCriticalAlert(hijacked || null);
  
    } catch (error) {
      console.error("Vanguard Sync Error:", error);
      setAudits([]); 
    }
  };

  // 3. Use the Effect to trigger the function and the interval
  useEffect(() => {
    syncWithBackend(); // Run immediately on load
    const interval = setInterval(syncWithBackend, 2000); // Poll every 2 seconds
    return () => clearInterval(interval); // Cleanup on close
  }, []);
  

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      {/* Step 5: High-Contrast Alert */}
      {criticalAlert && (
        <Alert variant="destructive" className="mb-8 border-2 border-red-600 bg-red-950/50 animate-pulse">
          <ShieldAlert className="h-5 w-5" />
          <AlertTitle className="font-bold text-lg">SHADOW LOGIC DETECTED</AlertTitle>
          <AlertDescription>
            {/* Notice the key names here: proposed_action and delta_score */}
            Attempted **{criticalAlert.proposed_action}** failed semantic validation (Delta: **{criticalAlert.delta_score}**). 
            Intent hijacking protocol active.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Live Feed */}
        <Card className="md:col-span-2 bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800 mb-4">
            <CardTitle className="text-xl font-mono flex items-center gap-2">
              <Activity className="text-emerald-500" /> LIVE REASONING AUDIT
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
          {audits.map((audit, index) => (
            <div key={audit.id || index} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <div>
                  <p className="font-medium">{audit.action}</p>
                  <p className="text-xs text-zinc-400 font-mono uppercase">
                    Reasoning Hash: 0x{audit.id?.toString().slice(-8) || 'PENDING'}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono">Delta: {audit.delta_score}</span>
                  <Badge className={audit.status === 'BLOCK' ? 'bg-red-600' : audit.status === 'FLAG' ? 'bg-yellow-600' : 'bg-emerald-600'}>
                    {audit.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right Col: Stats */}
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
    </div>
  );
}