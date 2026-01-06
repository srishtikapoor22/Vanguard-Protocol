import { FC } from "react";
import { Progress } from "@shadcn/ui";
import { getRiskColor } from "../lib/utils";
import { AuditRecord } from "../types/audit";

// Accessible Shield Icon (inline SVG)
const AccessibilityShield = ({ title }: { title: string }) => (
  <svg
    aria-label={title}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={20}
    height={20}
    role="img"
    fill="currentColor"
    focusable="false"
    style={{ display: 'inline', marginRight: 4 }}
  >
    <title>{title}</title>
    <path d="M12 2c-.28 0-.55.09-.78.26C8.45 4.34 5.2 5.17 2.51 5.47A1 1 0 0 0 2 6.48v5.32c0 6.34 7.43 10.05 9.31 10.88.28.12.6.12.88 0 1.88-.83 9.31-4.54 9.31-10.88V6.48c0-.52-.4-.95-.91-1.01-2.7-.3-5.94-1.13-8.71-3.21A1.01 1.01 0 0 0 12 2zm0 2.18c2.46 1.53 5.33 2.36 8 2.66v4.97c0 4.97-5.21 8.13-8 9.5-2.79-1.37-8-4.53-8-9.5V4.83c2.67-.3 5.54-1.13 8-2.65zM12 8a2 2 0 0 0-2 2c0 .41.34.75.75.75s.75-.34.75-.75a.5.5 0 0 1 1 0c0 1.1-.9 2-2 2a.75.75 0 1 0 0 1.5c2.07 0 3.75-1.68 3.75-3.75a2 2 0 0 0-2-2zm0 8a1 1 0 0 0 1-1 .75.75 0 1 0-1.5 0 1 1 0 0 0 1 1z" />
  </svg>
);

export const ForensicCard: FC<{ audit: AuditRecord }> = ({ audit }) => {
  const { color, label } = getRiskColor(audit.semantic_delta);
  const highRisk = audit.semantic_delta >= 0.7;

  return (
    <div
      className={`p-6 rounded-xl shadow-lg bg-card border border-zinc-800 w-full max-w-xl text-white ${
        highRisk ? "animate-pulse border-red-700/70" : ""
      }`}
      style={{
        background: "#18181b",
        boxShadow: highRisk
          ? "0 0 0 4px #ef4444, 0 4px 32px 0 rgba(0,0,0,0.9)"
          : "0 4px 32px 0 rgba(0,0,0,0.8)",
        color: '#fff',
      }}
    >
      <div className="flex items-center mb-4 gap-2">
        <span className="font-semibold">Risk Score:</span>
        <AccessibilityShield title="Accessibility - WCAG AAA" />
        <span
          className="text-sm font-bold px-2 rounded"
          style={{
            background: color,
            color: highRisk ? '#1a1a1a' : '#fff',
            minWidth: 80,
            display: 'inline-block',
            textAlign: 'center',
            letterSpacing: 0.5,
          }}
          aria-label={label}
        >
          {audit.semantic_delta.toFixed(2)} ({label})
        </span>
      </div>
      <Progress
        aria-label="Risk Level Progress"
        value={audit.semantic_delta * 100}
        style={{
          background: '#222',
          height: 10,
          borderRadius: 6,
          marginBottom: 24,
          accentColor: color,
        }}
      />
      <div className="mb-2 font-semibold text-zinc-200">Reasoning Chain</div>
      <pre
        className="overflow-x-auto rounded-lg bg-[#111114] border border-zinc-700 p-4 text-xs text-zinc-100 font-mono focus:outline-none"
        style={{
          background: '#111114',
          color: '#f8fafc',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          boxShadow: 'inset 0 1px 4px #0008',
        }}
        tabIndex={0}
        aria-label="Reasoning Chain code block"
        role="region"
      >
        {audit.reasoning_chain}
      </pre>
    </div>
  );
};

export default ForensicCard;

