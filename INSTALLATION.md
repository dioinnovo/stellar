# 🔧 Stellar Intelligence Platform - Complete Installation Guide

## Table of Contents
- [System Requirements](#system-requirements)
- [Pre-Installation Checklist](#pre-installation-checklist)
- [Installation Steps](#installation-steps)
- [Configuration](#configuration)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Advanced Setup](#advanced-setup)

## System Requirements

### Minimum Requirements
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Node.js**: Version 20.x or higher (LTS recommended)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Internet**: Required for downloading dependencies and AI services

### Recommended Setup
- **Node.js**: Version 20.11.1 (LTS)
- **Package Manager**: npm 10.x (comes with Node.js)
- **Code Editor**: Visual Studio Code with TypeScript extensions
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

## Pre-Installation Checklist

### 1. Install Node.js

**Windows:**
1. Download from [nodejs.org](https://nodejs.org/)
2. Run the installer (.msi file)
3. Follow the installation wizard
4. Restart your computer

**macOS:**
1. Download from [nodejs.org](https://nodejs.org/)
2. Run the installer (.pkg file)
3. Or use Homebrew: `brew install node`

**Linux (Ubuntu/Debian):**
```bash
# Update package index
sudo apt update

# Install Node.js
sudo apt install nodejs npm

# Or use NodeSource repository for latest version
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Verify Installation:**
```bash
node --version    # Should show v20.x.x or higher
npm --version     # Should show 10.x.x or higher
```

### 2. Install Git

**Windows:**
- Download from [git-scm.com](https://git-scm.com/)
- Run installer with default settings

**macOS:**
- Install Xcode Command Line Tools: `xcode-select --install`
- Or use Homebrew: `brew install git`

**Linux:**
```bash
sudo apt install git
```

**Verify Installation:**
```bash
git --version    # Should show git version 2.x.x
```

## Installation Steps

### Step 1: Clone the Repository

```bash
# Navigate to your desired directory
cd ~/Projects  # or C:\Users\YourName\Projects on Windows

# Clone the repository
git clone https://dev.azure.com/Innovoco/Innovoco%20-%20Infrastructure%20and%20Internal%20Development/_git/AI-Stellar-HomeInspection

# Navigate into the project
cd AI-Stellar-HomeInspection

# Verify you're in the right directory
ls -la  # You should see package.json, README.md, etc.
```

### Step 2: Install Dependencies

```bash
# Install all dependencies
npm install

# This process will:
# - Download all packages from package.json
# - Create node_modules directory
# - Generate package-lock.json
# - Take 2-5 minutes depending on internet speed
```

**If you encounter errors:**

**Permission Issues (macOS/Linux):**
```bash
sudo npm install
# OR fix npm permissions permanently:
sudo chown -R $(whoami) ~/.npm
```

**Network Issues:**
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install

# Or use yarn as alternative
npm install -g yarn
yarn install
```

### Step 3: Environment Configuration

The project comes with a pre-configured `.env.local` file:

```bash
# View current configuration
cat .env.local

# Create backup (recommended)
cp .env.local .env.local.backup
```

**Key configurations already set:**
- ✅ Azure OpenAI API keys
- ✅ Voice chat configuration
- ✅ Email service setup
- ✅ Database settings
- ✅ Google Maps integration

**For development**: No changes needed - use as-is.

**For production**: Update these variables:
```bash
# Edit the file
nano .env.local  # or use your preferred editor

# Update these values:
NODE_ENV=production
NEXT_PUBLIC_DEMO_MODE=false
NEXTAUTH_URL=https://your-domain.com
```

### Step 4: Database Setup

```bash
# Generate Prisma client (creates database interface)
npx prisma generate

# This creates:
# - node_modules/.prisma/client
# - Type definitions for database
```

```bash
# Initialize database with schema
npx prisma migrate dev --name initial_setup

# This creates:
# - prisma/dev.db (SQLite database file)
# - prisma/migrations/ directory
# - Database tables based on schema
```

```bash
# Optional: Add sample data
npx prisma db seed

# This populates the database with:
# - Sample inspections
# - Demo claims
# - Test data for development
```

### Step 5: Start the Application

```bash
# Start development server
npm run dev

# Expected output:
# ▲ Next.js 15.5.2
# - Local:        http://localhost:3002
# - Network:      http://192.168.1.x:3002
# ✓ Ready in 2.3s
```

**Alternative start methods:**
```bash
# Turbo mode (faster rebuilds)
npm run dev:turbo

# Production build
npm run build && npm start

# Background process
nohup npm run dev > app.log 2>&1 &
```

## Configuration

### Database Configuration

**Default (SQLite - for development):**
```env
DATABASE_URL="file:./dev.db"
```

**PostgreSQL (for production):**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/stellar_db"
```

**MySQL (alternative):**
```env
DATABASE_URL="mysql://username:password@localhost:3306/stellar_db"
```

### AI Services Configuration

**Azure OpenAI (default):**
```env
AZURE_OPENAI_ENDPOINT=https://your-resource.cognitiveservices.azure.com
AZURE_OPENAI_KEY=your-key-here
AZURE_OPENAI_VERSION=2024-12-01-preview
```

**OpenAI (alternative):**
```env
OPENAI_API_KEY=sk-your-key-here
```

### Email Configuration

**Resend (default):**
```env
RESEND_API_KEY=re_your-key-here
RESEND_FROM_EMAIL=claims@yourdomain.com
```

**SendGrid (alternative):**
```env
SENDGRID_API_KEY=SG.your-key-here
```

## Verification

### 1. Application Health Check

Navigate to: `http://localhost:3002`

✅ **You should see:**
- Stellar Intelligence dashboard loads
- No console errors in browser developer tools
- Navigation works between sections

❌ **If you see errors:**
- Check terminal for error messages
- Verify all dependencies installed
- Check browser console for JavaScript errors

### 2. Feature Testing

**Schedule Dashboard:**
- Navigate to `/dashboard/inspection`
- Should show inspection cards
- "New Inspection" button should work

**Claims Management:**
- Navigate to `/dashboard/claims`
- Should show claims list
- Filtering should work

**Reports:**
- Navigate to `/dashboard/reports`
- Should show completed reports
- PDF download should function

### 3. Database Connection

```bash
# Check database status
npx prisma studio

# This opens a web interface at http://localhost:5555
# You should see your database tables and data
```

### 4. API Endpoints

```bash
# Test API health
curl http://localhost:3002/api/health

# Expected response: {"status":"ok","timestamp":"..."}
```

## Troubleshooting

### Common Error 1: Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3002`

**Solution:**
```bash
# Find process using port
lsof -ti:3002

# Kill the process
kill -9 $(lsof -ti:3002)

# Or use different port
PORT=3003 npm run dev
```

### Common Error 2: Module Not Found

**Error:** `Cannot find module 'some-package'`

**Solution:**
```bash
# Clear everything and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Common Error 3: Database Issues

**Error:** `Prisma Client initialization failed`

**Solution:**
```bash
# Reset database
rm -f prisma/dev.db
npx prisma migrate dev --name fresh_start
npx prisma generate
```

### Common Error 4: TypeScript Errors

**Error:** Various TypeScript compilation errors

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next/

# Restart development server
npm run dev
```

### Common Error 5: Permission Denied

**Error:** `EACCES: permission denied`

**Solution (macOS/Linux):**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or run with sudo (not recommended for development)
sudo npm run dev
```

## Advanced Setup

### Development Tools

**Install recommended VS Code extensions:**
```bash
# Install VS Code extensions via command line
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-json
```

**Configure VS Code settings:**
Create `.vscode/settings.json`:
```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### Environment Optimization

**For development:**
```env
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_DEBUG_MODE=true
```

**For staging:**
```env
NODE_ENV=staging
LOG_LEVEL=info
ENABLE_DEBUG_MODE=false
```

**For production:**
```env
NODE_ENV=production
LOG_LEVEL=error
ENABLE_DEBUG_MODE=false
```

### Performance Monitoring

**Enable analytics:**
```bash
# Install monitoring tools
npm install @vercel/analytics @sentry/nextjs

# Add to next.config.js
const withSentry = require('@sentry/nextjs');
module.exports = withSentry({
  // your config
});
```

### Docker Setup (Optional)

**Create Dockerfile:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3002
CMD ["npm", "start"]
```

**Run with Docker:**
```bash
# Build image
docker build -t stellar-app .

# Run container
docker run -p 3002:3002 stellar-app
```

## Support

If you encounter issues not covered in this guide:

1. **Check the main README.md** for additional information
2. **Review error logs** in the terminal and browser console
3. **Search existing issues** in the project repository
4. **Create a new issue** with:
   - Operating system and version
   - Node.js and npm versions
   - Complete error message
   - Steps to reproduce the problem

**Contact Information:**
- Technical Support: dev@stellar-ai.com
- Documentation: docs@stellar-ai.com
- General Questions: support@stellar-ai.com

---

✅ **Installation Complete!** Your Stellar Intelligence Platform should now be running successfully.