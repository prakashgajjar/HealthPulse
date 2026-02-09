import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthFromRequest } from '@/lib/middleware';
import User from '@/app/models/User';
import MedicalReport from '@/app/models/MedicalReport';

/**
 * GET /api/debug/trends
 * Debug endpoint to check data and filters
 */
export async function GET(request) {
  try {
    await dbConnect();

    // Check authentication
    const auth = await getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(auth.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Get all areas in database
    const areas = await MedicalReport.distinct('area');
    
    // Get count by area
    const countByArea = await MedicalReport.aggregate([
      { $group: { _id: '$area', count: { $sum: 1 }, totalCases: { $sum: '$caseCount' } } }
    ]);

    // Get sample reports
    const samples = await MedicalReport.find().limit(5).lean();

    return NextResponse.json({
      userInfo: {
        id: user._id,
        name: user.name,
        email: user.email,
        area: user.area,
        role: user.role,
      },
      databaseStats: {
        totalReports: await MedicalReport.countDocuments(),
        areas: areas,
        countByArea: countByArea,
      },
      sampleReports: samples.map(r => ({
        disease: r.disease,
        area: r.area,
        caseCount: r.caseCount,
        reportDate: r.reportDate,
      })),
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
