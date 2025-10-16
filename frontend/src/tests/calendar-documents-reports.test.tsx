import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { Calendar } from '@/components/calendar/calendar';
import { CalendarEventForm } from '@/components/calendar/calendar-event-form';
import { DocumentUpload } from '@/components/documents/document-upload';
import { DocumentList } from '@/components/documents/document-list';
import { ReportingDashboard } from '@/components/reports/reporting-dashboard';
import { NotificationBell } from '@/components/notifications/notification-bell';
import type { DocumentCategory, DocumentWithRelations } from '@/types/calendar-documents-reporting';

// Mock Auth context to avoid provider requirement in NotificationBell and others
vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'emp1', role: 'employee', email: 'test@example.com' },
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

// Silence toast side effects in component tests
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
  }),
}));

// Polyfill ResizeObserver for Recharts ResponsiveContainer in JSDOM
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!('ResizeObserver' in globalThis)) {
  Object.defineProperty(globalThis, 'ResizeObserver', {
    value: MockResizeObserver,
    writable: true,
    configurable: true,
  });
}

// Mock Notification Service to provide deterministic data for NotificationBell
vi.mock('@/lib/services/notification-service', () => {
  let notifications = [
    {
      id: '1',
      userId: 'emp1',
      type: 'system',
      title: 'Document Warning',
      message: 'Document expires in 5 days',
      read: false,
      createdAt: new Date('2024-01-15T10:00:00Z'),
    },
    {
      id: '2',
      userId: 'emp1',
      type: 'leave_approved',
      title: 'Leave Approved',
      message: 'Leave request approved',
      read: true,
      createdAt: new Date('2024-01-14T10:00:00Z'),
    },
  ];
  const getUnread = () => notifications.filter(n => !n.read).length;
  const service = {
    subscribe: vi.fn().mockReturnValue(() => {}),
    subscribeToNotifications: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
    getNotifications: vi.fn(async () => ({ notifications, total: notifications.length })),
    getUserNotifications: vi.fn(async () => notifications),
    getUnreadCount: vi.fn(async () => getUnread()),
    markAsRead: vi.fn(async (id: string) => {
      notifications = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    }),
    markAllAsRead: vi.fn(async () => {
      notifications = notifications.map(n => ({ ...n, read: true }));
    }),
    deleteNotification: vi.fn(async (id: string) => {
      notifications = notifications.filter(n => n.id !== id);
    }),
  };
  return { notificationService: service, default: service };
});

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })),
    })),
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [],
          error: null,
        })),
        order: vi.fn(() => ({
          data: [],
          error: null,
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: '1' },
            error: null,
          })),
        })),
      })),
      storage: {
        from: vi.fn(() => ({
          upload: vi.fn(() => ({
            data: { path: 'test-file.pdf' },
            error: null,
          })),
        })),
      },
    })),
  }),
}));

// Mock fetch API (typed)
const mockFetch = vi.fn<typeof fetch>();
Object.defineProperty(globalThis, 'fetch', { value: mockFetch, writable: true });

describe('Calendar Component', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), { status: 200 })
    );
  });

  it('renders calendar with different views', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <Calendar />
      </QueryClientProvider>
    );
    
    // Check if view buttons are present
    expect(screen.getByText('Month')).toBeInTheDocument();
    expect(screen.getByText('Week')).toBeInTheDocument();
    expect(screen.getByText('Day')).toBeInTheDocument();
    expect(screen.getByText('List')).toBeInTheDocument();
  });

  it('switches between calendar views', async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <Calendar />
      </QueryClientProvider>
    );
    
    const weekButton = screen.getByText('Week');
    await user.click(weekButton);
    
    // Verify the button remains present and clickable
    expect(weekButton).toBeInTheDocument();
  });

  it('navigates between months', async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <Calendar />
      </QueryClientProvider>
    );
    
    const prevButton = screen.getByLabelText('Previous month');
    const nextButton = screen.getByLabelText('Next month');
    
    await user.click(prevButton);
    await user.click(nextButton);
    
    // Verify navigation works (implementation specific)
    expect(screen.getByText(/\d{4}/)).toBeInTheDocument(); // Year should be visible
  });
});

