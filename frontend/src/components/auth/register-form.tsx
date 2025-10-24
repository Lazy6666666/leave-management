'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          },
        },
      })

      if (error) {
        toast.error(error.message)
        return
      }

      if (authData.user) {
        toast.success('Account created successfully! Please check your email to verify your account.')
        router.push('/auth/verify-email')
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="Enter your first name"
            {...form.register('firstName')}
            disabled={isLoading}
          />
          {form.formState.errors.firstName && (
            <p className="text-sm text-red-600">
              {form.formState.errors.firstName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Enter your last name"
            {...form.register('lastName')}
            disabled={isLoading}
          />
          {form.formState.errors.lastName && (
            <p className="text-sm text-red-600">
              {form.formState.errors.lastName.message}
            </p>
          )}
        </div>
      </div>

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

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          {...form.register('password')}
          disabled={isLoading}
        />
        {form.formState.errors.password && (
          <p className="text-sm text-red-600">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          {...form.register('confirmPassword')}
          disabled={isLoading}
        />
        {form.formState.errors.confirmPassword && (
          <p className="text-sm text-red-600">
            {form.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
      >
        {isLoading ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  )
}
