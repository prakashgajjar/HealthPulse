'use client';

import {
  TrendingUp,
  TrendingDown,
  MapPin,
  Clock,
  Biohazard,
  ShieldAlert,
} from 'lucide-react';
import ExplainabilityPanel from './ExplainabilityPanel';

/* ===================== STAT CARD ===================== */
export function StatCard({
  label,
  value,
  icon: Icon,
  subtext,
  trend = null,
  trendDirection = 'up',
}) {
  const trendColor =
    trendDirection === 'up' ? 'text-red-600' : 'text-green-600';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {label}
          </p>

          <p className="text-3xl font-semibold text-gray-900">
            {value}
          </p>

          {trend !== null && (
            <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
              {trendDirection === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="font-medium">{trend}%</span>
            </div>
          )}

          {subtext && (
            <p className="text-xs text-gray-500">{subtext}</p>
          )}
        </div>

        {Icon && (
          <div className="h-11 w-11 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Icon className="h-5 w-5 text-emerald-600" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ===================== ALERT CARD ===================== */
export function AlertCard({ alert, onDelete, onToggle }) {
  const riskStyles = {
    low: 'border-green-300 bg-green-50',
    medium: 'border-yellow-300 bg-yellow-50',
    high: 'border-red-300 bg-red-100',
  };

  const badgeStyles = {
    low: 'text-green-700 bg-green-100',
    medium: 'text-yellow-700 bg-yellow-100',
    high: 'text-red-700 bg-red-100',
  };

  const sourceIcon = alert.source === 'AI' ? '🤖' : '👤';

  return (
    <div
      className={`rounded-xl border p-5 ${riskStyles[alert.riskLevel]}`}
    >
      <div className="flex justify-between gap-4">
        <div className="space-y-3 flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <ShieldAlert className="w-5 h-5 text-gray-700" />
            <h4 className="font-semibold text-gray-900">
              {alert.title}
            </h4>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeStyles[alert.riskLevel]}`}
            >
              {alert.riskLevel.toUpperCase()}
            </span>
            {alert.source === 'AI' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                🤖 AI Generated
              </span>
            )}
            {alert.type && alert.type !== 'general' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                {alert.type.toUpperCase()}
              </span>
            )}
          </div>

          {/* Message */}
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {alert.message}
          </p>

          {/* Explanations for AI alerts */}
          {alert.explanations && alert.explanations.length > 0 && (
            <div className="mt-2 p-2 bg-white rounded border border-gray-300">
              <p className="text-xs font-medium text-gray-700 mb-1">Why this alert:</p>
              <ul className="text-xs text-gray-600 space-y-0.5">
                {alert.explanations.map((exp, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="mr-1">•</span>
                    <span>{exp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <Biohazard className="w-4 h-4" />
              {alert.disease}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {alert.area}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {new Date(alert.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Explainability */}
          {alert._id && (
            <div className="mt-2">
              <ExplainabilityPanel itemId={alert._id} itemType="alert" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {onToggle && (
            <button
              onClick={() => onToggle(alert._id)}
              className="px-3 py-1.5 text-xs rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition"
            >
              {alert.isActive ? 'Deactivate' : 'Activate'}
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(alert._id)}
              className="px-3 py-1.5 text-xs rounded-md bg-red-600 text-white hover:bg-red-700 transition"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===================== DISEASE LIST ITEM ===================== */
export function DiseaseListItem({ disease, count, area }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 hover:bg-gray-50 transition">
      <div>
        <p className="text-sm font-medium text-gray-900">
          {disease}
        </p>
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {area}
        </p>
      </div>

      <p className="text-lg font-semibold text-emerald-600">
        {count}
      </p>
    </div>
  );
}

/* ===================== HIGH RISK AREA CARD ===================== */
export function HighRiskAreaCard({
  area,
  todayCases,
  sevenDayAverage,
  riskLevel,
  percentageChange,
}) {
  const levelStyles = {
    low: 'border-green-300',
    medium: 'border-yellow-300',
    high: 'border-red-300',
  };

  const changeColor =
    percentageChange > 0 ? 'text-red-600' : 'text-green-600';

  return (
    <div className={`rounded-xl border p-6 bg-white ${levelStyles[riskLevel]}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">{area}</h4>
        <span className="text-xs font-medium text-gray-600">
          {riskLevel.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <Metric label="Today" value={todayCases} />
        <Metric label="7-Day Avg" value={sevenDayAverage} />
        <Metric
          label="Change"
          value={`${percentageChange > 0 ? '+' : ''}${percentageChange}%`}
          className={changeColor}
        />
      </div>
    </div>
  );
}

/* ===================== SMALL METRIC ===================== */
function Metric({ label, value, className = '' }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-sm font-semibold ${className}`}>
        {value}
      </p>
    </div>
  );
}
