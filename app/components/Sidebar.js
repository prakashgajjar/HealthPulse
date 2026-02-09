'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  Bell,
  HeartPulse,
  MapPin,
  Mail,
  Shield,
  Zap,
  AlertCircle,
  BarChart3,
} from 'lucide-react';

export function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  const adminLinks = [
    { href: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/admin/reports', label: 'Medical Reports', icon: FileText },
    { href: '/dashboard/admin/trends', label: 'Trends Analysis', icon: TrendingUp },
    { href: '/dashboard/admin/overall-data', label: 'Overall Data', icon: BarChart3 },
    { href: '/dashboard/admin/risk-score', label: 'Risk Score Meter', icon: AlertCircle },
    { href: '/dashboard/admin/alerts', label: 'Alerts Management', icon: Bell },
    { href: '/dashboard/admin/forecast', label: 'Forecast & Simulator', icon: Zap },
  ];

  const userLinks = [
    { href: '/dashboard/user', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/user/alerts', label: 'My Alerts', icon: Bell },
    { href: '/dashboard/user/health-info', label: 'Overall Health Info', icon: HeartPulse },
    { href: '/dashboard/user/trends', label: 'Case Trends', icon: TrendingUp },
    { href: '/dashboard/user/risk-score', label: 'Risk Score Meter', icon: AlertCircle },
    { href: '/dashboard/user/forecast', label: 'Health Forecast', icon: Zap },
  ];

  const links = user?.role === 'admin' ? adminLinks : userLinks;
  const isAdmin = user?.role === 'admin';

  return (
    <aside className="fixed left-0 top-0 w-72 h-screen bg-white border-r border-gray-200 flex flex-col shadow-lg z-40">
      {/* ================= BRAND ================= */}
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          HealthPulse
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {isAdmin ? 'Administrator Panel' : 'User Dashboard'}
        </p>
      </div>

      {/* ================= NAV ================= */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + '/');

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? 'text-emerald-600' : 'text-gray-400'
                }`}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* ================= PROFILE ================= */}
      <div className="px-6 py-5 border-t border-gray-200">
        <p className="text-xs font-medium text-gray-400 mb-4">
          ACCOUNT
        </p>

        <div className="space-y-4 text-sm">
          <div>
            <p className="text-gray-500">Name</p>
            <p className="font-medium text-gray-900 truncate">
              {user?.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <p className="text-gray-700 truncate">{user?.email}</p>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <p className="text-gray-700">{user?.area}</p>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2 text-emerald-600">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-medium">Administrator</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
