"use client";
import * as React from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { AuditRecord } from "../types/audit";

interface Props {
  audits: (AuditRecord & { trust_baseline?: string })[];
  onRowClick?: (audit: AuditRecord) => void;
}

export const AuditAccordion: React.FC<Props> = ({ audits, onRowClick }) => (
  <Accordion.Root type="multiple" className="w-full">
    {audits.map(audit => (
      <Accordion.Item key={audit.audit_id} value={audit.audit_id}
        className="border-b border-zinc-800">
        <Accordion.Header asChild>
          <button
            className="flex w-full px-4 py-3 bg-zinc-950 hover:bg-zinc-900 font-semibold text-left text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
            onClick={() => onRowClick?.(audit)}
            aria-label={audit.proposed_action}
          >
            <div className="flex-1 text-sm">
              <span className="font-bold text-blue-400 mr-2">{audit.agent_mission}</span>
              <span className="text-zinc-400">/ {audit.proposed_action}</span>
            </div>
            <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-amber-400 font-mono tracking-tight ml-4">
              {audit.risk_level}
            </span>
            <span
              className="ml-2 text-zinc-600 text-xs font-mono"
            >{new Date(audit.timestamp).toLocaleString()}</span>
          </button>
        </Accordion.Header>
        <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up bg-zinc-900 text-blue-200">
          <div className="px-6 py-6 flex flex-col gap-4">
            <div>
              <div className="font-semibold text-xs text-blue-400 mb-1">Reasoning Chain</div>
              <pre className="bg-black border border-zinc-700 rounded-lg p-3 whitespace-pre-line text-xs text-blue-300 font-mono shadow-inner select-all" tabIndex={0} aria-label="Reasoning chain (AI log)" style={{fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'}}>{audit.reasoning_chain}</pre>
            </div>
            {audit.trust_baseline && (
            <div>
              <div className="font-semibold text-xs text-green-400 mb-1">Trust Baseline</div>
              <pre className="bg-black border border-green-700 rounded-lg p-3 whitespace-pre-line text-xs text-green-300 font-mono shadow-inner select-all" tabIndex={0} aria-label="Trust baseline (context)" style={{fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'}}>{audit.trust_baseline}</pre>
            </div>
            )}
          </div>
        </Accordion.Content>
      </Accordion.Item>
    ))}
  </Accordion.Root>
);

export default AuditAccordion;

