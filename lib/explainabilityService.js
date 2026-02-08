/**
 * Explainability Service (XAI)
 * Explains AI decisions about risk scores and alerts in human-readable format
 */

import RiskScore from '@/app/models/RiskScore';
import Alert from '@/app/models/Alert';

/**
 * Build explanation for risk score factors
 */
function buildFactorExplanation(factor, value, weight) {
  const explanations = {
    growthRate: {
      0: 'No growth in cases',
      30: 'Slow growth in case count',
      50: 'Moderate growth detected',
      75: 'Rapid case growth detected',
      100: 'Extremely rapid growth - urgent attention needed',
    },
    caseDensity: {
      0: 'No reported cases',
      25: 'Low case count',
      50: 'Moderate case density',
      75: 'High case density',
      100: 'Very high case density - cluster detected',
    },
    diseaseSeverity: {
      0: 'Low severity disease',
      30: 'Moderate severity disease',
      60: 'High severity disease',
      80: 'Very high severity disease',
      100: 'Critical severity disease',
    },
    historicalOutbreak: {
      0: 'No previous outbreaks',
      30: 'Minor outbreak history',
      60: 'Significant outbreak in past 90 days',
      80: 'Recent major outbreak',
      100: 'Ongoing outbreak situation',
    },
  };

  const ranges = explanations[factor] || {};
  let explanation = 'Unable to determine';

  // Find closest range
  const keys = Object.keys(ranges).map(Number).sort((a, b) => a - b);
  const closest = keys.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );

  if (ranges[closest]) {
    explanation = ranges[closest];
  }

  return {
    factor,
    value: parseFloat(value.toFixed(2)),
    weight: `${(weight * 100).toFixed(0)}%`,
    explanation,
    contribution: parseFloat((value * weight).toFixed(2)),
  };
}

/**
 * Generate detailed explanation for a risk score
 */
export async function explainRiskScore(riskScore) {
  try {
    const factors = [];
    let totalContribution = 0;

    // Explain each factor
    const weightedFactors = [
      { name: 'growthRate', weight: 0.4 },
      { name: 'caseDensity', weight: 0.3 },
      { name: 'diseaseSeverity', weight: 0.2 },
      { name: 'historicalOutbreak', weight: 0.1 },
    ];

    weightedFactors.forEach(({ name, weight }) => {
      const explanation = buildFactorExplanation(
        name,
        riskScore[name] || 0,
        weight
      );
      factors.push(explanation);
      totalContribution += explanation.contribution;
    });

    // Build narrative explanation
    const narrative = [];
    const sortedFactors = factors.sort((a, b) => b.contribution - a.contribution);

    // Add top 3 contributing factors to narrative
    sortedFactors.slice(0, 3).forEach(f => {
      narrative.push(`${f.explanation} (contributes ${f.contribution.toFixed(1)} to score)`);
    });

    return {
      riskScore: riskScore.riskScore,
      riskLevel: riskScore.riskLevel,
      area: riskScore.area,
      disease: riskScore.disease,
      calculatedAt: riskScore.calculationDate,
      contributingFactors: factors,
      narrative,
      confidence: 'High (based on statistical analysis)',
      dataPoints: {
        casesLastWeek: riskScore.totalCases,
        casesPreviousWeek: riskScore.previousPeriodCases,
        growthPercentage: riskScore.growthRate,
      },
      recommendations: generateRecommendations(riskScore.riskLevel, riskScore.disease),
    };
  } catch (error) {
    console.error('Error explaining risk score:', error);
    throw error;
  }
}

/**
 * Generate recommendations based on risk level and disease
 */
