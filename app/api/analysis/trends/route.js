import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MedicalReport from '@/app/models/MedicalReport';
import { getAuthFromRequest, isAdmin } from '@/lib/middleware';
import User from '@/app/models/User';

/**
 * GET /api/analysis/trends
 * Get trend analysis data for charts
 */
export async function GET(request) {
  try {
    await dbConnect();

    // Check authentication
    const auth = await getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await User.findById(auth.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const area = searchParams.get('area');

    // Filter based on role
    let areaFilter = {};
    if (user.role === 'user') {
      areaFilter = { area: user.area };
    } else if (area) {
      areaFilter = { area };
    }

    // Get reports for specified days
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - days);
    pastDate.setHours(0, 0, 0, 0);

    const reports = await MedicalReport.find({
      ...areaFilter,
      reportDate: { $gte: pastDate },
    }).sort({ reportDate: 1 });

    // Group reports by date
    const dailyData = {};
    reports.forEach((report) => {
      const dateStr = new Date(report.reportDate).toISOString().split('T')[0];
      if (!dailyData[dateStr]) {
        dailyData[dateStr] = 0;
      }
      dailyData[dateStr] += report.caseCount;
    });

    // Convert to array for charting
    const trendData = Object.entries(dailyData).map(([date, count]) => ({
      date,
      cases: count,
    }));

    // Group by disease for disease trends
    const diseaseData = {};
    reports.forEach((report) => {
      const dateStr = new Date(report.reportDate).toISOString().split('T')[0];
      if (!diseaseData[report.disease]) {
        diseaseData[report.disease] = {};
      }
      if (!diseaseData[report.disease][dateStr]) {
        diseaseData[report.disease][dateStr] = 0;
      }
      diseaseData[report.disease][dateStr] += report.caseCount;
    });

    return NextResponse.json(
      {
        trendData,
        diseaseData,
        period: days,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Trend analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
