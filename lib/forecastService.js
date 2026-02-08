/**
 * Forecast Service
 * Predicts future disease cases using time-series forecasting
 * Simulates scenarios with intervention factors
 */

import MedicalReport from '@/app/models/MedicalReport';

/**
 * Get historical case data for forecasting
 */
async function getHistoricalData(area, disease, days = 60) {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const reports = await MedicalReport.find({
      area,
      disease,
      reportDate: { $gte: startDate },
    })
      .sort({ reportDate: 1 })
      .lean();

      console.log(`Historical data for ${area} - ${disease}:`, reports, 'reports found');

    if (reports.length === 0) {
      return [];
    }

    // Group by date and sum cases (in case multiple reports per day)
    const groupedByDate = {};
    reports.forEach(report => {
      const dateKey = report.reportDate.toISOString().split('T')[0];
      groupedByDate[dateKey] = (groupedByDate[dateKey] || 0) + report.caseCount;
    });



    // Convert to sorted array
    return Object.entries(groupedByDate)
      .map(([date, cases]) => ({
        date: new Date(date),
        cases,
      }))
      .sort((a, b) => a.date - b.date);
  } catch (error) {
    console.error('Error getting historical data:', error);
    return [];
  }
}

/**
 * Simple exponential smoothing with trend
 * Used for time-series forecasting
 */
function exponentialSmoothing(data, alpha = 0.3, beta = 0.2) {
  if (data.length === 0) return null;

  const cases = data.map(d => d.cases);

  // Initialize
  let level = cases[0];
  let trend = cases.length > 1 ? cases[1] - cases[0] : 0;
  const forecast = [level + trend];

  // Apply exponential smoothing
  for (let i = 1; i < cases.length; i++) {
    const prevLevel = level;
    level = alpha * cases[i] + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
    forecast.push(level + trend);
  }

  return { level, trend, forecast };
}

/**
 * Forecast cases for next N days
 */
function forecastNextDays(level, trend, days = 7) {
  const forecast = [];

  for (let i = 1; i <= days; i++) {
    const predictedCases = Math.max(0, Math.round(level + trend * i));
    forecast.push(predictedCases);
  }

  return forecast;
}

/**
 * Calculate intervention impact factor
 */
function calculateInterventionFactor(interventions) {
  // Base factor
  let factor = 1.0;

  // Awareness level impact (0-100)
  if (interventions.awarenessLevel) {
    const awareness = Math.min(100, Math.max(0, interventions.awarenessLevel));
    // Higher awareness = more reduction (max 25% reduction at 100% awareness)
    factor *= 1 - (awareness / 100) * 0.25;
  }

  // Medical intervention impact
  if (interventions.medicalIntervention) {
    factor *= 0.70; // 30% reduction with medical intervention
  }

  // Environmental control impact
  if (interventions.environmentalControl) {
    factor *= 0.75; // 25% reduction with environmental control
  }

  // Ensure factor stays reasonable
  return Math.max(0.3, Math.min(1.5, factor));
}

/**
 * Get baseline forecast for an area and disease
 */
export async function getBaselineForecast(area, disease, forecastDays = 7) {
  try {
    const historicalData = await getHistoricalData(area, disease, 60);

    if (historicalData.length > 1) {
      // Not enough data for forecasting
      return {
        area,
        disease,
        status: 'insufficient_data',
        message: 'Insufficient historical data for forecasting',
      };
    }

    // Apply exponential smoothing
    const smoothing = exponentialSmoothing(historicalData);

    if (!smoothing) {
      return {
        area,
        disease,
        status: 'error',
        message: 'Error calculating forecast',
      };
    }

    // Get forecast
    const forecast = forecastNextDays(smoothing.level, smoothing.trend, forecastDays);

    // Calculate statistics
    const historicalCases = historicalData.map(d => d.cases);
    const avgDaily = historicalCases.reduce((a, b) => a + b, 0) / historicalCases.length;
    const trend = smoothing.trend > 0 ? 'increasing' : 'decreasing';

    return {
      area,
      disease,
      status: 'success',
      historicalAverage: parseFloat(avgDaily.toFixed(2)),
      currentTrend: trend,
      trendStrength: parseFloat(Math.abs(smoothing.trend).toFixed(2)),
      baselineForecast: forecast.map(Math.round),
      forecastDays,
      confidence: calculateForecastConfidence(historicalData.length),
      recommendations: generateRecommendations(trend, smoothing.trend),
    };
  } catch (error) {
    console.error('Error getting baseline forecast:', error);
    throw error;
  }
}

