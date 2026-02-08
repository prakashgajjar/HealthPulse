'use client';

import { useState } from 'react';
import axios from 'axios';

export default function ExplainabilityPanel({ itemId, itemType = 'alert' }) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleViewExplanation = async () => {
    if (explanation) {
      setShowExplanation(!showExplanation);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `/api/ai/explain?type=${itemType}&id=${itemId}`
      );
      setExplanation(response.data.explanation);
      setShowExplanation(true);
    } catch (error) {
      console.error('Error fetching explanation:', error);
      alert('Failed to load explanation');
    } finally {
      setLoading(false);
    }
  };

  if (!explanation && !loading && !showExplanation) {
    return (
      <button
        onClick={handleViewExplanation}
        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline transition"
      >
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
        </svg>
        Why?
      </button>
    );
  }

  return (
    <div className="w-full">
      <button
        onClick={handleViewExplanation}
        disabled={loading}
        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline transition disabled:opacity-50"
      >
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
        </svg>
        {showExplanation ? 'Hide' : 'Show'} Explanation
      </button>

      {showExplanation && explanation && (
        <div className="mt-3 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <h4 className="font-semibold text-gray-800 mb-3">
            🔍 Why This {itemType === 'alert' ? 'Alert' : 'Risk Score'}?
          </h4>

          {/* Main narrative */}
          {explanation.narrative && (
            <p className="text-sm text-gray-700 mb-3 leading-relaxed">
              {explanation.narrative}
            </p>
          )}

          {/* Key factors */}
          {explanation.aiExplanations && explanation.aiExplanations.length > 0 && (
            <div className="mb-3">
              <h5 className="font-medium text-gray-700 text-sm mb-2">Key Factors:</h5>
              <ul className="space-y-1">
                {explanation.aiExplanations.map((factor, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contributing factors for risk score */}
          {explanation.contributingFactors && (
            <div className="mb-3">
              <h5 className="font-medium text-gray-700 text-sm mb-2">
                Contributing Factors:
              </h5>
              <div className="space-y-2">
                {explanation.contributingFactors.map((factor, idx) => (
                  <div key={idx} className="bg-white p-2 rounded border border-gray-200">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-gray-700 text-sm capitalize">
                        {factor.factor?.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span className="text-blue-600 font-semibold text-sm">
                        {factor.contribution}
                        {factor.weight && ` (${factor.weight})`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{factor.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Anomaly details */}
          {explanation.anomalyDetails && (
            <div className="mb-3 bg-white p-2 rounded border border-yellow-200">
              <h5 className="font-medium text-gray-700 text-sm mb-1">Anomaly Detected:</h5>
              <p className="text-sm text-gray-700">{explanation.anomalyDetails.interpretation}</p>
            </div>
          )}

          {/* Data points */}
          {explanation.dataPoints && (
            <div className="mb-3">
              <h5 className="font-medium text-gray-700 text-sm mb-2">Data Used:</h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(explanation.dataPoints).map(([key, value]) => (
                  <div key={key} className="bg-white p-2 rounded border border-gray-200">
                    <span className="text-Gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}:
                    </span>
                    <span className="font-semibold text-gray-800 ml-1">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {explanation.recommendations && explanation.recommendations.length > 0 && (
            <div className="mb-3">
              <h5 className="font-medium text-gray-700 text-sm mb-2">Recommendations:</h5>
              <ul className="space-y-1">
                {explanation.recommendations.slice(0, 3).map((rec, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start">
                    <span className="mr-2">✓</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Trust score */}
          {explanation.trustScore && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Confidence Score:</span>
                <div className="flex items-center">
                  <div className="w-20 h-2 bg-gray-300 rounded-full mr-2">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${explanation.trustScore}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-gray-700">
                    {explanation.trustScore}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          {explanation.disclaimer && (
            <p className="text-xs text-gray-600 italic mt-3 pt-3 border-t border-blue-200">
              ⚠️ {explanation.disclaimer}
            </p>
          )}
        </div>
      )}

      {loading && (
        <div className="mt-3 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <div className="flex items-center space-x-2">
            <div className="animate-spin">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm text-gray-700">Loading explanation...</span>
          </div>
        </div>
      )}
    </div>
  );
}
