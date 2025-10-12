
# Technical Specifications - Leave Management System

## Document Information
- **Document Version**: 1.0
- **Last Updated**: 2025-10-12
- **Author**: AI Development Team
- **Status**: Draft
- **Reviewers**: [Add stakeholders]

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture
```
Frontend Layer (Next.js 15)
├── App Router with Server Components
├── React 18/19 with TypeScript
├── Tailwind CSS + shadcn/ui
├── React Query for data fetching
├── Zustand for state management
└── Real-time updates via Supabase

Backend Services
├── Supabase (PostgreSQL Database)
├── Supabase Auth (Authentication)
├── Supabase Edge Functions (Business Logic)
├── Supabase Storage (File Management)
├── Supabase Realtime (Live Updates)
└── Email Service Integration

Infrastructure
├── Vercel (Frontend Hosting)
├── Supabase (Backend Services)
├── SendGrid/Resend (Email Notifications)
├── Sentry (Error Tracking)
└── Monitoring & Analytics
```

### 1.2 Technology Stack

#### Frontend Technologies
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.x
- **UI Library**: shadcn/ui components
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: React Query for server state, Zustand for client state
- **Form Handling**: React Hook Form with Zod validation
- **Testing**: Vitest (unit), Playwright (E2E)
- **Build Tool**: Turbopack (Next.js built-in)

#### Backend Technologies
- **Database**: PostgreSQL 15+
- **ORM**: Prisma with Supabase extensions
- **Auth**: Supabase Auth
- **Realtime**: Supabase Realtime
- **Storage**: Supabase Storage
- **Edge Functions**: Supabase Edge Functions (Node.js 18+)
- **Email**: SendGrid/Resend
- **Monitoring**: Sentry + custom logging

#### Infrastructure Technologies
- **Frontend Hosting**: Vercel
- **Backend Services**: Supabase
- **CI/CD**: GitHub Actions
- **Containerization**: Docker (for Edge Functions)
- **Monitoring**: Sentry, custom metrics
- **Backup**: Supabase automated backups

---

## 2. Database Schema Design

### 2.1 Core Tables

#### employees
```sql
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  role ENUM('employee', 'manager', 'admin', 'hr') NOT NULL,
  department VARCHAR(100),
  position VARCHAR(100),
  hire_date DATE,
  photo_url VARCHAR(500),
  phone VARCHAR(20),
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_employees_supabase_id ON employees(supabase_id);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_role ON employees(role);
```

#### leave_types
```sql
CREATE TABLE leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  default_allocation_days INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  requires_document BOOLEAN DEFAULT false,
  max_consecutive_days INTEGER,
  accrual_frequency ENUM('monthly', 'quarterly', 'yearly', 'none') DEFAULT 'none',
  carry_over_limit INTEGER,
  carry_over_expiry_days INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_leave_types_name ON leave_types(name);
CREATE INDEX idx_leave_types_active ON leave_types(is_active);
```

#### leave_balances
```sql
CREATE TABLE leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id UUID REFERENCES leave_types(id) ON DELETE CASCADE,
  total_days INTEGER NOT NULL,
  used_days INTEGER DEFAULT 0,
  available_days INTEGER GENERATED ALWAYS AS (total_days - used_days) STORED,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, leave_type_id, year)
);

-- Indexes
CREATE INDEX idx_leave_balances_employee ON leave_balances(employee_id);
CREATE INDEX idx_leave_balances_leave_type ON leave_balances(leave_type_id);
CREATE INDEX idx_leave_balances_year ON leave_balances(year);
```

#### leaves
```sql
CREATE TABLE leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id UUID REFERENCES leave_types(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count INTEGER NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
  reason TEXT,
  approver_id UUID REFERENCES employees(id),
  approved_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_leaves_requester ON leaves(requester_id);
CREATE INDEX idx_leaves_status ON leaves(status);
CREATE INDEX idx_leaves_dates ON leaves(start_date, end_date);
CREATE INDEX idx_leaves_approver ON leaves(approver_id);
```

#### company_documents
```sql
CREATE TABLE company_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by UUID REFERENCES employees(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type VARCHAR(100),
  expiry_date DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_company_documents_uploaded_by ON company_documents(uploaded_by);
CREATE INDEX idx_company_documents_expiry ON company_documents(expiry_date);
CREATE INDEX idx_company_documents_active ON company_documents(is_active);
```

#### audit_logs
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES employees(id),
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(50),
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

### 2.2 Database Views

