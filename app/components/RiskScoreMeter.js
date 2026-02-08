'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import ExplainabilityPanel from './ExplainabilityPanel';

export default function RiskScoreMeter({ area, disease = null }) {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!area) return;

    const fetchRiskScore = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `/api/ai/risk-score?area=${encodeURIComponent(area)}&aggregate=true`
        );
        setRiskData(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching risk score:', err);
        setError('Failed to load risk score');
      } finally {
        setLoading(false);
      }
    };

    fetchRiskScore();
    // Refresh every 30 minutes
    const interval = setInterval(fetchRiskScore, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [area, disease]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error || !riskData) {
    return (
      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-400">
        <p className="text-gray-600 text-sm">{error || 'No risk data available'}</p>
      </div>
    );
  }

  const score = riskData.aggregateRiskScore;
  const level = riskData.aggregateRiskLevel;
  const color = level === 'high' ? 'text-red-600' : level === 'medium' ? 'text-yellow-600' : 'text-green-600';
  const bgColor = level === 'high' ? 'bg-red-50' : level === 'medium' ? 'bg-yellow-50' : 'bg-green-50';
  const borderColor = level === 'high' ? 'border-red-400' : level === 'medium' ? 'border-yellow-400' : 'border-green-400';

  const getRiskBadgeIcon = () => {
    if (level === 'high') return '🔴';
    if (level === 'medium') return '🟡';
    return '🟢';
  };

  const getRiskDescription = () => {
    if (level === 'high') return 'High Risk - Caution Advised';
    if (level === 'medium') return 'Moderate Risk - Monitor Closely';
    return 'Low Risk - Safe';
  };

  return (
    <div className={`${bgColor} rounded-lg shadow border-l-4 ${borderColor} p-4`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Health Risk Assessment</h3>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${color} bg-white border`}>
          {getRiskBadgeIcon()} {level.toUpperCase()}
        </span>
      </div>

      {/* Risk score meter */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-700 font-medium">Risk Score</span>
          <span className={`text-2xl font-bold ${color}`}>{score}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              level === 'high'
                ? 'bg-red-500'
                : level === 'medium'
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${score}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>0</span>
          <span className="text-gray-500">Low 40 | Medium 70 | High 100</span>
          <span>100</span>
        </div>
      </div>

      {/* Description */}
      <div className="text-sm text-gray-700 mb-3">
        <p className="font-medium">{getRiskDescription()}</p>
        <p className="text-xs text-gray-600 mt-1">
          Area: <strong>{riskData.area}</strong>
        </p>
      </div>

      {/* Top threats */}
      {riskData.topThreats && riskData.topThreats.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Disease Threats:</h4>
          <div className="space-y-1">
            {riskData.topThreats.map((threat, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{threat.disease}</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    threat.riskLevel === 'high'
                      ? 'bg-red-200 text-red-800'
                      : threat.riskLevel === 'medium'
                      ? 'bg-yellow-200 text-yellow-800'
                      : 'bg-green-200 text-green-800'
                  }`}
                >
                  {threat.riskLevel.toUpperCase()} ({threat.riskScore})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last updated */}
      {riskData.lastCalculated && (
        <div className="text-xs text-gray-600 mb-3 italic">
          Last calculated: {new Date(riskData.lastCalculated).toLocaleDateString()}
        </div>
      )}

      {/* Explainability panel */}
      {riskData._id && (
        <div className="pt-3 border-t border-gray-300">
          <ExplainabilityPanel itemId={riskData._id} itemType="risk-score" />
        </div>
      )}

      {/* Recommendations */}
      <div className="mt-3 p-2 bg-white rounded text-xs text-gray-700">
        <p className="font-medium mb-1">💡 How to Stay Safe:</p>
        <ul className="space-y-0.5 list-disc list-inside">
          <li>Follow local health advisories</li>
          <li>Practice preventive measures for active diseases</li>
          <li>Consult healthcare providers if symptoms appear</li>
        </ul>
      </div>
    </div>
  );
}
