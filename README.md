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
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/stellar-intelligence.git
cd stellar-intelligence
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys:
```env
# Required
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY=your-key
OPENAI_API_KEY=your-key

# Optional
RESEND_API_KEY=your-key
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

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