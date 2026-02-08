import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/app/models/User';
import Alert from '@/app/models/Alert';
import { getAreaAggregateRisk } from '@/lib/riskService';
import { getAuthFromRequest } from '@/lib/middleware';

/**
 * Chat intents and handlers
 */
const INTENTS = {
  AREA_SAFETY: 'area_safety',
  SPREADING_DISEASES: 'spreading_diseases',
  PRECAUTIONS: 'precautions',
  AREA_RISK: 'area_risk',
  ALERTS: 'alerts',
  GENERAL_INFO: 'general_info',
  UNKNOWN: 'unknown',
};

/**
 * Detect user intent from message
 */
function detectIntent(message) {
  const lowerMessage = message.toLowerCase();

  // Define intent patterns
  if (
    lowerMessage.includes('is my area safe') ||
    lowerMessage.includes('safe') ||
    lowerMessage.includes('safety')
  ) {
    return INTENTS.AREA_SAFETY;
  }

  if (
    lowerMessage.includes('spreading') ||
    lowerMessage.includes('disease') ||
    lowerMessage.includes('outbreak') ||
    lowerMessage.includes('virus')
  ) {
    return INTENTS.SPREADING_DISEASES;
  }

  if (
    lowerMessage.includes('precaution') ||
    lowerMessage.includes('prevent') ||
    lowerMessage.includes('protect') ||
    lowerMessage.includes('protection')
  ) {
    return INTENTS.PRECAUTIONS;
  }

  if (
    lowerMessage.includes('risk') ||
    lowerMessage.includes('dangerous') ||
    lowerMessage.includes('threat')
  ) {
    return INTENTS.AREA_RISK;
  }

  if (lowerMessage.includes('alert')) {
    return INTENTS.ALERTS;
  }

  return INTENTS.UNKNOWN;
}

/**
 * Extract area from message
 */
function extractArea(message, userArea = null) {
  // Try to find pincode or area name in message
  const words = message.split(/\s+/);
  
  // Check for 5-digit pincode
  const pincode = words.find(w => /^\d{5}$/.test(w));
  if (pincode) return pincode;

  // Use user's area if available
  if (userArea) return userArea;

  return null;
}

/**
 * Handle area safety query
 */
async function handleAreaSafety(area) {
  if (!area) {
    return {
      response: 'Please provide your area or pincode so I can assess the health situation there.',
      type: 'request_info',
    };
  }

  const riskData = await getAreaAggregateRisk(area);

  if (!riskData) {
    return {
      response: `I don't have recent health data for ${area}. The system may not be monitoring this area yet.`,
      type: 'no_data',
    };
  }

  const safetyLevel =
    riskData.aggregateRiskLevel === 'low'
      ? '✅ appears to be relatively safe'
      : riskData.aggregateRiskLevel === 'medium'
      ? '⚠️ has moderate health risks'
      : '🔴 has elevated health risks';

  let response = `${area} ${safetyLevel}. `;

  if (riskData.topThreats.length > 0) {
    response += `Current disease concerns: ${riskData.topThreats.map(t => `${t.disease} (Risk: ${t.riskLevel})`).join(', ')}. `;
  }

  response += 'Please follow local health advisories and consult healthcare providers if you have concerns.';

  return {
    response,
    type: 'area_safety',
    riskData,
  };
}

/**
 * Handle spreading diseases query
 */
async function handleSpreadingDiseases(area) {
  if (!area) {
    return {
      response: 'Please share your area so I can tell you about diseases of concern there.',
      type: 'request_info',
    };
  }

  const activeAlerts = await Alert.find({ area, isActive: true }).limit(5);

  if (activeAlerts.length === 0) {
    return {
      response: `No active health alerts for ${area} currently. Continue monitoring local health updates.`,
      type: 'no_alerts',
    };
  }

  let response = `In ${area}, the following are under observation:\n\n`;
  activeAlerts.forEach(alert => {
    response += `• ${alert.disease}: ${alert.message.substring(0, 100)}...\n`;
  });

  response += '\n⚠️ This is community health information. Consult healthcare professionals for medical advice.';

  return {
    response,
    type: 'spreading_diseases',
    alerts: activeAlerts.map(a => ({ disease: a.disease, riskLevel: a.riskLevel })),
  };
}

/**
 * Handle precautions query
 */
