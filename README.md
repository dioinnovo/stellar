# Stellar Intelligence Platform

## 🚀 Overview

Stellar Intelligence Platform is an AI-powered claims advocacy system that helps policyholders maximize their legitimate insurance claims. We analyze submitted claims to ensure fair settlements and protect policyholders from being undervalued by insurance companies. Our platform transforms the claims experience with instant assessment, optimal recovery strategies, and intelligent claim optimization.

## 🎯 Purpose & Value Proposition

### For Policyholders
- **Maximize Claim Value**: AI analysis ensures you receive fair compensation
- **Expert Advocacy**: Professional claim assessment and documentation
- **Faster Resolution**: From weeks to days with intelligent automation
- **Transparent Process**: Understand your claim's true value and potential
- **Protection from Underpayment**: Don't let insurers take advantage

### Key Differentiators
- Empowering policyholders to maximize legitimate claims
- Focus on property insurance only (commercial & residential)
- End-to-end workflow automation from initial assessment to settlement
- GraphRAG-powered context enrichment for optimal claim strategies

## 🛠 Tech Stack

### Frontend
- **Next.js 15.5.2** - Latest App Router for full-stack capabilities
- **React 19.1.1** - Latest React with improved performance
- **Tailwind CSS 4.1.13** - New v4 syntax with enhanced features
- **Framer Motion** - Smooth animations and transitions
- **Recharts** - Data visualization for analytics
- **Lucide Icons** - Modern icon library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Type-safe database access
- **SQLite** - Development database (PostgreSQL for production)
- **Zod** - Runtime type validation

### AI & Processing
- **LangChain** - AI orchestration and chains
- **ChromaDB** - Vector database for similarity search
- **OpenAI/Anthropic APIs** - LLM integration
- **PDF.js** - Document processing

### Infrastructure
- **Resend** - Email notifications
- **Socket.io** - Real-time updates (planned)
- **Multer** - File upload handling

## 📁 Project Structure

```
stellar/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   │   ├── claims/        # Claims submission & management
│   │   ├── admin/         # Admin dashboard endpoints
│   │   └── workflows/     # Workflow automation
│   ├── admin/             # Admin dashboard UI
│   ├── demo/              # Interactive demo
│   ├── claims/[id]/       # Individual claim details
│   └── page.tsx           # Landing page
├── lib/                   # Utility functions
│   ├── db.ts             # Prisma client
│   ├── email.ts          # Email service
│   ├── workflow.ts       # Workflow engine
│   └── graphrag.ts       # Knowledge graph (planned)
├── prisma/               
│   └── schema.prisma     # Database schema
└── components/           # Reusable React components
```

## 🔄 Workflow Automation

### Claim Submission Workflow
1. **Form Submission** → Triggers automated workflow
2. **Triage** → AI assigns priority based on severity
3. **Classification** → AI analyzes damage type with confidence scores
4. **Estimation** → Generates preliminary estimate
5. **Notification** → Sends email with estimate to insured
6. **CRM Integration** → Creates lead for follow-up

### Database Schema
- **Claims** - Core claim data with AI scores
- **Documents** - File uploads and attachments
- **Workflows** - Automation state tracking
- **Leads** - CRM integration
- **Notifications** - Email queue and history
- **Enrichments** - GraphRAG context (planned)
- **Activities** - Complete audit trail

## 🚀 Getting Started

### Prerequisites

Before installing the Stellar Intelligence Platform, ensure you have the following installed on your system:

- **Node.js 20.x or higher** (LTS recommended)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version` and `npm --version`
- **Git** (for cloning the repository)
  - Download from [git-scm.com](https://git-scm.com/)
  - Verify installation: `git --version`
- **Text Editor** (VS Code recommended)
  - Download from [code.visualstudio.com](https://code.visualstudio.com/)

### Step-by-Step Installation

#### 1. Clone the Repository

```bash
# Clone the repository
git clone https://dev.azure.com/Innovoco/Innovoco%20-%20Infrastructure%20and%20Internal%20Development/_git/AI-Stellar-HomeInspection

