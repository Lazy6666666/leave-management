import { PasswordResetForm } from '@/components/auth/password-reset-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen app-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Reset your password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email to receive a password reset link
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Password Reset</CardTitle>
            <CardDescription>
              We&#39;ll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordResetForm />
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link 
              href="/auth/login" 
              className="font-medium text-primary hover:text-primary/80"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
