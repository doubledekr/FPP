# PersonalizeAI Deployment Guide

Complete guide for deploying PersonalizeAI to production environments.

## Quick Deployment Options

### Option 1: Vercel + Heroku (Recommended)
- **Frontend**: Deploy to Vercel (free tier available)
- **Backend**: Deploy to Heroku (free tier available)
- **Database**: PostgreSQL on Heroku or external provider
- **Total Cost**: $0-$25/month for MVP

### Option 2: DigitalOcean Droplet
- **Full Stack**: Single droplet with nginx reverse proxy
- **Database**: PostgreSQL on same droplet or managed database
- **Total Cost**: $5-$20/month

### Option 3: AWS/GCP/Azure
- **Frontend**: Static hosting (S3, Cloud Storage)
- **Backend**: Container service or serverless
- **Database**: Managed database service
- **Total Cost**: $10-$50/month

## Frontend Deployment (React)

### Vercel Deployment (Recommended)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Build and Deploy**
```bash
cd frontend
npm run build
vercel
```

3. **Configure Environment Variables**
In Vercel dashboard, add:
```
VITE_API_BASE_URL=https://your-backend-url.herokuapp.com/api
```

4. **Custom Domain** (Optional)
- Add custom domain in Vercel dashboard
- Configure DNS records

### Netlify Deployment

1. **Build Project**
```bash
cd frontend
npm run build
```

2. **Deploy via CLI**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

3. **Environment Variables**
In Netlify dashboard, add:
```
VITE_API_BASE_URL=https://your-backend-url.herokuapp.com/api
```

### Manual Static Hosting

1. **Build for Production**
```bash
cd frontend
npm run build
```

2. **Upload dist/ folder** to your hosting provider:
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Static Web Apps
- Any static hosting service

## Backend Deployment (Flask)

### Heroku Deployment (Recommended)

1. **Install Heroku CLI**
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows/Linux
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

2. **Prepare for Deployment**
```bash
cd backend

# Create Procfile
echo "web: python src/main.py" > Procfile

# Create runtime.txt
echo "python-3.11.0" > runtime.txt

# Update main.py for production
```

3. **Update main.py for Heroku**
```python
import os
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ... your existing code ...

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
```

4. **Deploy to Heroku**
```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Create Heroku app
heroku create your-personalizeai-api

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set FLASK_ENV=production
heroku config:set OPENAI_API_KEY=your_openai_key

# Deploy
git push heroku main
```

### DigitalOcean Droplet

1. **Create Droplet**
- Ubuntu 22.04 LTS
- $5/month basic droplet
- Add SSH key

2. **Server Setup**
```bash
# Connect to droplet
ssh root@your_droplet_ip

# Update system
apt update && apt upgrade -y

# Install dependencies
apt install -y python3 python3-pip python3-venv nginx postgresql postgresql-contrib

# Create application user
adduser personalizeai
usermod -aG sudo personalizeai
su - personalizeai
```

3. **Deploy Application**
```bash
# Clone repository
git clone https://github.com/yourusername/personalize-ai-mvp.git
cd personalize-ai-mvp

# Setup backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Setup database
sudo -u postgres createdb personalizeai
sudo -u postgres createuser personalizeai
sudo -u postgres psql -c "ALTER USER personalizeai PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE personalizeai TO personalizeai;"
```

4. **Configure Nginx**
```nginx
# /etc/nginx/sites-available/personalizeai
server {
    listen 80;
    server_name your_domain.com;

    # Frontend
    location / {
        root /home/personalizeai/personalize-ai-mvp/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

5. **Setup Systemd Service**
```ini
# /etc/systemd/system/personalizeai.service
[Unit]
Description=PersonalizeAI Flask App
After=network.target

[Service]
User=personalizeai
WorkingDirectory=/home/personalizeai/personalize-ai-mvp/backend
Environment=PATH=/home/personalizeai/personalize-ai-mvp/backend/venv/bin
ExecStart=/home/personalizeai/personalize-ai-mvp/backend/venv/bin/python src/main.py
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable personalizeai
sudo systemctl start personalizeai

# Enable nginx site
sudo ln -s /etc/nginx/sites-available/personalizeai /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

## Database Setup

### PostgreSQL Configuration

1. **Environment Variables**
```bash
# Production environment variables
DATABASE_URL=postgresql://username:password@host:port/database
FLASK_ENV=production
OPENAI_API_KEY=your_openai_key
SECRET_KEY=your_secret_key_here
```

2. **Database Migration**
```python
# Update models/subscriber.py for PostgreSQL
import os
from sqlalchemy import create_engine

DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///database/app.db')
engine = create_engine(DATABASE_URL)
```

3. **Initialize Production Database**
```bash
# Run demo data seeder for production
python src/demo_data_seeder.py
```

## SSL/HTTPS Setup

### Let's Encrypt (Free SSL)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your_domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Cloudflare (Recommended)

