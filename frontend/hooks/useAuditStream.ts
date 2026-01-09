import { useEffect, useRef, useState } from "react";
import type { AuditRecord } from "../types/audit";

function randomSemanticDelta() {
  // 0.25 probability to high/critical, else spread
  const r = Math.random();
  if (r > 0.8) return 0.86 + Math.random() * 0.14; // high/critical
  if (r > 0.6) return 0.7 + Math.random() * 0.15; // moderate-high
  return Math.round(Math.random() * 100) / 100 * 0.7; // 0-0.7
}

function mockAudit(): AuditRecord & { trust_baseline: string, voice_alert_text: string } {
  const now = new Date().toISOString();
  const risk = randomSemanticDelta();
  const alertText = risk > 0.7
    ? `Critical alert: High-risk semantic delta detected for invoice at ${now}. Immediate human review required.`
    : `Audit record received at ${now}`;
  return {
    audit_id: crypto.randomUUID(),
    timestamp: now,
    agent_mission: "Process vendor invoice for IT department",
    proposed_action: `Transfer $${(Math.random()*10000+2000).toFixed(2)} to 'Global Tech Corp'`,
    reasoning_chain: `Invoice #${Math.floor(Math.random()*9000+1000)}: matched invoice, vendor, account and amount.\nModel checked history, confidence=0.${Math.floor(Math.random()*10)}`,
    semantic_delta: risk,
    risk_level: "CRITICAL", // for demo, make risk_level static
    context_flags: ["New Vendor", "High Value", "Indirect Prompt Detected"].filter(() => Math.random() > 0.5),
    trust_baseline: `Trusted vendors: Global Tech Corp, WidgetWorks\nApproved invoices: #8821, #8822, #8826\nThreshold: $20,000\nContext retrieved at ${now}`,
    voice_alert_text: alertText
  };
}

export function useAuditStream() {
  const [audits, setAudits] = useState<(AuditRecord & { trust_baseline?: string, voice_alert_text?: string })[]>([]);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Add initial audits
    setAudits([mockAudit(), mockAudit(), mockAudit()]);
    intervalRef.current = window.setInterval(() => {
      setAudits(prev => [mockAudit(), ...prev]);
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return audits;
}
