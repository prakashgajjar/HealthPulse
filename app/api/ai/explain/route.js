import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { generateExplainabilityReport } from '@/lib/explainabilityService';
import { getAuthFromRequest } from '@/lib/middleware';

/**
 * GET /api/ai/explain?type=alert|risk-score&id=<id>
 * Get detailed explanation for an alert or risk score
 */
export async function GET(request) {
  try {
    await dbConnect();

    const auth = await getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json(
        { error: 'Missing required parameters: type and id' },
        { status: 400 }
      );
    }

    if (!['alert', 'risk-score'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "alert" or "risk-score"' },
        { status: 400 }
      );
    }

    const explanation = await generateExplainabilityReport(type, id);

    if (!explanation) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        explanation,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Explainability error:', error);
    return NextResponse.json(
      { error: 'Failed to generate explanation' },
      { status: 500 }
    );
  }
}
