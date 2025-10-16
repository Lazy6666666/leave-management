'use client'

import { ReactNode, useState } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/auth/auth-provider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  // Create a QueryClient and keep it stable across renders
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Reasonable defaults to avoid aggressive retries in dev
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <AuthProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}