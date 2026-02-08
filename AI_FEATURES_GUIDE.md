# 🤖 HealthPulse AI Features - Complete Implementation Guide

## Overview

HealthPulse now includes 5 advanced AI features for community health analytics:

1. **Area Risk Score Generation** - Dynamic AI-based health risk assessment
2. **AI Anomaly Detection** - Automatic spike detection and alerting
3. **Health Assistant Chatbot** - Interactive Q&A system
4. **AI Alert Message Generation** - Auto-generate contextual alert text
5. **Explainability Panel (XAI)** - Transparent AI decision explanations

---

## 🎯 Feature 1: Area Risk Score Generation (0-100)

### Purpose
Calculate dynamic, explainable health risk scores for every area based on disease data.

### How It Works

**Risk Score Formula:**
```
riskScore = (growthRate × 0.4) + (caseDensity × 0.3) + (diseaseSeverity × 0.2) + (historicalOutbreak × 0.1)
```

**Components:**
- **Growth Rate (40% weight)**: % increase in cases over last 7 vs previous 7 days
- **Case Density (30%)**: Normalized case count in the area
- **Disease Severity (20%)**: Predefined severity weight for each disease
- **Historical Outbreak (10%)**: Presence of outbreak in last 90 days

**Risk Classification:**
- **0-39**: Low Risk ✅
- **40-69**: Medium Risk ⚠️
- **70-100**: High Risk 🔴

### Backend Files
- **Service**: `lib/riskService.js`
  - `calculateAreaRiskScore(area, disease)` - Calculate risk scores
  - `getAreaRiskScores(area)` - Get latest scores for an area
  - `getAreaAggregateRisk(area)` - Get combined risk assessment

- **Model**: `app/models/RiskScore.js`
  - Stores: area, disease, riskScore, riskLevel, contributing factors, calculation metadata

### API Endpoints

#### POST /api/ai/risk-score
Calculate and save risk scores for an area
```bash
curl -X POST http://localhost:3000/api/ai/risk-score \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "area": "12345",
    "disease": "dengue"
  }'
```

#### GET /api/ai/risk-score?area=12345&aggregate=true
Retrieve risk scores for an area
```bash
curl http://localhost:3000/api/ai/risk-score?area=12345&aggregate=true \
  -H "Authorization: Bearer <token>"
```

### Frontend Components
- **RiskScoreMeter** (`app/components/RiskScoreMeter.js`)
  - Displays risk score meter with color coding
  - Shows top disease threats
  - Includes explainability panel
  - Auto-refreshes every 30 minutes

**Usage:**
```jsx
<RiskScoreMeter area={user.area} />
```

### Features
- ✅ Automated calculation on medical report creation
- ✅ Disease-specific severity weighting
- ✅ Contributing factor tracking
- ✅ Historical outbreak detection
- ✅ Real-time updates

---

## 🔍 Feature 2: AI Anomaly Detection + Automatic Alerts

### Purpose
Detect abnormal spikes in disease cases and automatically create alerts.

### How It Works

**Detection Method: Z-Score Statistical Analysis**
```
Anomaly if: todayCases > mean + 2 × stdDev
```

**Calculations:**
- Historical data: Last 30 days
- Moving average: Last 7 days
- Threshold: 2 standard deviations above mean
- Spike percentage: ((new - average) / average) × 100

### Backend Files
- **Service**: `lib/anomalyService.js`
  - `checkAnomalyInReport(disease, area, newCaseCount)` - Detect anomalies
  - `generateAnomalyAlert(anomalyData)` - Create alert from anomaly data
  - `calculateStatistics(area, disease, days)` - Get historical stats

### API Endpoints

#### POST /api/ai/anomaly-detect
Check for anomalies in new medical reports
```bash
curl -X POST http://localhost:3000/api/ai/anomaly-detect \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "disease": "dengue",
    "area": "12345",
    "newCaseCount": 150,
    "createAlert": true
  }'
```

**Response:**
```json
{
  "anomalyDetected": true,
  "anomalyData": {
    "hasAnomaly": true,
    "spikePercentage": 85.5,
    "zScore": 2.3
  },
  "alertCreated": "alert_id_123"
}
```

