# 🏠 Stellar Intelligence Platform - AI Home Inspection System

> **Quick Start**: Deploy and run the complete AI-powered home inspection platform in under 10 minutes

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=flat&logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)

## 🚀 Quick Deploy (Virtual Machine Ready)

### Prerequisites for VM Deployment
- **Linux VM** (Ubuntu 20.04+ recommended) with 4GB+ RAM
- **SSH access** to your virtual machine
- **Domain/IP** for external access (optional)

### 1. VM Setup (Ubuntu/Debian)

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git
sudo apt install git -y

# Verify installations
node --version    # Should show v20.x.x
npm --version     # Should show 10.x.x
git --version     # Should show git version 2.x.x
```

### 2. Clone and Setup Application

```bash
# Clone from Azure DevOps repository
git clone https://dev.azure.com/Innovoco/Innovoco%20-%20Infrastructure%20and%20Internal%20Development/_git/AI-Stellar-HomeInspection

# Navigate to project
cd AI-Stellar-HomeInspection

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma migrate dev --name init

# Start the application
npm run dev
```

### 3. Access the Application

**Local Access:**
- Open browser: `http://localhost:3002`
- Application automatically loads the Schedule Dashboard

**Remote Access (VM with public IP):**
```bash
# Allow port 3002 through firewall
sudo ufw allow 3002

# Start with host binding for external access
npm run dev -- --hostname 0.0.0.0
```
- Access via: `http://YOUR_VM_IP:3002`

## 🎯 What You Get Out of the Box

### Core Features Available Immediately:
- **📅 Schedule Dashboard** - Manage inspection appointments
- **🏠 Property Inspection Workflow** - Complete inspection process
- **📋 Claims Management** - Track and manage claims
- **📊 Reports & Analytics** - Generate detailed reports
- **🤖 AI Assistant** - Voice and text interaction
- **📧 Email Notifications** - Automated communication

### Pre-configured Integrations:
- ✅ **Azure OpenAI** - GPT-4 powered analysis
- ✅ **Voice Chat** - Real-time voice interaction
- ✅ **Email Service** - Automated notifications via Resend
- ✅ **Google Maps** - Address autocomplete and mapping
- ✅ **PDF Generation** - Automated report creation
- ✅ **Database** - SQLite with Prisma ORM

## 🛠️ Production Deployment

### Docker Deployment (Recommended for Production)

```bash
# Create Dockerfile (if not exists)
cat > Dockerfile << 'EOF'
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3002
CMD ["npm", "start"]
EOF

# Build and run with Docker
docker build -t stellar-app .
docker run -d -p 3002:3002 --name stellar-app stellar-app
```

### PM2 Process Manager (Alternative)

```bash
# Install PM2 globally
npm install -g pm2

# Build for production
npm run build

# Start with PM2
pm2 start npm --name "stellar-app" -- start

# Setup auto-restart on boot
pm2 startup
pm2 save
```

### Nginx Reverse Proxy (Optional)

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/stellar << 'EOF'
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/stellar /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 📁 Project Structure

```
AI-Stellar-HomeInspection/
├── app/                          # Next.js App Router
│   ├── dashboard/                # Main application dashboards
│   │   ├── inspection/           # Inspection management
│   │   ├── claims/               # Claims processing
│   │   └── reports/              # Analytics and reports
│   ├── api/                      # API endpoints
│   └── page.tsx                  # Auto-redirects to dashboard
├── components/                   # Reusable UI components
├── lib/                          # Utilities and integrations
├── docs/                         # Documentation
│   └── INSTALLATION.md           # Detailed setup guide
├── prisma/                       # Database schema and migrations
└── .env.local                    # Pre-configured environment
```

## 🔧 Configuration

### Environment Variables (Pre-configured)

The application comes with a ready-to-use `.env.local` file containing:

