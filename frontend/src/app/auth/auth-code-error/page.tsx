import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen app-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-destructive/20">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-foreground">Authentication Error</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            There was a problem with your authentication
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Something went wrong</CardTitle>
            <CardDescription>
              We couldn&#39;t complete your authentication. This could be due to an expired or invalid link.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Please try signing in again or contact support if the problem persists.
              </p>
            </div>

            <div className="flex flex-col space-y-2">
              <Button asChild>
                <Link href="/auth/login">
                  Try Again
                </Link>
              </Button>
              
              <Button variant="outline" asChild>
                <Link href="/">
                  Return to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
