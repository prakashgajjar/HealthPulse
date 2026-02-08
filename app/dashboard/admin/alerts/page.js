'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/app/components/Sidebar';
import  {AlertCard}  from '@/app/components/Cards';
import { AdminRoute } from '@/app/components/ProtectedRoute';
import {
  Bell,
  AlertTriangle,
  Loader2,
  PlusCircle,
} from 'lucide-react';

/* ===================== CONTENT ===================== */
function AlertsContent() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [disease, setDisease] = useState('');
  const [area, setArea] = useState('');
  const [riskLevel, setRiskLevel] = useState('medium');

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  /* ===================== FETCH ALERTS ===================== */
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/alerts/adminget?limit=50');
      if (!res.ok) throw new Error('Failed to fetch alerts');

      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  /* ===================== CREATE ALERT ===================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title || !message || !disease || !area) {
      setError('All fields are required');
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch('/api/alerts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message,
          disease,
          area,
          riskLevel,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create alert');
      }

      setSuccess('Alert successfully created and delivered.');
      setTitle('');
      setMessage('');
      setDisease('');
      setArea('');
      setRiskLevel('medium');

      fetchAlerts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ===================== GENERATE ALERT WITH AI ===================== */
  const handleGenerateWithAI = async () => {
    if (!disease || !area) {
      setError('Please enter disease and area first');
      return;
    }

    setError(null);
    setGeneratingAI(true);

    try {
      const res = await fetch('/api/ai/generate-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disease,
          area,
          riskLevel,
          caseCount: null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate alert');
      }

      const data = await res.json();
      const alertData = data.alert;

      // Fill in the form with AI-generated content
      setTitle(alertData.title);
      setMessage(alertData.message);
      setSuccess('AI-generated alert loaded. Please review and edit as needed.');
    } catch (err) {
      setError('Failed to generate alert: ' + err.message);
    } finally {
      setGeneratingAI(false);
    }
  };

  /* ===================== DELETE ALERT ===================== */
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this alert permanently?')) return;

    try {
      const res = await fetch(`/api/alerts/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete alert');
      setSuccess('Alert deleted');
      fetchAlerts();
    } catch (err) {
      setError(err.message);
    }
  };

  /* ===================== TOGGLE ALERT ===================== */
  const handleToggle = async (id) => {
    try {
      const alert = alerts.find((a) => a._id === id);
      if (!alert) return;

      const res = await fetch(`/api/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !alert.isActive }),
      });

      if (!res.ok) throw new Error('Failed to update alert');
      fetchAlerts();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto space-y-10">

          {/* ===================== HEADER ===================== */}
          <header>
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl font-semibold text-gray-900">
                Alert Management
              </h1>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Create, manage, and control health alerts sent to users
            </p>
          </header>

          {/* ===================== FEEDBACK ===================== */}
          {error && (
            <div className="flex items-start gap-2 p-4 rounded-lg bg-red-50 border border-red-200">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
              {success}
            </div>
          )}

          {/* ===================== CREATE ALERT ===================== */}
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Create New Alert
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Alert Title" value={title} onChange={setTitle} />
                <Input label="Disease" value={disease} onChange={setDisease} />
                <Input label="Area" value={area} onChange={setArea} />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Risk Level
                  </label>
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alert Message
                </label>
                <div className="flex gap-2 mb-2">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Write a clear and actionable alert message"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleGenerateWithAI}
                  disabled={generatingAI || !disease || !area}
                  className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm transition"
                >
                  {generatingAI ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      ✨ Generate with AI
                    </>
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Send Alert
              </button>
            </form>
          </section>

          {/* ===================== ALERT HISTORY ===================== */}
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Alert History
            </h2>

            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : alerts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No alerts have been created yet
              </p>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <AlertCard
                    key={alert._id}
                    alert={alert}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

/* ===================== INPUT COMPONENT ===================== */
function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
      />
    </div>
  );
}

/* ===================== PAGE EXPORT ===================== */
export default function AdminAlertsPage() {
  return (
    <AdminRoute>
      <AlertsContent />
    </AdminRoute>
  );
}
