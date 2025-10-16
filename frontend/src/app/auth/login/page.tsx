import { LoginForm } from '@/components/auth/login-form'
import { ThemeToggle } from '@/components/theme-toggle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="login-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        <Card className="glass-card bg-transparent">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-foreground">Welcome back</CardTitle>
            <CardDescription className="mt-1 text-sm text-muted-foreground">
              Sign in to your Leave Management account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link 
                  href="/auth/register" 
                  className="font-medium text-primary hover:text-primary/80"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
