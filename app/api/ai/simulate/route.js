import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { simulateScenario, compareScenarios } from '@/lib/forecastService';
import { getAuthFromRequest, isAdmin } from '@/lib/middleware';

/**
 * POST /api/ai/simulate
 * Simulate scenario with interventions
 *
 * Request body:
 * {
 *   area: string,
 *   disease: string,
 *   interventions: {
 *     awarenessLevel: 0-100,
 *     medicalIntervention: boolean,
 *     environmentalControl: boolean
 *   },
 *   days: 7 (optional)
 * }
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

    const { area, disease, interventions, days = 7 } = await request.json();

    if (!area || !disease || !interventions) {
      return NextResponse.json(
        { error: 'Missing required fields: area, disease, interventions' },
        { status: 400 }
      );
    }

    // Validate interventions
    if (
      typeof interventions.awarenessLevel !== 'number' ||
      typeof interventions.medicalIntervention !== 'boolean' ||
      typeof interventions.environmentalControl !== 'boolean'
    ) {
      return NextResponse.json(
        { error: 'Invalid interventions format' },
        { status: 400 }
      );
    }

    const simulation = await simulateScenario(area, disease, interventions, days);

    return NextResponse.json(simulation, { status: 200 });
  } catch (error) {
    console.error('Simulation error:', error);
    return NextResponse.json(
      { error: 'Failed to run simulation' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/simulate/compare
 * Compare multiple scenarios
 *
 * Request body:
 * {
 *   area: string,
 *   disease: string,
 *   scenarios: [
 *     {
 *       name: string,
 *       interventions: { ... }
 *     }
 *   ],
 *   days: 7 (optional)
 * }
 */
export async function PUT(request) {
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

    const { area, disease, scenarios, days = 7 } = await request.json();

    if (!area || !disease || !scenarios || scenarios.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: area, disease, scenarios' },
        { status: 400 }
      );
    }

    const comparison = await compareScenarios(area, disease, scenarios, days);

    return NextResponse.json(comparison, { status: 200 });
  } catch (error) {
    console.error('Scenario comparison error:', error);
    return NextResponse.json(
      { error: 'Failed to compare scenarios' },
      { status: 500 }
    );
  }
}
