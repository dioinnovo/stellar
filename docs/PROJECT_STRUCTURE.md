# Project Structure Framework

This document explains the architectural decisions and structure of the Stellar Intelligence Platform, serving as a framework for maintaining consistency and best practices across all future development.

## Table of Contents

1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [Design Principles](#design-principles)
4. [Routing Architecture](#routing-architecture)
5. [Component Organization](#component-organization)
6. [Configuration Standards](#configuration-standards)
7. [Best Practices](#best-practices)
8. [Migration Guide](#migration-guide)

---

## Overview

The Stellar Intelligence Platform follows **Next.js 16 App Router conventions** with the **src/ directory pattern**. This structure provides:

- ✅ Clear separation between application code and configuration
- ✅ Scalable organization for growing codebases
- ✅ Type-safe imports with path aliases
- ✅ Feature-based component colocation
- ✅ Industry-standard conventions

**Key Technologies:**
- Next.js 15.5.2 with App Router
- TypeScript with strict mode
- Tailwind CSS 3.3
- React 18.2
- shadcn/ui component library

---

## Directory Structure

```
stellar/
├── src/                          # Application source code
│   ├── app/                      # Next.js App Router
│   │   ├── (marketing)/         # Public marketing pages (route group)
│   │   │   ├── _components/     # Marketing-specific components
│   │   │   ├── landing/         # → /landing
│   │   │   ├── demo/           # → /demo
│   │   │   ├── pricing/        # → /pricing
│   │   │   ├── layout.tsx      # Marketing layout
│   │   │   └── error.tsx       # Marketing error boundary
│   │   │
│   │   ├── dashboard/          # Authenticated user area
│   │   │   ├── _components/    # Dashboard-specific components
│   │   │   ├── assistant/      # → /dashboard/assistant
│   │   │   ├── claims/         # → /dashboard/claims
│   │   │   ├── inspection/     # → /dashboard/inspection
│   │   │   ├── reports/        # → /dashboard/reports
│   │   │   ├── layout.tsx      # Dashboard layout with sidebar
│   │   │   ├── error.tsx       # Dashboard error boundary
│   │   │   ├── loading.tsx     # Dashboard loading state
│   │   │   └── page.tsx        # → /dashboard
│   │   │
│   │   ├── admin/              # Admin-only area
│   │   │   ├── _components/    # Admin-specific components
│   │   │   ├── claims-center/  # → /admin/claims-center
│   │   │   ├── layout.tsx      # Admin layout with auth check
│   │   │   ├── error.tsx       # Admin error boundary
│   │   │   └── page.tsx        # → /admin
│   │   │
│   │   ├── api/                # API routes
│   │   │   ├── assistant/      # AI assistant endpoints
│   │   │   ├── claims/         # Claims processing
│   │   │   ├── chat/           # Chat endpoints
│   │   │   └── realtime/       # Real-time WebSocket
│   │   │
│   │   ├── error.tsx           # Global error boundary
│   │   ├── not-found.tsx       # Custom 404 page
│   │   ├── loading.tsx         # Global loading state
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Root page (redirects to /landing)
│   │   ├── globals.css         # Global styles
│   │   └── README.md           # App Router documentation
│   │
│   ├── components/             # Global shared components
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── Sidebar.tsx         # Global sidebar component
│   │   ├── MobileBottomNav.tsx # Mobile navigation
│   │   └── [...]               # Other reusable components
│   │
│   ├── lib/                    # Utilities and business logic
│   │   ├── ai/                 # AI service integrations
│   │   ├── agents/             # AI agent orchestration
│   │   ├── orchestrator/       # Workflow orchestration
│   │   ├── pdf/                # PDF generation
│   │   ├── voice/              # Voice integration
│   │   └── utils.ts            # Utility functions
│   │
│   ├── contexts/               # React context providers
│   │   ├── SidebarContext.tsx  # Sidebar state
│   │   └── theme-provider.tsx  # Dark mode provider
│   │
│   └── hooks/                  # Custom React hooks
│       └── useRealtimeVoice.ts # Real-time voice hook
│
├── public/                     # Static assets
│   └── images/                # Images served at /images/*
│
├── docs/                       # Documentation
│   ├── PROJECT_STRUCTURE.md   # This file
│   └── [...]                  # Other documentation
│
├── prisma/                     # Database schema
│   └── schema.prisma          # Prisma schema
│
├── .env.local                 # Environment variables (not committed)
├── .env.example               # Environment template
├── next.config.js             # Next.js configuration
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies
└── README.md                  # Project overview
```

---

## Design Principles

### 1. Separation of Concerns

**Problem:** Configuration files mixed with application code creates clutter and confusion.

**Solution:** The `src/` directory pattern separates concerns:
- `src/` → All application code (app, components, lib, etc.)
- Root → Only configuration files (package.json, tsconfig.json, etc.)

**Benefits:**
- Cleaner project root
- Easier to navigate
- Industry standard
- Better IDE organization

### 2. Feature-Based Organization

**Problem:** All components in one folder becomes unmanageable as projects grow.

**Solution:** Two-tier component organization:
- **Global components** (`src/components/`) - Shared across entire app
- **Private components** (`src/app/(route)/_components/`) - Feature-specific

**Benefits:**
- Components live near where they're used (colocation)
- Clear ownership and scope
- Easier to find and maintain
- Prevents accidental routing (underscore prefix)

### 3. Type Safety

**Problem:** Import errors and type mismatches during development.

**Solution:** Path aliases configured in TypeScript:
```typescript
"paths": {
  "@/*": ["./src/*"]
}
```

**Benefits:**
- Clean imports: `@/components/Button` vs `../../../components/Button`
- IDE autocomplete
- Refactoring safety
- Consistent import style

### 4. Progressive Enhancement

**Problem:** Poor user experience during loading and errors.

**Solution:** Next.js special files at appropriate levels:
- `error.tsx` - Error boundaries for graceful failure
- `loading.tsx` - Loading states for better UX
- `not-found.tsx` - Custom 404 pages

**Benefits:**
- Better error handling
- Smooth loading states
- Professional user experience
- SEO-friendly error pages

---

## Routing Architecture

### Route Groups

**What are Route Groups?**
Folders wrapped in parentheses `(folder)` organize routes **without affecting the URL structure**.

**When to Use:**
- Grouping routes that share a layout
- Organizing routes by section (marketing, dashboard, admin)
- Multiple root layouts at same level

**Example:**
```
app/
├── (marketing)/
│   ├── landing/page.tsx    → /landing (NOT /marketing/landing)
│   └── pricing/page.tsx    → /pricing (NOT /marketing/pricing)
└── dashboard/
    └── page.tsx            → /dashboard
```

### URL Mapping

| File Path | URL | Purpose |
|-----------|-----|---------|
| `app/page.tsx` | `/` | Root page (redirects to /landing) |
| `app/(marketing)/landing/page.tsx` | `/landing` | Marketing landing page |
| `app/(marketing)/demo/page.tsx` | `/demo` | Interactive demo |
| `app/dashboard/page.tsx` | `/dashboard` | User dashboard home |
| `app/dashboard/assistant/page.tsx` | `/dashboard/assistant` | AI assistant interface |
| `app/admin/page.tsx` | `/admin` | Admin dashboard |

### Private Folders

**What are Private Folders?**
Folders prefixed with underscore `_folder` are **excluded from routing** entirely.

**When to Use:**
- Route-specific components
- Utilities used only in that section
- Internal implementation details

**Example:**
```
app/dashboard/
├── _components/           # NOT routable
│   ├── MetricsCard.tsx   # Dashboard-only component
│   └── ChartWidget.tsx   # Dashboard-only component
└── page.tsx              # → /dashboard
```

### Special Files

Next.js recognizes specific filenames for routing and UI:

| File | Purpose | Required |
|------|---------|----------|
| `layout.tsx` | Shared UI wrapper for segment and children | Recommended |
| `page.tsx` | Makes route publicly accessible | Yes (for routes) |
| `loading.tsx` | Loading UI with automatic Suspense | Optional |
| `error.tsx` | Error boundary for runtime errors | Optional |
| `not-found.tsx` | Custom 404 UI | Optional |
| `route.ts` | API endpoint handler | Yes (for APIs) |

**Rendering Hierarchy:**
```
layout.tsx
  → error.tsx
    → loading.tsx
      → not-found.tsx
        → page.tsx
```

---

## Component Organization

### Two-Tier System

#### Tier 1: Global Components (`src/components/`)

**Purpose:** Components used across **multiple route groups or sections**.

**Examples:**
- UI primitives (buttons, inputs, cards)
- Layout components (navigation, footer)
- Form components
- Shared widgets

**Location:** `src/components/`

**Import:**
```typescript
import { Button } from '@/components/ui/button'
import Sidebar from '@/components/Sidebar'
```

#### Tier 2: Private Components (`src/app/(route)/_components/`)

**Purpose:** Components used **only within a specific route or feature**.

**Examples:**
- Dashboard-specific charts
- Marketing page sections
- Admin panel widgets

**Location:** `src/app/dashboard/_components/`

**Import:**
```typescript
import MobileChat from '@/app/dashboard/_components/mobile-chat-interface'
```

### Decision Matrix

**Use `src/components/` when:**
- ✅ Component is used in 2+ different route groups
- ✅ It's a UI primitive (button, input, card)
- ✅ It's a layout component (header, footer, sidebar)
- ✅ You want it easily discoverable for reuse

**Use `src/app/(route)/_components/` when:**
- ✅ Component is specific to one feature/route
- ✅ It contains route-specific business logic
- ✅ It's unlikely to be reused elsewhere
- ✅ You want to keep related code together

### shadcn/ui Components

All shadcn/ui components go in `src/components/ui/`:
```
src/components/ui/
├── button.tsx
├── card.tsx
├── dialog.tsx
├── input.tsx
└── [...]
```

**Why?**
- Official shadcn/ui convention
- Easy to update with CLI
- Clear distinction from custom components

---

## Configuration Standards

### TypeScript Configuration

**`tsconfig.json` Requirements:**

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]  // MUST point to src/
    },
    "strict": true,
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "preserve",
    "moduleResolution": "bundler"
  }
}
```

**Why:**
- Path aliases enable clean imports
- Strict mode catches errors early
- Modern ES features for better performance

### Tailwind Configuration

**`tailwind.config.ts` Requirements:**

```typescript
const config: Config = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    // NOT './pages/**/*' (we use App Router, not Pages Router)
  ],
  // ...
}
```

**Why:**
- Must include src/ paths for content detection
- Excludes unused paths for faster builds
- Prevents styles from being purged

### Environment Variables

**Structure:**
```
.env.local          # Local development (gitignored)
.env.example        # Template for team (committed)
```

**Naming Convention:**
```bash
# Public variables (available in browser)
NEXT_PUBLIC_API_URL=...

