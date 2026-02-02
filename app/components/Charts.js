'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/* ===================== TOOLTIP ===================== */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-900">
        {payload[0].value} cases
      </p>
    </div>
  );
}

/* ===================== EMPTY STATE ===================== */
function EmptyState({ message }) {
  return (
    <div className="h-80 flex items-center justify-center">
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}

/* ===================== TREND CHART ===================== */
export function TrendChart({ data = [], height = 320 }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <EmptyState message="No trend data available for this period" />;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          fontSize={12}
          stroke="#6b7280"
        />
        <YAxis
          fontSize={12}
          stroke="#6b7280"
        />
        <Tooltip content={<ChartTooltip />} />
        <Line
          type="monotone"
          dataKey="cases"
          stroke="#10b981"
          strokeWidth={2.5}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ===================== DISEASE DISTRIBUTION ===================== */
export function DiseaseDistributionChart({ data = [], height = 320 }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <EmptyState message="No disease distribution data available" />;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
        <XAxis
          dataKey="disease"
          fontSize={12}
          stroke="#6b7280"
        />
        <YAxis
          fontSize={12}
          stroke="#6b7280"
        />
        <Tooltip content={<ChartTooltip />} />
        <Bar
          dataKey="count"
          fill="#10b981"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
