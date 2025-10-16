'use client'

import { useAuth } from './auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import type { UserRole } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  fallback?: React.ReactNode
}

export function ProtectedRoute({
  children,
  requiredRole,
  fallback
}: ProtectedRouteProps) {
  const { user, employee, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-4 text-sm text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return fallback || null
  }

  if (requiredRole && employee?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-sm text-gray-600 text-center">
              You don't have permission to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}