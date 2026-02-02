"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/app/components/Sidebar";
import { AlertCard } from "@/app/components/Cards";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";

import { ShieldAlert, AlertTriangle, Loader2 } from "lucide-react";

/* ===================== CONTENT ===================== */
function UserAlertsContent() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all | high | medium | low

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/alerts/get?limit=50");
        if (!res.ok) throw new Error("Failed to fetch alerts");

        const data = await res.json();
        setAlerts(data.alerts || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const filteredAlerts =
    filter === "all" ? alerts : alerts.filter((a) => a.riskLevel === filter);

  const riskStats = {
    high: alerts.filter((a) => a.riskLevel === "high").length,
    medium: alerts.filter((a) => a.riskLevel === "medium").length,
    low: alerts.filter((a) => a.riskLevel === "low").length,
  };

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 min-h-screen bg-gray-50 px-8 py-6">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* ================= HEADER ================= */}
          <header>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl font-semibold text-gray-900">
                Alert History
              </h1>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Health alerts issued for your area
            </p>
          </header>

          {/* ================= ERROR ================= */}
          {error && (
            <div className="flex items-start gap-2 p-4 rounded-lg bg-red-50 border border-red-200">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* ================= RISK SUMMARY ================= */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">
              Risk Summary
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <RiskStat label="High Risk" value={riskStats.high} color="red" />
              <RiskStat
                label="Medium Risk"
                value={riskStats.medium}
                color="yellow"
              />
              <RiskStat label="Low Risk" value={riskStats.low} color="green" />
            </div>
          </section>

          {/* ================= FILTER ================= */}
          <section className="flex flex-wrap gap-2">
            {["all", "high", "medium", "low"].map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`px-4 py-2 text-sm rounded-lg font-medium transition ${
                  filter === level
                    ? "bg-emerald-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {level === "all"
                  ? "All Alerts"
                  : `${level.charAt(0).toUpperCase()}${level.slice(1)} Risk`}
              </button>
            ))}
          </section>

          {/* ================= ALERT LIST ================= */}
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-gray-600 font-medium">
                  No alerts found for this filter
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAlerts.map((alert) => (
                  <AlertCard key={alert._id} alert={alert} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

/* ===================== RISK STAT ===================== */
function RiskStat({ label, value, color }) {
  const colors = {
    red: "bg-red-50 border-red-200 text-red-700",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
    green: "bg-green-50 border-green-200 text-green-700",
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[color]}`}>
      <p className="text-xs font-medium">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}

/* ===================== PAGE EXPORT ===================== */
export default function UserAlertsPage() {
  return (
    <ProtectedRoute>
      <UserAlertsContent />
    </ProtectedRoute>
  );
}
