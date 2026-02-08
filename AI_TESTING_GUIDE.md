# 🚀 HealthPulse AI Features - Quick Start Testing Guide

## Prerequisites
- Node.js 18+
- MongoDB connection (DATABASE_URL in .env.local)
- JWT_SECRET configured
- Project built successfully: `npm run build`

## 🎬 Quick Start

### 1. Start the Development Server
```bash
npm run dev
```
Access at: `http://localhost:3000`

### 2. Login/Create Account

**Test User Account:**
- Email: `user@example.com`
- Password: `password123`
- Area: `12345`
- Role: User

**Test Admin Account:**
- Email: `admin@example.com`
- Password: `admin123`
- Area: `12345`
- Role: Admin

Or create your own accounts via the signup page.

---

## 🧪 Testing Each Feature

### Feature 1️⃣: Risk Score Generation

#### Step 1: Create Medical Reports (as Admin)
1. Login as admin
2. Go to `/dashboard/admin/reports`
3. Create multiple reports for the same disease/area:
   - Disease: `dengue`
   - Area: `12345`
   - Case Count: 50 (first day)
   - Case Count: 60 (second day) - observe growth

#### Step 2: View Risk Scores
1. Login as regular user in area `12345`
2. Go to `/dashboard/user`
3. **See the Risk Score Meter** at the top
   - Shows current risk level (Low/Medium/High)
   - Progress bar from 0-100
   - Top disease threats listed
   - Click "Why?" to see explainability

#### Step 3: Check via API
```bash
# Get risk scores for an area
curl -X GET "http://localhost:3000/api/ai/risk-score?area=12345&aggregate=true" \
  -H "Authorization: Bearer <your_token>"
```

---

### Feature 2️⃣: Anomaly Detection

#### Step 1: Create Spike Scenario
1. Create initial reports with consistent case counts (~20 per day)
2. Then create a report with significantly higher cases (~100+)
3. This should trigger anomaly detection

#### Step 2: Check Alerts Generated Automatically
1. After creating the spike report, go to `/dashboard/admin/alerts`
2. **Look for auto-generated alert** with:
   - Title containing "Anomaly Detected"
   - Badge showing "🤖 AI Generated"
   - Badge showing "ANOMALY" type
   - Spike percentage in explanation

#### Step 3: Via API
```bash
# Manually check for anomaly
curl -X POST "http://localhost:3000/api/ai/anomaly-detect" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "disease": "dengue",
    "area": "12345",
    "newCaseCount": 150,
    "createAlert": true
  }'
```

---

### Feature 3️⃣: Health Assistant Chatbot

#### Step 1: Access Chatbot
1. Login as any user
2. Look at **bottom-right corner** of screen
3. Click floating **blue chat bubble** (💬)

#### Step 2: Try These Questions
```
1. "Is my area safe?"
   Expected: Risk assessment for your area

2. "What diseases are spreading?"
   Expected: List of active alerts and diseases

3. "What precautions should I take?"
   Expected: General and disease-specific guidance

4. "What is the risk level?"
   Expected: Risk score and threat information

5. Or use quick buttons: Click suggested questions
```

#### Step 3: Observe Features
- ✅ Floating widget opens/closes
- ✅ Chat history persists
- ✅ Suggested quick questions appear
- ✅ Auto-detection of your area
- ✅ Medical disclaimer shown
- ✅ Responses are contextual

---

### Feature 4️⃣: AI Alert Generation

#### Step 1: Go to Alert Creation
1. Login as admin
2. Navigate to `/dashboard/admin/alerts`
3. Scroll to **"Create New Alert"** section

#### Step 2: Use AI Generator
```
1. Fill in: Disease (e.g., "dengue")
2. Fill in: Area (e.g., "12345")
3. Select: Risk Level (e.g., "high")
4. Click: ✨ "Generate with AI" button
5. Wait for response (1-2 seconds)
6. See pre-filled message in textarea
7. **Optional**: Edit message
8. Click: "Send Alert" to publish
```