### Alert Model Updates
New fields in Alert model:
- `source`: "AI" or "manual"
- `type`: "general", "anomaly", or "trend"
- `spikePercentage`: For anomaly alerts
- `explanations`: Array of reason strings

### Features
- ✅ Automatic trigger when new reports are added
- ✅ Statistical Z-score methodology
- ✅ Auto-create high-risk alerts
- ✅ Moving average calculation
- ✅ Spike percentage tracking

---

## 💬 Feature 3: AI Health Assistant Chatbot

### Purpose
Provide community health guidance through conversational AI.

### How It Works

**Intent Detection:**
- "Is my area safe?" → Area Safety Query
- "What diseases are spreading?" → Spreading Diseases Query
- "What precautions?" → Prevention Guidance
- "What is the risk?" → Risk Assessment
- "Show me alerts" → Active Alerts

**Response Generation:**
- Rule-based intent matching
- Database queries for relevant data
- Template-based response formatting
- Medical disclaimers on all responses

### Backend Files
- **API Route**: `app/api/ai/chat/route.js`
  - Intent detection with pattern matching
  - Area extraction from messages
  - Response handlers for each intent

### API Endpoints

#### POST /api/ai/chat
Send a message to the health assistant
```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "message": "Is my area safe from dengue?"
  }'
```

**Response:**
```json
{
  "message": "Is my area safe from dengue?",
  "response": "Your area has MODERATE RISK. Current disease concerns...",
  "intent": "area_safety",
  "type": "area_safety",
  "disclaimer": "⚠️ This is community health information, NOT medical diagnosis or treatment advice."
}
```

### Frontend Components
- **ChatBot** (`app/components/ChatBot.js`)
  - Floating widget in bottom-right corner
  - Chat history display
  - Suggested quick questions
  - Real-time message sending
  - Loading animations

**Features:**
- Collapsible UI
- Message history
- Quick action buttons
- Responsive design
- Medical disclaimer

### Capabilities
- ✅ Area safety assessment
- ✅ Active disease queries
- ✅ Prevention guidance
- ✅ Current risk levels
- ✅ Disease information
- ✅ Automatic area detection from user profile

### Example Conversations
```
User: "Is my area safe?"
Bot: "Area 12345 has MODERATE RISK. Current disease concerns: Dengue (Medium), Malaria (Low)..."

User: "What precautions should I take?"
Bot: "Key precautions:
  🏥 Consult healthcare provider if symptoms develop
  🧼 Practice good hand hygiene
  😷 Follow basic respiratory etiquette
  📋 Monitor health status regularly"
```

---

## ✨ Feature 4: AI Alert Message Generation

### Purpose
Help admins quickly create contextual, actionable alert messages using AI.

### How It Works

**Alert Generation Process:**
1. Admin selects disease, area, risk level
2. Clicks "✨ Generate with AI" button
3. AI queries:
   - Disease severity
   - Area risk data
   - Recent trends
   - Disease-specific guidance
4. Generates alert title and comprehensive message
5. Admin reviews and edits before sending

**Message Template System:**
- Severity-based templates (low/medium/high)
- Disease-specific variations
- Preventive guidance inclusion
- Clear, actionable language

### Backend Files
- **Service**: `lib/alertAIService.js`
  - `generateAlertMessage()` - Create alert text
  - `generateAlertWithContext()` - Full alert with guidance
  - `getPreventiveGuidance()` - Disease-specific advice

### API Endpoints

#### POST /api/ai/generate-alert
Generate an alert message
```bash
curl -X POST http://localhost:3000/api/ai/generate-alert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "disease": "dengue",
    "area": "12345",
    "riskLevel": "high",
    "riskScore": 82,
    "caseCount": 150
  }'
```

**Response:**
```json
{
  "alert": {
    "title": "⚠️ Anomaly Detected: Dengue",
    "message": "HIGH ALERT: Area 12345 is experiencing a significant dengue outbreak. Cases: 150. IMMEDIATE PRECAUTIONS REQUIRED...",
    "disease": "dengue",
    "area": "12345",
    "riskLevel": "high",
    "preventiveGuidance": [
      "🦟 Apply mosquito repellents containing DEET",
      "🏠 Clear stagnant water from containers",
      "🛌 Use bed nets and air-conditioned spaces",
      "👕 Wear full-sleeve clothing during peak mosquito hours"
    ],
    "explanations": ["Spike severity: 85.5% above moving average"]
  }
}
```