# Private variables (server-only)
DATABASE_URL=...
ANTHROPIC_API_KEY=...
```

---

## Best Practices

### 1. File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| React Components | PascalCase | `UserProfile.tsx` |
| Utilities | kebab-case | `format-date.ts` |
| Hooks | camelCase with use prefix | `useAuth.ts` |
| Types/Interfaces | PascalCase | `User.ts` |
| Constants | SCREAMING_SNAKE_CASE | `API_ENDPOINTS.ts` |
| Next.js Special Files | lowercase | `page.tsx`, `layout.tsx` |

### 2. Import Organization

**Order:**
1. External dependencies
2. Internal aliases (`@/...`)
3. Relative imports
4. Types (if separate)
5. Styles

**Example:**
```typescript
// 1. External
import { useState } from 'react'
import { Button } from '@radix-ui/react-button'

// 2. Internal aliases
import { Card } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

// 3. Relative
import { UserAvatar } from './UserAvatar'

// 4. Types
import type { User } from '@/types'

// 5. Styles (if using CSS modules)
import styles from './component.module.css'
```

### 3. Component Structure

**Recommended structure for React components:**

```typescript
'use client' // Only if needed (client component)

// Imports
import { useState } from 'react'
import { Button } from '@/components/ui/button'

// Types
interface ComponentProps {
  title: string
  onAction: () => void
}

