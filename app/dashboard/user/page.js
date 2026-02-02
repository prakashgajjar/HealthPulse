'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/app/components/Sidebar';
import { StatCard, AlertCard } from '@/app/components/Cards';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import { useAuth } from '@/app/context/AuthContext';
import { Heart, AlertTriangle, Activity, TrendingUp, Loader2, Shield } from 'lucide-react';

/**
 * User Dashboard
 */
function UserDashboardContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch overview
        const overviewResponse = await fetch('/api/analysis/overview');
        if (overviewResponse.ok) {
          const data = await overviewResponse.json();
          setStats(data.stats);
        }

        // Fetch alerts for user's area
        const alertsResponse = await fetch('/api/alerts?limit=10');
        if (alertsResponse.ok) {
          const data = await alertsResponse.json();
          setAlerts(data.alerts || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4 inline-block animate-spin">
            <div className="border-4 border-blue-200 border-t-blue-600 rounded-full w-12 h-12"></div>
          </div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-black text-gray-900">👋 Welcome, {user?.name}!</h1>
            <p className="text-gray-600 text-lg mt-2">📍 Your local health dashboard for <span className="font-bold text-blue-600">{user?.area}</span></p>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-red-100 text-red-800 rounded-lg border-l-4 border-red-500 shadow-md flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-bold">Error Loading Data</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Statistics for User's Area */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatCard
              label="Cases Today in Your Area"
              value={stats?.todayCases || 0}
              icon="📊"
              subtext="Health cases reported today"
              trend={Math.round(Math.random() * 15)}
              trendDirection={Math.random() > 0.5 ? 'up' : 'down'}
            />
            <StatCard
              label="This Week"
              value={stats?.weekCases || 0}
              icon="📈"
              subtext="Cases reported this week"
              trend={Math.round(Math.random() * 12)}
              trendDirection="up"
            />
            <StatCard
              label="This Month"
              value={stats?.monthCases || 0}
              icon="📋"
              subtext="Total cases this month"
              trend={Math.round(Math.random() * 20)}
              trendDirection="up"
            />
          </div>

          {/* Health Tips */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 mb-10">
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-3xl font-black text-gray-900">💡 Preventive Health Tips</h2>
              <span className="text-sm font-bold text-blue-600">STAY SAFE</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-green-900 mb-2 text-lg flex items-center gap-2">🧼 Hygiene</h3>
                <p className="text-sm text-gray-700 font-medium">Wash hands regularly with soap and water for at least 20 seconds, especially before eating and after touching surfaces.</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-blue-900 mb-2 text-lg flex items-center gap-2">😷 Precautions</h3>
                <p className="text-sm text-gray-700 font-medium">Wear masks in crowded areas and maintain safe distance from unwell individuals when needed.</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-purple-900 mb-2 text-lg flex items-center gap-2">💪 Immunity</h3>
                <p className="text-sm text-gray-700 font-medium">Stay hydrated, eat nutritious food, exercise regularly, and get 7-8 hours of quality sleep daily.</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-orange-900 mb-2 text-lg flex items-center gap-2">🏥 Medical</h3>
                <p className="text-sm text-gray-700 font-medium">Stay updated with vaccinations and consult a healthcare provider if you experience any symptoms.</p>
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-3xl font-black text-gray-900">🚨 Recent Alerts for Your Area</h2>
              <span className="text-sm font-bold bg-red-500 text-white px-3 py-1 rounded-full">
                {alerts.length} NEW
              </span>
            </div>
            {alerts.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-5xl mb-4 block">✅</span>
                <p className="text-gray-600 font-semibold text-lg">No active alerts for your area</p>
                <p className="text-gray-500 text-sm mt-2">Your area is currently safe. Stay vigilant!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert._id}
                    className={`p-6 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all ${
                      alert.riskLevel === 'high'
                        ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-500'
                        : alert.riskLevel === 'medium'
                        ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-500'
                        : 'bg-gradient-to-r from-green-50 to-green-100 border-green-500'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                          <span className="text-2xl animate-pulse">🚨</span>
                          {alert.title}
                        </h3>
                        <p className="text-sm text-gray-700 mt-2 font-medium">{alert.message}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-3 font-semibold">
                          <span className="flex items-center gap-1">🦠 {alert.disease}</span>
                          <span className="flex items-center gap-1">📅 {new Date(alert.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-full text-xs font-black tracking-wider flex-shrink-0 ${
                          alert.riskLevel === 'high'
                            ? 'bg-red-500 text-white'
                            : alert.riskLevel === 'medium'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-green-500 text-white'
                        }`}
                      >
                        {alert.riskLevel === 'high' ? '🔴 HIGH' : alert.riskLevel === 'medium' ? '🟡 MEDIUM' : '🟢 LOW'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function UserDashboard() {
  return (
    <ProtectedRoute>
      <UserDashboardContent />
    </ProtectedRoute>
  );
}
