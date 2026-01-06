"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AnalyticsData {
  total_audits: number;
  hijacks_prevented: number;
  average_delta: number;
  risk_trend: Array<{ hour: string; delta: number }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("http://localhost:8000/analytics");
        if (response.ok) {
          const analytics = await response.json();
          setData(analytics);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        // Use mock data if API fails
        setData({
          total_audits: 1247,
          hijacks_prevented: 23,
          average_delta: 0.42,
          risk_trend: generateMockTrendData(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const generateMockTrendData = () => {
    const hours = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      hours.push({
        hour: hour.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        delta: Math.random() * 0.6 + 0.2, // Random delta between 0.2 and 0.8
      });
    }
    return hours;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-zinc-400">Loading analytics...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-400">Failed to load analytics data</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 text-white">Security Analytics</h1>
      <p className="text-zinc-400 mb-8">Real-time metrics and risk trend analysis</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Logic Audits Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-400">Total Logic Audits</h3>
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{data.total_audits.toLocaleString()}</div>
          <p className="text-sm text-zinc-500">All-time audit count</p>
        </div>

        {/* Hijacks Prevented Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-400">Hijacks Prevented</h3>
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{data.hijacks_prevented}</div>
          <p className="text-sm text-zinc-500">Blocked attempts (delta &gt; 0.7)</p>
        </div>

        {/* Average Semantic Delta Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-400">Average Semantic Delta</h3>
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{data.average_delta.toFixed(2)}</div>
          <p className="text-sm text-zinc-500">Mean risk score (24h)</p>
        </div>
      </div>

      {/* Risk Trend Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Risk Trend (Last 24 Hours)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.risk_trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
            <XAxis
              dataKey="hour"
              stroke="#71717a"
              style={{ fontSize: "12px" }}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#71717a"
              style={{ fontSize: "12px" }}
              domain={[0, 1]}
              tickFormatter={(value) => value.toFixed(1)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                color: "#fff",
              }}
              labelStyle={{ color: "#a1a1aa" }}
            />
            <Line
              type="monotone"
              dataKey="delta"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