// Component
export default function Component({ title, onAction }: ComponentProps) {
  // Hooks
  const [state, setState] = useState()

  // Event handlers
  const handleClick = () => {
    // ...
  }

  // Render
  return (
    <div>
      {/* ... */}
    </div>
  )
}
```

### 4. API Route Organization

**Pattern:**
```
src/app/api/
├── (public)/         # Public endpoints (no auth)
├── (protected)/      # Authenticated endpoints
└── (admin)/          # Admin-only endpoints
```

**File structure:**
```typescript
// src/app/api/users/route.ts
export async function GET(request: Request) {
  // Handle GET request
}

export async function POST(request: Request) {
  // Handle POST request
}
```

### 5. Error Handling

**Hierarchy of error boundaries:**

```
app/error.tsx                    # Global catch-all
app/dashboard/error.tsx          # Dashboard-specific
app/dashboard/claims/error.tsx   # Claims-specific (if needed)
```

**Specificity wins:** Most specific error boundary catches first.

### 6. Loading States

**Progressive loading:**

```
app/loading.tsx                  # Global loading
app/dashboard/loading.tsx        # Dashboard loading
app/dashboard/claims/loading.tsx # Claims loading
```

**Use Suspense boundaries** for component-level loading.

---

## Migration Guide

### Adding a New Route

**Step 1:** Determine the section
- Marketing? → `src/app/(marketing)/`
- User feature? → `src/app/dashboard/`
- Admin? → `src/app/admin/`

**Step 2:** Create the route folder
```bash
mkdir -p src/app/dashboard/new-feature
```

**Step 3:** Add page file
```typescript
// src/app/dashboard/new-feature/page.tsx
export default function NewFeaturePage() {
  return <div>New Feature</div>
}
```

**Step 4:** Add components (if needed)
```bash
mkdir -p src/app/dashboard/new-feature/_components
```

### Adding a New Component

**Decision Tree:**

1. **Is it used in 2+ different sections?**
   - Yes → `src/components/`
   - No → Continue

2. **Is it a UI primitive or layout component?**
   - Yes → `src/components/ui/` or `src/components/`
   - No → Continue

3. **Which section uses it?**
   - Dashboard → `src/app/dashboard/_components/`
   - Marketing → `src/app/(marketing)/_components/`
   - Admin → `src/app/admin/_components/`

### Refactoring to This Structure

**If you have:**
```
app/
├── components/  # Everything mixed together
├── page.tsx
└── dashboard/
```

**Migrate to:**

1. Create `src/` directory
2. Move `app/` → `src/app/`
3. Create `src/components/` for global components
4. Create private folders: `src/app/dashboard/_components/`
5. Sort components into appropriate locations
6. Update imports
7. Update configs (tsconfig.json, tailwind.config.ts)

---

## Framework Checklist

Use this checklist when starting a new Next.js project or auditing an existing one:

### Structure
- [ ] Using `src/` directory for application code
- [ ] Configuration files at project root
- [ ] Route groups for organizing sections
- [ ] Private folders (`_components`) for feature-specific code
- [ ] Global components in `src/components/`

### Configuration
- [ ] TypeScript paths point to `./src/*`
- [ ] Tailwind content includes `./src/**/*`
- [ ] Environment variables follow NEXT_PUBLIC_ convention
- [ ] `.env.example` committed to repo

### Routes
- [ ] Special files (error.tsx, loading.tsx, not-found.tsx) at appropriate levels
- [ ] Each major section has its own layout
- [ ] API routes organized by access level
- [ ] URL structure is clean and logical

### Components
- [ ] Two-tier system (global vs private)
- [ ] shadcn/ui components in `src/components/ui/`
- [ ] Clear naming conventions
- [ ] Proper TypeScript types

### Code Quality
- [ ] Consistent import organization
- [ ] TypeScript strict mode enabled
- [ ] No unused dependencies
- [ ] Documentation up to date

---

## Common Pitfalls to Avoid

### ❌ Don't Do This

**Mixing app code with config files:**
```
❌ components/ (at root instead of src/)
❌ lib/ (at root instead of src/)
```

**Forgetting to update paths:**
```typescript
❌ "@/*": ["./*"]  // Should be "./src/*"
```

**Using route groups incorrectly:**
```
❌ app/(dashboard)/dashboard/page.tsx  // Redundant
```

**Putting all components in one folder:**
```
❌ src/components/
    ├── DashboardChart.tsx      # Should be in dashboard/_components
    ├── MarketingHero.tsx       # Should be in (marketing)/_components
    └── Button.tsx              # Correctly placed