#### leave_events_view
```sql
CREATE VIEW leave_events_view AS
SELECT 
  l.id,
  l.requester_id,
  e.first_name || ' ' || e.last_name as requester_name,
  e.department,
  l.leave_type_id,
  lt.name as leave_type_name,
  l.start_date,
  l.end_date,
  l.days_count,
  l.status,
  l.reason,
  l.approver_id,
  a.first_name || ' ' || a.last_name as approver_name,
  l.approved_at,
  l.created_at,
  l.updated_at,
  COUNT(cd.id) as document_count
FROM leaves l
JOIN employees e ON l.requester_id = e.id
JOIN leave_types lt ON l.leave_type_id = lt.id
LEFT JOIN employees a ON l.approver_id = a.id
LEFT JOIN company_documents cd ON l.id = cd.record_id::uuid
GROUP BY l.id, e.first_name, e.last_name, e.department, lt.name, a.first_name, a.last_name;
```

#### leave_aggregates_view
```sql
CREATE VIEW leave_aggregates_view AS
SELECT 
  e.id as employee_id,
  e.first_name || ' ' || e.last_name as employee_name,
  e.department,
  EXTRACT(YEAR FROM l.start_date) as year,
  EXTRACT(MONTH FROM l.start_date) as month,
  COUNT(*) as total_requests,
  COUNT(CASE WHEN l.status = 'approved' THEN 1 END) as total_approved,
  COUNT(CASE WHEN l.status = 'rejected' THEN 1 END) as total_rejected,
  COUNT(CASE WHEN l.status = 'cancelled' THEN 1 END) as total_cancelled,
  SUM(CASE WHEN l.status = 'approved' THEN l.days_count ELSE 0 END) as total_approved_days,
  SUM(CASE WHEN l.status = 'rejected' THEN l.days_count ELSE 0 END) as total_rejected_days,
  SUM(CASE WHEN l.status = 'cancelled' THEN l.days_count ELSE 0 END) as total_cancelled_days
FROM employees e
LEFT JOIN leaves l ON e.id = l.requester_id
GROUP BY e.id, e.first_name, e.last_name, e.department, EXTRACT(YEAR FROM l.start_date), EXTRACT(MONTH FROM l.start_date);
```

### 2.3 Row-Level Security (RLS)

#### employees table RLS
```sql
-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON employees
  FOR SELECT USING (auth.uid() = supabase_id);

CREATE POLICY "Users can update own profile" ON employees
  FOR UPDATE USING (auth.uid() = supabase_id);

CREATE POLICY "Managers can view team members" ON employees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM employees m 
      WHERE m.supabase_id = auth.uid() 
      AND m.role IN ('manager', 'admin', 'hr')
      AND (m.department = employees.department OR m.role IN ('admin', 'hr'))
    )
  );

CREATE POLICY "Admin/HR can view all employees" ON employees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM employees e 
      WHERE e.supabase_id = auth.uid() 
      AND e.role IN ('admin', 'hr')
    )
  );
```

#### leaves table RLS
```sql
-- Enable RLS
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own leaves" ON leaves
  FOR SELECT USING (requester_id = (SELECT id FROM employees WHERE supabase_id = auth.uid()));

CREATE POLICY "Users can insert own leaves" ON leaves
  FOR INSERT WITH CHECK (requester_id = (SELECT id FROM employees WHERE supabase_id = auth.uid()));

CREATE POLICY "Users can update own leaves" ON leaves
  FOR UPDATE USING (requester_id = (SELECT id FROM employees WHERE supabase_id = auth.uid()));

CREATE POLICY "Managers can view team leaves" ON leaves
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM employees m 
      WHERE m.supabase_id = auth.uid() 
      AND m.role IN ('manager', 'admin', 'hr')
      AND (m.department = (SELECT department FROM employees WHERE id = leaves.requester_id) OR m.role IN ('admin', 'hr'))
    )
  );

CREATE POLICY "Admin/HR can approve/reject leaves" ON leaves
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM employees e 
      WHERE e.supabase_id = auth.uid() 
      AND e.role IN ('admin', 'hr')
    )
  );
```

---

## 3. API Design

### 3.1 REST API Endpoints

#### Authentication Endpoints
```
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/verify-email
GET /api/auth/me
PUT /api/auth/profile
```

#### Leave Management Endpoints
```
GET /api/leaves
POST /api/leaves
GET /api/leaves/:id
PUT /api/leaves/:id
DELETE /api/leaves/:id
PATCH /api/leaves/:id/approve
PATCH /api/leaves/:id/reject
PATCH /api/leaves/:id/cancel
GET /api/leaves/balances
GET /api/leaves/history
```