#### Step 3: Admire Generated Content
The AI generates:
- Appropriate alert title
- Contextual message
- Risk-level adapted content
- Disease-specific guidance
- Preventive measures
- Medical disclaimer

#### Step 4: Via API
```bash
curl -X POST "http://localhost:3000/api/ai/generate-alert" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "disease": "dengue",
    "area": "12345",
    "riskLevel": "high",
    "riskScore": 85,
    "caseCount": 150
  }'
```

---

### Feature 5️⃣: Explainability Panel

#### Step 1: View Risk Score Explanation
1. Login as user in area with created reports
2. Go to `/dashboard/user`
3. Look at **Risk Score Meter** section
4. Click blue **"Why?"** link at bottom
5. Expand to see:
   - Narrative explanation
   - Factor contribution breakdown
   - Confidence score
   - Recommendations

#### Step 2: View Alert Explanation
1. Go to any alerts page with AI-generated alerts
2. In alert card, click **"Why?"** or **"Show Explanation"**
3. See detailed breakdown:
   - When alert was created
   - Why it was triggered
   - Key factors considered
   - Anomaly details (if anomaly type)
   - Recommended actions

#### Step 3: Full Explainability Report via API
```bash
# Explain a risk score
curl "http://localhost:3000/api/ai/explain?type=risk-score&id=<risk_score_id>" \
  -H "Authorization: Bearer <token>"

# Explain an alert
curl "http://localhost:3000/api/ai/explain?type=alert&id=<alert_id>" \
  -H "Authorization: Bearer <token>"
```

---

## 🔌 Complete Testing Workflow

### Scenario: Hospital Reports Dengue Surge

**Step 1: Admin Creates Report**
```bash
POST /api/reports
{
  "disease": "dengue",
  "area": "65432",
  "caseCount": 200  # Much higher than historical average
}
```

**Expected Automatic Actions:**
- ✅ Anomaly detection triggered
- ✅ AI-generated alert created with type="anomaly"
- ✅ Risk score calculated/updated
- ✅ Stored in database

**Step 2: User Checks Dashboard**
- User in area 65432 logs in
- Sees risk score: **82/100 (HIGH)**
- Sees top threat: Dengue (High)
- Clicks "Why?" to see explanation:
  - "Cases increased by 85% in last 7 days"
  - "High disease severity detected"
  - Recommendations listed

**Step 3: User Asks Chatbot**
```
User: "What's happening with dengue in my area?"
Bot: "In 65432, the following are under observation:
  • Dengue: HIGH risk alert issued due to case surge"
```

**Step 4: Admin Creates Additional Alert**
- Goes to alert creation
- Enters: disease="dengue", area="65432", riskLevel="high"
- Clicks "✨ Generate with AI"
- Gets auto-generated message with:
  - Clear alert title
  - Actionable guidance
  - Preventive measures
  - Context about risk level
- Reviews and sends

**Step 5: Admin Can View Explanation**
- Clicks "Why?" on the alert
- Sees:
  - Alert creation reason
  - Data points used
  - Spike percentage if anomaly
  - Trust score (e.g., 92%)
  - Recommended actions

---

## 📊 Sample Test Data

Create realistic test scenarios:

### Scenario 1: Steady Disease (Baseline)
```javascript
// Day 1-7: Consistent cases (5 per day)
{disease: "dengue", area: "11111", caseCount: 5}
```
**Expected Result**: Risk = Low (0-30)

### Scenario 2: Growing Trend
```javascript
// Day 1-7: 5, 8, 12, 18, 25, 35, 48
// Exponential growth pattern
```
**Expected Result**: Risk = Medium-High (60-85)

### Scenario 3: Spike (Anomaly)
```javascript
// Day 1-6: 10 per day average
// Day 7: 95 suddenly
```
**Expected Result**: 
- Risk = High
- Anomaly detected
- Auto-alert created
- Spike percentage > 80%

