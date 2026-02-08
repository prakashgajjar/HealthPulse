import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { generateAlertWithContext, generateAlertMessage } from '@/lib/alertAIService';
import { getAuthFromRequest, isAdmin } from '@/lib/middleware';

/**
 * POST /api/ai/generate-alert
 * Generate AI alert message for admin
 * 
 * Request body:
 * {
 *   disease: string,
 *   area: string,
 *   riskLevel: 'low' | 'medium' | 'high',
 *   riskScore: number (0-100),
 *   caseCount: number,
 *   anomalyInfo: { spikePercentage: number } (optional)
 * }
 */
export async function POST(request) {
  try {
    await dbConnect();

    // Check authentication - admin only
    const auth = await getAuthFromRequest(request);
    if (!auth || !isAdmin(auth)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const {
      disease,
      area,
      riskLevel = 'medium',
      riskScore = null,
      caseCount = null,
      anomalyInfo = null,
    } = await request.json();

    if (!disease || !area) {
      return NextResponse.json(
        { error: 'Missing required fields: disease, area' },
        { status: 400 }
      );
    }

    if (!['low', 'medium', 'high'].includes(riskLevel)) {
      return NextResponse.json(
        { error: 'Invalid risk level' },
        { status: 400 }
      );
    }

    // Generate comprehensive alert with context
    const alert = await generateAlertWithContext({
      disease,
      area,
      riskLevel,
      riskScore,
      caseCount,
      anomalyInfo,
    });

    return NextResponse.json(
      {
        alert,
        message: 'Alert generated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Alert generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate alert' },
      { status: 500 }
    );
  }
}
