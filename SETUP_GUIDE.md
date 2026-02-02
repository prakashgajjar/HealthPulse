# SETUP GUIDE - Health Analytics System

## Quick Start (5 Minutes)

### 1. Prerequisites Check
```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be v9.0.0 or higher
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start MongoDB
**Windows:**
```bash
mongod
```

**macOS with Homebrew:**
```bash
brew services start mongodb-community
```

**Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Seed Database
```bash
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```

### 6. Access Application
- Frontend: http://localhost:3000
- Admin: admin@health.com / password123
- User: user@health.com / password123

---

## Detailed Setup Instructions

### Step 1: Clone Repository
```bash
cd /path/to/project
npm install
```

### Step 2: Configure Database

**Option A: MongoDB Local**
1. Install MongoDB from https://docs.mongodb.com/manual/installation/
2. Start MongoDB service
3. Verify connection:
   ```bash
   mongo
   ```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get connection string
5. Update `.env.local`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/health-analytics
   ```

### Step 3: Environment Setup
Create `.env.local` with:
```env
MONGODB_URI=mongodb://localhost:27017/health-analytics
JWT_SECRET=change-this-to-a-secure-random-string-in-production
NODE_ENV=development
```

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Seed Data
```bash
npm run seed
```

Expected output:
```
✓ MongoDB connected
Clearing database...
✓ Database cleared
Seeding users...
✓ Created 4 users
Seeding medical reports...
✓ Created 930 medical reports
Seeding alerts...
✓ Created 5 alerts

✓ Database seeding completed successfully!

Test Credentials:
Admin: admin@health.com / password123
User: user@health.com / password123
```

### Step 5: Start Development Server
```bash
npm run dev
```

Open browser: http://localhost:3000

---

## User Roles & Permissions

### Admin Role (admin@health.com)
Access:
- ✓ Dashboard Overview
- ✓ Medical Reports Management
- ✓ Trend Analysis
- ✓ Alert Management
- ✓ View all areas' data
- ✓ Create/Edit/Delete reports and alerts

### User Role (user@health.com)
Access:
- ✓ Personal Dashboard
- ✓ Area-specific health data
- ✓ My Alerts (for their area only)
- ✓ Health Information
- ✓ Cannot add reports or create alerts

---

## File Structure Overview

```
app/
├── api/                           # API Routes
│   ├── auth/
│   │   ├── signup/route.js       # Register endpoint
│   │   ├── login/route.js        # Login endpoint
│   │   └── logout/route.js       # Logout endpoint
│   ├── reports/
│   │   └── route.js              # Reports CRUD
│   ├── analysis/
│   │   ├── overview/route.js     # Dashboard data
│   │   └── trends/route.js       # Trend analysis
│   └── alerts/
│       ├── route.js              # Alerts CRUD
│       └── [id]/route.js         # Update/delete alerts
├── components/                    # Reusable UI components
│   ├── Navbar.js
│   ├── Sidebar.js
│   ├── Cards.js
│   ├── Charts.js
│   └── ProtectedRoute.js
├── context/                       # React Context
│   └── AuthContext.js
├── dashboard/                     # Dashboard pages
│   ├── admin/
│   │   ├── page.js              # Admin overview
│   │   ├── reports/page.js      # Reports management
│   │   ├── trends/page.js       # Trends analysis
│   │   └── alerts/page.js       # Alerts management
│   └── user/
│       ├── page.js              # User dashboard
│       ├── alerts/page.js       # User alerts
│       └── health-info/page.js  # Health information
├── models/                        # MongoDB schemas
│   ├── User.js
│   ├── MedicalReport.js
│   └── Alert.js
├── login/
├── signup/
├── page.js                       # Home page
├── layout.js                     # Root layout
└── globals.css                   # Global styles

lib/
├── mongodb.js                    # DB connection
├── auth.js                       # JWT utilities
├── middleware.js                 # Auth middleware
├── analytics.js                  # Analytics functions
├── password.js                   # Password utilities
└── seed.js                       # Database seeding
```

---

## Core Analytics Logic

### Risk Level Detection
```javascript
// In lib/analytics.js

function detectHighRiskAreas(todayReports, last7DaysReports, threshold = 1.5) {
  // Calculate 7-day average for each area
  // Compare today's cases with average
  // If today > average * 2: HIGH RISK
  // If today > average * 1.5: MEDIUM RISK
  // Otherwise: LOW RISK
}
```

### Alert Flow
1. Admin creates alert with area and risk level
2. Alert stored in MongoDB
3. Users retrieve alerts via API (filtered by their area)
4. Alerts displayed in user dashboard
5. Admin can deactivate/delete alerts

