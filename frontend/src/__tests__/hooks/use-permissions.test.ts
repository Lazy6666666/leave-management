import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePermissions } from '@/hooks/use-permissions'

describe('usePermissions', () => {
  it('returns correct permissions for employee role', () => {
    const { result } = renderHook(() => usePermissions('employee'))
    
    expect(result.current.role).toBe('employee')
    expect(result.current.can('leaves.create')).toBe(true)
    expect(result.current.can('leaves.approve')).toBe(false)
    expect(result.current.can('users.create')).toBe(false)
  })
  
  it('returns correct permissions for manager role', () => {
    const { result } = renderHook(() => usePermissions('manager'))
    
    expect(result.current.role).toBe('manager')
    expect(result.current.can('leaves.create')).toBe(true)
    expect(result.current.can('leaves.approve')).toBe(true)
    expect(result.current.can('users.create')).toBe(false)
  })
  
  it('returns correct permissions for hr role', () => {
    const { result } = renderHook(() => usePermissions('hr'))
    
    expect(result.current.role).toBe('hr')
    expect(result.current.can('leaves.create')).toBe(true)
    expect(result.current.can('leaves.approve')).toBe(true)
    expect(result.current.can('users.create')).toBe(true)
    expect(result.current.can('settings.update')).toBe(false)
  })
  
  it('returns correct permissions for admin role', () => {
    const { result } = renderHook(() => usePermissions('admin'))
    
    expect(result.current.role).toBe('admin')
    expect(result.current.can('leaves.create')).toBe(true)
    expect(result.current.can('leaves.approve')).toBe(true)
    expect(result.current.can('users.create')).toBe(true)
    expect(result.current.can('settings.update')).toBe(true)
  })
  
  it('correctly checks for multiple permissions with canAll', () => {
    const { result } = renderHook(() => usePermissions('manager'))
    
    expect(result.current.canAll(['leaves.view', 'leaves.approve'])).toBe(true)
    expect(result.current.canAll(['leaves.view', 'users.create'])).toBe(false)
  })
  
  it('correctly checks for any permission with canAny', () => {
    const { result } = renderHook(() => usePermissions('employee'))
    
    expect(result.current.canAny(['leaves.view', 'leaves.approve'])).toBe(true)
    expect(result.current.canAny(['leaves.approve', 'users.create'])).toBe(false)
  })
  
  it('returns all permissions for a role', () => {
    const { result } = renderHook(() => usePermissions('employee'))
    const permissions = result.current.getAllPermissions()
    
    expect(permissions).toContain('leaves.create')
    expect(permissions).toContain('leaves.view')
    expect(permissions).toContain('leave-types.view')
    expect(permissions).toContain('leave-balances.view')
    expect(permissions.length).toBe(4)
  })
})