function generateRecommendations(riskLevel, disease) {
  const baseRecommendations = {
    low: [
      'Continue routine health monitoring',
      'Maintain standard preventive practices',
      'Stay informed about disease updates',
    ],
    medium: [
      'Increase health awareness in community',
      'Ensure vaccination status is current',
      'Monitor symptoms closely',
      'Consult healthcare provider if symptoms develop',
    ],
    high: [
      'Activate emergency health protocols',
      'Increase surveillance and testing',
      'Implement community health measures',
      'Provide immediate access to healthcare',
      'Distribute preventive measures',
    ],
  };

  const diseaseSpecific = {
    dengue: [
      'Eliminate mosquito breeding sites',
      'Distribute insect repellents',
      'Advise on protective clothing',
    ],
    malaria: [
      'Distribute bed nets',
      'Arrange prophylaxis programs',
      'Increase testing availability',
    ],
    'covid-19': [
      'Boost vaccination campaigns',
      'Increase testing capacity',
      'Advise on isolation procedures',
    ],
    measles: [
      'Organize vaccination drives',
      'Isolate confirmed cases',
      'Monitor contacts',
    ],
    tuberculosis: [
      'Screen at-risk populations',
      'Ensure treatment access',
      'Implement infection control',
    ],
  };

  const recommendations = [
    ...(baseRecommendations[riskLevel] || []),
    ...(diseaseSpecific[disease.toLowerCase()] || []),
  ];

  return recommendations;
}

/**
 * Generate explanation for an alert
 */
export async function explainAlert(alertId) {
  try {
    const alert = await Alert.findById(alertId);

    if (!alert) {
      return null;
    }

    const explanation = {
      alertId: alert._id,
      title: alert.title,
      disease: alert.disease,
      area: alert.area,
      riskLevel: alert.riskLevel,
      source: alert.source || 'manual',
      type: alert.type || 'general',
      createdAt: alert.createdAt,
    };

    // Add AI-specific explanations if available
    if (alert.explanations && alert.explanations.length > 0) {
      explanation.aiExplanations = alert.explanations;
    }

    if (alert.spikePercentage) {
      explanation.anomalyDetails = {
        spikePercentage: alert.spikePercentage,
        interpretation: `Cases increased by ${alert.spikePercentage.toFixed(1)}% above the normal threshold`,
      };
    }

    // Add narrative
    explanation.narrative = buildAlertNarrative(alert);

    // Add trustScore
    explanation.trustScore = calculateTrustScore(alert);

    return explanation;
  } catch (error) {
    console.error('Error explaining alert:', error);
    throw error;
  }
}

/**
 * Build human-readable narrative for alert
 */
function buildAlertNarrative(alert) {
  let narrative = `An alert for ${alert.disease} has been issued in ${alert.area}. `;

  if (alert.source === 'AI') {
    if (alert.type === 'anomaly') {
      narrative += `The AI system detected an unusual increase in cases (${alert.spikePercentage?.toFixed(1) || 'significant'}% above average). `;
    } else if (alert.type === 'trend') {
      narrative += 'The AI system identified concerning disease trends. ';
    } else {
      narrative += 'The AI system identified health risks based on available data. ';
    }
  } else {
    narrative += 'This alert was created by health administrators. ';
  }

  narrative += `Risk level is classified as ${alert.riskLevel.toUpperCase()}. `;

  if (alert.riskScore) {
    narrative += `The composite risk score is ${alert.riskScore}/100. `;
  }

  narrative += 'This information is provided for community awareness and should not be used for self-diagnosis.';

  return narrative;
}

/**
 * Calculate trust score for an alert
 */
function calculateTrustScore(alert) {
  let score = 75; // Base score

  // More trustworthy if it has detailed explanations
  if (alert.explanations && alert.explanations.length >= 3) {
    score += 15;
  }

  // Add points for anomaly detection
  if (alert.source === 'AI' && alert.type === 'anomaly') {
    score += 10;
  }

  // Reduce if manual (less algorithmic)
  if (alert.source !== 'AI') {
    score -= 5;
  }

  return Math.min(100, score);
}

/**
 * Request full explainability report
 */
export async function generateExplainabilityReport(type, id) {
  try {
    let report = {};

    if (type === 'risk-score') {
      const riskScore = await RiskScore.findById(id);
      if (!riskScore) return null;
      report = await explainRiskScore(riskScore);
    } else if (type === 'alert') {
      report = await explainAlert(id);
    } else {
      throw new Error('Invalid explainability report type');
    }

    return {
      ...report,
      reportType: type,
      generatedAt: new Date(),
      disclaimer: 'This explanation is generated by our AI system to help understand health data. Always consult healthcare professionals for medical concerns.',
    };
  } catch (error) {
    console.error('Error generating explainability report:', error);
    throw error;
  }
}

export default {
  explainRiskScore,
  explainAlert,
  generateExplainabilityReport,
  generateRecommendations,
};
