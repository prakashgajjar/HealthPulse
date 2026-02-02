'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import {
  BarChart3,
  MapPin,
  Bell,
  ShieldCheck,
  HeartPulse,
} from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push(
        user.role === 'admin'
          ? '/dashboard/admin'
          : '/dashboard/user'
      );
    }
  }, [isAuthenticated, user, router]);

  return (
    <main className="bg-gray-50">
      {/* ================= HERO ================= */}
      <section className="relative bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-7xl mx-auto px-6 py-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-6">
            <HeartPulse className="w-4 h-4" />
            Community Health Intelligence
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
            Monitor & Protect Your{' '}
            <span className="text-emerald-500">Community&apos;s Health</span>
          </h1>

          <p className="mt-6 max-w-3xl mx-auto text-lg text-gray-600">
            A powerful digital health analytics platform that tracks disease
            patterns, identifies risks, and sends real-time alerts to keep
            communities safe.
          </p>

          <div className="mt-10 flex justify-center gap-4 flex-wrap">
            <Link
              href="/signup"
              className="px-8 py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition"
            >
              Start Monitoring →
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900">
            Comprehensive Health Monitoring
          </h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Everything you need to track, analyze, and respond to health trends
            in your community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: BarChart3,
              title: 'Real-time Analytics',
              desc: 'Monitor health trends with interactive dashboards and visual insights.',
            },
            {
              icon: MapPin,
              title: 'Area-based Tracking',
              desc: 'Track disease outbreaks and health patterns across regions.',
            },
            {
              icon: Bell,
              title: 'Smart Alerts',
              desc: 'Receive targeted alerts when health risks are detected.',
            },
            {
              icon: ShieldCheck,
              title: 'Risk Assessment',
              desc: 'AI-powered analysis to identify high-risk zones early.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-100 mb-5">
                <item.icon className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="bg-white border-t border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div>
            <p className="text-4xl font-bold text-emerald-500">24/7</p>
            <p className="mt-2 text-gray-600">Real-time Monitoring</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-emerald-500">100+</p>
            <p className="mt-2 text-gray-600">Areas Covered</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-emerald-500">Instant</p>
            <p className="mt-2 text-gray-600">Alert Delivery</p>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Ready to Protect Your Community?
          </h2>
          <p className="mt-4 text-gray-600">
            Join thousands of health professionals and community leaders using
            HealthPulse to monitor and improve public health.
          </p>

          <Link
            href="/signup"
            className="inline-block mt-8 px-8 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition"
          >
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-gray-500">
          © 2024 HealthPulse. Built for community health.
        </div>
      </footer>
    </main>
  );
}