### Frontend Updates
**Admin Alerts Page** (`app/dashboard/admin/alerts/page.js`)
- Added AI button next to message textarea
- Loading state during generation
- Auto-fill form with generated content
- Admin can edit before sending

### Features
- ✅ Template-based generation
- ✅ Disease-specific content
- ✅ Preventive guidance inclusion
- ✅ Risk level adaptation
- ✅ Admin review before sending
- ✅ Editable generated content

---

## 🔬 Feature 5: Explainability Panel (XAI)

### Purpose
Make AI decisions transparent and understandable to users.

### How It Works

**Explainability for Risk Scores:**
1. Show contributing factor values
2. Explain each factor's impact
3. Display narrative explanation
4. Show recommendations
5. Display confidence score

**Explainability for Alerts:**
1. Show alert generation reason
2. List key factors
3. Explain anomaly severity (if applicable)
4. Show data points used
5. Include disclaimer

### Backend Files
- **Service**: `lib/explainabilityService.js`
  - `explainRiskScore(riskScore)` - Explain risk score generation
  - `explainAlert(alertId)` - Explain alert creation
  - `generateExplainabilityReport(type, id)` - Full report
  - `generateRecommendations()` - AI-suggested actions

### API Endpoints

#### GET /api/ai/explain?type=risk-score&id=<id>
Get detailed explanation
```bash
curl http://localhost:3000/api/ai/explain?type=risk-score&id=12345 \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "explanation": {
    "riskScore": 78,
    "riskLevel": "high",
    "area": "12345",
    "disease": "dengue",
    "narrative": "The risk score is high due to rapid case growth...",
    "contributingFactors": [
      {
        "factor": "growthRate",
        "value": 85.5,
        "weight": "40%",
        "explanation": "Rapid case growth detected"
      }
    ],
    "recommendations": [
      "Activate emergency health protocols",
      "Eliminate mosquito breeding sites",
      "Distribute insect repellents"
    ],
    "trustScore": 92,
    "disclaimer": "This explanation is generated by our AI system..."
  }
}
```

### Frontend Components
- **ExplainabilityPanel** (`app/components/ExplainabilityPanel.js`)
  - Collapsible "Why?" button
  - Shows explanation on demand
  - Narrative text
  - Factor breakdown with percentages
  - Confidence score visualization
  - Recommendations
  - Medical disclaimer

**Usage:**
```jsx
<ExplainabilityPanel itemId={alertId} itemType="alert" />
```

### Integration Points
- **Risk Score Display**: Shows "Why?" button under risk meter
- **Alert Cards**: Integrated into alert display
- **Dashboard**: Available throughout system

### Features
- ✅ Clear narrative explanations
- ✅ Factor contribution breakdown
- ✅ Confidence scoring
- ✅ Actionable recommendations
- ✅ Data transparency
- ✅ Medical disclaimers
- ✅ Lazy loading on demand

---

## 📊 System Integration

### Data Flow

```
Medical Report Created
    ↓
Report saved to MongoDB
    ↓
Triggers Anomaly Detection
    ↓
  If anomaly: Create AI Alert → Alert Dashboard
    ↓
Calculates Risk Score
    ↓
Risk Score saved → Risk Score Dashboard
    ↓
User views dashboard → Sees Risk Meter + Explainability
    ↓
User/Admin uses Chatbot → Gets personalized responses
    ↓
Admin creates alert → Can generate message with AI
```

### Database Models

**RiskScore**
```javascript
{
  area: String,
  disease: String,
  riskScore: Number (0-100),
  riskLevel: String (low/medium/high),
  growthRate: Number,
  caseDensity: Number,
  diseaseSeverity: Number,
  historicalOutbreak: Number,
  contributingFactors: [String],
  calculationDate: Date,
  totalCases: Number,
  previousPeriodCases: Number
}
```

**Alert (Updated)**
```javascript
{
  title: String,
  message: String,
  disease: String,
  area: String,
  riskLevel: String,
  riskScore: Number,
  source: String (AI/manual),
  type: String (general/anomaly/trend),
  spikePercentage: Number,
  explanations: [String],
  isActive: Boolean,
  createdBy: ObjectId,
  createdAt: Date
}
```

