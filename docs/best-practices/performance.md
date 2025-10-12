# Performance Optimization Best Practices

## Table of Contents
- [Core Web Vitals](#core-web-vitals)
- [Bundle Optimization](#bundle-optimization)
- [Database Performance](#database-performance)
- [Caching Strategies](#caching-strategies)
- [Image Optimization](#image-optimization)
- [Code Splitting](#code-splitting)
- [Monitoring & Analytics](#monitoring--analytics)
- [CDN & Edge Computing](#cdn--edge-computing)

## Core Web Vitals

### LCP (Largest Contentful Paint) < 2.5s
```typescript
// Optimize LCP with proper image dimensions and preloading
export function OptimizedImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      priority={true}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
    />
  )
}

// Preload critical resources
export function Head() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
    </>
  )
}
```

### FID (First Input Delay) < 100ms
```typescript
// Optimize FID with proper event handling
export function OptimizedButton() {
  const [loading, setLoading] = useState(false)

  const handleClick = useCallback(async () => {
    setLoading(true)
    try {
      await performAction()
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="enabled:active:scale-95 transition-transform"
    >
      {loading ? 'Loading...' : 'Click me'}
    </button>
  )
}
```

### CLS (Cumulative Layout Shift) < 0.1
```typescript
// Prevent CLS with proper sizing
export function StableLayout() {
  return (
    <div className="min-h-screen">
      <header className="h-16 border-b">
        {/* Fixed height header */}
      </header>
      <main className="flex-1">
        <Suspense fallback={<div className="h-64 animate-pulse" />}>
          <DynamicContent />
        </Suspense>
      </main>
    </div>
  )
}
```

## Bundle Optimization

### Bundle Analyzer Setup
```json
// package.json
{
  "scripts": {
    "analyze": "cross-env ANALYZE=true next build",
    "build": "next build"
  }
}
```

### Tree Shaking Implementation
```typescript
// Properly export for tree shaking
export { Button } from './button'
export { Input } from './input'
export { Card } from './card'

// Avoid barrel exports that include everything
// ❌ export * from './components'
// ✅ export { Button, Input, Card } from './components'
```

### Dynamic Imports Pattern
```typescript
// Lazy load heavy components
const AdminPanel = lazy(() => import('./admin/AdminPanel'))
const Calendar = lazy(() => import('./calendar/Calendar'))
const Reports = lazy(() => import('./reports/Reports'))

// Route-based code splitting
const LeaveRoutes = [
  {
    path: '/leaves',
    component: lazy(() => import('./pages/leaves')),
  },
  {
    path: '/leaves/new',
    component: lazy(() => import('./pages/leaves/new')),
  },
  {
    path: '/leaves/:id',
    component: lazy(() => import('./pages/leaves/[id]')),
  },
]
```

## Database Performance

### Query Optimization
```sql
-- Use proper indexes
CREATE INDEX CONCURRENTLY idx_leaves_status_requester
ON leaves(status, requester_id)
WHERE status IN ('pending', 'approved');

-- Optimize complex queries with views
CREATE MATERIALIZED VIEW leave_summary AS
SELECT
  requester_id,
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_requests,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_count
FROM leaves
GROUP BY requester_id, DATE_TRUNC('month', created_at);

-- Refresh materialized view periodically
REFRESH MATERIALIZED VIEW CONCURRENTLY leave_summary;
```

### Supabase Performance Patterns
```typescript
// Use select with specific columns
const { data } = await supabase
  .from('leaves')
  .select('id, status, created_at')
  .eq('requester_id', userId)
  .order('created_at', { ascending: false })
  .limit(50)

// Use RPC for complex operations
const { data } = await supabase.rpc('get_leave_summary', {
  p_user_id: userId,
  p_month: currentMonth,
  p_year: currentYear
})
```

## Caching Strategies

### React Query Caching
```typescript
// Configure React Query for optimal caching
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && 'status' in error && typeof error.status === 'number') {
          if (error.status >= 400 && error.status < 500) return false
        }
        return failureCount < 3
      },
    },
  },
})

// Prefetch critical data
export function usePrefetchLeaves() {
  const queryClient = useQueryClient()

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ['leaves'],
      queryFn: fetchLeaves,
      staleTime: 5 * 60 * 1000,
    })
  }, [queryClient])
}
```

### Next.js Cache Configuration
```typescript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}
```

## Image Optimization

### Next.js Image Component Best Practices
```typescript
// Responsive images with proper sizing
export function ResponsiveImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      fill
      style={{ objectFit: 'cover' }}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
    />
  )
}

// Generate blur placeholder
export async function getBlurDataURL(src: string) {
  const response = await fetch(src)
  const buffer = await response.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  return `data:image/jpeg;base64,${base64}`
}
```

### Image CDN Optimization
```typescript
// Use Supabase Storage with optimized settings
export async function uploadOptimizedImage(file: File) {
  const { data, error } = await supabase.storage
    .from('images')
    .upload(`leaves/${Date.now()}-${file.name}`, file, {
      cacheControl: '31536000', // 1 year
      upsert: false,
      contentType: file.type,
    })

  if (error) throw error
  return data
}
```

## Code Splitting

### Route-Based Splitting
```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="container mx-auto py-6">
        {children}
      </main>
    </div>
  )
}

// app/dashboard/leaves/page.tsx
export default function LeavesPage() {
  return (
    <div>
      <h1>Leave Management</h1>
      <LeavesTable />
    </div>
  )
}
```

### Component-Based Splitting
```typescript
// Lazy load heavy admin components
const AdminReports = lazy(() =>
  import('./admin/AdminReports').then(module => ({
    default: module.AdminReports
  }))
)

const CalendarView = lazy(() =>
  import('./calendar/CalendarView').then(module => ({
    default: module.CalendarView
  }))
)
```

## Monitoring & Analytics

### Performance Monitoring Setup
```typescript
// lib/monitoring.ts
export function reportWebVitals(metric: NextWebVitalsMetric) {
  // Send to analytics service
  console.log(metric)

  // Example: Send to Vercel Analytics
  if (typeof window !== 'undefined' && 'gtag' in window) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    })
  }
}
```

### Custom Performance Metrics
```typescript
// Track custom business metrics
export function trackBusinessMetric(name: string, value: number, tags?: Record<string, string>) {
  if (typeof window !== 'undefined') {
    // Send to your analytics service
    window.gtag?.('event', name, {
      event_category: 'Business',
      value: value,
      custom_parameters: tags,
    })
  }
}

// Usage in components
export function useTrackLeaveSubmission() {
  return useCallback((leaveData: LeaveFormData) => {
    trackBusinessMetric('leave_submitted', 1, {
      leave_type: leaveData.leaveType,
      duration_days: leaveData.duration,
    })
  }, [])
}
```

## CDN & Edge Computing

### Vercel Edge Configuration
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add security headers at edge
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

### Supabase Edge Functions Optimization
```typescript
// supabase/functions/optimized-leave-lookup/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { userId, limit = 50 } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Optimized query with proper indexing
  const { data, error } = await supabase
    .from('leaves')
    .select(`
      id,
      status,
      start_date,
      end_date,
      leave_types(name)
    `)
    .eq('requester_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ data }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
    },
  })
})
```

## Performance Budgets

### Bundle Size Budgets
```json
// bundle-analyzer.config.js
module.exports = {
  budgets: [
    {
      path: 'chunks/main.*.js',
      maxSize: '200 kB',
      warnings: true,
    },
    {
      path: 'chunks/vendor.*.js',
      maxSize: '500 kB',
      warnings: true,
    },
    {
      path: 'chunks/runtime.*.js',
      maxSize: '20 kB',
      warnings: true,
    },
  ],
}
```

### Performance Testing Thresholds
```typescript
// performance-thresholds.ts
export const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals
  LCP: 2500, // milliseconds
  FID: 100,  // milliseconds
  CLS: 0.1,  // score

  // Custom metrics
  TIME_TO_FIRST_BYTE: 800,  // milliseconds
  FIRST_PAINT: 1500,        // milliseconds
  LARGEST_CONTENTFUL_PAINT: 2500, // milliseconds

  // Bundle sizes
  MAIN_BUNDLE_SIZE: 200 * 1024,  // 200KB
  VENDOR_BUNDLE_SIZE: 500 * 1024, // 500KB

  // Database queries
  SLOW_QUERY_THRESHOLD: 1000, // milliseconds
} as const
```

## Best Practices Summary

### Performance Optimization Checklist
- [ ] Optimize images with proper dimensions and formats
- [ ] Implement code splitting for all routes and heavy components
- [ ] Use React Query for intelligent caching and background updates
- [ ] Add proper loading states and skeleton screens
- [ ] Implement database query optimization and proper indexing
- [ ] Set up performance monitoring and Core Web Vitals tracking
- [ ] Use CDN and edge computing for global performance
- [ ] Implement proper bundle analysis and size budgets
- [ ] Optimize fonts with preload and display swap
- [ ] Use proper meta tags for SEO and social sharing

### Monitoring Setup
- [ ] Core Web Vitals tracking with Google Analytics or Vercel Analytics
- [ ] Custom performance metrics for business-critical operations
- [ ] Bundle size monitoring with automated alerts
- [ ] Database query performance monitoring
- [ ] Error tracking and performance regression detection
