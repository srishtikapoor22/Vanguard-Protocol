import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@shadcn/ui";

export interface EmergencyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reasoningChain: string;
  policy: string;
}

export const EmergencyDialog: React.FC<EmergencyDialogProps> = ({ open, onOpenChange, reasoningChain, policy }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-4xl bg-[#09090b] text-white border border-red-700 shadow-xl" style={{ color: '#fff', background: '#09090b' }}>
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-amber-400 flex gap-4 items-center">
          🚨 Emergency Intervention Required
        </DialogTitle>
        <DialogDescription className="text-zinc-300">
          An audit detected possible "Shadow Logic Hijacking." Review below:
        </DialogDescription>
      </DialogHeader>
      <div className="mt-6 flex flex-col md:flex-row gap-6">
        <section className="flex-1 bg-card rounded-lg border border-zinc-700 p-4 min-w-[300px]">
          <div className="font-semibold text-blue-400 mb-2">Immutable Policy</div>
          <pre className="text-xs font-mono whitespace-pre-line text-blue-200" style={{ minHeight: 160 }} tabIndex={0} aria-label="Immutable Policy" role="region">{policy}</pre>
        </section>
        <section className="flex-1 bg-card rounded-lg border border-zinc-700 p-4 min-w-[300px]">
          <div className="font-semibold text-amber-400 mb-2">AI Reasoning Chain</div>
          <pre className="text-xs font-mono whitespace-pre-line text-amber-100" style={{ minHeight: 160 }} tabIndex={0} aria-label="AI Reasoning Chain" role="region">{reasoningChain}</pre>
        </section>
      </div>
      <DialogClose className="mt-4 px-6 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        Close
      </DialogClose>
    </DialogContent>
  </Dialog>
);

export default EmergencyDialog;