#### Admin Endpoints
```
GET /api/admin/users
POST /api/admin/users
PUT /api/admin/users/:id
DELETE /api/admin/users/:id
GET /api/admin/leave-types
POST /api/admin/leave-types
PUT /api/admin/leave-types/:id
DELETE /api/admin/leave-types/:id
GET /api/admin/reports
POST /api/admin/reports/export
GET /api/admin/audit-logs
```

#### Calendar Endpoints
```
GET /api/calendar
GET /api/calendar/:date
GET /api/calendar/team/:teamId
GET /api/calendar/department/:department
```

#### Document Endpoints
```
POST /api/documents
GET /api/documents/:id
DELETE /api/documents/:id
GET /api/documents/:id/download
POST /api/documents/upload
```

### 3.2 API Response Format

#### Success Response
```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}
```

#### Error Response
```typescript
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    field?: string;
  };
  timestamp: string;
}
```

### 3.3 API Authentication

#### JWT Token Structure
```typescript
interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: 'employee' | 'manager' | 'admin' | 'hr';
  department?: string;
  iat: number;
  exp: number;
}
```

#### Authentication Middleware
```typescript
// lib/auth.ts
export async function requireAuth(request: Request): Promise<User> {
  const token = extractToken(request);
  if (!token) {
    throw new UnauthorizedError('No token provided');
  }
  
  const payload = verifyToken(token);
  const user = await getUserById(payload.sub);
  
  if (!user) {
    throw new UnauthorizedError('User not found');
  }
  
  return user;
}

export async function requireRole(request: Request, requiredRole: UserRole): Promise<User> {
  const user = await requireAuth(request);
  if (!hasRole(user.role, requiredRole)) {
    throw new ForbiddenError('Insufficient permissions');
  }
  return user;
}
```

---

## 4. Frontend Architecture

### 4.1 Folder Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Authentication routes
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/              # Dashboard routes
│   │   │   ├── dashboard/
│   │   │   ├── leaves/
│   │   │   ├── calendar/
│   │   │   ├── admin/
│   │   │   └── profile/
│   │   ├── api/                      # API routes
│   │   │   ├── auth/
│   │   │   ├── leaves/
│   │   │   ├── admin/
│   │   │   └── documents/
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Home page
│   ├── components/                   # Reusable components
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── layout/                   # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── footer.tsx
│   │   ├── forms/                    # Form components
│   │   │   ├── leave-request-form.tsx
│   │   │   └── profile-form.tsx
│   │   ├── charts/                   # Chart components
│   │   │   └── leave-chart.tsx
│   │   └── calendar/                 # Calendar components
│   │       └── calendar-view.tsx
│   ├── hooks/                        # Custom hooks
│   │   ├── use-auth.ts
│   │   ├── use-leaves.ts
│   │   ├── use-calendar.ts
│   │   └── use-realtime.ts
│   ├── lib/                          # Utility libraries
│   │   ├── supabase-client.ts
│   │   ├── supabase-server.ts
│   │   ├── api-client.ts
│   │   ├── auth.ts
│   │   ├── utils.ts
│   │   └── validations.ts
│   ├── types/                        # TypeScript definitions
│   │   ├── index.ts
│   │   ├── api.ts
│   │   └── database.ts
│   ├── store/                        # State management
│   │   ├── auth-store.ts
│   │   ├── ui-store.ts
│   │   └── app-store.ts
│   └── styles/                       # Style utilities
│       ├── globals.css
│       └── tailwind.css
├── public/                           # Static assets
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── .eslintrc.json
```

### 4.2 Component Architecture

#### Base Component Structure
```typescript
// components/ui/base-component.tsx
interface BaseComponentProps {
  className?: string;
  dataTest?: string;
  dataMcp?: string;
  children: React.ReactNode;
}

export function BaseComponent({ 
  className = '', 
  dataTest, 
  dataMcp, 
  children 
}: BaseComponentProps) {
  return (
    <div className={className} data-test={dataTest} data-mcp={dataMcp}>
      {children}
    </div>
  );
}
```

#### Form Component Structure
```typescript
// components/forms/base-form.tsx
interface BaseFormProps<T> {
  onSubmit: (data: T) => Promise<void>;
  defaultValues?: Partial<T>;
  className?: string;
  children: React.ReactNode;
}

export function BaseForm<T extends Record<string, any>>({
  onSubmit,
  defaultValues,
  className,
  children
}: BaseFormProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleSubmit = async (data: T) => {
    try {
      await onSubmit(data);
    } catch (error) {
      form.setError('root', { message: error.message });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className={className}>
      {children}
    </form>
  );
}
```

### 4.3 State Management

#### Auth Store
```typescript
// store/auth-store.ts
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      set({ 
        user: data.user, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    } catch (error) {
      throw error;
    }
  },
}));
```

#### UI Store
```typescript
// store/ui-store.ts
interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  notifications: Notification[];
  loading: boolean;
}

