"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

import { Sidebar } from "@/app/components/Sidebar";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import { useAuth } from "@/app/context/AuthContext";
import { StatCard } from "@/app/components/Cards";
import { TrendChart, DiseaseDistributionChart } from "@/app/components/Charts";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import {
  TrendingUp,
  Calendar,
  BarChart3,
  Activity,
  AlertTriangle,
  Loader2,
} from "lucide-react";

/* ================= CONTENT ================= */
function UserTrendsContent() {
  const { user } = useAuth();
  const [timePeriod, setTimePeriod] = useState(7);
  const [trendData, setTrendData] = useState([]);
  const [diseaseData, setDiseaseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = [
    "#10b981", // emerald
    "#3b82f6", // blue
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
  ];

  const [stats, setStats] = useState({
    totalCases: 0,
    avgDaily: 0,
    peakDay: 0,
  });

  useEffect(() => {
    fetchTrends();
  }, [timePeriod]);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get("/api/analysis/trends", {
        params: { days: timePeriod },
      });

      console.log("Trend Analysis Response:", res.data);

      const { trendData = [], diseaseData = {} } = res.data || {};

      /* ---------- SET TREND DATA ---------- */
      setTrendData(trendData);

      /* ---------- CONVERT DISEASE OBJECT → ARRAY ---------- */
      const diseaseArray = Object.entries(diseaseData).map(
        ([name, values]) => ({
          name,
          cases: Object.values(values).reduce((sum, v) => sum + v, 0),
        }),
      );

      /* ---------- SORT BY CASES ---------- */
      diseaseArray.sort((a, b) => b.cases - a.cases);

      /* ---------- SET DISEASE DATA ---------- */
      setDiseaseData(diseaseArray);

      /* ---------- CALCULATE STATS ---------- */
      const totalCases = trendData.reduce((sum, d) => sum + d.cases, 0);
      const avgDaily = totalCases / trendData.length || 0;
      const peakDay = Math.max(...trendData.map((d) => d.cases), 0);

      setStats({
        totalCases: Math.round(totalCases),
        avgDaily: Math.round(avgDaily),
        peakDay: Math.round(peakDay),
      });
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load trend data");
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOADING STATE ================= */
  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="ml-72 min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <>
      <Sidebar />

      <main className="ml-72 min-h-screen bg-gray-50 px-8 py-6">
        <motion.div
          className="max-w-6xl mx-auto space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* ================= HEADER ================= */}
          <motion.header variants={itemVariants}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Case Trends Analysis
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Disease trends for <span className="font-medium">{user?.area}</span>
                </p>
              </div>
            </div>
          </motion.header>

          {/* ================= ERROR STATE ================= */}
          {error && (
            <motion.div
              className="flex items-start gap-2 p-4 rounded-lg bg-red-50 border border-red-200"
              variants={itemVariants}
            >
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          {/* ================= TIME PERIOD SELECTOR ================= */}
          <motion.div
            className="flex gap-3 flex-wrap"
            variants={itemVariants}
          >
            {[
              { label: "Last 7 Days", value: 7 },
              { label: "Last 30 Days", value: 30 },
              { label: "Last 90 Days", value: 90 },
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => setTimePeriod(period.value)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  timePeriod === period.value
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {period.label}
              </button>
            ))}
          </motion.div>

          {/* ================= STATS CARDS ================= */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <StatCard
                label="Total Cases"
                value={stats.totalCases}
                icon={Activity}
                subtext={`In last ${timePeriod} days`}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                label="Daily Average"
                value={stats.avgDaily}
                icon={BarChart3}
                subtext="Cases per day"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                label="Peak Cases"
                value={stats.peakDay}
                icon={TrendingUp}
                subtext="Highest single day"
              />
            </motion.div>
          </motion.div>

          {/* ================= TREND CHART ================= */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
            variants={itemVariants}
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Daily Case Trend
              </h2>
            </div>
            <TrendChart data={trendData} />
          </motion.div>

          {/* ================= DISEASE DISTRIBUTION ================= */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            variants={containerVariants}
          >
            {/* Chart */}
            <motion.div
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
              variants={itemVariants}
            >
              <div className="flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Disease Distribution
                </h2>
              </div>
              {diseaseData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={diseaseData}
                      dataKey="cases"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) =>
                        `${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {diseaseData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} cases`, "Cases"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No disease data available
                </p>
              )}
            </motion.div>

            {/* List */}
            <motion.div
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
              variants={itemVariants}
            >
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Top Diseases
                </h2>
              </div>

              {diseaseData.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No disease data available
                </p>
              ) : (
                <div className="space-y-3">
                  {diseaseData.slice(0, 8).map((disease, index) => (
                    <div
                      key={disease.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="font-medium text-gray-900">
                          {disease.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {disease.cases} cases
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      </main>
    </>
  );
}

/* ================= PAGE EXPORT ================= */
export default function UserTrendsPage() {
  return (
    <ProtectedRoute>
      <UserTrendsContent />
    </ProtectedRoute>
  );
}
