# DEPLOYMENT GUIDE

## Local Development

### Prerequisites
- Node.js 18.0+
- MongoDB 4.0+ or MongoDB Atlas account

### Quick Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
# Create .env.local with MongoDB URI and JWT_SECRET
# See .env.example for reference

# 3. Start MongoDB
# Windows: mongod
# macOS: brew services start mongodb-community
# Docker: docker run -d -p 27017:27017 mongo

# 4. Seed database
npm run seed

# 5. Start dev server
npm run dev

# Visit http://localhost:3000
```

## Production Build

```bash
# Build for production
npm run build

# Start production server
npm start

# Application runs on http://localhost:3000
```

## Deployment Platforms

### Vercel (Recommended for Next.js)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# 3. Set environment variables in Vercel dashboard:
#    - DATABASE_URL
#    - JWT_SECRET
#    - NODE_ENV=production
```

### Heroku

```bash
# 1. Create Heroku app
heroku create your-app-name

# 2. Set environment variables
heroku config:set DATABASE_URL=your_DATABASE_URL
heroku config:set JWT_SECRET=your_jwt_secret

# 3. Deploy
git push heroku main
```

### Docker

```bash
# Build Docker image
docker build -t health-analytics .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=mongodb://... \
  -e JWT_SECRET=your_secret \
  health-analytics
```

### AWS EC2

```bash
# 1. SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-instance

# 2. Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 3. Clone repository and setup
git clone your-repo
cd health-analytics
npm install
npm run build

# 4. Create PM2 start script
npm install -g pm2
pm2 start npm --name "health-analytics" -- start

# 5. Setup environment variables
nano .env.local

# 6. Setup reverse proxy with Nginx
sudo yum install -y nginx
# Configure nginx to proxy to localhost:3000
```

## Environment Variables

### Development
```env
DATABASE_URL=mongodb://localhost:27017/health-analytics
JWT_SECRET=dev-secret-key
NODE_ENV=development
```

### Production
```env
DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/health-analytics
JWT_SECRET=secure-production-secret-key-32-chars-min
NODE_ENV=production
```

### MongoDB Atlas Setup
1. Create account at mongodb.com
2. Create cluster
3. Create database user with strong password
4. Whitelist IP addresses (or 0.0.0.0 for all)
5. Get connection string
6. Replace placeholders: mongodb+srv://username:password@cluster...

## SSL/HTTPS Setup

### Let's Encrypt with Certbot (for self-hosted)
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com
```

### Nginx SSL Configuration
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoring & Logging

### PM2 Monitoring
```bash
pm2 start npm --name "health-analytics" -- start
pm2 save
pm2 startup
pm2 logs
pm2 monitor
```

### Error Logging
Add error tracking service:
```bash
npm install sentry-browser @sentry/react
```

### Performance Monitoring
```bash
npm install @vercel/analytics
```

## Database Backups

### MongoDB Atlas Automatic Backups
- Enable in cluster settings
- Automatic daily snapshots
- 30-day retention

### Manual Backup
```bash
# Export database
mongoexport --uri "mongodb+srv://user:password@cluster..." \
  --collection users \
  --out users.json

# Import database
mongoimport --uri "mongodb+srv://user:password@cluster..." \
  --collection users \
  --file users.json
```

## Scaling Considerations

1. **Database**: Use MongoDB Atlas auto-scaling
2. **API**: Implement caching with Redis
3. **Static Assets**: Use CDN (Vercel, Cloudflare)
4. **Load Balancing**: Use load balancer for multiple instances
5. **Rate Limiting**: Implement API rate limiting

## Security Hardening

```javascript
// Add rate limiting middleware
npm install express-rate-limit

// Add CORS protection
npm install cors

// Add helmet for security headers
npm install helmet
```

## Continuous Deployment

### GitHub Actions CI/CD
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - run: npm test
      # Add your deployment step here
```

## Health Checks

```javascript
// app/api/health/route.js
export async function GET() {
  try {
    await dbConnect();
    return Response.json({ status: 'healthy' });
  } catch {
    return Response.json({ status: 'unhealthy' }, { status: 500 });
  }
}
```

## Maintenance

### Regular Updates
```bash
# Check for security updates
npm audit

# Update dependencies
npm update

# Upgrade to latest versions
npm install --latest
```

### Database Optimization
```bash
# Rebuild indexes
mongo
> use health-analytics
> db.medicalreports.reIndex()
```

## Rollback Procedure

```bash
# If deployment fails, rollback to previous version
git revert HEAD
npm run build
npm start

# Or with PM2
pm2 restart health-analytics
```

---

For detailed setup instructions, see SETUP_GUIDE.md
For troubleshooting, see README.md
