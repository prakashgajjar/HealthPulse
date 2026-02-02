'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/app/components/Sidebar';
import { AdminRoute } from '@/app/components/ProtectedRoute';
import {
  FileText,
  PlusCircle,
  MapPin,
  Biohazard,
  Calendar,
  Hash,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

function ReportsContent() {
  const [disease, setDisease] = useState('');
  const [area, setArea] = useState('');
  const [caseCount, setCaseCount] = useState('');
  const [reportDate, setReportDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reports?days=30');
      if (!res.ok) throw new Error('Failed to fetch reports');
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!disease || !area || !caseCount) {
      setError('All fields are required');
      return;
    }

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disease,
          area,
          caseCount: Number(caseCount),
          reportDate: new Date(reportDate),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create report');
      }

      setSuccess('Medical report added successfully');
      setDisease('');
      setArea('');
      setCaseCount('');
      setReportDate(new Date().toISOString().split('T')[0]);
      fetchReports();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* ================= HEADER ================= */}
          <header>
            <div className="flex items-center gap-3">
              <FileText className="w-7 h-7 text-emerald-600" />
              <h1 className="text-3xl font-semibold text-gray-900">
                Medical Reports
              </h1>
            </div>
            <p className="mt-2 text-gray-600">
              Create and manage disease reports submitted by health authorities
            </p>
          </header>

          {/* ================= ALERTS ================= */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {/* ================= ADD REPORT ================= */}
          <section className="bg-white border border-gray-200 rounded-xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Add New Report
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  icon={Biohazard}
                  label="Disease Name"
                  value={disease}
                  onChange={setDisease}
                  placeholder="Dengue, Malaria, COVID-19"
                />

                <Input
                  icon={MapPin}
                  label="Area / Region"
                  value={area}
                  onChange={setArea}
                  placeholder="North Delhi, 110001"
                />

                <Input
                  icon={Hash}
                  label="Case Count"
                  type="number"
                  value={caseCount}
                  onChange={setCaseCount}
                  placeholder="Number of cases"
                />

                <Input
                  icon={Calendar}
                  label="Report Date"
                  type="date"
                  value={reportDate}
                  onChange={setReportDate}
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition"
              >
                <PlusCircle className="w-4 h-4" />
                Create Report
              </button>
            </form>
          </section>

          {/* ================= REPORTS TABLE ================= */}
          <section className="bg-white border border-gray-200 rounded-xl p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Recent Reports
            </h2>

            {loading ? (
              <p className="text-sm text-gray-500 text-center py-8">
                Loading reports…
              </p>
            ) : reports.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No reports available
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr className="text-gray-600">
                      <th className="px-4 py-3 text-left font-medium">
                        Disease
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Area
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Cases
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr
                        key={r._id}
                        className="border-b last:border-0 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {r.disease}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {r.area}
                        </td>
                        <td className="px-4 py-3 font-semibold text-emerald-600">
                          {r.caseCount}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(r.reportDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

/* ================= INPUT COMPONENT ================= */
function Input({
  label,
  icon: Icon,
  value,
  onChange,
  type = 'text',
  placeholder,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
        )}

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${
            Icon ? 'pl-10' : 'pl-3'
          } pr-3 py-2.5 border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-emerald-500
            focus:border-emerald-500 text-sm`}
        />
      </div>
    </div>
  );
}


export default function AdminReports() {
  return (
    <AdminRoute>
      <ReportsContent />
    </AdminRoute>
  );
}
