# Health Analytics System - Digital Health Management

A production-ready web application for analyzing medical reporting data and visualizing community health trends through dashboards and alerts.

## 🌟 Features

### For All Users
- **User Authentication**: Secure JWT-based login and signup
- **Area-Specific Dashboard**: View health metrics for your region
- **Real-Time Alerts**: Receive health alerts relevant to your area
- **Health Information**: Access preventive health tips and guidance

### For Regular Users
- Dashboard with area-specific health statistics
- View cases today, this week, and this month
- Receive targeted alerts for their area
- Access health tips and emergency contacts
- View disease trends in their area

### For Administrators
- Complete medical report management
- Advanced analytics and trend analysis
- High-risk area detection
- Alert generation and management
- System-wide health monitoring
- 7-day average comparison analysis

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: JavaScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Charts**: Recharts
- **State Management**: React Context API
- **Password Hashing**: bcryptjs

## 📋 Prerequisites

- Node.js 18.0+
- MongoDB 4.0+ (Local or Atlas)
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone and Install Dependencies

```bash
cd health-analytics-system
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
DATABASE_URL=mongodb://localhost:27017/health-analytics
# Or MongoDB Atlas:
# DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/health-analytics

JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

### 3. Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service (Windows)
mongod

# Or on macOS with Homebrew
brew services start mongodb-community
```

**Option B: MongoDB Atlas (Cloud)**
- Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster and get your connection string
- Update `.env.local` with your connection string

### 4. Seed Sample Data

```bash
npm run seed
```

This creates:
- Demo admin account: `admin@health.com` / `password123`
- Demo user accounts with sample data
- 30 days of medical reports
- Sample alerts across different areas

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📱 Default Test Credentials

### Admin Access
- Email: `admin@health.com`
- Password: `password123`
- Area: Central

### User Access
- Email: `user@health.com`
- Password: `password123`
- Area: North Delhi

## 📁 Project Structure

```
health-analytics-system/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── reports/           # Medical reports endpoints
│   │   ├── analysis/          # Analysis endpoints
│   │   └── alerts/            # Alerts endpoints
│   ├── components/            # Reusable components
│   ├── context/               # React Context
│   ├── dashboard/             # Dashboard pages
│   │   ├── admin/            # Admin dashboard
│   │   └── user/             # User dashboard
│   ├── models/                # MongoDB models
│   ├── globals.css            # Global styles
│   ├── layout.js              # Root layout
│   ├── page.js                # Home page
│   ├── login/
│   └── signup/
├── lib/
│   ├── mongodb.js             # MongoDB connection
│   ├── auth.js                # JWT utilities
│   ├── middleware.js          # Auth middleware
│   ├── analytics.js           # Analytics functions
│   ├── password.js            # Password utilities
│   └── seed.js                # Database seeding
├── .env.example               # Environment template
├── .env.local                 # Local environment (not in git)
├── next.config.js             # Next.js config
├── tailwind.config.js         # Tailwind config
├── postcss.config.js          # PostCSS config
└── package.json               # Dependencies
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Medical Reports
- `POST /api/reports` - Create report (Admin only)
- `GET /api/reports` - Get reports with filters

### Analysis
- `GET /api/analysis/overview` - Dashboard overview
- `GET /api/analysis/trends` - Trend data for charts

### Alerts
- `POST /api/alerts` - Create alert (Admin only)
- `GET /api/alerts` - Get alerts for user
- `PATCH /api/alerts/[id]` - Update alert (Admin only)
- `DELETE /api/alerts/[id]` - Delete alert (Admin only)

## 🎯 Key Features Explained

### Risk Level Detection
The system automatically analyzes trends:
- **HIGH RISK**: Today's cases > 7-day average × 2
- **MEDIUM RISK**: Today's cases > 7-day average × 1.5
- **LOW RISK**: Normal case counts

### Alert System
- Admin creates area-specific alerts
- System filters alerts by user's area
- Alerts display in user dashboard
- Admin can manage alert status

### Analytics
- 7-day moving average calculation
- Daily trend analysis
- Disease distribution analysis
- Area-wise case monitoring
- Percentage change tracking

## 📊 Dashboard Pages

### Admin Dashboard
- **Overview**: Key statistics and high-risk areas
- **Medical Reports**: Add and manage reports
- **Trends**: Visualize case trends with charts
- **Alerts**: Create and manage alerts

### User Dashboard
- **Dashboard**: Area health statistics
- **My Alerts**: View alerts for their area
- **Area Health**: Disease information and health tips

## 🔄 Authentication Flow

1. User signs up or logs in
2. Server verifies credentials
3. JWT token generated and set in HTTP-only cookie
4. Token used for subsequent API requests
5. Middleware verifies token on protected routes
6. User role determines accessible features

## 🧪 Testing

### Test User Flows

1. **Sign Up Flow**
   - Navigate to `/signup`
   - Fill form with name, email, password, area
   - Click "Sign Up"
   - Redirected to login

2. **Admin Flow**
   - Login with admin credentials
   - Access admin dashboard
   - Add medical reports
   - View trends and create alerts

3. **User Flow**
   - Login with user credentials
   - View area dashboard
   - Check alerts for your area
   - Read health information

## 📈 Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Setup
- Change `JWT_SECRET` to a strong random key
- Use MongoDB Atlas for production database
- Set `NODE_ENV=production`
- Enable HTTPS
- Use proper error logging

### Deployment Options
- **Vercel**: Direct Next.js deployment
- **Heroku**: Node.js hosting
- **AWS**: EC2 or Elastic Beanstalk
- **Docker**: Containerize application

### Docker Setup

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token-based authentication
- ✅ HTTP-only cookies
- ✅ Input validation
- ✅ SQL injection prevention (MongoDB queries)
- ✅ Role-based access control
- ✅ Protected API routes
- ✅ CORS protection

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Solution: Ensure MongoDB is running and DATABASE_URL is correct
```

### Seed Script Error
```
Solution: Make sure MongoDB is running before executing seed script
npm run seed
```

### CSS Not Loading
```
Solution: Rebuild Tailwind CSS
npm install
npm run dev
```

### Authentication Issues
```
Solution: Clear cookies and try login again
Check .env.local for correct JWT_SECRET
```

## 📝 Database Schemas

### User
- name: String
- email: String (unique)
- password: String (hashed)
- role: String (user/admin)
- area: String
- createdAt: Date

### MedicalReport
- disease: String
- area: String
- caseCount: Number
- reportDate: Date
- createdAt: Date

### Alert
- title: String
- message: String
- disease: String
- area: String
- riskLevel: String (low/medium/high)
- isActive: Boolean
- createdBy: ObjectId (User reference)
- createdAt: Date

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Mongoose](https://mongoosejs.com)
- [Tailwind CSS](https://tailwindcss.com)
- [JWT Authentication](https://jwt.io)
- [Recharts](https://recharts.org)

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💼 Support

For issues, questions, or suggestions, please create an issue in the repository.

---

**Note**: This is a demonstration project. For production use, additional security measures, compliance requirements, and testing should be implemented based on your specific requirements and regulations.