# Navigate to the project directory
cd AI-Stellar-HomeInspection
```

#### 2. Install Dependencies

```bash
# Install all project dependencies (this may take 2-3 minutes)
npm install

# If you encounter permission errors on macOS/Linux, try:
sudo npm install

# Alternative: Use yarn if you prefer
# yarn install
```

#### 3. Set Up Environment Variables

```bash
# Create environment file from the existing template
cp .env.local .env.local.backup
```

**Important**: The application comes with a pre-configured `.env.local` file that includes:
- Azure OpenAI integration
- Voice chat capabilities
- Email services
- Google Maps integration

**For basic setup**, you can use the existing configuration as-is. The app will run in demo mode.

**For production setup**, update these key variables in `.env.local`:

```env
# Change to production URL when deploying
NEXTAUTH_URL=http://localhost:3002

# Update to false for production
NEXT_PUBLIC_DEMO_MODE=false

# Database (SQLite by default, PostgreSQL for production)
DATABASE_URL="file:./dev.db"

# Optional: Add your own API keys for enhanced features
ANTHROPIC_API_KEY=your_anthropic_key_here
OPENAI_API_KEY=your_openai_key_here
```

#### 4. Initialize the Database

```bash
# Generate Prisma client (required for database operations)
npx prisma generate

# Create and migrate database schema
npx prisma migrate dev --name init

# Optional: Seed database with demo data
npx prisma db seed
```

#### 5. Start the Development Server

```bash
# Start the development server
npm run dev

# Alternative: Use turbo mode for faster development
npm run dev:turbo
```

#### 6. Verify Installation

1. **Open your browser** and navigate to: `http://localhost:3002`
2. **You should see** the Stellar Intelligence dashboard automatically load
3. **Test the application** by:
   - Navigating through different sections (Schedule, Claims, Reports)
   - Creating a new inspection
   - Viewing existing claims

### 🚀 Quick Start Commands

```bash
# Complete setup in one go
git clone https://dev.azure.com/Innovoco/Innovoco%20-%20Infrastructure%20and%20Internal%20Development/_git/AI-Stellar-HomeInspection
cd AI-Stellar-HomeInspection
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

### 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3002 |
| `npm run dev:turbo` | Start development server with Turbo mode |
| `npm run build` | Build the application for production |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint to check code quality |

### 🐛 Troubleshooting

#### Common Issues and Solutions

**1. Port Already in Use**
```bash
# If port 3002 is busy, the app will automatically use 3001, 3003, etc.
# Check the terminal output for the actual port being used
```

**2. Node Version Compatibility**
```bash
# Check your Node.js version
node --version

# If you have an older version, update Node.js or use nvm:
nvm install 20
nvm use 20
```

**3. Database Connection Issues**
```bash
# Reset the database
rm -f prisma/dev.db
npx prisma migrate dev --name init
```

**4. Missing Dependencies**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**5. Permission Errors (macOS/Linux)**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### 🌐 Accessing the Application

Once running, the application provides these main sections:

- **📅 Schedule Dashboard**: `http://localhost:3002/dashboard/inspection`
- **📋 Claims Management**: `http://localhost:3002/dashboard/claims`
- **📊 Reports**: `http://localhost:3002/dashboard/reports`
- **🏠 Property Inspection**: Create new inspections and manage workflows

### 🔐 Environment Configuration Details

The application uses these key environment variables:

| Variable | Purpose | Required |
|----------|---------|----------|
| `DATABASE_URL` | Database connection string | ✅ Yes |
| `AZURE_OPENAI_KEY` | AI services integration | ✅ Yes |
| `RESEND_API_KEY` | Email notifications | ⚠️ Optional |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Address autocomplete | ⚠️ Optional |
| `NEXT_PUBLIC_DEMO_MODE` | Demo vs production mode | ⚠️ Optional |

