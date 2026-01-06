"use client";

import { useState } from "react";

interface PolicyData {
  corporate_mission: string;
  approved_vendors: string;
}

export default function PolicyConfigurationPage() {
  const [formData, setFormData] = useState<PolicyData>({
    corporate_mission: "",
    approved_vendors: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Parse approved vendors from comma-separated string
      const vendorsList = formData.approved_vendors
        .split(",")
        .map((v: string) => v.trim())
        .filter((v: string) => v.length > 0);

      const response = await fetch("http://localhost:8000/policy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          corporate_mission: formData.corporate_mission,
          approved_vendors: vendorsList,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save policy");
      }

      setMessage({ type: "success", text: "Policy configuration saved successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save policy configuration. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-white">Policy Configuration</h1>
      <p className="text-zinc-400 mb-8">
        Configure your corporate mission statement and approved vendors. This data will be used to
        update the Azure AI Search index for trust baseline evaluation.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="corporate_mission" className="block text-sm font-medium text-zinc-300 mb-2">
            Corporate Mission Statement
          </label>
          <textarea
            id="corporate_mission"
            rows={8}
            value={formData.corporate_mission}
            onChange={(e) => setFormData({ ...formData, corporate_mission: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Enter your corporate mission statement here. This defines the core purpose and values that AI agents should align with..."
            required
          />
          <p className="mt-2 text-sm text-zinc-500">
            This mission statement will be used as the baseline for semantic delta calculations.
          </p>
        </div>

        <div>
          <label htmlFor="approved_vendors" className="block text-sm font-medium text-zinc-300 mb-2">
            Approved Vendors
          </label>
          <textarea
            id="approved_vendors"
            rows={6}
            value={formData.approved_vendors}
            onChange={(e) => setFormData({ ...formData, approved_vendors: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Enter approved vendors, one per line or comma-separated. Example: Acme Corp, Global Tech Inc, Secure Systems LLC"
            required
          />
          <p className="mt-2 text-sm text-zinc-500">
            List all approved vendors. Transactions with these vendors will receive lower risk scores.
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-900/30 border border-green-700 text-green-300"
                : "bg-red-900/30 border border-red-700 text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Save Policy Configuration"}
          </button>
        </div>
      </form>
    </div>
  );
}

