'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updatePasswordSchema, type UpdatePasswordFormData } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function UpdatePasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: UpdatePasswordFormData) => {
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Password updated successfully!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Password update error:', error)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your new password"
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
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your new password"
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
        {isLoading ? 'Updating...' : 'Update Password'}
      </Button>
    </form>
  )
}
