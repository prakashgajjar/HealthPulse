/**
 * Anomaly Detection Service
 * Detects unusual spikes in disease cases using statistical methods
 */

import MedicalReport from '@/app/models/MedicalReport';

/**
 * Calculate moving average and standard deviation for cases
 */
async function calculateStatistics(area, disease, days = 30) {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const reports = await MedicalReport.find({
      area,
      disease,
      reportDate: { $gte: startDate },
    }).sort({ reportDate: 1 });

    if (reports.length === 0) {
      return null;
    }

    const cases = reports.map(r => r.caseCount);
    
    // Calculate mean
    const mean = cases.reduce((a, b) => a + b, 0) / cases.length;
    
    // Calculate standard deviation
    const variance = cases.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / cases.length;
    const stdDev = Math.sqrt(variance);
    
    // Calculate moving average (last 7 days)
    const last7Days = reports.slice(-7);
    const movingAvg = last7Days.length > 0 
      ? last7Days.reduce((a, b) => a + b.caseCount, 0) / last7Days.length
      : mean;

    return {
      mean,
      stdDev,
      movingAvg,
      historicalCases: cases,
      lastValue: cases[cases.length - 1],
      reportsCount: reports.length,
    };
  } catch (error) {
    console.error('Error calculating statistics:', error);
    return null;
  }
}

/**
 * Detect anomaly using Z-score method
 * Anomaly is detected if: todayCases > mean + 2 * stdDev
 */
function detectAnomalyZScore(newCases, statistics) {
  if (!statistics || statistics.stdDev === 0) {
    // If no historical data, check if cases are significantly higher
    return newCases > statistics.mean * 1.5;
  }

  const zScore = (newCases - statistics.mean) / statistics.stdDev;
  const isAnomaly = zScore > 2; // 2 standard deviations threshold
  
  return {
    isAnomaly,
    zScore,
    threshold: statistics.mean + 2 * statistics.stdDev,
  };
}

/**
 * Calculate spike percentage
 */
function calculateSpikePercentage(newCases, previousAverage) {
  if (previousAverage === 0) {
    return newCases > 0 ? 100 : 0;
  }
  return ((newCases - previousAverage) / previousAverage) * 100;
}

/**
 * Check for anomaly in new report
 */
export async function checkAnomalyInReport(disease, area, newCaseCount) {
  try {
    const statistics = await calculateStatistics(area, disease, 30);

    if (!statistics) {
      // No historical data to compare
      return {
        hasAnomaly: false,
        reason: 'Insufficient historical data',
        newCaseCount,
      };
    }

    const anomalyCheck = detectAnomalyZScore(newCaseCount, statistics);

    if (anomalyCheck.isAnomaly) {
      const spikePercentage = calculateSpikePercentage(newCaseCount, statistics.movingAvg);
      
      return {
        hasAnomaly: true,
        disease,
        area,
        newCaseCount,
        previousMovingAvg: parseFloat(statistics.movingAvg.toFixed(2)),
        spikePercentage: parseFloat(spikePercentage.toFixed(2)),
        zScore: parseFloat(anomalyCheck.zScore.toFixed(2)),
        threshold: parseFloat(anomalyCheck.threshold.toFixed(2)),
        reason: `Cases spiked ${Math.round(spikePercentage)}% above moving average (Z-score: ${anomalyCheck.zScore.toFixed(2)})`,
      };
    }

    return {
      hasAnomaly: false,
      disease,
      area,
      newCaseCount,
      previousMovingAvg: parseFloat(statistics.movingAvg.toFixed(2)),
      zScore: parseFloat(anomalyCheck.zScore.toFixed(2)),
      reason: 'Normal case count variation',
    };
  } catch (error) {
    console.error('Error checking anomaly:', error);
    throw error;
  }
}

/**
 * Generate alert data for an anomaly
 */
export function generateAnomalyAlert(anomalyData) {
  if (!anomalyData.hasAnomaly) {
    return null;
  }

  const {
    disease,
    area,
    newCaseCount,
    previousMovingAvg,
    spikePercentage,
  } = anomalyData;

  // Determine risk level based on spike severity
  let riskLevel = 'medium';
  if (spikePercentage > 100) riskLevel = 'high';
  if (spikePercentage < 30) riskLevel = 'low';

  return {
    title: `⚠️ Anomaly Detected: ${disease}`,
    message: `Unusual spike in ${disease} cases in ${area}. Cases increased to ${newCaseCount} (${spikePercentage.toFixed(1)}% above average). Please monitor closely.`,
    disease,
    area,
    riskLevel,
    source: 'AI',
    type: 'anomaly',
    spikePercentage,
    explanations: [
      `Raw case count: ${newCaseCount} (previous average: ${previousMovingAvg.toFixed(0)})`,
      `Spike severity: ${spikePercentage.toFixed(1)}% above moving average`,
      'This is an automated alert based on statistical anomaly detection',
    ],
  };
}

export default {
  checkAnomalyInReport,
  generateAnomalyAlert,
  calculateStatistics,
};
