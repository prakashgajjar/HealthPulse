'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/app/components/Sidebar';
import { AlertCard } from '@/app/components/Cards';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';

/**
 * User Alerts Page
 */
function UserAlertsContent() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, high, medium, low

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/alerts?limit=100');
        if (!response.ok) throw new Error('Failed to fetch alerts');
        const data = await response.json();
        setAlerts(data.alerts || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.riskLevel === filter);

  const riskStats = {
    high: alerts.filter(a => a.riskLevel === 'high').length,
    medium: alerts.filter(a => a.riskLevel === 'medium').length,
    low: alerts.filter(a => a.riskLevel === 'low').length,
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Alert History</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded border border-red-300">
              {error}
            </div>
          )}

          {/* Risk Summary */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-red-600 font-semibold">High Risk</p>
              <p className="text-3xl font-bold text-red-700">{riskStats.high}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-600 font-semibold">Medium Risk</p>
              <p className="text-3xl font-bold text-yellow-700">{riskStats.medium}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-600 font-semibold">Low Risk</p>
              <p className="text-3xl font-bold text-green-700">{riskStats.low}</p>
            </div>
          </div>

          {/* Filter */}
          <div className="mb-6 bg-white p-4 rounded-lg shadow">
            <label className="inline-block mr-4">
              <span className="font-semibold mr-2">Filter by Risk:</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1 border rounded focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Alerts</option>
                <option value="high">High Risk Only</option>
                <option value="medium">Medium Risk Only</option>
                <option value="low">Low Risk Only</option>
              </select>
            </label>
          </div>

          {/* Alerts List */}
          <div className="bg-white p-6 rounded-lg shadow">
            {loading ? (
              <p className="text-gray-600 text-center py-8">Loading alerts...</p>
            ) : filteredAlerts.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No alerts found</p>
            ) : (
              <div className="space-y-4">
                {filteredAlerts.map((alert) => (
                  <AlertCard key={alert._id} alert={alert} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function UserAlerts() {
  return (
    <ProtectedRoute>
      <UserAlertsContent />
    </ProtectedRoute>
  );
}