interface UIActions {
  toggleTheme: () => void;
  toggleSidebar: () => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState & UIActions>((set) => ({
  theme: 'light',
  sidebarOpen: true,
  notifications: [],
  loading: false,

  toggleTheme: () => {
    set((state) => ({ 
      theme: state.theme === 'light' ? 'dark' : 'light' 
    }));
  },

  toggleSidebar: () => {
    set((state) => ({ 
      sidebarOpen: !state.sidebarOpen 
    }));
  },

  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }]
    }));
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },
}));
```

---

## 5. Security Implementation

### 5.1 Authentication Security

#### JWT Configuration
```typescript
// lib/auth.ts
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: '7d',
  algorithm: 'HS256' as const,
  issuer: 'leave-management-system',
  audience: 'leave-management-users',
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
    algorithm: jwtConfig.algorithm,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  });
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, jwtConfig.secret, {
      algorithms: [jwtConfig.algorithm],
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    }) as JwtPayload;
  } catch (error) {
    throw new UnauthorizedError('Invalid token');
  }
}
```

#### Password Security
```typescript
// lib/auth.ts
const passwordConfig = {
  minLength: 8,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 0,
  maxAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
};

export function validatePassword(password: string): boolean {
  const regex = new RegExp(
    `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{${passwordConfig.minLength},}$`
  );
  return regex.test(password);
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(
  password: string, 
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
```

### 5.2 Data Validation

#### Zod Schemas
```typescript
// lib/validations.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  department: z.string().optional(),
  position: z.string().optional(),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const leaveRequestSchema = z.object({
  leaveTypeId: z.string().uuid('Invalid leave type'),
  startDate: z.date(),
  endDate: z.date(),
  reason: z.string().max(500, 'Reason must be less than 500 characters').optional(),
  documents: z.array(z.instanceof(File)).optional(),
}).refine((data) => data.startDate <= data.endDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});
```

### 5.3 API Security

#### Rate Limiting
```typescript
// lib/security.ts
import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many API requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
```

#### CORS Configuration
```typescript
// lib/security.ts
export const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
```

### 5.4 File Upload Security

#### File Validation
```typescript
// lib/security.ts
export const allowedFileTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
];

export const maxFileSize = 5 * 1024 * 1024; // 5MB

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!allowedFileTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only PDF, JPG, PNG, and GIF files are allowed.',
    };
  }

  if (file.size > maxFileSize) {
    return {
      valid: false,
      error: 'File size exceeds 5MB limit.',
    };
  }

  return { valid: true };
}
```

---

## 6. Performance Optimization

### 6.1 Database Optimization

#### Indexing Strategy
```sql
-- Composite indexes for common query patterns
CREATE INDEX idx_leaves_requester_status ON leaves(requester_id, status);
CREATE INDEX idx_leaves_dates_status ON leaves(start_date, end_date, status);
CREATE INDEX idx_leave_balances_employee_year ON leave_balances(employee_id, year);
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action);
```

#### Query Optimization
```typescript
// lib/database/optimizations.ts
export async function getLeaveBalancesWithCache(employeeId: string) {
  const cacheKey = `leave-balances-${employeeId}`;
  const cached = await cache.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }

  const balances = await prisma.leaveBalance.findMany({
    where: { employeeId },
    include: {
      leaveType: {
        select: { name: true, description: true },
      },
    },
    orderBy: { year: 'desc' },
  });

  await cache.set(cacheKey, JSON.stringify(balances), { ttl: 3600 }); // 1 hour
  return balances;
}
```

### 6.2 Frontend Performance

#### Code Splitting
```typescript
// components/calendar/calendar-view.tsx
import dynamic from 'next/dynamic';

const FullCalendar = dynamic(
  () => import('@fullcalendar/react'),
  { ssr: false }
);

const dayGridPlugin = dynamic(
  () => import('@fullcalendar/daygrid'),
  { ssr: false }
);

const interactionPlugin = dynamic(
  () => import('@fullcalendar/interaction'),
  { ssr: false }
);

export function CalendarView() {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      // ... other props
    />
  );
}
```

#### Image Optimization
```typescript
// components/ui/image.tsx
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  className 
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      priority={false}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
    />
  );
}
```

### 6.3 Caching Strategy

#### React Query Configuration
```typescript
// lib/react-query.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        if (error.status === 404) return false;
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

