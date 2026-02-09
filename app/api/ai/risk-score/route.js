import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthFromRequest } from '@/lib/middleware';
import MedicalReport from '@/app/models/MedicalReport';

// Disease severity weights
const DISEASE_SEVERITY = {
  dengue: 60,
  malaria: 70,
  'covid-19': 65,
  influenza: 40,
  flu: 40,
  chickenpox: 30,
  measles: 75,
  tuberculosis: 85,
  typhoid: 55,
  cholera: 90,
  hepatitis: 65,
};

function getDiseaseSeverity(disease) {
  return DISEASE_SEVERITY[disease.toLowerCase()] || 50;
}

function calculateGrowthRate(currentCases, previousCases) {
  if (previousCases === 0) {
    return currentCases > 0 ? 100 : 0;
  }
  return ((currentCases - previousCases) / previousCases) * 100;
}

function normalize(value, max = 100) {
  return Math.min(100, Math.max(0, (value / max) * 100));
}

function classifyRiskLevel(score) {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function calculateRiskScore(growthRate, caseDensity, diseaseSeverity, historicalOutbreak) {
  const normalizedGrowth = normalize(growthRate, 150);
  const normalizedSeverity = diseaseSeverity;
  const normalizedOutbreak = historicalOutbreak;

  return Math.round(
    normalizedGrowth * 0.4 + caseDensity * 0.3 + normalizedSeverity * 0.2 + normalizedOutbreak * 0.1
  );
}

/**
 * Calculate risk scores from medical reports
 */
async function calculateRiskScoresFromReports(area) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  // Get current period cases (last 7 days)
  const currentPeriodReports = await MedicalReport.aggregate([
    {
      $match: {
        area: { $regex: area, $options: 'i' },
        reportDate: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: '$disease',
        cases: { $sum: '$caseCount' },
      },
    },
  ]);

  // Get previous period cases (7-14 days ago)
  const previousPeriodReports = await MedicalReport.aggregate([
    {
      $match: {
        area: { $regex: area, $options: 'i' },
        reportDate: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: '$disease',
        cases: { $sum: '$caseCount' },
      },
    },
  ]);

  // Get historical data for outbreak detection
  const historicalReports = await MedicalReport.aggregate([
    {
      $match: {
        area: { $regex: area, $options: 'i' },
        reportDate: { $gte: ninetyDaysAgo },
      },
    },
    {
      $group: {
        _id: '$disease',
        totalCases: { $sum: '$caseCount' },
        avgCases: { $avg: '$caseCount' },
        maxCases: { $max: '$caseCount' },
        count: { $sum: 1 },
      },
    },
  ]);

  // Calculate risk scores for each disease
  const riskScores = [];

  for (const currentEntry of currentPeriodReports) {
    const disease = currentEntry._id;
    const currentCases = currentEntry.cases;

    // Get previous cases
    const previousEntry = previousPeriodReports.find(p => p._id === disease);
    const previousCases = previousEntry ? previousEntry.cases : 0;

    // Get historical data
    const historicalEntry = historicalReports.find(h => h._id === disease);
    let historicalOutbreak = 0;
    if (historicalEntry) {
      const hasOutbreak = historicalEntry.maxCases > historicalEntry.avgCases * 2;
      historicalOutbreak = hasOutbreak ? 80 : 20;
    }

    // Calculate components
    const growthRate = calculateGrowthRate(currentCases, previousCases);
    const caseDensity = normalize(currentCases, 100);
    const diseaseSeverity = getDiseaseSeverity(disease);

    // Calculate risk score
    const riskScore = calculateRiskScore(growthRate, caseDensity, diseaseSeverity, historicalOutbreak);
    const riskLevel = classifyRiskLevel(riskScore);

    riskScores.push({
      disease,
      riskScore,
      riskLevel,
      currentCases,
      previousCases,
      growthRate: parseFloat(growthRate.toFixed(2)),
      caseDensity: parseFloat(caseDensity.toFixed(2)),
      diseaseSeverity,
    });
  }

  return riskScores;
}

