import { ForensicCard } from "../../../components/ForensicCard";
import { useAuditStream } from "../../../hooks/useAuditStream";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const audits = useAuditStream();

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
              <ForensicCard audit={audit} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </main>
  );
}

