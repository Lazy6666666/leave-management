import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import { server } from './mocks/server'
// Mock Next.js router for components using useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

// Mock Supabase client used in client components
vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } }),
    },
  }),
}))

// Mock Supabase browser client used by services (realtime + queries)
vi.mock('@/lib/supabase/client', () => {
  const makeQueryBuilder = (): any => ({
    select: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
    update: vi.fn().mockResolvedValue({ error: null }),
    delete: vi.fn().mockResolvedValue({ error: null }),
    insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    single: vi.fn().mockResolvedValue({ data: {}, error: null }),
    eq: vi.fn().mockReturnValue(makeQueryBuilder()),
    order: vi.fn().mockReturnValue(makeQueryBuilder()),
    limit: vi.fn().mockReturnValue(makeQueryBuilder()),
    range: vi.fn().mockReturnValue(makeQueryBuilder()),
  })

  const mockSubscription = {
    unsubscribe: vi.fn(),
  }

  const mockChannel = () => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnValue(mockSubscription),
  })

  const client = {
    channel: vi.fn().mockImplementation(mockChannel),
    from: vi.fn().mockImplementation(makeQueryBuilder),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
    },
  }

  return {
    createClient: () => client,
    supabase: client,
  }
})

// Establish API mocking before all tests
beforeAll(() => server.listen())

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => server.resetHandlers())

// Clean up after the tests are finished
afterAll(() => server.close())
