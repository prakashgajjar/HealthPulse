'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/app/components/Sidebar';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import { useAuth } from '@/app/context/AuthContext';

/**
 * User Area Health Information Page
 */
function HealthInfoContent() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/reports?days=30');
        if (!response.ok) throw new Error('Failed to fetch reports');
        const data = await response.json();
        setReports(data.reports || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Group by disease
  const diseaseMap = {};
  reports.forEach(report => {
    if (!diseaseMap[report.disease]) {
      diseaseMap[report.disease] = 0;
    }
    diseaseMap[report.disease] += report.caseCount;
  });

  const topDiseases = Object.entries(diseaseMap)
    .map(([disease, count]) => ({ disease, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Area Health Information</h1>
          <p className="text-gray-600 mb-8">Health status and disease distribution in {user?.area}</p>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded border border-red-300">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="mb-4 inline-block animate-spin">
                  <div className="border-4 border-blue-200 border-t-blue-600 rounded-full w-12 h-12"></div>
                </div>
                <p className="text-gray-600">Loading health data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Top Diseases */}
              <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-2xl font-bold mb-4">🦠 Top Diseases in Your Area (Last 30 Days)</h2>
                {topDiseases.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No disease data available</p>
                ) : (
                  <div className="space-y-3">
                    {topDiseases.map((item, index) => (
                      <div key={item.disease} className="flex items-center justify-between p-4 bg-gray-50 rounded hover:bg-gray-100 transition">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-gray-400 w-8">{index + 1}</span>
                          <div>
                            <p className="font-semibold text-gray-900">{item.disease}</p>
                            <p className="text-sm text-gray-600">Cases reported</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-blue-600">{item.count}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Health Advice */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4">💊 Health Guidance</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <h3 className="font-semibold text-blue-900 mb-2">✓ When to Seek Help</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• High fever lasting more than 3 days</li>
                      <li>• Severe cough or difficulty breathing</li>
                      <li>• Persistent body aches or weakness</li>
                      <li>• Any unusual or concerning symptoms</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <h3 className="font-semibold text-green-900 mb-2">🛡️ Prevention Measures</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Maintain proper hygiene and sanitation</li>
                      <li>• Drink clean water and eat nutritious food</li>
                      <li>• Get adequate sleep and exercise regularly</li>
                      <li>• Stay updated with recommended vaccinations</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                    <h3 className="font-semibold text-purple-900 mb-2">📞 Emergency Contacts</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Emergency: 112</li>
                      <li>• Health Helpline: 1075</li>
                      <li>• COVID Helpline: 1075</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function UserHealthInfo() {
  return (
    <ProtectedRoute>
      <HealthInfoContent />
    </ProtectedRoute>
  );
}
