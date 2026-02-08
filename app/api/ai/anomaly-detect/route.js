import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { checkAnomalyInReport, generateAnomalyAlert } from '@/lib/anomalyService';
import Alert from '@/app/models/Alert';
import { getAuthFromRequest, isAdmin } from '@/lib/middleware';

/**
 * POST /api/ai/anomaly-detect
 * Check for anomaly in a medical report
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

    const { disease, area, newCaseCount, createAlert = false } = await request.json();

    if (!disease || !area || typeof newCaseCount !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: disease, area, newCaseCount' },
        { status: 400 }
      );
    }

    // Check for anomaly
    const anomalyCheck = await checkAnomalyInReport(disease, area, newCaseCount);

    // If anomaly detected and createAlert is true, automatically create alert
    let alertCreated = null;
    if (anomalyCheck.hasAnomaly && createAlert) {
      const alertData = generateAnomalyAlert(anomalyCheck);
      
      if (alertData) {
        const alert = new Alert({
          ...alertData,
          createdBy: auth.userId,
        });
        await alert.save();
        alertCreated = alert;
      }
    }

    return NextResponse.json(
      {
        anomalyDetected: anomalyCheck.hasAnomaly,
        anomalyData: anomalyCheck,
        alertCreated: alertCreated ? alertCreated._id : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Anomaly detection error:', error);
    return NextResponse.json(
      { error: 'Failed to detect anomaly' },
      { status: 500 }
    );
  }
}
