# App Router Structure

This directory contains the Next.js 15 App Router implementation for the Stellar Intelligence Platform.

## Route Groups

We use **route groups** (folders with parentheses) to organize routes without affecting the URL structure:

### `(marketing)` - Public Marketing Pages
**No authentication required**

- `/landing` - Main marketing landing page with features, testimonials, and CTA
- `/demo` - Interactive product demo showcasing AI capabilities
- `/pricing` - Pricing plans and subscription information
- `/pricing-print` - Print-friendly version of pricing page

**Purpose:** Convert visitors into users through compelling content and demonstrations.

### `(dashboard)` - Authenticated User Application
**Requires user authentication**

- `/dashboard` - Main dashboard with overview and quick actions
- `/dashboard/assistant` - AI-powered assistant interface
- `/dashboard/claims` - Claims management and tracking
- `/dashboard/inspection` - Property inspection workflow
  - `/inspection/new` - Start new inspection
  - `/inspection/[id]/start` - Begin inspection process
  - `/inspection/[id]/areas` - Select areas to inspect
  - `/inspection/[id]/area/[areaId]` - Inspect specific area
  - `/inspection/[id]/review` - Review inspection results
  - `/inspection/[id]/report` - Generate inspection report
  - `/inspection/[id]/complete` - Complete inspection
- `/dashboard/reports` - View and manage reports
  - `/reports/[id]/review` - Review specific report

**Purpose:** Core application functionality for authenticated users.

### `(admin)` - Admin Panel
**Requires admin role**

- `/admin` - Admin dashboard with system overview
- `/admin/claims-center` - Advanced claims management and analytics

**Purpose:** Administrative functions for managing users, claims, and system configuration.

## Special Files

### Global Files (app/ root)
- `layout.tsx` - Root layout with theme provider and global styles
- `page.tsx` - Root page (redirects to /landing)
- `error.tsx` - Global error boundary
- `not-found.tsx` - Custom 404 page
- `loading.tsx` - Global loading state

### Route Group Files
Each route group has its own:
- `layout.tsx` - Shared layout for the group (sidebar, navigation, auth checks)
- `error.tsx` - Error boundary specific to that section
- `loading.tsx` - Loading states for that section

## API Routes

Located in `app/api/`:

- `/api/admin/*` - Admin-only API endpoints
- `/api/assistant/*` - AI assistant endpoints
- `/api/chat/*` - Chat and conversation endpoints
- `/api/claims/*` - Claims processing endpoints
- `/api/enrichment/*` - Data enrichment services
- `/api/orchestrate/*` - Workflow orchestration
- `/api/realtime/*` - Real-time updates and WebSocket
- `/api/stella-claims/*` - Stella-specific claim handling
- `/api/stella-leads/*` - Lead management

## Private Folders

Folders prefixed with underscore (`_`) are **private** and excluded from routing:

- `_components/` - Route-specific components not used elsewhere
- `_lib/` - Route-specific utilities and helpers
- `_shared/` - Shared utilities within app directory

**Example:**
```
app/
├── (dashboard)/
│   ├── _components/      # Dashboard-only components
│   │   ├── MetricsCard.tsx
│   │   └── RecentActivity.tsx
│   ├── page.tsx
│   └── layout.tsx
```

## URL Structure

Route groups **do not appear in URLs**:

| File Path | URL |
|-----------|-----|
| `app/(marketing)/landing/page.tsx` | `/landing` |
| `app/(marketing)/demo/page.tsx` | `/demo` |
| `app/(dashboard)/page.tsx` | `/dashboard` |
| `app/(dashboard)/claims/page.tsx` | `/dashboard/claims` |
| `app/(admin)/page.tsx` | `/admin` |

## Authentication & Authorization

- **Marketing routes** - Public, no auth required
- **Dashboard routes** - Protected by authentication middleware
- **Admin routes** - Protected by admin role check in layout

## File Naming Conventions

- `page.tsx` - Route page component
- `layout.tsx` - Shared layout wrapper
- `loading.tsx` - Loading UI
- `error.tsx` - Error boundary
- `not-found.tsx` - 404 page
- `route.ts` - API route handler
- Component files use PascalCase: `ComponentName.tsx`
- Utility files use kebab-case: `utility-name.ts`

## Best Practices

1. **Colocation** - Keep components close to where they're used
2. **Private folders** - Use `_folder` for non-routable organizational folders
3. **Route groups** - Use `(group)` to organize routes without affecting URLs
4. **Special files** - Leverage `error.tsx` and `loading.tsx` for better UX
5. **Layouts** - Use layouts to share UI and reduce code duplication

## Learn More

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Private Folders](https://nextjs.org/docs/app/building-your-application/routing/colocation#private-folders)