```env
# Azure OpenAI (Ready to use)
AZURE_OPENAI_ENDPOINT=configured
AZURE_OPENAI_KEY=configured

# Email Service (Ready to use)
RESEND_API_KEY=configured
RESEND_FROM_EMAIL=claims@stellaradjusting.com

# Database (SQLite - ready for development)
DATABASE_URL="file:./dev.db"

# Application Settings
NEXT_PUBLIC_DEMO_MODE=false
NODE_ENV=development
```

### For Production - Update These:

```bash
# Edit environment file
nano .env.local

# Update these values:
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_DEMO_MODE=false
```

## 🧪 Testing the Deployment

### 1. Application Health Check
```bash
# Test if application is running
curl http://localhost:3002/api/health
# Expected: {"status":"ok","timestamp":"..."}
```

### 2. Database Connection
```bash
# Open Prisma Studio to view data
npx prisma studio
# Opens http://localhost:5555 with database interface
```

### 3. Feature Testing
- **Schedule Dashboard**: Create and manage inspections
- **Claims Processing**: Submit and track claims
- **AI Assistant**: Test voice and text interactions
- **Report Generation**: Generate and download PDF reports

## 🐛 Quick Troubleshooting

### Application Won't Start
```bash
# Check Node.js version
node --version  # Must be 20+

# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Reset database
rm -f prisma/dev.db
npx prisma migrate dev --name fresh_start
```

### Port Issues
```bash
# Find process using port 3002
sudo lsof -ti:3002

# Kill process
sudo kill -9 $(sudo lsof -ti:3002)

# Or use different port
PORT=3003 npm run dev
```

### Permission Errors
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

## 📖 Documentation

- **[Complete Installation Guide](docs/INSTALLATION.md)** - Detailed setup instructions
- **[API Documentation](docs/API.md)** - API endpoints and usage (coming soon)
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment options (coming soon)

## 🔐 Security Notes

### Default Security Settings:
- ✅ Environment variables for sensitive data
- ✅ Input validation with Zod schemas
- ✅ SQL injection prevention via Prisma
- ✅ XSS protection built into React/Next.js

### Production Security Checklist:
- [ ] Change default API keys in `.env.local`
- [ ] Enable HTTPS with SSL certificates
- [ ] Configure firewall rules
- [ ] Set up regular backups
- [ ] Enable access logging

## 🎯 Use Cases

### Insurance Companies
- Automate property inspections
- Generate comprehensive reports
- Streamline claims processing
- Reduce manual documentation time

### Property Managers
- Schedule routine inspections
- Track property conditions
- Generate maintenance reports
- Coordinate with contractors

### Home Inspectors
- Digital inspection workflows
- Voice-powered data collection
- Automated report generation
- Client communication tools

## 📊 Performance

**Expected Performance:**
- **Startup Time**: < 10 seconds
- **Report Generation**: < 30 seconds
- **Database Queries**: < 100ms average
- **Page Load Times**: < 2 seconds

**Resource Requirements:**
- **Development**: 2GB RAM, 1 CPU core
- **Production**: 4GB RAM, 2 CPU cores
- **Storage**: 5GB minimum (including logs and data)

## 🆘 Support

### Quick Help
- **Documentation**: Check `docs/INSTALLATION.md` for detailed setup
- **Logs**: Check browser console and terminal output
- **Database**: Use `npx prisma studio` to inspect data

### Contact
- **Technical Issues**: Create issue in Azure DevOps repository
- **Feature Requests**: Contact development team
- **Deployment Help**: Reference this README or detailed docs

---

## 📋 Quick Commands Reference

```bash
# Development
npm run dev              # Start development server
npm run dev:turbo        # Start with turbo mode (faster)

# Production
npm run build           # Build for production
npm start              # Start production server

# Database
npx prisma studio      # Open database interface
npx prisma migrate dev # Apply database changes

# Utilities
npm run lint           # Check code quality
git pull              # Update from repository
```

**🚀 Ready to deploy? Just run the Quick Deploy commands above and you'll have the full Stellar Intelligence Platform running in minutes!**