"use client";
import * as React from "react";

export default function AgentInputSidebar() {
  const [form, setForm] = React.useState({
    agentId: "",
    mission: "",
    action: ""
  });
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("http://localhost:8000/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: form.agentId,
          mission_statement: form.mission,
          proposed_action: form.action
        })
      });
      if(res.ok) setMsg("Submitted for audit ✅");
      else setMsg("Error submitting audit");
    } catch (e) {
      setMsg("Network error");
    }
    setLoading(false);
  }

  return (
    <aside className="w-full md:w-80 shrink-0 p-6 bg-zinc-900 border-r border-zinc-800 min-h-screen flex flex-col gap-8 shadow-xl">
      <h2 className="text-lg font-bold text-white mb-2 tracking-wide">Simulated Agent Input</h2>
      <form className="flex flex-col gap-4 mt-8" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-1 text-zinc-300 text-xs font-semibold uppercase tracking-wider" htmlFor="agent_id">Agent ID</label>
          <input
            id="agent_id"
            required
            type="text"
            className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-white focus:border-blue-500 focus:outline-none shadow"
            value={form.agentId}
            onChange={e => setForm(f => ({ ...f, agentId: e.target.value }))}
            autoComplete="off"
          />
        </div>
        <div>
          <label className="block mb-1 text-zinc-300 text-xs font-semibold uppercase tracking-wider" htmlFor="mission">Mission Statement</label>
          <textarea
            id="mission"
            required
            rows={2}
            className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-white focus:border-blue-500 focus:outline-none shadow"
            value={form.mission}
            onChange={e => setForm(f => ({ ...f, mission: e.target.value }))}
          />
        </div>
        <div>
          <label className="block mb-1 text-zinc-300 text-xs font-semibold uppercase tracking-wider" htmlFor="action">Proposed Action</label>
          <textarea
            id="action"
            required
            rows={2}
            className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-white focus:border-blue-500 focus:outline-none shadow"
            value={form.action}
            onChange={e => setForm(f => ({ ...f, action: e.target.value }))}
          />
        </div>
        <button
          type="submit"
          className={`w-full py-2 mt-2 rounded bg-blue-600 font-bold text-md text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-wait ${loading ? 'animate-pulse' : ''}`}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit for Audit'}
        </button>
        {msg && (
          <span
            className={`text-xs font-medium ${msg.includes('✅') ? 'text-green-400' : 'text-red-400'}`}
            aria-live="polite"
          >{msg}</span>
        )}
      </form>
    </aside>
  );
}

