# 🚀 Quick Start Reference

## ⚡ 30-Second Setup

```bash
# 1. Install
npm install

# 2. Configure
# Create .env.local with:
# MONGODB_URI=mongodb://localhost:27017/health-analytics
# JWT_SECRET=your-secret-key

# 3. Start MongoDB
mongod

# 4. Run
npm run dev

# 5. Seed Data
npm run seed
```

Visit: **http://localhost:3000**

---

## 👤 Test Accounts

| Role  | Email                 | Password | Area     |
|-------|----------------------|----------|----------|
| Admin | admin@example.com    | admin123 | Downtown |
| User  | user@example.com     | user123  | Westside |

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `app/api/` | API endpoints |
| `app/dashboard/` | Dashboard pages |
| `app/components/` | Reusable components |
| `lib/analytics.js` | Business logic |
| `lib/seed.js` | Sample data |
| `.env.local` | Environment config |

---

## 🔗 Important URLs

| Page | URL |
|------|-----|
| Home | `/` |
| Login | `/login` |
| Signup | `/signup` |
| Admin Dashboard | `/dashboard/admin` |
| User Dashboard | `/dashboard/user` |
| Reports | `/dashboard/admin/reports` |
| Trends | `/dashboard/admin/trends` |
| Alerts (Admin) | `/dashboard/admin/alerts` |
| Alerts (User) | `/dashboard/user/alerts` |

---

## 🔌 API Quick Reference

```
Auth:
  POST /api/auth/signup
  POST /api/auth/login
  POST /api/auth/logout

Reports:
  POST /api/reports (Admin)
  GET /api/reports

Analytics:
  GET /api/analysis/overview
  GET /api/analysis/trends

Alerts:
  POST /api/alerts (Admin)
  GET /api/alerts
  PATCH /api/alerts/[id] (Admin)
  DELETE /api/alerts/[id] (Admin)
```

---

## 🎯 Admin Workflow

1. Login as admin
2. Go to Medical Reports
3. Add new reports
4. Check Dashboard for stats
5. View Trends
6. Create Alerts for high-risk areas
7. Manage existing alerts

---

## 🎯 User Workflow

1. Sign up with area
2. Login to dashboard
3. View area health stats
4. Check personal alerts
5. Read health tips
6. View area health info

---

## 🛠️ Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server
npm run seed             # Populate sample data
npm run lint             # Check code quality
```

---

## 📊 Sample Data Included

✅ COVID-19 cases (multiple areas)
✅ Influenza cases
✅ Dengue cases
✅ Malaria cases
✅ 30+ medical records
✅ Historical data for trends

---

## 🔑 Features at a Glance

### Admin Dashboard
- 📊 Real-time statistics
- 📝 Report management
- 📈 Trend analysis
- 🚨 Alert management
- 🔴 High-risk detection

### User Dashboard
- 📊 Area statistics
- 🚨 Personal alerts
- ❤️ Health tips
- 📍 Local trends

---

## ✅ Verification

```bash
# Check if running
curl http://localhost:3000

# Check MongoDB
mongosh

# Check environment
cat .env.local
```

---

## 🚀 Deploy to Production

### Vercel
```bash
git push origin main
# Add env vars in Vercel dashboard
```

### Heroku
```bash
heroku create app-name
heroku config:set MONGODB_URI=your_uri
heroku config:set JWT_SECRET=your_secret
git push heroku main
```

---

## 🐛 Quick Fixes

| Issue | Solution |
|-------|----------|
| Port in use | `npm run dev -- -p 3001` |
| MongoDB error | Ensure mongod is running |
| npm install fails | `rm -rf node_modules && npm install` |
| Stale cache | Clear `.next` folder |

---

## 📞 Support Resources

- Check browser console for errors
- Review server logs: `npm run dev`
- Check MongoDB logs
- Read COMPLETE_PROJECT_SUMMARY.md
- Review README.md

---

**Status**: ✅ Ready to Use
**Last Updated**: February 2, 2026