### Report Processing
1. Admin submits medical report (disease, area, count, date)
2. System stores report in database
3. Analysis endpoints aggregate reports
4. Risk levels calculated based on trends
5. Trending diseases extracted
6. Data returned to dashboards

---

## Testing Flows

### Test Flow 1: Admin Creates Alert
1. Login as admin@health.com
2. Go to "Alerts" page
3. Fill form:
   - Title: "Test Alert"
   - Disease: "COVID-19"
   - Area: "North Delhi"
   - Risk: "High"
   - Message: "Test message"
4. Click "Send Alert"
5. Alert appears in alert list

### Test Flow 2: User Receives Alert
1. Logout from admin
2. Login as user@health.com (Area: North Delhi)
3. Go to "My Alerts"
4. Alert created by admin appears (because area matches)
5. Only alerts for "North Delhi" show up

### Test Flow 3: Admin Adds Report
1. Login as admin
2. Go to "Medical Reports"
3. Fill:
   - Disease: "Malaria"
   - Area: "North Delhi"
   - Cases: 15
4. Click "Create Report"
5. Go to "Dashboard" or "Trends"
6. See updated case counts

### Test Flow 4: Trend Analysis
1. Login as admin
2. Go to "Trends"
3. Select time period (7, 14, 30, 90 days)
4. View line chart of cases over time
5. View bar chart of top 10 diseases

---

## API Testing with cURL

### Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "area": "Test Area",
    "role": "user"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@health.com",
    "password": "password123"
  }'
```

### Get Reports (requires auth header or cookie)
```bash
curl -X GET http://localhost:3000/api/reports?days=7 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Report (Admin only)
```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "disease": "Dengue",
    "area": "North Delhi",
    "caseCount": 25,
    "reportDate": "2024-02-01"
  }'
```

### Get Analysis Overview
```bash
curl -X GET http://localhost:3000/api/analysis/overview \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Troubleshooting

### Issue: MongoDB Connection Refused
**Solution:**
```bash
# Check if MongoDB is running
netstat -an | grep 27017

# Start MongoDB
mongod

# Or with Docker
docker start mongodb
```

### Issue: Seed Script Fails
**Solution:**
```bash
# Ensure MongoDB is running
# Clear any existing data
mongo
> db.dropDatabase()

# Run seed again
npm run seed
```

### Issue: "Cannot find module"
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue: Port 3000 Already in Use
**Solution:**
```bash
# Linux/macOS
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
npm run dev -- -p 3001
```

### Issue: JWT Token Invalid
**Solution:**
- Clear browser cookies
- Clear `.env.local` and reset JWT_SECRET
- Re-login
- Check that JWT_SECRET matches in .env.local

### Issue: CSS Styles Not Loading
**Solution:**
```bash
# Rebuild Tailwind
npm install
npm run build

# Or in dev mode
npm run dev
```

---

## Production Deployment

### Build Production
```bash
npm run build
npm start
```

### Vercel Deployment
```bash
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Strong random secret

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t health-analytics .
docker run -p 3000:3000 -e MONGODB_URI=... -e JWT_SECRET=... health-analytics
```

---

## Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use strong MongoDB passwords
- [ ] Enable HTTPS only
- [ ] Use MongoDB Atlas with IP whitelisting
- [ ] Set up environment variables on hosting platform
- [ ] Enable CORS only for your domain
- [ ] Use secure cookies (httpOnly, secure, sameSite)
- [ ] Regular security updates (`npm audit`)
- [ ] Implement rate limiting
- [ ] Add logging and monitoring
- [ ] Regular backups of MongoDB

---

## Performance Optimization

1. **Database Indexing**: Already implemented on critical fields
2. **Pagination**: Implemented on alerts endpoint
3. **Caching**: Can add Redis for frequently accessed data
4. **Code Splitting**: Next.js handles automatically
5. **Image Optimization**: Use Next.js Image component
6. **Lazy Loading**: Implement for dashboard components

---

## Support & Resources

- Next.js Docs: https://nextjs.org/docs
- MongoDB Docs: https://docs.mongodb.com
- Mongoose Docs: https://mongoosejs.com
- Tailwind CSS: https://tailwindcss.com
- Recharts: https://recharts.org

---

## Quick Reference Commands

```bash
# Development
npm install              # Install dependencies
npm run dev             # Start dev server
npm run build           # Build for production
npm start               # Start production server
npm run seed            # Seed database
npm run lint            # Run linter

# Database
npm run seed            # Populate with sample data
npm run seed:reset      # Reset and reseed

# Deployment
vercel                  # Deploy to Vercel
npm run build           # Build for production
```

---

Generated: 2024
Version: 1.0.0
