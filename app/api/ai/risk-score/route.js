import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { calculateAreaRiskScore, getAreaRiskScores, getAreaAggregateRisk } from '@/lib/riskService';
import { getAuthFromRequest } from '@/lib/middleware';

/**
 * POST /api/ai/risk-score
 * Calculate and get risk score for an area
 */
export async function POST(request) {
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

    const { area, disease } = await request.json();

    if (!area) {
      return NextResponse.json(
        { error: 'Area is required' },
        { status: 400 }
      );
    }

    // Calculate risk scores
    const riskScores = await calculateAreaRiskScore(area, disease);

    return NextResponse.json(
      {
        message: 'Risk scores calculated',
        riskScores,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Risk score calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate risk scores' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/risk-score?area=<area>&aggregate=true
 * Get latest risk scores for an area
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
    const area = searchParams.get('area');
    const aggregate = searchParams.get('aggregate') === 'true';

    if (!area) {
      return NextResponse.json(
        { error: 'Area is required' },
        { status: 400 }
      );
    }

    let data;
    if (aggregate) {
      data = await getAreaAggregateRisk(area);
    } else {
      data = await getAreaRiskScores(area);
    }

    return NextResponse.json(
      {
        data,
        timestamp: new Date(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Risk score retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve risk scores' },
      { status: 500 }
    );
  }
}
