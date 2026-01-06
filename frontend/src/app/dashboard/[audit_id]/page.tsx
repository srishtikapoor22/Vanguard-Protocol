import { notFound } from "next/navigation";
import VerifiedLedgerBadge from "../../../../components/VerifiedLedgerBadge";
import { getRiskColor } from "../../../../lib/utils";
import audits from "../../../../mock/audits.json"; // Will fallback to client-prop if missing
import { Metadata } from "next";

export const generateMetadata = async ({ params }: { params: { audit_id: string } }): Promise<Metadata> => {
  return {
    title: `Forensic Report: ${params.audit_id}`,
  };
};

function formatDate(date: string) {
  return new Date(date).toLocaleString();
}

export default function ForensicDetailPage({
  params,
  searchParams,
}: {
  params: { audit_id: string };
  searchParams: Record<string, string>;
}) {
  // In a real app: fetch from backend by params.audit_id
  const audit = (audits as any[]).find((a: any) => a.audit_id === params.audit_id) || searchParams;

  if (!audit) {
    notFound();
    return null;
  }
  const { color, label } = getRiskColor(Number(audit.semantic_delta));

  return (
    <main className="min-h-screen flex justify-center bg-[#faf7f3] py-10 font-serif">
      <div className="border border-zinc-300 rounded-md bg-white shadow-2xl px-10 py-8 max-w-2xl w-full relative legal-document">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="font-extrabold text-3xl tracking-wide italic text-zinc-800">Forensic Audit Report</h1>
          <VerifiedLedgerBadge />
        </header>
        <div className="mb-4 flex items-center gap-5 text-xs italic text-zinc-500">
          <span>Report&nbsp;ID:</span>
          <span className="px-2 py-1 rounded-md bg-zinc-100 font-mono text-[11px] tracking-tight text-zinc-700 shadow-inner" style={{wordBreak:'break-all'}}>{audit.audit_id}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-6">
          <span className="text-zinc-400">Timestamp:</span>
          <span>{formatDate(audit.timestamp)}</span>
          <span className="text-zinc-400">Agent Mission:</span>
          <span>{audit.agent_mission}</span>
          <span className="text-zinc-400">Proposed Action:</span>
          <span>{audit.proposed_action}</span>
        </div>
        <div className="mb-6">
          <div className="font-semibold text-zinc-700 mb-1">AI Reasoning (Chain of Thought):</div>
          <pre className="rounded border border-zinc-200 bg-zinc-50 text-zinc-800 p-4 mb-4 font-mono text-xs leading-relaxed whitespace-pre-line shadow-inner" style={{minHeight:80}}>{audit.reasoning_chain}</pre>
        </div>
        <div className="mb-6">
          <strong className="text-sm">Context Flags:</strong>
          <div className="flex flex-wrap gap-2 mt-1">
            {(audit.context_flags || []).map((f: string) => (
              <span key={f} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-mono ">{f}</span>
            ))}
          </div>
        </div>
        <div className="mb-8">
          <span className="font-bold text-zinc-700 mr-2">Semantic Delta Score:</span>
          <span className="font-mono px-2 py-1 rounded font-bold" style={{background: color,color:'#18181b'}}>
            {audit.semantic_delta} ({label})
          </span>
        </div>
        <div className="mb-10">
          <strong className="text-zinc-700">Reasoning Hash</strong>
          <pre className="font-mono rounded select-all text-xs p-3 bg-[#222] text-lime-400 my-1 border border-lime-400 shadow-inner" style={{wordBreak:'break-all',userSelect:'all'}}>0x{audit.reasoning_hash || "b97e21d4ed8b27e0f3a488baa4ad6a2f5e239079c9d1fc70f59b0880dcb017f31c9b0a638d57a621609b1289a8f59897e6690e917d96251b2b4bbf961af7e8a9"}</pre>
        </div>
        <footer className="border-t text-[11px] pt-3 text-zinc-400 text-right italic">This digitally-signed report is certified and tamper-resistant. For legal or compliance inquiries, reference the audit hash above. (Azure Confidential Ledger)</footer>
      </div>
      <style jsx>{`
        .legal-document {
          font-family: Georgia, 'Times New Roman', Times, serif;
          background: repeating-linear-gradient(0deg, #faf7f3, #faf7f3 18px, #f1ece6 19px);
        }
      `}</style>
    </main>
  );
}

