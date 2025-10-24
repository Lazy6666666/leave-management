import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PermissionGate } from '@/components/auth/permission-gate'

describe('PermissionGate', () => {
  it('renders children when user has the required permission', () => {
    render(
      <PermissionGate userRole="admin" permission="leaves.approve">
        <div data-testid="protected-content">Protected Content</div>
      </PermissionGate>
    )
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })
  
  it('renders fallback when user does not have the required permission', () => {
    render(
      <PermissionGate 
        userRole="employee" 
        permission="leaves.approve"
        fallback={<div data-testid="fallback-content">Access Denied</div>}
      >
        <div data-testid="protected-content">Protected Content</div>
      </PermissionGate>
    )
    
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    expect(screen.getByTestId('fallback-content')).toBeInTheDocument()
  })
  
  it('renders children when user has all required permissions', () => {
    render(
      <PermissionGate 
        userRole="hr" 
        permissions={['leaves.view', 'leaves.approve']}
      >
        <div data-testid="protected-content">Protected Content</div>
      </PermissionGate>
    )
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })
  
  it('renders children when user has any of the required permissions', () => {
    render(
      <PermissionGate 
        userRole="manager" 
        anyPermission={['leaves.delete', 'leaves.approve']}
      >
        <div data-testid="protected-content">Protected Content</div>
      </PermissionGate>
    )
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })
  
  it('renders children when no permission checks are specified', () => {
    render(
      <PermissionGate userRole="employee">
        <div data-testid="protected-content">Protected Content</div>
      </PermissionGate>
    )
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })
})