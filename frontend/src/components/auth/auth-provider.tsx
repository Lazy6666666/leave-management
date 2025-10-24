'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, type AuthChangeEvent, type Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Employee } from '@/types'

interface AuthContextType {
  user: User | null
  employee: Employee | null
  loading: boolean
  signOut: () => Promise<void>
  refreshEmployee: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user ?? null)
      
      if (user) {
        await fetchEmployee(user.id)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchEmployee(session.user.id)
        } else {
          setEmployee(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchEmployee = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('supabase_id', userId)
        .single()

      if (error) {
        console.error('Error fetching employee:', error)
        return
      }

      setEmployee(data)
    } catch (error) {
      console.error('Error fetching employee:', error)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setEmployee(null)
  }

  const refreshEmployee = async () => {
    if (user) {
      await fetchEmployee(user.id)
    }
  }

  const value = {
    user,
    employee,
    loading,
    signOut,
    refreshEmployee,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
