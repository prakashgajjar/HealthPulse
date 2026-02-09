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

    // Filter based on role and area parameter
    let areaFilter = {};
    
    if (user.role === 'user') {
      // Users can only see their own area's data
      areaFilter = { area: user.area };
    } else if (user.role === 'admin') {
      // Admins can optionally filter by specific area
      // Special keywords like 'ALL', 'BY_AREA', 'OVERALL' mean no area filter (show all areas)
      if (area && !['ALL', 'BY_AREA', 'OVERALL', 'all', 'by_area', 'overall'].includes(area)) {
        areaFilter = { area };
      }
      // Otherwise areaFilter remains empty to get all areas
    }

    // Get reports for specified days
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - days);
    pastDate.setHours(0, 0, 0, 0);

    console.log('Trends query params:', { 
      days, 
      area: area || 'all',
      userRole: user.role,
      userArea: user.area,
      pastDate,
      areaFilter 
    });

    // Debug: Check what's actually in the database
    const allReportsCount = await MedicalReport.countDocuments();
    const reportsByArea = await MedicalReport.aggregate([
      { $group: { _id: '$area', count: { $sum: 1 } } }
    ]);

    console.log('Database summary:', { allReportsCount, reportsByArea });

    const reports = await MedicalReport.find({
      ...areaFilter,
      reportDate: { $gte: pastDate },
    }).sort({ reportDate: 1 });

    console.log(`Found ${reports.length} reports for trends analysis with filter:`, areaFilter);

    if (reports.length === 0) {
      console.warn('No reports found. Checking database...');
      const allReports = await MedicalReport.countDocuments();
      const recentReports = await MedicalReport.countDocuments({ 
        reportDate: { $gte: pastDate } 
      });
      console.log(`Total reports in DB: ${allReports}, Recent: ${recentReports}`);
    }

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

    console.log('Trend analysis data prepared:', { 
      reportCount: reports.length,
      trendDataPoints: trendData.length, 
      diseaseCount: Object.keys(diseaseData).length,
      trendData: trendData.slice(0, 5),
      diseasePreview: Object.keys(diseaseData).slice(0, 3)
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
