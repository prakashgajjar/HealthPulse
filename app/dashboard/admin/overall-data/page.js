"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

import { Sidebar } from "@/app/components/Sidebar";
import { AdminRoute } from "@/app/components/ProtectedRoute";
import { StatCard } from "@/app/components/Cards";
import { TrendChart } from "@/app/components/Charts";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  AreaChart,
  Area,
} from "recharts";

import {  Layers } from "lucide-react";

import {
  TrendingUp,
  BarChart3,
  Activity,
  AlertTriangle,
  Loader2,
  Globe,
} from "lucide-react";

/* ================= CONTENT ================= */
function OverallDataContent() {
  const [timePeriod, setTimePeriod] = useState(7);
  const [trendData, setTrendData] = useState([]);
  const [diseaseData, setDiseaseData] = useState([]);
  const [areaData, setAreaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = [
    "#10b981", // emerald
    "#3b82f6", // blue
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#14b8a6", // teal
    "#f43f5e", // rose
  ];

  const [stats, setStats] = useState({
    totalCases: 0,
    avgDaily: 0,
    peakDay: 0,
    totalAreas: 0,
  });

  useEffect(() => {
    fetchOverallData();
  }, [timePeriod]);

  const fetchOverallData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch overall trends (no area filter)
      const trendRes = await axios.get("/api/analysis/trends", {
        params: { days: timePeriod, area: "ALL" },
      });

      console.log("Overall Data Response:", trendRes.data);

      const { trendData = [], diseaseData = {} } = trendRes.data || {};

      setTrendData(trendData);

      // Convert disease object to array
      const diseaseArray = Object.entries(diseaseData).map(
        ([name, values]) => ({
          name,
          cases: Object.values(values).reduce((sum, v) => sum + v, 0),
        }),
      );

      diseaseArray.sort((a, b) => b.cases - a.cases);
      setDiseaseData(diseaseArray);

      // Calculate stats
      const totalCases = trendData.reduce((sum, d) => sum + d.cases, 0);
      const avgDaily = totalCases / trendData.length || 0;
      const peakDay = Math.max(...trendData.map((d) => d.cases), 0);

      setStats({
        totalCases: Math.round(totalCases),
        avgDaily: Math.round(avgDaily),
        peakDay: Math.round(peakDay),
        totalAreas: diseaseArray.length,
      });

      // Fetch area-wise breakdown
      await fetchAreaData();
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load overall data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAreaData = async () => {
    try {
      const res = await axios.get("/api/analysis/trends", {
        params: { days: timePeriod, area: "BY_AREA" },
      });

      // This would need a new API endpoint or modification
      // For now, we'll derive from disease data if available
    } catch (err) {
      console.error("Area data fetch error:", err);
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
          className="max-w-7xl mx-auto space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* ================= HEADER ================= */}
          <motion.header variants={itemVariants}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <Globe className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Overall Health Data
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Community-wide disease trends and statistics
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
          <motion.div className="flex gap-3 flex-wrap" variants={itemVariants}>
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
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {period.label}
              </button>
            ))}
          </motion.div>

          {/* ================= STATS CARDS ================= */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
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
                label="Peak Day"
                value={stats.peakDay}
                icon={TrendingUp}
                subtext="Highest daily count"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                label="Diseases"
                value={diseaseData.length}
                icon={Globe}
                subtext="Types reported"
              />
            </motion.div>
          </motion.div>

          {/* ================= TREND CHART ================= */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
            variants={itemVariants}
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Community-Wide Daily Trend
              </h2>
            </div>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9333ea" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="cases"
                    stroke="#9333ea"
                    fillOpacity={1}
                    fill="url(#colorCases)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No trend data available
              </p>
            )}
          </motion.div>

          {/* ================= DISEASE DISTRIBUTION & TOP DISEASES ================= */}
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
                      data={diseaseData.slice(0, 8)}
                      dataKey="cases"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) =>
                        `${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {diseaseData.slice(0, 8).map((entry, index) => (
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
                <BarChart3 className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Top 10 Diseases
                </h2>
              </div>

              {diseaseData.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No disease data available
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {diseaseData.slice(0, 10).map((disease, index) => (
                    <div
                      key={disease.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="font-medium text-gray-900 truncate">
                          {disease.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 ml-2">
                        {disease.cases}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* ================= INFO PANEL ================= */}

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="
    rounded-xl border border-purple-200 
    bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 
    p-6 shadow-sm hover:shadow-md
  "
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                Data Insights
              </h3>
            </div>

            {/* Content */}
            <ul className="space-y-3 text-lg text-gray-700">
              <li className="flex items-start gap-3">
                <Activity className="w-4 h-4 mt-1 text-blue-500" />
                <span>
                  <span className="font-medium text-gray-900">
                    Total Cases:
                  </span>{" "}
                  <span className="font-semibold text-blue-700">
                    {stats.totalCases}
                  </span>{" "}
                  cases across all areas in the last{" "}
                  <span className="font-medium">{timePeriod}</span> days
                </span>
              </li>

              <li className="flex items-start gap-3">
                <TrendingUp className="w-4 h-4 mt-1 text-red-500" />
                <span>
                  <span className="font-medium text-gray-900">
                    Peak Activity:
                  </span>{" "}
                  Highest single-day count was{" "}
                  <span className="font-semibold text-red-600">
                    {stats.peakDay}
                  </span>{" "}
                  cases
                </span>
              </li>

              <li className="flex items-start gap-3">
                <BarChart3 className="w-4 h-4 mt-1 text-green-600" />
                <span>
                  <span className="font-medium text-gray-900">
                    Daily Average:
                  </span>{" "}
                  <span className="font-semibold text-green-700">
                    {stats.avgDaily}
                  </span>{" "}
                  cases per day
                </span>
              </li>

              <li className="flex items-start gap-3">
                <Layers className="w-4 h-4 mt-1 text-purple-600" />
                <span>
                  <span className="font-medium text-gray-900">
                    Disease Diversity:
                  </span>{" "}
                  <span className="font-semibold text-purple-700">
                    {diseaseData.length}
                  </span>{" "}
                  different diseases reported
                </span>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </main>
    </>
  );
}

/* ================= PAGE EXPORT ================= */
export default function AdminOverallDataPage() {
  return (
    <AdminRoute>
      <OverallDataContent />
    </AdminRoute>
  );
}
