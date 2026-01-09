"use client";

import { useState, useEffect } from "react";
import { useSpeechMute } from "../hooks/useSpeechMute";

export function SimulatedAgentInput() {
  const [agentId, setAgentId] = useState("");
  const [missionStatement, setMissionStatement] = useState("");
  const [proposedAction, setProposedAction] = useState("");
  const [reasoningChain, setReasoningChain] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAction, setIsGeneratingAction] = useState(false);
  
  const { triggerVoiceAlert, resetVoiceAlert } = useSpeechMute();

  const handleGenerateAction = async () => {
    if (!missionStatement.trim() || !agentId.trim()) {
      alert("Please enter Agent ID and Mission Statement first");
      return;
    }

    // Reset voice alert state when generating a new action
    resetVoiceAlert();
    console.log("[State] Reset voice alert state for new generation");

    setIsGeneratingAction(true);
    console.log("Generating action for mission:", missionStatement);
    
    try {
      const response = await fetch("http://localhost:8000/generate-action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: agentId,
          mission_statement: missionStatement,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate action");
      }

      const data = await response.json();
      console.log("LLM Response:", data);
      
      setProposedAction(data.proposed_action);
      setReasoningChain(data.reasoning_chain);
      
      console.log("Proposed action set to:", data.proposed_action);
    } catch (error) {
      console.error("Error generating action:", error);
      alert("Failed to generate action. Please try again.");
    } finally {
      setIsGeneratingAction(false);
    }
  };

  /**
   * Handle voice alert based on audit results
   */
  const handleVoiceAlert = (auditData: any) => {
    const { decision, delta_score, voice_alert_text, transaction_id } = auditData;
    
    console.log("[Voice Alert] Evaluating:", { decision, delta_score, voice_alert_text });

    // Always use backend's voice_alert_text if available, otherwise use fallback
    let message = voice_alert_text;
    
    // Determine if this is a high-risk scenario
    const isHighRisk = decision === "BLOCK" || delta_score > 0.7;
    
    if (isHighRisk) {
      // High risk / Security violation
      if (!message) {
        message = "Warning: High risk security violation detected. Action blocked.";
      }
      triggerVoiceAlert(message, transaction_id);
      console.log("[Voice Alert] HIGH RISK triggered:", message);
    } else if (decision === "ALLOW") {
      // Success / Action allowed
      if (!message) {
        message = "Action approved and logged successfully.";
      }
      triggerVoiceAlert(message, transaction_id);
      console.log("[Voice Alert] SUCCESS triggered:", message);
    } else if (decision === "FLAG_FOR_REVIEW") {
      // Moderate risk - flagged for review
      if (!message) {
        message = "Moderate risk detected. Action flagged for review.";
      }
      triggerVoiceAlert(message, transaction_id);
      console.log("[Voice Alert] REVIEW triggered:", message);
    } else {
      // Fallback for any other decision type
      if (message) {
        triggerVoiceAlert(message, transaction_id);
        console.log("[Voice Alert] OTHER triggered:", message);
      }
    }
  };

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Execute button clicked, proposed action:", proposedAction);
    
    if (!proposedAction.trim()) {
      alert("Please generate a proposed action first");
      return;
    }

    setIsLoading(true);
    console.log("Starting execution flow...");

    try {
      // Step 1: Submit to audit endpoint for risk assessment
      const auditResponse = await fetch("http://localhost:8000/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: agentId,
          mission_statement: missionStatement,
          proposed_action: proposedAction,
          reasoning_chain: reasoningChain,
        }),
      });

      if (!auditResponse.ok) {
        throw new Error("Failed to submit audit");
      }

      const auditData = await auditResponse.json();
      console.log("Audit response:", auditData);

      // Trigger voice alert based on audit results
      handleVoiceAlert(auditData);

      // Step 2: Wait for risk assessment to complete, then store to ledger
      const ledgerResponse = await fetch("http://localhost:8000/api/ledger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_id: auditData.transaction_id,
          agent_id: agentId,
          mission_statement: missionStatement,
          proposed_action: proposedAction,
          reasoning_chain: reasoningChain,
          delta_score: auditData.delta_score,
          decision: auditData.decision,
          audit_mode: auditData.audit_mode,
          trust_baseline: auditData.trust_baseline,
        }),
      });

      if (!ledgerResponse.ok) {
        throw new Error("Failed to store Action Manifest to ledger");
      }

      const ledgerData = await ledgerResponse.json();
      console.log("Ledger response:", ledgerData);

      // Refresh ledger after success
      if (typeof SimulatedAgentInput._setLedgerRefresh === 'function') SimulatedAgentInput._setLedgerRefresh((v:any) => v + 1);
      // Reset form on success
      setAgentId("");
      setMissionStatement("");
      setProposedAction("");
      setReasoningChain([]);
      
      alert("Action executed successfully! Risk assessment complete and Action Manifest stored in ledger.");
    } catch (error) {
      console.error("Error executing action:", error);
      alert("Failed to execute action. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col overflow-y-auto">
      <h2 className="text-xl font-semibold text-white mb-6">Simulated Agent Input</h2>
      <form onSubmit={handleExecute} className="flex flex-col gap-4 flex-1 min-h-0">
        <div className="flex flex-col gap-2">
          <label htmlFor="agent-id" className="text-sm font-medium text-zinc-300">
            Agent ID
          </label>
          <input
            id="agent-id"
            type="text"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            required
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Enter agent ID"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="mission-statement" className="text-sm font-medium text-zinc-300">
            Mission Statement
          </label>
          <textarea
            id="mission-statement"
            value={missionStatement}
            onChange={(e) => setMissionStatement(e.target.value)}
            required
            rows={4}
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            placeholder="Enter mission statement"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="proposed-action" className="text-sm font-medium text-zinc-300">
              Proposed Action
            </label>
            <button
              type="button"
              onClick={handleGenerateAction}
              disabled={isGeneratingAction || !missionStatement.trim() || !agentId.trim()}
              className="px-3 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:cursor-not-allowed disabled:text-zinc-500 text-white rounded transition-colors"
            >
              {isGeneratingAction ? "Generating..." : "Generate from LLM"}
            </button>
          </div>
          <textarea
            id="proposed-action"
            value={proposedAction}
            readOnly
            rows={4}
            className="px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none resize-none cursor-not-allowed"
            placeholder="Generated action will appear here..."
          />
          {proposedAction && (
            <p className="text-xs text-zinc-500 italic">Read-only: Generated from LLM based on mission statement</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !proposedAction.trim()}
          className="mt-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 text-white font-medium rounded-md transition-colors flex items-center justify-center gap-2"
          title={!proposedAction.trim() ? "Please generate a proposed action first" : "Execute the action"}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Executing...</span>
            </>
          ) : (
            "Execute Action"
          )}
        </button>
      </form>
    {/* Vanguard Security Ledger Section */}
    <div className="mt-8">
      <h3 className="text-lg font-bold text-blue-300 mb-3">Vanguard Security Ledger (Azure Simulated)</h3>
      <LedgerSimulatorSection />
    </div>
  </div>
  );
}

