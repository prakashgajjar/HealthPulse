'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

import { Sidebar } from '@/app/components/Sidebar';
import { AdminRoute } from '@/app/components/ProtectedRoute';
import { StatCard } from '@/app/components/Cards';
import { TrendChart, DiseaseDistributionChart } from '@/app/components/Charts';

import {
  TrendingUp,
  Calendar,
  BarChart3,
  Activity,
  AlertTriangle,
  Info,
  Loader2,
} from 'lucide-react';

/* ================= CONTENT ================= */
function TrendsContent() {
  const [timePeriod, setTimePeriod] = useState(7);
  const [trendData, setTrendData] = useState([]);
  const [diseaseData, setDiseaseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    totalCases: 0,
    avgDaily: 0,
    peakDay: 0,
    activeRegions: 0,
  });

  useEffect(() => {
    fetchTrends();
  }, [timePeriod]);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get('/api/analysis/trends', {
        params: { days: timePeriod },
      });

      /*
        API RESPONSE FORMAT:
        {
          trendData: [{ date, cases }],
          diseaseData: { diseaseName: { date: cases } }
        }
      */

      const { trendData = [], diseaseData = {} } = res.data || {};

      /* ---------- SET TREND DATA ---------- */
      setTrendData(trendData);

      /* ---------- CONVERT DISEASE OBJECT → ARRAY ---------- */
      const diseaseArray = Object.entries(diseaseData).map(
        ([name, values]) => ({
          name,
          cases: Object.values(values).reduce((sum, v) => sum + v, 0),
        })
      );

      setDiseaseData(diseaseArray);

      /* ---------- STATS ---------- */
      const totalCases = trendData.reduce(
        (sum, d) => sum + (d.cases || 0),
        0
      );

      const avgDaily = Math.round(totalCases / timePeriod);

      const peakDay = Math.max(
        0,
        ...trendData.map((d) => d.cases || 0)
      );

      setStats({
        totalCases,
        avgDaily,
        peakDay,
        activeRegions: 0, // optional – add later if area data exists
      });
    } catch (err) {
      setError('Failed to load trend analytics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto space-y-10">

          {/* ================= HEADER ================= */}
          <header className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
                <h1 className="text-2xl font-semibold text-gray-900">
                  Trend Analysis
                </h1>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Disease patterns over time
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              {[7, 14, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setTimePeriod(d)}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${
                    timePeriod === d
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </header>

          {/* ================= ERROR ================= */}
          {error && (
            <div className="flex items-start gap-2 p-4 rounded-lg bg-red-50 border border-red-200">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* ================= STATS ================= */}
          {!loading && (
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                label="Total Cases"
                value={stats.totalCases}
                icon={Activity}
                subtext={`Last ${timePeriod} days`}
              />
              <StatCard
                label="Daily Average"
                value={stats.avgDaily}
                icon={BarChart3}
                subtext="Cases / day"
              />
              <StatCard
                label="Peak Day"
                value={stats.peakDay}
                icon={TrendingUp}
                subtext="Highest single day"
              />
              <StatCard
                label="Active Regions"
                value={stats.activeRegions}
                icon={BarChart3}
                subtext="Affected areas"
              />
            </section>
          )}

          {/* ================= CHARTS ================= */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border">
              <h2 className="text-lg font-semibold mb-4">
                Case Trends
              </h2>

              {loading ? (
                <div className="h-80 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <TrendChart data={trendData} height={320} />
              )}
            </div>

            <div className="bg-white p-6 rounded-xl border">
              <h2 className="text-lg font-semibold mb-4">
                Top Diseases
              </h2>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-10 bg-gray-100 rounded animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <DiseaseDistributionChart
                  data={diseaseData}
                  height={320}
                />
              )}
            </div>
          </section>

          {/* ================= INFO ================= */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <Info className="w-6 h-6 text-blue-600 mt-0.5" />
            <p className="text-sm text-gray-700">
              This view highlights disease trends over time to identify
              growth patterns, peak periods, and high-risk zones for
              proactive planning.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ================= PAGE EXPORT ================= */
export default function Page() {
  return (
    <AdminRoute>
      <TrendsContent />
    </AdminRoute>
  );
}
