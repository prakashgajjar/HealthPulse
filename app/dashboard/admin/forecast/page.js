"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/app/components/Sidebar";
import ForecastSimulator from "@/app/components/ForecastSimulator";
import { AdminRoute } from "@/app/components/ProtectedRoute";
import { TrendingUp, Activity, Zap } from "lucide-react";
import { BarChart3, Target } from "lucide-react";

export default function ForecastPage() {
  const [area, setArea] = useState("");
  const [disease, setDisease] = useState("");
  const [diseaseInput, setDiseaseInput] = useState("");
  const [areaInput, setAreaInput] = useState("");

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

  return (
    <AdminRoute>
      <>
        <Sidebar />

        <div className="ml-72 min-h-screen overflow-auto p-6 md:p-8 bg-gray-50">
          <motion.div
            className="max-w-7xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Header */}
            <motion.div
              className="mb-8 flex items-center gap-4"
              variants={itemVariants}
            >
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                <TrendingUp className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  AI Health Forecast & Simulator
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Predict disease trends and simulate preventive interventions
                </p>
              </div>
            </motion.div>

            {/* Selection Panel */}
            <motion.div
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8"
              variants={itemVariants}
            >
              <div className="flex items-center gap-3 mb-6">
                <Activity className="text-indigo-600" size={22} />
                <h2 className="text-xl font-semibold text-gray-800">
                  Input Data
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Area Input */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Area / Pincode
                  </label>

                  <input
                    type="text"
                    placeholder="Enter area name or pincode (e.g. Patan or 384265)"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white font-medium"
                    value={areaInput}
                    onChange={(e) => setAreaInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        setArea(areaInput);
                        setDisease(diseaseInput);
                      }
                    }}
                  />

                  <p className="text-xs text-gray-500 mt-1">
                    Supports city names and numeric pincodes
                  </p>
                </motion.div>

                {/* Disease Input */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Disease
                  </label>

                  <input
                    type="text"
                    placeholder="Enter disease name (e.g. Dengue, Malaria, COVID-19)"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white font-medium"
                    value={diseaseInput}
                    onChange={(e) => setDiseaseInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        setArea(areaInput);
                        setDisease(diseaseInput);
                      }
                    }}
                  />

                  <p className="text-xs text-gray-500 mt-1">
                    Case-insensitive, community-level disease tracking
                  </p>
                </motion.div>
              </div>

              {/* Single Search Button */}
              <motion.div variants={itemVariants} className="mt-6">
                <button
                  onClick={() => {
                    setArea(areaInput);
                    setDisease(diseaseInput);
                  }}
                  className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-md"
                >
                  Search Forecast
                </button>
              </motion.div>
            </motion.div>

            {/* Feature Cards */}
            {!area || !disease ? (
              <motion.div
                className="grid md:grid-cols-3 gap-4 mb-8"
                variants={containerVariants}
              >
                <motion.div
                  className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border border-blue-200 hover:shadow-md transition"
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                >
                  <BarChart3 className="w-8 h-8 text-blue-600 mb-2" />
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Baseline Forecast
                  </h3>
                  <p className="text-sm text-gray-700">
                    AI predicts cases for 7–30 days
                  </p>
                </motion.div>

                <motion.div
                  className="bg-gradient-to-br from-green-50 to-emerald-100 p-5 rounded-lg border border-green-200 hover:shadow-md transition"
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                >
                  <Target className="w-8 h-8 text-green-600 mb-2" />
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Intervention Sim
                  </h3>
                  <p className="text-sm text-gray-700">
                    Simulate preventive actions
                  </p>
                </motion.div>

                <motion.div
                  className="bg-gradient-to-br from-purple-50 to-indigo-100 p-5 rounded-lg border border-indigo-200 hover:shadow-md transition"
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                >
                  <TrendingUp className="w-8 h-8 text-indigo-600 mb-2" />
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Impact Analysis
                  </h3>
                  <p className="text-sm text-gray-700">
                    See cases prevented & reduction %
                  </p>
                </motion.div>
              </motion.div>
            ) : null}

            {/* Simulator */}
            {area && disease && (
              <motion.div
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-200">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Zap className="text-indigo-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Forecast Results
                    </h3>
                    <p className="text-xs text-gray-600">
                      {area} • {disease}
                    </p>
                  </div>
                </div>
                <ForecastSimulator area={area} disease={disease} />
              </motion.div>
            )}

            {/* Quick Tips */}
            {!area || !disease ? (
              <motion.div
                className="mt-8 bg-indigo-50 border-l-4 border-indigo-600 p-6 rounded-lg"
                variants={itemVariants}
              >
                <h3 className="font-semibold text-indigo-900 mb-3">
                  💡 How to Use
                </h3>
                <ol className="space-y-2 text-sm text-indigo-900 list-decimal list-inside">
                  <li>
                    Select an area from the dropdown or enter a custom area code
                  </li>
                  <li>Choose a disease to forecast</li>
                  <li>
                    View the baseline prediction without any interventions
                  </li>
                  <li>
                    Adjust intervention controls (awareness, medical,
                    environmental)
                  </li>
                  <li>Compare % reduction vs baseline forecast</li>
                </ol>
              </motion.div>
            ) : null}
          </motion.div>
        </div>
      </>
    </AdminRoute>
  );
}
