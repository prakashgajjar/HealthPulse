import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Alert from '@/app/models/Alert';
import { getAuthFromRequest, isAdmin } from '@/lib/middleware';

/**
 * POST /api/alerts
 * Create new alert (Admin only)
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

    const { title, message, disease, area, riskLevel } = await request.json();

    // Validation
    if (!title || !message || !disease || !area || !riskLevel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['low', 'medium', 'high'].includes(riskLevel)) {
      return NextResponse.json(
        { error: 'Invalid risk level' },
        { status: 400 }
      );
    }

    const alert = new Alert({
      title,
      message,
      disease,
      area,
      riskLevel,
      createdBy: auth.userId,
    });

    await alert.save();

    return NextResponse.json(
      {
        message: 'Alert created successfully',
        alert,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create alert error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
