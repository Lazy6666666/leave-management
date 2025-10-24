import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { UserRole } from '@/types'

export async function middleware(request: NextRequest) {
  const updateResult = await updateSession(request)

  if (updateResult instanceof NextResponse) {
    return updateResult
  }

  const { supabase, response } = updateResult

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define routes by access level
  const authRoutes = ['/auth/login', '/auth/register', '/auth/verify-email', '/auth/reset-password']
  const protectedRoutes = ['/dashboard', '/profile']
  const managerRoutes = ['/team', '/approvals']
  const hrRoutes = ['/employees', '/leave-types', '/reports']
  const adminRoutes = ['/admin', '/settings', '/audit-logs']
  
  const path = request.nextUrl.pathname
  const isAuthRoute = authRoutes.some(route => path.startsWith(route))
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isManagerRoute = managerRoutes.some(route => path.startsWith(route))
  const isHrRoute = hrRoutes.some(route => path.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => path.startsWith(route))

  // Redirect unauthenticated users from protected routes to login
  if ((isProtectedRoute || isManagerRoute || isHrRoute || isAdminRoute) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && user) {
    const redirectTo = request.nextUrl.searchParams.get('redirectTo')
    const url = request.nextUrl.clone()
    url.pathname = redirectTo || '/dashboard'
    url.searchParams.delete('redirectTo')
    return NextResponse.redirect(url)
  }

  // Role-based access control for authenticated users
  if (user) {
    const userRole = user.user_metadata?.role as UserRole || 'employee'
    
    // Check role-based access
    if (
      (isAdminRoute && userRole !== 'admin') ||
      (isHrRoute && !['admin', 'hr'].includes(userRole)) ||
      (isManagerRoute && !['admin', 'hr', 'manager'].includes(userRole))
    ) {
      // Redirect to dashboard if unauthorized
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
