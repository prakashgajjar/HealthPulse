import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MedicalReport from '@/app/models/MedicalReport';
import { getAuthFromRequest, isAdmin } from '@/lib/middleware';
import {
  detectHighRiskAreas,
  getReportsByDays,
  getAreaWiseDiseaseDistribution,
  getTrendingDiseases,
  calculateDailyTotal,
} from '@/lib/analytics';

/**
 * GET /api/analysis/overview
 * Get dashboard overview analytics
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

    const now = new Date();

    // Filter based on role
    let areaFilter = {};
    if (auth.role === 'user') {
      areaFilter = { area: auth.area };
    }

    // Get today's reports
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const todayReports = await MedicalReport.find({
      ...areaFilter,
      reportDate: { $gte: todayStart, $lte: todayEnd },
    });

    // Get this week's reports
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekReports = await MedicalReport.find({
      ...areaFilter,
      reportDate: { $gte: weekStart },
    });

    // Get this month's reports
    const monthStart = new Date(now);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthReports = await MedicalReport.find({
      ...areaFilter,
      reportDate: { $gte: monthStart },
    });

    // Get last 7 days for comparison
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const last7DaysReports = await MedicalReport.find({
      ...areaFilter,
      reportDate: { $gte: sevenDaysAgo, $lte: todayEnd },
    });

    // Calculate totals
    const todayTotal = calculateDailyTotal(todayReports);
    const weekTotal = calculateDailyTotal(weekReports);
    const monthTotal = calculateDailyTotal(monthReports);

    // Get trending diseases
    const trendingDiseases = getTrendingDiseases(last7DaysReports);

    // Get high-risk areas (only for admin)
    let highRiskAreas = [];
    if (auth.role === 'admin') {
      highRiskAreas = detectHighRiskAreas(todayReports, last7DaysReports);
    }

    return NextResponse.json(
      {
        stats: {
          todayCases: todayTotal,
          weekCases: weekTotal,
          monthCases: monthTotal,
        },
        trendingDiseases,
        highRiskAreas,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Analysis overview error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
