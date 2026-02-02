import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Alert from '@/app/models/Alert';
import { getAuthFromRequest, isAdmin } from '@/lib/middleware';

/**
 * PATCH /api/alerts/[id]
 * Update alert status (Admin only)
 */
export async function PATCH(request, { params }) {
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

    const { id } = params;
    const { isActive } = await request.json();

    const alert = await Alert.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Alert updated successfully',
        alert,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update alert error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/alerts/[id]
 * Delete alert (Admin only)
 */
export async function DELETE(request, { params }) {
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

    const { id } = params;

    const alert = await Alert.findByIdAndDelete(id);

    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Alert deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete alert error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
