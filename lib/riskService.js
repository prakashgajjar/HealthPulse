/**
 * Risk Score Service
 * Generates AI-based health risk scores for areas
 * Formula: (growthRate × 0.4) + (caseDensity × 0.3) + (diseaseSeverity × 0.2) + (historicalOutbreak × 0.1)
 */

import MedicalReport from '@/app/models/MedicalReport';
import RiskScore from '@/app/models/RiskScore';

// Disease severity weights (typical severity of common diseases)
const DISEASE_SEVERITY = {
  'dengue': 60,
  'malaria': 70,
  'covid-19': 65,
  'influenza': 40,
  'chickenpox': 30,
  'measles': 75,
  'tuberculosis': 85,
  'typhoid': 55,
  'cholera': 90,
  'hepatitis': 65,
  'default': 50,
};

/**
 * Get severity weight for a disease
 */
function getDiseaseSeverity(disease) {
  return DISEASE_SEVERITY[disease.toLowerCase()] || DISEASE_SEVERITY['default'];
}

/**
 * Get case statistics for an area and disease over last 7 days
 */
async function getCaseStatistics(area, disease = null) {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const query = { area, reportDate: { $gte: sevenDaysAgo } };
    if (disease) query.disease = disease;

    // Last 7 days cases
    const currentPeriod = await MedicalReport.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$disease',
          cases: { $sum: '$caseCount' },
        },
      },
    ]);

    // Previous 7 days cases (7-14 days ago)
    const previousQuery = { area, reportDate: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } };
    if (disease) previousQuery.disease = disease;

    const previousPeriod = await MedicalReport.aggregate([
      { $match: previousQuery },
      {
        $group: {
          _id: '$disease',
          cases: { $sum: '$caseCount' },
        },
      },
    ]);

    return { currentPeriod, previousPeriod };
  } catch (error) {
    console.error('Error getting case statistics:', error);
    return { currentPeriod: [], previousPeriod: [] };
  }
}

/**
 * Check if area had an outbreak in the last 90 days (simplified: any spike detection)
 */
async function checkHistoricalOutbreak(area) {
  try {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    
    const reports = await MedicalReport.find({
      area,
      reportDate: { $gte: ninetyDaysAgo },
    });

    if (reports.length === 0) return 0;

    // Calculate average and check for spikes
    const totalCases = reports.reduce((sum, r) => sum + r.caseCount, 0);
    const avgCases = totalCases / reports.length;
    
    // Check if any report has > 2x average (indicating outbreak)
    const hasOutbreak = reports.some(r => r.caseCount > avgCases * 2);
    
    return hasOutbreak ? 80 : 20;
  } catch (error) {
    console.error('Error checking historical outbreak:', error);
    return 0;
  }
}

/**
 * Calculate growth rate (%)
 */
function calculateGrowthRate(currentCases, previousCases) {
  if (previousCases === 0) {
    return currentCases > 0 ? 100 : 0; // 100% if new cases, 0% if no cases
  }
  return ((currentCases - previousCases) / previousCases) * 100;
}

/**
 * Normalize a value to 0-100 scale
 */
function normalize(value, max = 100) {
  return Math.min(100, Math.max(0, (value / max) * 100));
}

/**
 * Generate contributing factors for explainability
 */
function generateExplanations(growthRate, caseDensity, diseaseSeverity, historicalOutbreak) {
  const explanations = [];
  
  if (growthRate > 50) {
    explanations.push(`Cases increased by ${growthRate.toFixed(1)}% in last 7 days`);
  } else if (growthRate > 20) {
    explanations.push(`Moderate growth: ${growthRate.toFixed(1)}% increase in cases`);
  }
  
  if (caseDensity > 70) {
    explanations.push('High case density detected in the area');
  } else if (caseDensity > 40) {
    explanations.push('Moderate case count in the area');
  }
  
  if (diseaseSeverity > 70) {
    explanations.push('High disease severity detected');
  }
  
  if (historicalOutbreak > 60) {
    explanations.push('Previous outbreak occurred in last 90 days');
  }
  
  if (explanations.length === 0) {
    explanations.push('Low activity in area');
  }
  
  return explanations;
}

/**
 * Calculate risk score for an area
 */
