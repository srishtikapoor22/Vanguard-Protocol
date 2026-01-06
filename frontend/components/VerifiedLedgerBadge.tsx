import React from "react";

export const VerifiedLedgerBadge: React.FC = () => (
  <span
    className="inline-flex items-center gap-2 rounded-md bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-500 shadow focus:outline-none focus:ring-2 focus:ring-blue-300 select-none"
    aria-label="Verified by Azure Confidential Ledger"
    title="Verified by Azure Confidential Ledger - blockchain attested"
  >
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="7" stroke="#3b82f6" strokeWidth="2" fill="#e0f2fe" />
      <path d="M5.5 8.5L7.3 10.2L11 6.5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    Verified by Azure Ledger
  </span>
);

export default VerifiedLedgerBadge;