#### Server-Side Caching
```typescript
// lib/cache.ts
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes
  checkperiod: 600, // 10 minutes
  useClones: false,
});

export async function getCachedData<T>(
  key: string, 
  fetchFunction: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached) {
    return cached;
  }

  const data = await fetchFunction();
  cache.set(key, data, ttl || 300);
  return data;
}
```

---

## 7. Testing Strategy

### 7.1 Unit Testing

#### Testing Setup
```typescript
// tests/setup.ts
import { vi } from 'vitest';
import { supabase } from '@/lib/supabase-client';

// Mock Supabase client
vi.mock('@/lib/supabase-client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
    },
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
    realtime: {
      channel: vi.fn(),
    },
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

#### Unit Test Example
```typescript
// tests/auth.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, register } from '@/lib/auth';
import { supabase } from '@/lib/supabase-client';

describe('Auth Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login user', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });

      const result = await login('test@example.com', 'password123');

      expect(result).toEqual(mockUser);
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should throw error when login fails', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Invalid credentials' },
      });

      await expect(login('test@example.com', 'wrong-password')).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });
});
```

### 7.2 Integration Testing

#### API Testing
```typescript
// tests/api.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { request } from 'http';
import { parse } from 'url';
import { supabase } from '@/lib/supabase-client';

describe('API Integration Tests', () => {
  let server: any;

  beforeAll(async () => {
    // Setup test database
    await supabase.from('employees').insert([
      {
        id: 'test-user-id',
        supabase_id: 'test-supabase-id',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'employee',
        is_active: true,
      },
    ]);

    // Start test server
    server = createServer(async (req, res) => {
      const parsedUrl = parse(req.url!, true);
      const { pathname } = parsedUrl;

      if (pathname === '/api/leaves') {
        // Handle API request
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: [] }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    });

    server.listen(3001);
  });

  afterAll(async () => {
    server.close();
    // Cleanup test data
    await supabase.from('employees').delete().eq('id', 'test-user-id');
  });

  it('should return 200 for valid API endpoint', async () => {
    const response = await new Promise((resolve) => {
      const req = request('http://localhost:3001/api/leaves', (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ statusCode: res.statusCode, data }));
      });
      req.end();
    });

    expect(response).toEqual({
      statusCode: 200,
      data: JSON.stringify({ success: true, data: [] }),
    });
  });
});
```

### 7.3 E2E Testing

#### Playwright Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### E2E Test Example
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should allow user to login', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-test="email-input"]', 'test@example.com');
    await page.fill('[data-test="password-input"]', 'password123');
    await page.click('[data-test="login-button"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-test="user-menu"]')).toBeVisible();
  });

  test('should show validation errors for invalid login', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-test="email-input"]', 'invalid-email');
    await page.fill('[data-test="password-input"]', 'short');
    await page.click('[data-test="login-button"]');
    
    await expect(page.locator('[data-test="email-error"]')).toBeVisible();
    await expect(page.locator('[data-test="password-error"]')).toBeVisible();
  });
});
```

### 7.4 Accessibility Testing

#### Accessibility Test Setup
```typescript
// tests/accessibility.test.ts
import { test, expect } from '@playwright/test';
import { axe, toHaveNoViolations } from 'jest-axe';

test.extend({
  page: async ({ page }, use) => {
    const injectAxe = async () => {
      await page.addInitScript(() => {
        window.axe = {
          run: (context, options) => {
            return new Promise((resolve) => {
              // Mock axe.run implementation
              resolve({
                violations: [],
              });
            });
          },
        };
      });
    };

    await injectAxe();
    await use(page);
  },
});

expect.extend(toHaveNoViolations);

test('should have no accessibility violations', async ({ page }) => {
  await page.goto('/');
  
  const results = await axe(page.locator('body').elementHandle()!);
  expect(results).toHaveNoViolations();
});
```

---

## 8. Deployment Configuration

### 8.1 Environment Variables

#### Development Environment
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

NODE_ENV=development
```

#### Production Environment
```bash
# .env.production
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_production_nextauth_secret

NODE_ENV=production
SENTRY_DSN=your_sentry_dsn
```

### 8.2 Vercel Configuration

#### vercel.json
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key",
    "NEXTAUTH_SECRET": "@nextauth_secret",
    "SENTRY_DSN": "@sentry_dsn"
  },
  "functions": {
    "api/**/*.js": {
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/crons/daily",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### 8.3 Docker Configuration

#### Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

---

## 9. Monitoring and Logging

### 9.1 Error Tracking

#### Sentry Configuration
```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE