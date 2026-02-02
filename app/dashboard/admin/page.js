'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/app/components/Sidebar';
import { StatCard, HighRiskAreaCard } from '@/app/components/Cards';
import { AdminRoute } from '@/app/components/ProtectedRoute';
import { useAuth } from '@/app/context/AuthContext';
import {
  LayoutDashboard,
  AlertTriangle,
  Activity,
  TrendingUp,
  CalendarDays,
  Loader2,
} from 'lucide-react';

function AdminOverviewContent() {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [trendingDiseases, setTrendingDiseases] = useState([]);
  const [highRiskAreas, setHighRiskAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/analysis/overview');
        if (!res.ok) throw new Error('Unable to load dashboard data');
        const data = await res.json();

        setStats(data.stats);
        setTrendingDiseases(data.trendingDiseases || []);
        setHighRiskAreas(data.highRiskAreas || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex items-center gap-3 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Loading analytics…</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 min-h-screen bg-gray-50 px-8 py-6">
        <div className="max-w-7xl mx-auto space-y-10">

          {/* ================= PAGE HEADER ================= */}
          <header className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-6 h-6 text-emerald-600" />
                <h1 className="text-2xl font-semibold text-gray-900">
                  Admin Dashboard
                </h1>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Centralized overview of community health activity
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CalendarDays className="w-4 h-4" />
              Last updated: Today
            </div>
          </header>

          {/* ================= ERROR ================= */}
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Data loading failed
                </p>
                <p className="text-xs text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* ================= KEY METRICS ================= */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">
              Key Metrics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                label="Cases Today"
                value={stats?.todayCases || 0}
                icon={Activity}
                subtext="Reported in last 24 hours"
                trend={stats?.todayTrend}
              />

              <StatCard
                label="Weekly Cases"
                value={stats?.weekCases || 0}
                icon={TrendingUp}
                subtext="Last 7 days"
                trend={stats?.weekTrend}
              />

              <StatCard
                label="Monthly Cases"
                value={stats?.monthCases || 0}
                icon={LayoutDashboard}
                subtext="Last 30 days"
                trend={stats?.monthTrend}
              />
            </div>
          </section>

          {/* ================= HIGH RISK AREAS ================= */}
          {highRiskAreas.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  High Risk Areas
                </h2>
                <span className="text-xs font-medium text-red-600">
                  {highRiskAreas.filter(a => a.riskLevel === 'high').length} critical zones
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {highRiskAreas.map(area => (
                  <HighRiskAreaCard key={area.area} {...area} />
                ))}
              </div>
            </section>
          )}

          {/* ================= TRENDING DISEASES ================= */}
          {trendingDiseases.length > 0 && (
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  Trending Diseases
                </h2>
                <p className="text-sm text-gray-500">
                  Most reported diseases in the last 7 days
                </p>
              </div>

              <div className="space-y-3">
                {trendingDiseases.slice(0, 10).map((item, index) => (
                  <div
                    key={item.disease}
                    className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-medium text-gray-400 w-6">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.disease}
                        </p>
                        <p className="text-xs text-gray-500">
                          Reported cases
                        </p>
                      </div>
                    </div>

                    <p className="text-lg font-semibold text-emerald-600">
                      {item.count}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminRoute>
      <AdminOverviewContent />
    </AdminRoute>
  );
}