1. **Add domain to Cloudflare**
2. **Update DNS records**
3. **Enable SSL/TLS encryption**
4. **Configure security settings**

## Environment Variables

### Production Environment Variables

```bash
# Backend (.env)
FLASK_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
OPENAI_API_KEY=your_openai_key
SECRET_KEY=your_secret_key_here
CORS_ORIGINS=https://your-frontend-domain.com

# Frontend (.env.production)
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_APP_NAME=PersonalizeAI
```

## Monitoring and Logging

### Application Monitoring

1. **Health Check Endpoint**
```python
@app.route('/health')
def health_check():
    return {'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()}
```

2. **Logging Configuration**
```python
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
```

3. **Error Tracking**
- Sentry for error tracking
- LogRocket for user session recording
- Google Analytics for usage analytics

### Server Monitoring

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Monitor logs
sudo journalctl -u personalizeai -f
sudo tail -f /var/log/nginx/access.log
```

## Backup Strategy

### Database Backups

```bash
# Automated PostgreSQL backup
#!/bin/bash
# backup.sh
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
aws s3 cp backup_*.sql s3://your-backup-bucket/
```

### Application Backups

```bash
# Backup application files
tar -czf app_backup_$(date +%Y%m%d).tar.gz /home/personalizeai/personalize-ai-mvp/
```

## Performance Optimization

### Frontend Optimization

1. **Build Optimization**
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts']
        }
      }
    }
  }
}
```

2. **CDN Configuration**
- Use Cloudflare or AWS CloudFront
- Enable gzip compression
- Set appropriate cache headers

### Backend Optimization

1. **Database Optimization**
```python
# Add database indexes
CREATE INDEX idx_subscriber_email ON subscribers(email);
CREATE INDEX idx_engagement_subscriber_id ON engagement_events(subscriber_id);
```

2. **Caching**
```python
from flask_caching import Cache
cache = Cache(app, config={'CACHE_TYPE': 'simple'})

@cache.cached(timeout=300)
def get_analytics_data():
    # Expensive computation
    return data
```

## Security Considerations

### API Security

1. **Rate Limiting**
```python
from flask_limiter import Limiter
limiter = Limiter(app, key_func=lambda: request.remote_addr)

@app.route('/api/subscribers')
@limiter.limit("100 per hour")
def get_subscribers():
    # API endpoint
```

2. **Input Validation**
```python
from marshmallow import Schema, fields

class SubscriberSchema(Schema):
    email = fields.Email(required=True)
    name = fields.Str(required=True, validate=Length(min=1, max=100))
```

3. **CORS Configuration**
```python
CORS(app, origins=['https://your-frontend-domain.com'])
```

### Infrastructure Security

1. **Firewall Configuration**
```bash
# UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

2. **SSH Security**
```bash
# Disable password authentication
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart ssh
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
- Check CORS configuration in Flask app
- Verify frontend API URL configuration

2. **Database Connection Issues**
- Verify DATABASE_URL format
- Check database credentials and permissions

3. **Build Failures**
- Clear node_modules and reinstall
- Check Node.js version compatibility

4. **SSL Certificate Issues**
- Verify domain DNS configuration
- Check certificate renewal status

### Debug Commands

```bash
# Check application logs
sudo journalctl -u personalizeai -n 50

# Check nginx logs
sudo tail -f /var/log/nginx/error.log

# Test API endpoints
curl -X GET https://your-api-domain.com/api/health

# Check database connection
psql $DATABASE_URL -c "SELECT version();"
```

## Cost Optimization

### Free Tier Options

1. **Vercel** - Frontend hosting (free)
2. **Heroku** - Backend hosting (free tier available)
3. **PostgreSQL** - Heroku Postgres hobby tier (free)
4. **Cloudflare** - CDN and SSL (free)

**Total Monthly Cost**: $0-$25

### Scaling Considerations

1. **Traffic Growth**
- Monitor API usage and response times
- Implement caching strategies
- Consider load balancing

2. **Database Scaling**
- Monitor database performance
- Implement read replicas if needed
- Consider database sharding for large datasets

3. **Cost Monitoring**
- Set up billing alerts
- Monitor resource usage
- Optimize based on actual usage patterns

## Support and Maintenance

### Regular Maintenance Tasks

1. **Weekly**
- Check application logs
- Monitor performance metrics
- Review security alerts

2. **Monthly**
- Update dependencies
- Review backup integrity
- Analyze usage patterns

3. **Quarterly**
- Security audit
- Performance optimization review
- Cost analysis and optimization

### Emergency Procedures

1. **Application Down**
- Check systemd service status
- Review application logs
- Restart services if needed

2. **Database Issues**
- Check database connectivity
- Review query performance
- Restore from backup if necessary

3. **Security Incidents**
- Isolate affected systems
- Review access logs
- Update security measures

---

For additional support or questions about deployment, please refer to the main README or contact the development team.