```

### ✅ Do This Instead

**Clean separation:**
```
✅ src/components/       # Global only
✅ src/app/              # App Router
✅ src/lib/              # Utilities
```

**Correct paths:**
```typescript
✅ "@/*": ["./src/*"]
```

**Simple route groups:**
```
✅ app/(marketing)/landing/page.tsx  → /landing
```

**Organized components:**
```
✅ src/components/ui/Button.tsx           # Global UI
✅ src/app/dashboard/_components/Chart.tsx # Private feature
```

---

## Conclusion

This structure is designed to:
- **Scale** - Grow with your project without reorganization
- **Maintain** - Easy to find and update code
- **Onboard** - New developers understand structure quickly
- **Standardize** - Follows Next.js and industry conventions

**Key Takeaways:**

1. Use `src/` to separate code from config
2. Use route groups to organize without affecting URLs
3. Use private folders for feature-specific components
4. Keep global components truly global
5. Configure TypeScript and Tailwind for `src/`
6. Add error and loading states at appropriate levels

---

## References

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Next.js Project Structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Private Folders](https://nextjs.org/docs/app/building-your-application/routing/colocation#private-folders)
- [TypeScript Configuration](https://nextjs.org/docs/app/building-your-application/configuring/typescript)

---

**Last Updated:** November 2024
**Next.js Version:** 15.5.2
**Maintained By:** Stellar Development Team