/**
 * Simulate scenario with interventions
 */
export async function simulateScenario(area, disease, interventions, forecastDays = 7) {
  try {
    // Get baseline forecast
    const baseline = await getBaselineForecast(area, disease, forecastDays);

    if (baseline.status !== 'success') {
      return baseline;
    }

    // Calculate intervention factor
    const factor = calculateInterventionFactor(interventions);

    // Apply interventions to forecast
    const simulatedForecast = baseline.baselineForecast.map(cases =>
      Math.round(cases * factor)
    );

    // Calculate impact
    const baselineTotal = baseline.baselineForecast.reduce((a, b) => a + b, 0);
    const simulatedTotal = simulatedForecast.reduce((a, b) => a + b, 0);
    const casesPrevented = baselineTotal - simulatedTotal;
    const percentReduction = ((casesPrevented / baselineTotal) * 100).toFixed(1);

    return {
      area,
      disease,
      status: 'success',
      baseline: {
        forecast: baseline.baselineForecast,
        total: baselineTotal,
      },
      scenario: {
        interventions,
        factor: parseFloat(factor.toFixed(2)),
        forecast: simulatedForecast,
        total: simulatedTotal,
      },
      impact: {
        casesPrevented: Math.round(casesPrevented),
        percentReduction: parseFloat(percentReduction),
        interventionStrength: calculateInterventionStrength(interventions),
      },
      forecastDays,
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error simulating scenario:', error);
    throw error;
  }
}

/**
 * Calculate forecast confidence based on data points
 */
function calculateForecastConfidence(dataPoints) {
  if (dataPoints >= 30) return 'high';
  if (dataPoints >= 14) return 'medium';
  return 'low';
}

/**
 * Calculate intervention strength description
 */
function calculateInterventionStrength(interventions) {
  let count = 0;
  if (interventions.awarenessLevel > 50) count++;
  if (interventions.medicalIntervention) count++;
  if (interventions.environmentalControl) count++;

  if (count === 3) return 'Very Strong';
  if (count === 2) return 'Strong';
  if (count === 1) return 'Moderate';
  return 'Minimal';
}

/**
 * Generate recommendations based on trend
 */
function generateRecommendations(trend, trendStrength) {
  const recommendations = [];

  if (trend === 'increasing') {
    recommendations.push('Cases are increasing - immediate action recommended');
    if (trendStrength > 2) {
      recommendations.push('Rapid growth detected - escalate interventions');
    }
  } else {
    recommendations.push('Cases are decreasing - continue current measures');
  }

  recommendations.push('Monitor forecasts daily for changes in trajectory');
  recommendations.push('Be prepared to adjust interventions based on actual data');

  return recommendations;
}

/**
 * Compare multiple scenarios
 */
export async function compareScenarios(area, disease, scenariosList, forecastDays = 7) {
  try {
    const results = await Promise.all(
      scenariosList.map(scenario =>
        simulateScenario(area, disease, scenario.interventions, forecastDays)
      )
    );

    // Add scenario labels
    const scenarios = results.map((result, idx) => ({
      ...result,
      name: scenariosList[idx].name || `Scenario ${idx + 1}`,
    }));

    // Find best scenario (maximum case prevention)
    const bestScenario = scenarios.reduce((best, current) =>
      current.status === 'success' &&
        (!best || current.impact.casesPrevented > best.impact.casesPrevented)
        ? current
        : best
    );

    return {
      area,
      disease,
      scenarios,
      bestScenario: bestScenario?.name || null,
      forecastDays,
    };
  } catch (error) {
    console.error('Error comparing scenarios:', error);
    throw error;
  }
}

export default {
  getBaselineForecast,
  simulateScenario,
  compareScenarios,
  getHistoricalData,
};
