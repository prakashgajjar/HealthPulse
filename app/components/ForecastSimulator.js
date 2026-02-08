'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import axios from 'axios';

export default function ForecastSimulator({ area, disease }) {
  const [baseline, setBaseline] = useState(null);
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  // Intervention controls
  const [interventions, setInterventions] = useState({
    awarenessLevel: 50,
    medicalIntervention: false,
    environmentalControl: false,
  });

  const [forecastDays, setForecastDays] = useState(7);

  // Fetch baseline forecast
  useEffect(() => {
    if (!area || !disease) return;

    const fetchBaseline = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `/api/ai/forecast?area=${encodeURIComponent(area)}&disease=${encodeURIComponent(
            disease
          )}&days=${forecastDays}`
        );
        setBaseline(response.data);
        setSimulation(null); // Reset simulation
      } catch (error) {
        console.error('Error fetching forecast:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBaseline();
  }, [area, disease, forecastDays]);

  // Run simulation
  const handleSimulate = async () => {
    if (!baseline) return;

    setSimulating(true);
    try {
      const response = await axios.post('/api/ai/simulate', {
        area,
        disease,
        interventions,
        days: forecastDays,
      });
      setSimulation(response.data);
    } catch (error) {
      console.error('Error running simulation:', error);
      alert('Failed to run simulation');
    } finally {
      setSimulating(false);
    }
  };

  // Prepare chart data
  const getChartData = () => {
    if (!baseline || baseline.status !== 'success') return [];

    const data = baseline.baselineForecast.map((cases, idx) => ({
      day: idx + 1,
      baseline: cases,
      simulated: simulation?.scenario?.forecast?.[idx] || null,
    }));

    return data;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (baseline?.status !== 'success') {
    return (
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
        <p className="text-gray-700 font-medium">📊 {baseline?.message || 'Unable to generate forecast'}</p>
        <p className="text-sm text-gray-600 mt-2">
          Try with different disease or area, or wait for more historical data.
        </p>
      </div>
    );
  }

  const chartData = getChartData();
  const impactReduction = simulation?.impact?.percentReduction || 0;
  const casesPrevented = simulation?.impact?.casesPrevented || 0;

  return (
    <div className="space-y-6">
      {/* Header with Key Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-600 uppercase">Forecast Confidence</p>
            <p className="text-2xl font-bold text-blue-600 mt-1 capitalize">{baseline.confidence}</p>
          </div>
          <div className="bg-white rounded p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-600 uppercase">Current Trend</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1 capitalize">
              {baseline.currentTrend}
            </p>
          </div>
          <div className="bg-white rounded p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-600 uppercase">Avg Daily Cases</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {baseline.historicalAverage.toFixed(0)}
            </p>
          </div>
          <div className="bg-white rounded p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-600 uppercase">Baseline Total</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {baseline.baselineForecast.reduce((a, b) => a + b, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Intervention Controls */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-6">🎯 Intervention Controls</h3>

        <div className="space-y-6">
          {/* Awareness Level Slider */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="font-semibold text-gray-700">
                📢 Public Awareness Level
              </label>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-bold ${
                    interventions.awarenessLevel < 33
                      ? 'bg-red-100 text-red-800'
                      : interventions.awarenessLevel < 66
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {interventions.awarenessLevel}%
                </span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={interventions.awarenessLevel}
              onChange={e =>
                setInterventions(prev => ({
                  ...prev,
                  awarenessLevel: parseInt(e.target.value),
                }))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>No Campaign</span>
              <span>Full Campaign</span>
            </div>
          </div>

          {/* Medical Intervention Toggle */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏥</span>
              <div>
                <p className="font-semibold text-gray-800">Medical Intervention</p>
                <p className="text-sm text-gray-600">Health camps, testing, treatment</p>
              </div>
            </div>
            <button
              onClick={() =>
                setInterventions(prev => ({
                  ...prev,
                  medicalIntervention: !prev.medicalIntervention,
                }))
              }
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                interventions.medicalIntervention ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  interventions.medicalIntervention ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Environmental Control Toggle */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌍</span>
              <div>
                <p className="font-semibold text-gray-800">Environmental Control</p>
                <p className="text-sm text-gray-600">Mosquito spraying, sanitation, water safety</p>
              </div>
            </div>
            <button
              onClick={() =>
                setInterventions(prev => ({
                  ...prev,
                  environmentalControl: !prev.environmentalControl,
                }))
              }
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                interventions.environmentalControl ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  interventions.environmentalControl ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Forecast Days */}
          <div>
            <label className="block font-semibold text-gray-700 mb-3">
              📅 Forecast Period
            </label>
            <div className="flex gap-2">
              {[7, 14, 21, 30].map(days => (
                <button
                  key={days}
                  onClick={() => setForecastDays(days)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    forecastDays === days
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {days} days
                </button>
              ))}
            </div>
          </div>

          {/* Run Simulation Button */}
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
          >
            {simulating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Running Simulation...
              </span>
            ) : (
              '▶️ Run Simulation'
            )}
          </button>
        </div>
      </div>

      {/* Forecast Comparison Chart */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          📈 Forecast Comparison ({forecastDays} Days)
        </h3>
        {chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="day"
                label={{ value: 'Days', position: 'insideBottomRight', offset: -5 }}
              />
              <YAxis label={{ value: 'Cases', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="baseline"
                stroke="#ef4444"
                strokeWidth={3}
                name="Without Intervention (Baseline)"
                dot={{ fill: '#ef4444', r: 4 }}
                activeDot={{ r: 6 }}
              />
              {simulation && (
                <Line
                  type="monotone"
                  dataKey="simulated"
                  stroke="#22c55e"
                  strokeWidth={3}
                  name="With Intervention (Simulated)"
                  dot={{ fill: '#22c55e', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Impact Summary */}
      {simulation && simulation.status === 'success' && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-300">
          <h3 className="text-lg font-bold text-gray-800 mb-4">🎯 Impact Analysis</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
              <p className="text-xs font-semibold text-gray-600 uppercase">Cases Prevented</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{casesPrevented}</p>
              <p className="text-sm text-gray-600 mt-1">
                Out of {simulation.baseline.total} projected
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
              <p className="text-xs font-semibold text-gray-600 uppercase">Case Reduction</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{impactReduction}%</p>
              <p className="text-sm text-gray-600 mt-1">Compared to baseline</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
              <p className="text-xs font-semibold text-gray-600 uppercase">Intervention Strength</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                {simulation.impact.interventionStrength}
              </p>
              <p className="text-sm text-gray-600 mt-1">Combined intervention effect</p>
            </div>
          </div>

          {/* Detailed Comparison */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <p className="font-semibold text-red-600 mb-2">📊 Baseline Forecast</p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Cases (Projected):</span>
                  <span className="font-bold text-gray-800">{simulation.baseline.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Daily Average:</span>
                  <span className="font-bold text-gray-800">
                    {Math.round(simulation.baseline.total / forecastDays)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <p className="font-semibold text-green-600 mb-2">✅ With Interventions</p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Cases (Projected):</span>
                  <span className="font-bold text-gray-800">{simulation.scenario.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Daily Average:</span>
                  <span className="font-bold text-gray-800">
                    {Math.round(simulation.scenario.total / forecastDays)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-6 p-4 bg-white rounded-lg border-l-4 border-indigo-500">
            <p className="font-semibold text-gray-800 mb-2">💡 Recommendations</p>
            <ul className="space-y-2">
              {impactReduction > 50 && (
                <li className="text-sm text-gray-700 flex items-start">
                  <span className="mr-2">✅</span>
                  <span>
                    Strong intervention strategy - {impactReduction}% case reduction is significant
                  </span>
                </li>
              )}
              {impactReduction > 25 && impactReduction <= 50 && (
                <li className="text-sm text-gray-700 flex items-start">
                  <span className="mr-2">⚠️</span>
                  <span>
                    Moderate interventions - Consider adding more measures for better impact
                  </span>
                </li>
              )}
              {impactReduction <= 25 && (
                <li className="text-sm text-gray-700 flex items-start">
                  <span className="mr-2">❌</span>
                  <span>Limited interventions - Increase awareness and implement all measures</span>
                </li>
              )}
              <li className="text-sm text-gray-700 flex items-start">
                <span className="mr-2">📋</span>
                <span>Monitor actual cases against this forecast daily</span>
              </li>
              <li className="text-sm text-gray-700 flex items-start">
                <span className="mr-2">🔄</span>
                <span>Adjust interventions based on deviations from prediction</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Baseline Recommendations */}
      {baseline.recommendations && baseline.recommendations.length > 0 && !simulation && (
        <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
          <h4 className="font-semibold text-blue-900 mb-3">📌 Baseline Insights</h4>
          <ul className="space-y-2">
            {baseline.recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm text-blue-800 flex items-start">
                <span className="mr-2">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
