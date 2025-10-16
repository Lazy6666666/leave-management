'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function PasswordResetForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const supabase = createClient()

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      setIsSubmitted(true)
      toast.success('Password reset email sent! Check your inbox.')
    } catch (error) {
      console.error('Password reset error:', error)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">Check your email</h3>
          <p className="text-sm text-gray-600">
            We&apos;ve sent a password reset link to {form.getValues('email')}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            setIsSubmitted(false)
            form.reset()
          }}
        >
          Send another email
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          {...form.register('email')}
          disabled={isLoading}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-red-600">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
      >
        {isLoading ? 'Sending...' : 'Send Reset Link'}
      </Button>
    </form>
  )
}
