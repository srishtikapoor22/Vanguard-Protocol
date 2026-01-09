"use client";

import { useState } from "react";

export function SimulatedAgentInput() {
  const [agentId, setAgentId] = useState("");
  const [missionStatement, setMissionStatement] = useState("");
  const [proposedAction, setProposedAction] = useState("");
  const [reasoningChain, setReasoningChain] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAction, setIsGeneratingAction] = useState(false);

  const handleGenerateAction = async () => {
    if (!missionStatement.trim() || !agentId.trim()) {
      alert("Please enter Agent ID and Mission Statement first");
      return;
    }

    setIsGeneratingAction(true);
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
      setProposedAction(data.proposed_action);
      setReasoningChain(data.reasoning_chain);
    } catch (error) {
      console.error("Error generating action:", error);
      alert("Failed to generate action. Please try again.");
    } finally {
      setIsGeneratingAction(false);
    }
  };

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!proposedAction.trim()) {
      alert("Please generate a proposed action first");
      return;
    }

    setIsLoading(true);

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
          className="mt-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors flex items-center justify-center gap-2"
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
    </div>
  );
}

