/**
 * Alert AI Service
 * Generates contextual alert messages using templates and NLP-based rewriting
 */

import { getAreaAggregateRisk } from './riskService';

// Alert message templates based on severity and disease
const ALERT_TEMPLATES = {
  high: {
    dengue: 'HIGH ALERT: {area} is experiencing a significant {disease} outbreak. Cases: {cases}. IMMEDIATE PRECAUTIONS REQUIRED - Seek shelter, avoid mosquito breeding spots, use repellents.',
    malaria: 'HIGH ALERT: {area} - {disease} cases surging to {cases}. CRITICAL - Use bed nets, take prophylaxis if recommended, report symptoms immediately.',
    'covid-19': 'HIGH ALERT: {area} - {disease} transmission at critical levels ({cases} cases). ESSENTIAL - Practice hygiene, maintain distance, get vaccinated if eligible.',
    measles: 'HIGH ALERT: {area} - {disease} spreading rapidly ({cases} cases reported). URGENT - Ensure vaccination status, avoid contact with sick individuals.',
    tuberculosis: 'HIGH ALERT: {area} - {disease} active transmission ({cases} cases). IMPORTANT - Medical screening advised, proper respiratory protection in public spaces.',
    default: 'HIGH ALERT: {area} is experiencing elevated {disease} activity with {cases} reported cases. Community precautions and medical consultation recommended.',
  },
  medium: {
    dengue: 'MODERATE ALERT: {disease} activity detected in {area} with {cases} cases. Recommended: Use mosquito repellents, clean water containers, monitor symptoms.',
    malaria: 'MODERATE ALERT: {disease} cases identified in {area} ({cases} reported). Recommendation: Use bed nets, consult health facility if symptoms appear.',
    'covid-19': 'MODERATE ALERT: {area} showing {disease} increase ({cases} cases). Advised: Maintain hygiene, home isolation if symptomatic, health monitoring.',
    measles: 'MODERATE ALERT: {disease} presence in {area} ({cases} cases). Caution: Verify vaccination status, avoid crowded places, monitor for symptoms.',
    tuberculosis: 'MODERATE ALERT: {disease} cases reported in {area} ({cases} cases). Guidance: Health screening available, respiratory precautions recommended.',
    default: 'MODERATE ALERT: {area} has {disease} activity. Please stay informed and follow basic health precautions.',
  },
  low: {
    default: 'INFORMATION: {area} has {disease} under observation ({cases} cases). Continue normal preventive practices.',
  },
};

/**
 * Get template for disease and risk level
 */
function getTemplate(riskLevel, disease) {
  const templates = ALERT_TEMPLATES[riskLevel] || ALERT_TEMPLATES.low;
  return templates[disease.toLowerCase()] || templates.default;
}

/**
 * Generate preventive guidance based on disease
 */
function getPreventiveGuidance(disease) {
  const guidance = {
    dengue: [
      '🦟 Apply mosquito repellents containing DEET',
      '🏠 Clear stagnant water from containers',
      '🛌 Use bed nets and air-conditioned spaces',
      '👕 Wear full-sleeve clothing during peak mosquito hours',
    ],
    malaria: [
      '🛌 Sleep under insecticide-treated bed nets',
      '💊 Take malaria prophylaxis if traveling to endemic areas',
      '🕐 Avoid being outdoors during dusk and dawn',
      '📋 Seek medical attention if experiencing fever',
    ],
    'covid-19': [
      '💉 Get vaccinated and booster doses',
      '🧼 Practice regular hand hygiene',
      '😷 Wear masks in crowded settings',
      '📏 Maintain physical distance when possible',
    ],
    measles: [
      '💉 Ensure MMR vaccination status',
      '🏥 Avoid close contact with confirmed cases',
      '😁 Practice respiratory hygiene',
      '📋 Seek immediate care if symptoms appear',
    ],
    tuberculosis: [
      '🫁 Get TB screening if at risk',
      '😷 Use respiratory protection around infected individuals',
      '💊 Complete full TB treatment if prescribed',
      '🏥 Report persistent cough lasting 3+ weeks',
    ],
    default: [
      '🏥 Consult healthcare provider if symptoms develop',
      '🧼 Practice good hand hygiene',
      '😷 Follow basic respiratory etiquette',
      '📋 Monitor health status regularly',
    ],
  };

  return guidance[disease.toLowerCase()] || guidance.default;
}

