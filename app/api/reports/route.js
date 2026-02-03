import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MedicalReport from '@/app/models/MedicalReport';
import { getAuthFromRequest, isAdmin } from '@/lib/middleware';
import User from '@/app/models/User';

/**
 * POST /api/reports
 * Create new medical report (Admin only)
 */
export async function POST(request) {
  try {
    await dbConnect();

    // Check authentication
    const auth = await getAuthFromRequest(request);
    if (!auth || !isAdmin(auth)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { disease, area, caseCount, reportDate } = await request.json();

    // Validation
    if (!disease || !area || typeof caseCount !== 'number') {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }

    if (caseCount < 0) {
      return NextResponse.json(
        { error: 'Case count cannot be negative' },
        { status: 400 }
      );
    }

    const report = new MedicalReport({
      disease,
      area,
      caseCount,
      reportDate: reportDate ? new Date(reportDate) : new Date(),
    });

    await report.save();

    return NextResponse.json(
      {
        message: 'Report created successfully',
        report,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reports
 * Get medical reports with optional filters
 */
export async function GET(request) {
  try {
    await dbConnect();

    // Check authentication
    const auth = await getAuthFromRequest(request);
    const user = User.findById(auth.userId)
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const area = searchParams.get('area');
    const disease = searchParams.get('disease');
    const days = parseInt(searchParams.get('days') || '7');

    // Build filter
    const filter = {};

    if (area) {
      filter.area = area;
    }

    if (disease) {
      filter.disease = disease;
    }

    // Get reports from last N days
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - days);
    filter.reportDate = { $gte: pastDate };

    // For regular users, only get reports for their area
    if (user.role === 'user') {
      filter.area = user.area;
    }

    const reports = await MedicalReport.find(filter).sort({ reportDate: -1 });

    return NextResponse.json(
      {
        count: reports.length,
        reports,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