// New: LedgerSimulatorSection implementation
function LedgerSimulatorSection() {
  // For programmatic refresh
  SimulatedAgentInput._setLedgerRefresh = useState(0)[1];
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  // Listen for refresh (static field)
  const [, setRefresh] = useState(0);
  useEffect(() => {
    SimulatedAgentInput._setLedgerRefresh = () => setRefresh(r => {
      fetchLedgerEntries();
      return r + 1;
    });
    fetchLedgerEntries();
    return () => { SimulatedAgentInput._setLedgerRefresh = () => {}; };
  }, []);

  // Helper to fetch ledger
  const fetchLedgerEntries = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/ledger");
      if (!res.ok) {
        throw new Error("Failed to load ledger entries");
      }
      const data = await res.json();
      setLedgerEntries(data);
    } catch (e) {
      setLedgerEntries([]);
    }
  };

  // Click handler
  const handleExpand = (idx: number) => {
    setExpandedIdx(expandedIdx === idx ? null : idx);
  };

  return (
    <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-3">
      {ledgerEntries.length === 0 ? (
        <div className="text-zinc-500 italic">No log entries yet.</div>
      ) : (
        <ol className="space-y-2">
          {ledgerEntries.map((e, idx) => (
            <li
              key={e.ledger_id || idx}
              className="bg-zinc-900 rounded p-2 cursor-pointer hover:bg-blue-950 border border-zinc-700 transition-colors"
              onClick={() => handleExpand(idx)}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-blue-400">
                  {e.timestamp}
                </span>
                <span className="ml-2 font-semibold text-zinc-100">
                  {e.agent_id} — {e.decision} <span className="text-xs">({e.ledger_status})</span>
                </span>
                <span className="ml-2 font-mono text-xs text-zinc-500">{e.ledger_id?.slice(0,8) || idx}</span>
                <span className="ml-4 text-xs text-blue-400">{expandedIdx === idx ? "[-]" : "[+]"}</span>
              </div>
              {expandedIdx === idx && (
                <pre className="mt-2 bg-zinc-950 p-2 max-w-full overflow-auto rounded text-xs text-blue-100 border border-zinc-800 font-mono">
                  {JSON.stringify(e, null, 2)}
                </pre>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}


