import { ForensicCard } from "../../../components/ForensicCard";
import { useAuditStream } from "../../../hooks/useAuditStream";
import { EmergencyDialog } from "../../../components/EmergencyDialog";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";

// Hardcoded immutable policy for side-by-side display
default const POLICY = `1. The Single Genuine Problem: "Shadow Logic Hijacking"
AI agents are being "gaslit" by indirect prompt injections. While tools like Azure AI Content Safety block obvious attacks, they miss Shadow Logic Hijacking—where a hacker embeds subtle instructions in documents (like a fake invoice) that don't violate safety filters but fundamentally alter the agent's intent.

The Critical Gaps:
The Intent Drift: Existing tools check if a prompt is bad. They don't check if the agent’s reasoning is still aligned with the corporate mission.
The Compliance Void: There is no "black box" recorder for AI reasoning that can hold up in a court of law or an insurance audit.

2. The Solution: Contextual Tiered Attestation
Vanguard Protocol is a Forensic Reasoning Firewall. It doesn't just look for bad words; it audits the Semantic Delta between the Agent's original mission and its proposed action, enriched by real-time business context.`;

export default function DashboardPage() {
  const audits = useAuditStream();
  const [modal, setModal] = React.useState<null | {reasoning: string}>(null);

  React.useEffect(() => {
    const latest = audits[0];
    if (latest && latest.risk_level === "CRITICAL") {
      setModal({ reasoning: latest.reasoning_chain });
    }
  }, [audits]);

  return (
    <main className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold mb-8 text-white">Forensic Dashboard</h1>
      <div className="max-w-2xl mx-auto flex flex-col gap-6 overflow-y-auto pb-20 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900" style={{maxHeight: 'calc(100vh - 64px)'}}>
        <AnimatePresence initial={false}>
          {audits.map((audit) => (
            <motion.div
              key={audit.audit_id}
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
              layout
            >
              <div onClick={() => window.location.assign(`/dashboard/${audit.audit_id}`)}
 style={{cursor: 'pointer'}} aria-label="Open forensic detail report">
  <ForensicCard audit={audit} />
</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <EmergencyDialog
        open={!!modal}
        onOpenChange={() => setModal(null)}
        policy={POLICY}
        reasoningChain={modal?.reasoning || ""}
      />
    </main>
  );
}
