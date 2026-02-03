import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Alert from '@/app/models/Alert';
import { getAuthFromRequest } from '@/lib/middleware';
import User from '@/app/models/User';

export async function GET(request) {
  try {
    await dbConnect();

    // 1️⃣ Authentication
    const auth = await getAuthFromRequest(request);

    const user = await User.findById(auth.userId);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2️⃣ Query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

    const skip = (page - 1) * limit;

    // 3️⃣ Filter
    const filter = {
      isActive: true,
    };

    // Regular users only see their area alerts
    if (user.role === 'user') {
      filter.area = user.area;
    }

    // 4️⃣ Query DB
    const [alerts, total] = await Promise.all([
      Alert.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email'),

      Alert.countDocuments(filter),
    ]);

    // 5️⃣ Response
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