### Scenario 4: Seasonal Pattern
```javascript
// Create reports spanning 90+ days with seasonal ups/downs
// Historical outbreak detection activates
```
**Expected Result**: Higher base risk due to outbreak history

---

## 🔍 Debugging Tips

### Check if services are working:

**1. Risk Score Service**
```bash
# Check if risk scores are being saved
curl "http://localhost:3000/api/ai/risk-score?area=12345&aggregate=true"
# Should return data if reports exist
```

**2. Anomaly Service**
```bash
# Test anomaly with sample data
curl -X POST "http://localhost:3000/api/ai/anomaly-detect" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"disease":"dengue","area":"test","newCaseCount":500,"createAlert":true}'
```

**3. Chatbot**
```bash
# Check if chat endpoint is responding
curl -X POST "http://localhost:3000/api/ai/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"message":"Is my area safe?"}'
```

**4. Server Logs**
Check terminal for errors:
```
AI processing error:
Anomaly detection error:
Chat error:
```

---

## 🧠 Understanding Results

### Risk Score Interpretation
- **0-39 (Low)**: Continue routine monitoring
- **40-69 (Medium)**: Increase awareness, follow advisories
- **70-100 (High)**: Activate protocols, consult health authorities

### Anomaly Detection Interpretation
- **Z-Score 2-2.5**: Significant spike, worth monitoring
- **Z-Score 2.5+**: Major outbreak, alert warranted
- **Spike% > 50%**: Consider immediate action

### Chatbot Intent Detection
- Works best with clear questions
- Area detection: Uses user's registered area
- Fallback: Asks user for area if needed

---

## ✅ Verification Checklist

After testing, verify:

- [ ] Risk score appears on user dashboard
- [ ] Meter shows correct color (green/yellow/red)
- [ ] Clicking "Why?" reveals explanation
- [ ] Chatbot opens with floating button
- [ ] Chatbot responds to questions
- [ ] Anomalies trigger auto-alerts
- [ ] AI alerts have special badges
- [ ] Admin "Generate with AI" button works
- [ ] Generated alerts are contextual
- [ ] Alert explanations show "Why?"
- [ ] All endpoints return valid JSON
- [ ] Medical disclaimers present everywhere

---

## 🆘 Troubleshooting

### "Permission denied" on APIs
- ✅ Ensure you're authenticated (JWT token in Authorization header)
- ✅ Use admin token for admin endpoints
- ✅ Check user role (admin for alert creation)

### "No data available" on Risk Score
- ✅ Create at least 1 medical report in that area first
- ✅ Wait for automatic calculation (happens on report creation)
- ✅ Or manually POST to `/api/ai/risk-score`

### Chatbot not responding
- ✅ Check browser console for JS errors
- ✅ Ensure user is logged in
- ✅ Check network tab for API responses
- ✅ Verify `/api/ai/chat` returns 200 status

### Alerts not auto-generating
- ✅ Report must have significantly higher case count
- ✅ Requires historical data (7+ days) for baseline
- ✅ Check server logs for anomaly detection errors

### Build fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

---

## 📚 Additional Resources

- **AI Features Guide**: Read `AI_FEATURES_GUIDE.md`
- **API Documentation**: See code comments in `/app/api/ai/`
- **Service Docs**: Check comments in `/lib/` services
- **Component Docs**: JSDoc comments in components

---

## 🎯 Next Steps

After testing:
1. Customize disease severity weights for your region
2. Adjust anomaly detection thresholds if needed
3. Fine-tune chatbot intents for local diseases
4. Populate with real medical data
5. Train admin users on features
6. Monitor AI performance and accuracy

---

**Happy Testing! 🎉**

For issues or questions, check the code comments and the comprehensive `AI_FEATURES_GUIDE.md`.