/**
 * POST /api/ai/risk-score
 * Calculate and get aggregated risk score for an area
 */
export async function POST(request) {
  try {
    await dbConnect();

    const auth = await getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { area } = await request.json();

    if (!area) {
      return NextResponse.json({ error: 'Area is required' }, { status: 400 });
    }

    // Calculate risk scores from medical reports
    const riskScores = await calculateRiskScoresFromReports(area);

    if (riskScores.length === 0) {
      return NextResponse.json(
        {
          data: {
            area,
            aggregateRiskScore: 0,
            aggregateRiskLevel: 'low',
            diseaseCount: { high: 0, medium: 0, low: 0 },
            topThreats: [],
            totalDiseases: 0,
          },
          timestamp: new Date(),
        },
        { status: 200 }
      );
    }

    // Count diseases by risk level
    const diseaseCount = {
      high: riskScores.filter(s => s.riskLevel === 'high').length,
      medium: riskScores.filter(s => s.riskLevel === 'medium').length,
      low: riskScores.filter(s => s.riskLevel === 'low').length,
    };

    // Calculate aggregate score
    const aggregateScore = Math.round(
      riskScores.reduce((sum, s) => sum + s.riskScore, 0) / riskScores.length
    );
    const aggregateLevel = classifyRiskLevel(aggregateScore);

    // Get top threats
    const topThreats = riskScores
      .filter(s => s.riskLevel !== 'low')
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 3)
      .map(s => ({
        disease: s.disease,
        riskScore: s.riskScore,
        riskLevel: s.riskLevel,
        currentCases: s.currentCases,
      }));

    return NextResponse.json(
      {
        data: {
          area,
          aggregateRiskScore: aggregateScore,
          aggregateRiskLevel: aggregateLevel,
          diseaseCount,
          topThreats,
          totalDiseases: riskScores.length,
          diseases: riskScores,
        },
        timestamp: new Date(),
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
 * GET /api/ai/risk-score?area=<area>
 * Get risk scores for an area
 */
export async function GET(request) {
  try {
    await dbConnect();

    const auth = await getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const area = searchParams.get('area');

    if (!area) {
      return NextResponse.json({ error: 'Area is required' }, { status: 400 });
    }

    const riskScores = await calculateRiskScoresFromReports(area);

    if (riskScores.length === 0) {
      return NextResponse.json(
        {
          data: {
            area,
            aggregateRiskScore: 0,
            aggregateRiskLevel: 'low',
            diseaseCount: { high: 0, medium: 0, low: 0 },
            topThreats: [],
            totalDiseases: 0,
          },
          timestamp: new Date(),
        },
        { status: 200 }
      );
    }

    // Count diseases by risk level
    const diseaseCount = {
      high: riskScores.filter(s => s.riskLevel === 'high').length,
      medium: riskScores.filter(s => s.riskLevel === 'medium').length,
      low: riskScores.filter(s => s.riskLevel === 'low').length,
    };

    // Calculate aggregate score
    const aggregateScore = Math.round(
      riskScores.reduce((sum, s) => sum + s.riskScore, 0) / riskScores.length
    );
    const aggregateLevel = classifyRiskLevel(aggregateScore);

    // Get top threats
    const topThreats = riskScores
      .filter(s => s.riskLevel !== 'low')
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 3)
      .map(s => ({
        disease: s.disease,
        riskScore: s.riskScore,
        riskLevel: s.riskLevel,
        currentCases: s.currentCases,
      }));

    return NextResponse.json(
      {
        data: {
          area,
          aggregateRiskScore: aggregateScore,
          aggregateRiskLevel: aggregateLevel,
          diseaseCount,
          topThreats,
          totalDiseases: riskScores.length,
          diseases: riskScores,
        },
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
