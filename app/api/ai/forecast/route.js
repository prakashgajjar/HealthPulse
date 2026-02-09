import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getBaselineForecast } from '@/lib/forecastService';
import { getAuthFromRequest, isAdmin } from '@/lib/middleware';

/**
 * GET /api/ai/forecast?area=<area>&disease=<disease>&days=7
 * Get baseline forecast for an area and disease
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
    const disease = searchParams.get('disease');
    const days = parseInt(searchParams.get('days') || '7');

    if (!area || !disease) {
      return NextResponse.json(
        { error: 'Missing required parameters: area, disease' },
        { status: 400 }
      );
    }

    if (days <= 1 || days >= 30) {
      return NextResponse.json(
        { error: 'Days must be between 1 and 30' },
        { status: 400 }
      );
    }

    const forecast = await getBaselineForecast(area, disease, days);

    console.log('Generated forecast:', forecast);

    return NextResponse.json(forecast, { status: 200 });
  } catch (error) {
    console.error('Forecast error:', error);
    return NextResponse.json(
      { error: 'Failed to generate forecast' },
      { status: 500 }
    );
  }
}
