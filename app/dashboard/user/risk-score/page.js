"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/app/components/Sidebar";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import { useAuth } from "@/app/context/AuthContext";
import {
  AlertCircle,
  TrendingUp,
  Activity,
  RefreshCw,
  MapPin,
} from "lucide-react";
import axios from "axios";

export default function UserRiskScorePage() {
  const { user } = useAuth();
  const [areaInput, setAreaInput] = useState(user?.area || "");
  const [area, setArea] = useState("");
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const fetchRiskScore = async () => {
    if (!area && !user?.area) {
      setError("Please enter an area first");
      return;
    }

    const searchArea = area || user?.area;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("/api/ai/risk-score", {
        area: searchArea,
      });

      setRiskData(response.data.data);
    } catch (err) {
      console.error("Error fetching risk score:", err);
      setError("Failed to load risk score data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (areaInput) setArea(areaInput);
    await fetchRiskScore();
  };

  useEffect(() => {
    if (user?.area && !area) {
      setArea(user.area);
      setAreaInput(user.area);
    }
  }, [user]);

  useEffect(() => {
    if (area) {
      fetchRiskScore();
    }
  }, [area]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRiskScore();
    setRefreshing(false);
  };

  const getRiskColor = (level) => {
    if (level === "high") return "text-red-600";
    if (level === "medium") return "text-yellow-600";
    return "text-green-600";
  };

  const getRiskBgColor = (level) => {
    if (level === "high") return "bg-red-50";
    if (level === "medium") return "bg-yellow-50";
    return "bg-green-50";
  };

  const getRiskBorderColor = (level) => {
    if (level === "high") return "border-red-400";
    if (level === "medium") return "border-yellow-400";
    return "border-green-400";
  };

  const getRiskIcon = (level) => {
    if (level === "high") return "🔴";
    if (level === "medium") return "🟡";
    return "🟢";
  };

  return (
    <ProtectedRoute>
      <Sidebar />
      <div className="ml-72 min-h-screen bg-gray-50">
        <div className="flex-1 overflow-auto p-6 md:p-8">
          <motion.div
            className="max-w-6xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Header */}
            <motion.div
              className="mb-8 flex items-center gap-4"
              variants={itemVariants}
            >
              <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-lg">
                <AlertCircle className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Health Risk Assessment
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Check disease risk level for your area
                </p>
              </div>
            </motion.div>

            {/* Search Panel */}
            <motion.div
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8"
              variants={itemVariants}
            >
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="text-orange-600" size={22} />
                <h2 className="text-xl font-semibold text-gray-800">
                  Area Selection
                </h2>
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter area name or pincode"
                  className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition bg-white font-medium"
                  value={areaInput}
                  onChange={(e) => setAreaInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition shadow-md"
                >
                  Check Risk
                </button>
                {area && (
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="px-4 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                  >
                    <RefreshCw
                      size={20}
                      className={refreshing ? "animate-spin" : ""}
                    />
                  </button>
                )}
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
            </motion.div>

            {/* Risk Meter Display */}
            {area && (
              <>
                {loading ? (
                  <motion.div
                    className="bg-white rounded-xl shadow-lg border border-gray-200 p-8"
                    variants={itemVariants}
                  >
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-12 bg-gray-200 rounded w-32"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                  </motion.div>
                ) : riskData ? (
                  <motion.div
                    className="space-y-8"
                    variants={containerVariants}
                  >
                    {/* Main Risk Score Card */}
                    <motion.div
                      className={`${getRiskBgColor(
                        riskData.aggregateRiskLevel
                      )} border-l-4 ${getRiskBorderColor(
                        riskData.aggregateRiskLevel
                      )} rounded-xl shadow-lg p-8 border`}
                      variants={itemVariants}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-4xl">
                              {getRiskIcon(riskData.aggregateRiskLevel)}
                            </span>
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900">
                                Risk Level
                              </h3>
                              <p className="text-sm text-gray-600">{area}</p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <span
                              className={`inline-block text-2xl font-bold px-4 py-2 rounded-lg ${getRiskColor(
                                riskData.aggregateRiskLevel
                              )} bg-white border`}
                            >
                              {riskData.aggregateRiskLevel.toUpperCase()}
                            </span>
                          </div>

                          <p className="text-gray-700 text-sm">
                            {riskData.aggregateRiskLevel === "high"
                              ? "⚠️ High risk detected. Take extra precautions."
                              : riskData.aggregateRiskLevel === "medium"
                                ? "⚡ Moderate risk. Stay aware and follow guidelines."
                                : "✅ Low risk. Continue healthy practices."}
                          </p>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
                          <p className="text-gray-600 text-sm mb-2">
                            Risk Score
                          </p>
                          <p
                            className={`text-5xl font-bold ${getRiskColor(
                              riskData.aggregateRiskLevel
                            )}`}
                          >
                            {riskData.aggregateRiskScore}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Out of 100
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-gray-700">
                            Risk Progress
                          </span>
                          <span className="text-xs text-gray-600">
                            {Math.round(
                              (riskData.aggregateRiskScore / 100) * 100
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              riskData.aggregateRiskLevel === "high"
                                ? "bg-red-500"
                                : riskData.aggregateRiskLevel === "medium"
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                            style={{
                              width: `${(riskData.aggregateRiskScore / 100) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Impact Area Cards */}
                    <motion.div
                      className="grid md:grid-cols-3 gap-6"
                      variants={containerVariants}
                    >
                      {/* High Severity Diseases */}
                      <motion.div
                        className="bg-white rounded-xl shadow-lg border border-red-200 p-6"
                        variants={itemVariants}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <AlertCircle className="text-red-600" size={20} />
                          </div>
                          <h4 className="font-semibold text-gray-800">
                            High Risk Diseases
                          </h4>
                        </div>
                        <p className="text-2xl font-bold text-red-600">
                          {riskData.diseaseCount?.high || 0}
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                          Stay alert & take precautions
                        </p>
                      </motion.div>

                      {/* Medium Severity Diseases */}
                      <motion.div
                        className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6"
                        variants={itemVariants}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <TrendingUp className="text-yellow-600" size={20} />
                          </div>
                          <h4 className="font-semibold text-gray-800">
                            Moderate Risk
                          </h4>
                        </div>
                        <p className="text-2xl font-bold text-yellow-600">
                          {riskData.diseaseCount?.medium || 0}
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                          Monitor closely
                        </p>
                      </motion.div>

                      {/* Low Severity Diseases */}
                      <motion.div
                        className="bg-white rounded-xl shadow-lg border border-green-200 p-6"
                        variants={itemVariants}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Activity className="text-green-600" size={20} />
                          </div>
                          <h4 className="font-semibold text-gray-800">
                            Low Risk Diseases
                          </h4>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                          {riskData.diseaseCount?.low || 0}
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                          Good health status
                        </p>
                      </motion.div>
                    </motion.div>

                    {/* Health Tips */}
                    <motion.div
                      className="bg-blue-50 border-l-4 border-blue-600 rounded-xl shadow-lg p-6"
                      variants={itemVariants}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <AlertCircle className="text-blue-600" size={22} />
                        <h3 className="text-lg font-semibold text-gray-900">
                          Health Guidelines
                        </h3>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>✓ Maintain proper hygiene and sanitation</li>
                        <li>✓ Stay updated with vaccination schedules</li>
                        <li>✓ Use preventive measures like masks if needed</li>
                        <li>✓ Seek medical help if symptoms appear</li>
                        <li>✓ Stay informed through official health channels</li>
                      </ul>
                    </motion.div>
                  </motion.div>
                ) : null}
              </>
            )}

            {/* Empty State */}
            {!area && (
              <motion.div
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center"
                variants={itemVariants}
              >
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No Area Selected
                </h3>
                <p className="text-gray-600">
                  {user?.area
                    ? `Showing risk assessment for: ${user.area}`
                    : "Enter your area and press Check Risk to view the health risk assessment."}
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
