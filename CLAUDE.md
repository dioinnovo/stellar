# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Stellar Intelligence Platform is a Next.js 15.5.2 application for AI-powered insurance claim intelligence. It demonstrates how AI can find overlooked insurance coverage and accelerate claim processing.

## Development Commands

### Running the Application
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 15.5.2 with App Router
- **UI**: React 18.2, Tailwind CSS 3.3, shadcn/ui components
- **State Management**: React hooks, Zustand (to be added)
- **Animations**: Framer Motion 11.0
- **AI Integration**: AI SDK (Vercel), ChromaDB for vectors
- **PDF Generation**: @pdfme/generator
- **Data Visualization**: Recharts

### Project Structure
```
stellar/
├── app/                     # Next.js 14 App Router
│   ├── (auth)/             # Authentication routes
│   ├── (dashboard)/        # Protected dashboard routes
│   ├── api/                # API routes
│   ├── demo/               # Interactive demo page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── claims/            # Claim processing components
│   ├── dashboard/         # Dashboard components
│   └── layout/            # Layout components
├── lib/
│   ├── ai/                # AI service integrations
│   ├── db/                # Database utilities
│   ├── utils/             # Helper functions
│   └── hooks/             # Custom React hooks
├── public/
│   └── images/            # Static images
└── .env.local             # Environment variables
```

### Key Features

1. **Landing Page** (`app/page.tsx`)
   - Hero section with value proposition
   - Live stats showcase
   - Feature highlights
   - CTA sections

2. **Interactive Demo** (`app/demo/page.tsx`)
   - 4-step wizard interface
   - Simulated AI processing
   - Real-time progress indicators
   - Mock results display

3. **AI Integration** (planned)
   - Claude Vision for damage analysis
   - ChromaDB for vector search
   - OpenAI embeddings for semantic search
   - Real-time WebSocket updates

### Environment Variables

Key environment variables in `.env.local`:
- `ANTHROPIC_API_KEY` - Claude API access
- `OPENAI_API_KEY` - OpenAI API access
- `NEXT_PUBLIC_DEMO_MODE` - Enable demo mode
- `CHROMA_SERVER_URL` - ChromaDB server

### Design System

- **Colors**: 
  - Primary: Stellar Orange (#E74C3C)
  - Secondary: Stellar Dark (#2C3E50)
- **Components**: Using shadcn/ui with Radix UI primitives
- **Animations**: Framer Motion for smooth transitions

### Demo Mode

The application includes a demo mode (`NEXT_PUBLIC_DEMO_MODE=true`) that:
- Uses mock data instead of real API calls
- Simulates processing delays for realism
- Shows pre-configured success scenarios
- Demonstrates key value propositions

### Next Steps

To complete the full implementation:
1. Add authentication with NextAuth.js
2. Implement real AI API integrations
3. Set up ChromaDB for vector storage
4. Add WebSocket support for real-time updates
5. Create dashboard with protected routes
6. Implement PDF report generation
7. Add database with Prisma
8. Set up production deployment on Vercel