'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/app/components/Sidebar';
import { StatCard, AlertCard } from '@/app/components/Cards';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import { useAuth } from '@/app/context/AuthContext';
import RiskScoreMeter from '@/app/components/RiskScoreMeter';

import {
  Activity,
  TrendingUp,
  Shield,
  Heart,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

/* ===================== CONTENT ===================== */
function UserDashboardContent() {
  const { user , setUser } = useAuth();

  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const overviewRes = await fetch('/api/analysis/overview');
        if (overviewRes.ok) {
          const data = await overviewRes.json();

          console.log('Overview data:', data);
          setStats(data.stats);
        }

        const alertsRes = await fetch('/api/alerts?limit=10');
        if (alertsRes.ok) {
          const data = await alertsRes.json();
          setAlerts(data.alerts || []);
        }
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // const [user1, setUser1] = useState(null);

  useEffect(() => {
      const initAuth = async () => {
        try {
          const res = await fetch('/api/auth/me', {
            credentials: 'include',
          });
  
          if (!res.ok) {
            setUser(null);
            return;
          }
  
          const data = await res.json();
          setUser(data.user);
        } catch (err) {
          console.error('Auth init failed:', err);
          setUser(null);
        } finally {
          setLoading(false);
        }
      };
  
      initAuth();
    }, []);

  /* ===================== LOADING ===================== */
  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex items-center gap-3 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Loading your dashboard…</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 min-h-screen bg-gray-50 px-8 py-6">
        <div className="max-w-6xl mx-auto space-y-10">

          {/* ================= HEADER ================= */}
          <header>
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome, {user?.name}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Health overview for your area: <span className="font-medium">{user?.area}</span>
            </p>
          </header>

          {/* ================= ERROR ================= */}
          {error && (
            <div className="flex items-start gap-2 p-4 rounded-lg bg-red-50 border border-red-200">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* ================= AI RISK ASSESSMENT ================= */}
          {user?.area && (
            <section>
              <RiskScoreMeter area={user.area} />
            </section>
          )}

          {/* ================= STATS ================= */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">
              Health Summary
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                label="Cases Today"
                value={stats?.todayCases || 0}
                icon={Activity}
                subtext="Reported in last 24 hours"
              />
              <StatCard
                label="This Week"
                value={stats?.weekCases || 0}
                icon={TrendingUp}
                subtext="Last 7 days"
              />
              <StatCard
                label="This Month"
                value={stats?.monthCases || 0}
                icon={Shield}
                subtext="Last 30 days"
              />
            </div>
          </section>

          {/* ================= HEALTH TIPS ================= */}
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Heart className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Preventive Health Guidance
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Tip
                title="Personal Hygiene"
                text="Wash hands frequently with soap and water, especially before meals and after public exposure."
              />
              <Tip
                title="Crowd Precautions"
                text="Avoid crowded places during outbreaks and follow local health advisories."
              />
              <Tip
                title="Immunity Support"
                text="Maintain a balanced diet, stay hydrated, exercise regularly, and get adequate sleep."
              />
              <Tip
                title="Medical Attention"
                text="Seek medical advice promptly if you experience symptoms or discomfort."
              />
            </div>
          </section>

          {/* ================= ALERTS ================= */}
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Alerts
              </h2>
              <span className="text-xs font-medium text-gray-500">
                {alerts.length} active
              </span>
            </div>

            {alerts.length === 0 ? (
              <div className="text-center py-10">
                <Shield className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                <p className="text-sm text-gray-600 font-medium">
                  No active alerts for your area
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Continue following preventive measures
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <AlertCard key={alert._id} alert={alert} />
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}

/* ===================== TIP CARD ===================== */
function Tip({ title, text }) {
  return (
    <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
      <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{text}</p>
    </div>
  );
}

/* ===================== PAGE EXPORT ===================== */
export default function UserDashboardPage() {
  return (
    <ProtectedRoute>
      <UserDashboardContent />
    </ProtectedRoute>
  );
}