### 🚀 Production Deployment

For production deployment:

1. **Update environment variables**:
   ```bash
   NODE_ENV=production
   NEXT_PUBLIC_DEMO_MODE=false
   NEXTAUTH_URL=https://your-domain.com
   ```

2. **Build the application**:
   ```bash
   npm run build
   npm start
   ```

3. **Use a process manager** (PM2 recommended):
   ```bash
   npm install -g pm2
   pm2 start npm --name "stellar-app" -- start
   ```

## 📍 Key Pages

- **`/`** - Landing page with value proposition
- **`/demo`** - Interactive claims processing demo
- **`/admin`** - Admin dashboard for claims management
- **`/api-demo`** - API documentation and examples
- **`/claims/[id]`** - Individual claim details (in progress)
- **`/inspection`** - Home inspection form (planned)

## ✅ Completed Features

### Phase 1: Foundation ✅
- [x] Database schema design with Prisma
- [x] API endpoints for claims submission
- [x] Workflow automation engine
- [x] Email notification system
- [x] CRM lead creation

### Phase 2: Core Functionality ✅
- [x] Claims submission with validation
- [x] Automated triage and classification
- [x] Preliminary estimate generation
- [x] Admin dashboard with filters
- [x] Activity logging and audit trail

### Phase 3: Integration ✅
- [x] Demo page API integration
- [x] Workflow triggers on submission
- [x] Email templates with estimates
- [x] Status tracking and updates

## 🚧 In Progress / Planned Features

### Phase 4: Advanced Features (From PRD)
- [ ] **Home Inspection Page**
  - Multi-step form wizard
  - Progressive data collection
  - Auto-save functionality
  
- [ ] **GraphRAG Implementation**
  - Vector embeddings for claims
  - Similar claims matching
  - Context-aware suggestions
  - Knowledge graph construction

- [ ] **File Processing**
  - PDF text extraction
  - OCR for images
  - Multi-format support
  - Drag-and-drop uploads

- [ ] **Real-time Updates**
  - WebSocket integration
  - Live status updates
  - Collaborative features
  - Push notifications

- [ ] **Claims Detail Page UI**
  - Full claim visualization
  - Document viewer
  - Timeline view
  - Action buttons

- [ ] **Enhanced Analytics**
  - Custom dashboards
  - Export functionality
  - Trend analysis
  - Performance metrics

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test API Endpoints
```bash
# Submit a claim
curl -X POST http://localhost:3000/api/claims/submit \
  -H "Content-Type: application/json" \
  -d '{
    "type": "commercial",
    "insuredName": "John Doe",
    "insuredEmail": "john@example.com",
    "insuredPhone": "555-0100",
    "propertyAddress": "123 Main St, Dallas, TX",
    "damageType": "Hurricane Wind Damage",
    "severity": "Major"
  }'

# Get admin dashboard data
curl http://localhost:3000/api/admin/claims
```

## 🔐 Security Considerations

- API endpoints require authentication (to be implemented)
- Environment variables for sensitive data
- Input validation with Zod
- SQL injection prevention via Prisma
- XSS protection built into React

## 📈 Performance Optimizations

- Server-side rendering with Next.js
- Database indexing on key fields
- Lazy loading for images
- Code splitting per route
- Caching strategies (planned)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 👥 Team

- Product Engineering Team
- AI/ML Team
- Insurance Domain Experts

## 📞 Support

For questions or support, please contact:
- Technical: dev@stellar-ai.com
- Business: sales@stellar-ai.com

## 🎯 Roadmap

### Q1 2025
- [x] Core platform development
- [x] Workflow automation
- [ ] GraphRAG integration

### Q2 2025
- [ ] Production deployment
- [ ] Enterprise authentication
- [ ] Advanced analytics

### Q3 2025
- [ ] Mobile application
- [ ] Third-party integrations
- [ ] International expansion

---

**Built with ❤️ by the Stellar Intelligence Team**