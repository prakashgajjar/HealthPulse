'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/app/components/Sidebar';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import { useAuth } from '@/app/context/AuthContext';

import {
  Activity,
  Shield,
  AlertTriangle,
  Phone,
  Loader2,
} from 'lucide-react';

/* ===================== CONTENT ===================== */
function HealthInfoContent() {
  const { user } = useAuth();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/reports?days=30');
        if (!res.ok) throw new Error('Failed to fetch health reports');

        const data = await res.json();
        setReports(data.reports || []);
        console.log('Health reports data:', data);
      } catch (err) {
        setError('Unable to load health information');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  /* ===================== AGGREGATION ===================== */
  const diseaseMap = {};
  reports.forEach((r) => {
    diseaseMap[r.disease] = (diseaseMap[r.disease] || 0) + r.caseCount;
  });

  const topDiseases = Object.entries(diseaseMap)
    .map(([disease, count]) => ({ disease, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <>
      <Sidebar />

      <main className="ml-72 min-h-screen bg-gray-50 px-8 py-6">
        <div className="max-w-5xl mx-auto space-y-10">

          {/* ================= HEADER ================= */}
          <header>
            <h1 className="text-2xl font-semibold text-gray-900">
              Area Health Information
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Health trends and guidance for <span className="font-medium">{user?.area}</span>
            </p>
          </header>

          {/* ================= ERROR ================= */}
          {error && (
            <div className="flex items-start gap-2 p-4 rounded-lg bg-red-50 border border-red-200">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* ================= LOADING ================= */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {/* ================= TOP DISEASES ================= */}
              <section className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Most Reported Diseases (Last 30 Days)
                  </h2>
                </div>

                {topDiseases.length === 0 ? (
                  <p className="text-sm text-gray-600 text-center py-8">
                    No disease data available for this period
                  </p>
                ) : (
                  <div className="space-y-3">
                    {topDiseases.map((item, index) => (
                      <div
                        key={item.disease}
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium text-gray-400 w-6">
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
                )}
              </section>

              {/* ================= HEALTH GUIDANCE ================= */}
              <section className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Health Guidance
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GuidanceCard
                    title="When to Seek Medical Help"
                    items={[
                      'High fever lasting more than 3 days',
                      'Breathing difficulty or chest pain',
                      'Persistent weakness or dehydration',
                      'Any sudden or unusual symptoms',
                    ]}
                    color="blue"
                  />

                  <GuidanceCard
                    title="Preventive Measures"
                    items={[
                      'Maintain personal hygiene and sanitation',
                      'Consume clean water and nutritious food',
                      'Exercise regularly and get adequate rest',
                      'Follow vaccination recommendations',
                    ]}
                    color="green"
                  />
                </div>
              </section>

              {/* ================= EMERGENCY ================= */}
              <section className="bg-gray-900 text-white rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Phone className="w-5 h-5 text-red-400" />
                  <h2 className="text-lg font-semibold">
                    Emergency Contacts
                  </h2>
                </div>

                <ul className="text-sm space-y-1 text-gray-300">
                  <li>Emergency Services: <span className="text-white font-medium">112</span></li>
                  <li>Health Helpline: <span className="text-white font-medium">1075</span></li>
                </ul>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}

/* ===================== GUIDANCE CARD ===================== */
function GuidanceCard({ title, items, color }) {
  const styles = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
  };

  return (
    <div className={`p-4 rounded-lg border ${styles[color]}`}>
      <h3 className="text-sm font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

/* ===================== PAGE EXPORT ===================== */
export default function UserHealthInfoPage() {
  return (
    <ProtectedRoute>
      <HealthInfoContent />
    </ProtectedRoute>
  );
}
