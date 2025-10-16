import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Mail } from 'lucide-react'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen app-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/20">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-foreground">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We&#39;ve sent you a verification link
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Email Verification Required</CardTitle>
            <CardDescription>
              Please check your email and click the verification link to activate your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                If you don't see the email, check your spam folder or{' '}                <Button variant="link" className="p-0 h-auto">
                  resend verification email
                </Button>
              </p>
            </div>

            <div className="flex flex-col space-y-2">
              <Button asChild>
                <Link href="/auth/login">
                  Back to Sign In
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