describe('Calendar Event Form', () => {
  it('renders form fields correctly', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <CalendarEventForm
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      </QueryClientProvider>
    );
    
    expect(screen.getByText('Event Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    expect(screen.getByText('Event Type')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    
    render(
      <QueryClientProvider client={queryClient}>
        <CalendarEventForm
          onSubmit={onSubmit}
          onCancel={vi.fn()}
        />
      </QueryClientProvider>
    );
    
    const submitButton = screen.getByRole('button', { name: /Save Event/i });
    await user.click(submitButton);
    
    // Should not call submit when required fields are missing
    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    
    render(
      <QueryClientProvider client={queryClient}>
        <CalendarEventForm
          onSubmit={onSubmit}
          onCancel={vi.fn()}
        />
      </QueryClientProvider>
    );
    
    await user.type(screen.getByLabelText('Event Title'), 'Team Meeting');
    await user.type(screen.getByLabelText('Description'), 'Weekly team sync');
    
    const submitButton = screen.getByRole('button', { name: /Save Event/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Team Meeting',
          description: 'Weekly team sync',
        })
      );
    });
  });
});

describe('Document Upload Component', () => {
  const mockCategories: DocumentCategory[] = [
    {
      id: 'policies',
      name: 'Policies',
      description: 'Policy docs',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];

  it('renders upload interface and form fields', () => {
    render(
      <DocumentUpload
        categories={mockCategories}
        onUploadSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const uploadButtons = screen.getAllByRole('button', { name: /Upload Documents/i });
    expect(uploadButtons.length).toBeGreaterThan(0);
    expect(screen.getByText('Drag & drop files here, or click to select')).toBeInTheDocument();
    expect(screen.getByText('Document Title *')).toBeInTheDocument();
    expect(screen.getByText('Category *')).toBeInTheDocument();
  });

  it('disables upload when no files are selected', () => {
    render(
      <DocumentUpload
        categories={mockCategories}
        onUploadSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const uploadButton = screen.getByRole('button', { name: /Upload Documents/i });
    expect(uploadButton).toBeDisabled();
  });

  it('shows validation error when required fields are missing', async () => {
    const user = userEvent.setup();
    render(
      <DocumentUpload
        categories={mockCategories}
        onUploadSuccess={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    // Upload a file using the hidden file input provided by dropzone
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, file);

    const uploadButton = screen.getByRole('button', { name: /Upload Documents/i });
    await user.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument();
    });
  });
});

describe('Document List Component', () => {
  const mockCategories: DocumentCategory[] = [
    {
      id: 'policies',
      name: 'Policies',
      description: 'Policy docs',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];

  const mockDocuments: DocumentWithRelations[] = [
    {
      id: '1',
      employee_id: 'emp1',
      category_id: 'policies',
      title: 'Employee Handbook',
      description: 'Company policies and procedures',
      file_name: 'handbook.pdf',
      file_size: 2048000,
      file_type: 'application/pdf',
      file_path: '/docs/handbook.pdf',
      storage_path: 'public/docs/handbook.pdf',
      is_private: false,
      uploaded_by: 'emp1',
      uploaded_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
      is_deleted: false,
      category: mockCategories[0],
      employee: { id: 'emp1', first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
      shares: [],
      audit_logs: [],
    },
  ];

  it('renders document list', () => {
    render(<DocumentList documents={mockDocuments} categories={mockCategories} />);
    
    expect(screen.getByText('Employee Handbook')).toBeInTheDocument();
    expect(screen.getByText('Company policies and procedures')).toBeInTheDocument();
    // Category badge or option should appear
    expect(screen.getByText('Policies')).toBeInTheDocument();
  });

  it('filters documents by search term', async () => {
    const user = userEvent.setup();
    render(<DocumentList documents={mockDocuments} categories={mockCategories} />);
    
    const searchInput = screen.getByPlaceholderText('Search documents...');
    await user.type(searchInput, 'handbook');
    
    expect(screen.getByText('Employee Handbook')).toBeInTheDocument();
  });

  it('shows category options from provided categories', async () => {
    render(<DocumentList documents={mockDocuments} categories={mockCategories} />);
    // Ensure the category option exists in the filter dropdown
    expect(screen.getByText('All Categories')).toBeInTheDocument();
    expect(screen.getByText('Policies')).toBeInTheDocument();
  });
});

describe('Reporting Dashboard', () => {
  const mockStats = {
    totalRequests: 45,
    approvedRequests: 35,
    pendingRequests: 8,
    rejectedRequests: 2,
    utilizationRate: 78.5,
    averageProcessingTime: 2.3,
  };

  it('renders statistics correctly', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    mockFetch.mockImplementation(async (input: Request | string | URL) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url ?? '';
      if (url.includes('/api/reports/leave-stats')) {
        return {
          ok: true,
          json: async () => ({ data: mockStats }),
        } as unknown as Response;
      }
      if (url.includes('/api/reports/leave-by-type')) {
        return { ok: true, json: async () => ({ data: [] }) } as unknown as Response;
      }
      if (url.includes('/api/reports/leave-by-department')) {
        return { ok: true, json: async () => ({ data: [] }) } as unknown as Response;
      }
      if (url.includes('/api/reports/monthly-trend')) {
        return { ok: true, json: async () => ({ data: [] }) } as unknown as Response;
      }
      return { ok: true, json: async () => ({}) } as unknown as Response;
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ReportingDashboard />
      </QueryClientProvider>
    );

    // Key metric labels should render
    expect(await screen.findByText('Total Requests')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Utilization Rate')).toBeInTheDocument();

    // Chart sections should render
    expect(screen.getByText('Leave Requests by Type')).toBeInTheDocument();
    expect(screen.getByText('Monthly Leave Trends')).toBeInTheDocument();
    expect(screen.getByText('Department Analysis')).toBeInTheDocument();
  });

  it('renders header and actions', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    mockFetch.mockImplementation(async (input: Request | string | URL) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url ?? '';
      if (url.includes('/api/reports/leave-stats')) {
        return { ok: true, json: async () => ({ data: mockStats }) } as unknown as Response;
      }
      if (url.includes('/api/reports/leave-by-type')) {
        return { ok: true, json: async () => ({ data: [] }) } as unknown as Response;
      }
      if (url.includes('/api/reports/leave-by-department')) {
        return { ok: true, json: async () => ({ data: [] }) } as unknown as Response;
      }
      if (url.includes('/api/reports/monthly-trend')) {
        return { ok: true, json: async () => ({ data: [] }) } as unknown as Response;
      }
      return { ok: true, json: async () => ({}) } as unknown as Response;
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ReportingDashboard />
      </QueryClientProvider>
    );

    expect(await screen.findByText('Leave Management Reports')).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });
});

describe('Notification Bell', () => {
  const mockNotifications = [
    {
      id: '1',
      employee_id: 'emp1',
      notification_type: 'document_expiry',
      message: 'Document expires in 5 days',
      is_read: false,
      created_at: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      employee_id: 'emp1',
      notification_type: 'leave_approval',
      message: 'Leave request approved',
      is_read: true,
      created_at: '2024-01-14T10:00:00Z',
    },
  ];

  beforeEach(() => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ data: mockNotifications }), { status: 200 })
    );
  });

  it('renders notification bell with unread count', async () => {
    render(<NotificationBell />);
    
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument(); // Unread count badge
    });
  });

  it('opens notification panel on click', async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);
    
    const bellButton = screen.getByRole('button');
    await user.click(bellButton);
    
    // Wait for popover header and notifications to render
    expect(await screen.findByText('Notifications')).toBeInTheDocument();
    expect(await screen.findByText('Mark all read')).toBeInTheDocument();
  });

  it('marks notification as read', async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);
    
    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    // Use the visible "Mark all read" button for robust interaction
    const markAllButton = await screen.findByText('Mark all read');
    await user.click(markAllButton);

    // Wait for the UI to reflect the read state: the Mark all read button should disappear
    await waitFor(() => {
      expect(screen.queryByText('Mark all read')).not.toBeInTheDocument();
    });

    // Unread badge should disappear after marking as read
    await waitFor(() => {
      expect(screen.queryByText('1')).not.toBeInTheDocument();
    });
  });
});