async function handlePrecautions(disease = null) {
  const diseaseGuidance = {
    dengue: [
      '🦟 Use mosquito repellents (DEET-based)',
      '🏠 Clear stagnant water from containers',
      '🛌 Sleep under bed nets',
      '👕 Wear full coverage clothing during peak mosquito hours (dawn & dusk)',
    ],
    malaria: [
      '🏥 Sleep under insecticide-treated bed nets',
      '💊 Take prescribed malaria prophylaxis',
      '🕐 Avoid outdoor activities during dusk and dawn',
      '📋 Seek medical care immediately if you develop fever',
    ],
    'covid-19': [
      '💉 Get vaccinated and maintain booster doses',
      '🧼 Wash hands regularly with soap',
      '😷 Wear masks in crowded areas',
      '📏 Maintain physical distance when possible',
    ],
    measles: [
      '💉 Ensure MMR vaccination status',
      '🤝 Avoid contact with infected individuals',
      '😁 Practice respiratory hygiene',
      '📋 Seek immediate medical attention if symptoms appear',
    ],
    tuberculosis: [
      '🫁 Get TB screening if you have persistent cough',
      '😷 Use respiratory protection around infected people',
      '💊 Complete full TB treatment if prescribed',
      '🏥 Report any prolonged cough to a doctor',
    ],
  };

  const guidance = diseaseGuidance[disease?.toLowerCase()] || [
    '🏥 Consult healthcare provider if symptoms develop',
    '🧼 Practice good hand hygiene',
    '😷 Follow respiratory etiquette',
    '📋 Monitor your health regularly',
  ];

  let response = 'Key precautions to follow:\n\n';
  guidance.forEach(g => {
    response += `${g}\n`;
  });

  response += '\n⚠️ These are general health recommendations. Consult a doctor for personalized advice.';

  return {
    response,
    type: 'precautions',
    guidance,
  };
}

/**
 * Handle area risk query
 */
async function handleAreaRisk(area) {
  if (!area) {
    return {
      response: 'Please provide your area to check health risks.',
      type: 'request_info',
    };
  }

  const riskData = await getAreaAggregateRisk(area);

  if (!riskData) {
    return {
      response: `I don't have risk assessment data for ${area} yet.`,
      type: 'no_data',
    };
  }

  const riskPercentage = riskData.aggregateRiskScore;
  let riskDescription = '';

  if (riskPercentage < 40) {
    riskDescription = '✅ LOW RISK - Area appears healthy';
  } else if (riskPercentage < 70) {
    riskDescription = '⚠️ MEDIUM RISK - Monitor health situation';
  } else {
    riskDescription = '🔴 HIGH RISK - Caution recommended';
  }

  let response = `Risk Assessment for ${area}:\n\n`;
  response += `${riskDescription}\n`;
  response += `Risk Score: ${riskPercentage}/100\n`;

  if (riskData.topThreats.length > 0) {
    response += `\nTop Threats:\n`;
    riskData.topThreats.forEach(threat => {
      response += `• ${threat.disease} - ${threat.riskLevel.toUpperCase()}\n`;
    });
  }

  response += '\n📋 Consult local health authorities for the latest updates.';

  return {
    response,
    type: 'area_risk',
    riskScore: riskPercentage,
    riskLevel: riskData.aggregateRiskLevel,
  };
}

/**
 * POST /api/ai/chat
 * Health chatbot endpoint
 */
export async function POST(request) {
  try {
    await dbConnect();

    const auth = await getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get user's area
    const user = await User.findById(auth.userId);
    const userArea = user?.area;

    // Detect intent
    const intent = detectIntent(message);
    const extractedArea = extractArea(message, userArea);

    let chatResponse;

    switch (intent) {
      case INTENTS.AREA_SAFETY:
        chatResponse = await handleAreaSafety(extractedArea);
        break;
      case INTENTS.SPREADING_DISEASES:
        chatResponse = await handleSpreadingDiseases(extractedArea);
        break;
      case INTENTS.PRECAUTIONS:
        chatResponse = await handlePrecautions(extractArea(message));
        break;
      case INTENTS.AREA_RISK:
        chatResponse = await handleAreaRisk(extractedArea);
        break;
      case INTENTS.ALERTS:
        chatResponse = await handleSpreadingDiseases(extractedArea);
        break;
      default:
        chatResponse = {
          response:
            'I can help you with: "Is my area safe?", "What diseases are spreading?", "What precautions should I take?". Feel free to ask!',
          type: 'help',
        };
    }

    return NextResponse.json(
      {
        message: message,
        response: chatResponse.response,
        intent,
        type: chatResponse.type,
        disclaimer:
          '⚠️ This is community health information, NOT medical diagnosis or treatment advice. Please consult healthcare professionals.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Chatbot error:', error);
    return NextResponse.json(
      { error: 'Chatbot service error' },
      { status: 500 }
    );
  }
}