function calculateRiskScore(growthRate, caseDensity, diseaseSeverity, historicalOutbreak) {
  // Normalize inputs to 0-100 range
  const normalizedGrowth = normalize(growthRate, 100);
  const normalizedDensity = caseDensity;
  const normalizedSeverity = diseaseSeverity;
  const normalizedOutbreak = historicalOutbreak;

  // Apply weights and calculate final score
  const riskScore = 
    (normalizedGrowth * 0.4) +
    (normalizedDensity * 0.3) +
    (normalizedSeverity * 0.2) +
    (normalizedOutbreak * 0.1);

  return Math.round(Math.min(100, Math.max(0, riskScore)));
}

/**
 * Classify risk level
 */
function classifyRiskLevel(riskScore) {
  if (riskScore < 40) return 'low';
  if (riskScore < 70) return 'medium';
  return 'high';
}

/**
 * Calculate risk score for a specific area and disease
 */
export async function calculateAreaRiskScore(area, disease = null) {
  try {
    const { currentPeriod, previousPeriod } = await getCaseStatistics(area, disease);
    
    if (currentPeriod.length === 0) {
      // No data, return low risk
      return null;
    }

    // If multiple diseases, calculate for each or aggregate
    const riskScores = [];

    for (const current of currentPeriod) {
      const diseaseData = disease || current._id;
      const currentCases = current.cases;
      const previousEntry = previousPeriod.find(p => p._id === diseaseData);
      const previousCases = previousEntry ? previousEntry.cases : 0;

      // Calculate components
      const growthRate = calculateGrowthRate(currentCases, previousCases);
      const caseDensity = normalize(currentCases, 100); // Normalize assuming max 100 cases is high
      const diseaseSeverity = getDiseaseSeverity(diseaseData);
      const historicalOutbreak = await checkHistoricalOutbreak(area);

      // Calculate risk score
      const riskScore = calculateRiskScore(growthRate, caseDensity, diseaseSeverity, historicalOutbreak);
      const riskLevel = classifyRiskLevel(riskScore);
      const explanations = generateExplanations(growthRate, caseDensity, diseaseSeverity, historicalOutbreak);

      riskScores.push({
        area,
        disease: diseaseData,
        riskScore,
        riskLevel,
        growthRate: parseFloat(growthRate.toFixed(2)),
        caseDensity: parseFloat(caseDensity.toFixed(2)),
        diseaseSeverity,
        historicalOutbreak,
        totalCases: currentCases,
        previousPeriodCases: previousCases,
        contributingFactors: explanations,
      });
    }

    // Save to database
    for (const scoreData of riskScores) {
      const existingScore = await RiskScore.findOne({
        area: scoreData.area,
        disease: scoreData.disease,
      }).sort({ calculationDate: -1 }).limit(1);

      // Only save if significantly different from last calculation
      if (!existingScore || Math.abs(existingScore.riskScore - scoreData.riskScore) > 5) {
        await RiskScore.create(scoreData);
      }
    }

    return riskScores;
  } catch (error) {
    console.error('Error calculating risk score:', error);
    throw error;
  }
}

/**
 * Get latest risk scores for an area
 */
export async function getAreaRiskScores(area) {
  try {
    const scores = await RiskScore.aggregate([
      { $match: { area } },
      { $sort: { calculationDate: -1 } },
      {
        $group: {
          _id: '$disease',
          latestScore: { $first: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$latestScore' } },
    ]);

    return scores;
  } catch (error) {
    console.error('Error getting risk scores:', error);
    return [];
  }
}

/**
 * Get aggregated risk for an area (highest risk across all diseases)
 */
export async function getAreaAggregateRisk(area) {
  try {
    const scores = await getAreaRiskScores(area);
    
    if (scores.length === 0) {
      return {
        area,
        aggregateRiskScore: 0,
        aggregateRiskLevel: 'low',
        topThreats: [],
      };
    }

    // Calculate weighted average and get top threats
    const totalWeight = scores.reduce((sum, s) => sum + 1, 0);
    const weightedScore = Math.round(
      scores.reduce((sum, s) => sum + s.riskScore, 0) / totalWeight
    );

    const topThreats = scores
      .filter(s => s.riskLevel !== 'low')
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 3)
      .map(s => ({
        disease: s.disease,
        riskScore: s.riskScore,
        riskLevel: s.riskLevel,
      }));

    return {
      area,
      aggregateRiskScore: weightedScore,
      aggregateRiskLevel: classifyRiskLevel(weightedScore),
      topThreats,
      lastCalculated: scores[0].calculationDate,
    };
  } catch (error) {
    console.error('Error getting aggregate risk:', error);
    return null;
  }
}

export default {
  calculateAreaRiskScore,
  getAreaRiskScores,
  getAreaAggregateRisk,
};