/**
 * Generate alert message from components
 */
export function generateAlertMessage({
  disease,
  area,
  riskLevel = 'medium',
  riskScore = null,
  caseCount = null,
  trendDirection = 'stable',
  anomalyInfo = null,
}) {
  // Get base template
  let template = getTemplate(riskLevel, disease);
  
  // Fill in template variables
  let message = template
    .replace('{disease}', disease)
    .replace('{area}', area)
    .replace('{cases}', caseCount || 'multiple');

  // Add trend information if increasing
  if (trendDirection === 'increasing') {
    message += ' Cases are trending upward - increased vigilance recommended.';
  }

  // Add anomaly-specific info
  if (anomalyInfo && anomalyInfo.spikePercentage) {
    message += ` Recent spike of ${anomalyInfo.spikePercentage.toFixed(1)}% detected.`;
  }

  // Add disclaimer
  message += '\n\n⚠️ DISCLAIMER: This is community health information, NOT medical advice. Consult healthcare professionals for diagnosis or treatment.';

  return message;
}

/**
 * Generate comprehensive alert with all details
 */
export async function generateAlertWithContext({
  disease,
  area,
  riskLevel = 'medium',
  riskScore = null,
  caseCount = null,
  anomalyInfo = null,
}) {
  try {
    // Get area risk data
    const areaRisk = await getAreaAggregateRisk(area);
    const trendDirection = riskScore ? (riskScore > 60 ? 'increasing' : 'stable') : 'stable';

    // Generate message
    const message = generateAlertMessage({
      disease,
      area,
      riskLevel,
      riskScore,
      caseCount,
      trendDirection,
      anomalyInfo,
    });

    // Get preventive guidance
    const preventiveGuidance = getPreventiveGuidance(disease);

    // Build explanations
    const explanations = [
      `Disease: ${disease}`,
      `Affected Area: ${area}`,
      `Risk Level: ${riskLevel.toUpperCase()}`,
    ];

    if (riskScore !== null) {
      explanations.push(`Risk Score: ${riskScore}/100`);
    }

    if (caseCount !== null) {
      explanations.push(`Reported Cases: ${caseCount}`);
    }

    if (anomalyInfo) {
      explanations.push(`Spike Detected: ${anomalyInfo.spikePercentage?.toFixed(1) || 'N/A'}% increase`);
    }

    if (areaRisk && areaRisk.topThreats.length > 0) {
      explanations.push(`Top Disease Threats: ${areaRisk.topThreats.map(t => t.disease).join(', ')}`);
    }

    return {
      title: `Alert: ${disease} in ${area}`,
      message,
      disease,
      area,
      riskLevel,
      riskScore,
      caseCount,
      source: 'AI',
      preventiveGuidance,
      explanations,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Error generating alert with context:', error);
    // Return basic alert if context fetch fails
    return {
      title: `Alert: ${disease} in ${area}`,
      message: generateAlertMessage({ disease, area, riskLevel, caseCount }),
      disease,
      area,
      riskLevel,
      source: 'AI',
    };
  }
}

/**
 * Improve alert message using simple NLP rewriting
 */
export function improveAlertMessage(baseMessage) {
  // Simple NLP techniques to make message more actionable
  let improved = baseMessage;

  // Replace passive constructions with active ones
  const replacements = {
    'is being': 'is currently',
    'has been detected': 'detected',
    'should be taken': 'take',
    'is recommended': 'recommended',
  };

  Object.entries(replacements).forEach(([from, to]) => {
    improved = improved.replace(new RegExp(from, 'gi'), to);
  });

  return improved;
}

export default {
  generateAlertMessage,
  generateAlertWithContext,
  improveAlertMessage,
  getPreventiveGuidance,
};