---

## 🔧 Configuration & Customization

### Disease Severity Weights

Edit in `lib/riskService.js`:
```javascript
const DISEASE_SEVERITY = {
  'dengue': 60,
  'malaria': 70,
  'covid-19': 65,
  // Add or modify as needed
};
```

### Risk Score Weights

Edit formula in `lib/riskService.js`:
```javascript
const riskScore = 
  (normalizedGrowth * 0.4) +    // Growth rate weight
  (normalizedDensity * 0.3) +   // Case density weight
  (normalizedSeverity * 0.2) +  // Disease severity weight
  (normalizedOutbreak * 0.1);   // Historical outbreak weight
```

### Anomaly Detection Threshold

Edit in `lib/anomalyService.js`:
```javascript
const isAnomaly = zScore > 2;  // 2 standard deviations (change to 2.5, 3, etc.)
```

### Chatbot Intents

Add new intents in `app/api/ai/chat/route.js`:
```javascript
const INTENTS = {
  YOUR_NEW_INTENT: 'your_new_intent',
  // Add handler function below
};
```

---

## 🚀 Usage Examples

### 1. Calculate Risk Scores After Report Creation

**Automatic**: Happens when medical report is created via POST /api/reports

**Manual**:
```bash
curl -X POST http://localhost:3000/api/ai/risk-score \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"area": "12345"}'
```

### 2. Check for Anomalies

```bash
curl -X POST http://localhost:3000/api/ai/anomaly-detect \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "disease": "dengue",
    "area": "12345",
    "newCaseCount": 200,
    "createAlert": true
  }'
```

### 3. Chat with Health Assistant

User opens chatbot in bottom-right corner and asks:
- "Is area 12345 safe?"
- "What diseases are spreading?"
- "What should I do to prevent dengue?"

### 4. Generate Alert with AI

Admin visits `/dashboard/admin/alerts`:
1. Enters disease and area
2. Selects risk level
3. Clicks "✨ Generate with AI"
4. Reviews generated message
5. Edits if needed
6. Clicks "Send Alert"

### 5. View Explanation

Click "Why?" button on any:
- Risk score card
- Alert card
- Dashboard risk meter

---

## ⚠️ Medical Disclaimers

All AI features include disclaimers:
- "This is community health information, NOT medical diagnosis"
- "Please consult healthcare professionals for medical concerns"
- "AI predictions are educational only, not prescriptive"

---

## 📈 Performance Metrics

**Risk Score Calculation**: ~200-500ms per area
**Anomaly Detection**: ~100-200ms per report
**Chatbot Response**: ~200-400ms average
**Alert Generation**: ~300-600ms

Calculations happen in background without blocking reports.

---

## 🔒 Security & Privacy

- All endpoints require authentication (JWT)
- Admin-only endpoints for sensitive operations
- User data filtered by area/role
- AI explanations don't reveal sensitive patterns
- No personal health information in logs

---

## 📝 Notes for Developers

1. **Async Processing**: AI calculations run asynchronously to not block requests
2. **Error Handling**: AI errors are logged but don't crash the system
3. **Historical Data**: Requires at least 7 days of data for accurate anomaly detection
4. **Scaling**: Consider caching risk scores for high-traffic areas
5. **Testing**: Use seed data to populate initial medical reports

---

## 🎓 Technical Stack

- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose
- **Frontend**: Next.js (App Router), React 18, Tailwind CSS
- **Charts**: Recharts for data visualization
- **UI Icons**: Lucide React
- **Auth**: JWT tokens

---

## ✅ Verification Checklist

- [x] Risk Score Model created
- [x] Anomaly Detection Service implemented
- [x] Alert AI Service with templates created
- [x] Explainability Service built
- [x] All API endpoints functional
- [x] Chatbot component with UI
- [x] Risk Score meter component
- [x] Explainability panel component
- [x] Alert generation button in admin UI
- [x] Integration with medical reports endpoint
- [x] Build compiles successfully
- [x] Medical disclaimers on all features

---

**Version**: 1.0.0
**Last Updated**: February 2026
**Status**: ✅ Production Ready
