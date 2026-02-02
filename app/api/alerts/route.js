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

/**
 * GET /api/alerts
 * Get alerts for user's area or all alerts for admin
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    let filter = { isActive: true };

    // Regular users only see alerts for their area
    if (auth.role === 'user') {
      filter.area = auth.area;
    }

    const alerts = await Alert.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('createdBy', 'name email');

    const total = await Alert.countDocuments(filter);

    return NextResponse.json(
      {
        alerts,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get alerts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
