# Design System Best Practices

## Table of Contents
- [Design Tokens](#design-tokens)
- [shadcn/ui Integration](#shadcnui-integration)
- [Component Architecture](#component-architecture)
- [Theming System](#theming-system)
- [Responsive Design](#responsive-design)
- [Accessibility Guidelines](#accessibility-guidelines)
- [Performance Optimization](#performance-optimization)
- [MCP Integration](#mcp-integration)

## Design Tokens

### Color System
```css
/* CSS Custom Properties for theming */
:root {
  --color-primary: 222.2 84% 4.9%;
  --color-primary-foreground: 210 40% 98%;
  --color-secondary: 210 40% 96%;
  --color-secondary-foreground: 222.2 84% 4.9%;
  --color-accent: 210 40% 96%;
  --color-accent-foreground: 222.2 84% 4.9%;
  --color-muted: 210 40% 96%;
  --color-muted-foreground: 215.4 16.3% 46.9%;
  --color-border: 214.3 31.8% 91.4%;
  --color-input: 214.3 31.8% 91.4%;
  --color-ring: 222.2 84% 4.9%;
}

[data-theme="dark"] {
  --color-primary: 210 40% 98%;
  --color-primary-foreground: 222.2 84% 4.9%;
  --color-secondary: 217.2 32.6% 17.5%;
  --color-secondary-foreground: 210 40% 98%;
  --color-accent: 217.2 32.6% 17.5%;
  --color-accent-foreground: 210 40% 98%;
  --color-muted: 217.2 32.6% 17.5%;
  --color-muted-foreground: 215 20.2% 65.1%;
  --color-border: 217.2 32.6% 17.5%;
  --color-input: 217.2 32.6% 17.5%;
  --color-ring: 212.7 26.8% 83.9%;
}
```

### Typography Scale
- **Display**: 3.75rem (60px) - Page titles, hero sections
- **H1**: 2.25rem (36px) - Main page headings
- **H2**: 1.875rem (30px) - Section headings
- **H3**: 1.5rem (24px) - Subsection headings
- **H4**: 1.25rem (20px) - Component headings
- **Body Large**: 1.125rem (18px) - Lead paragraphs
- **Body**: 1rem (16px) - Regular text
- **Body Small**: 0.875rem (14px) - Secondary text
- **Caption**: 0.75rem (12px) - Labels, metadata

### Spacing Scale
- **0**: 0px - No spacing
- **1**: 0.25rem (4px) - Minimal spacing
- **2**: 0.5rem (8px) - Small spacing
- **3**: 0.75rem (12px) - Component spacing
- **4**: 1rem (16px) - Base spacing unit
- **5**: 1.25rem (20px) - Section spacing
- **6**: 1.5rem (24px) - Large section spacing
- **8**: 2rem (32px) - Page section spacing
- **10**: 2.5rem (40px) - Major section spacing
- **12**: 3rem (48px) - Page breaks

## shadcn/ui Integration

### Component Installation Pattern
```bash
# Install base shadcn/ui components
npx shadcn@latest add button input label card table badge

# Install form components
npx shadcn@latest add form calendar popover command

# Install layout components
npx shadcn@latest add dialog sheet tabs accordion
```

### Component Wrapper Pattern
```typescript
// src/components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        data-testid={props["data-testid"]}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### MCP Integration for Components
```typescript
// All shadcn wrappers must accept data-mcp and data-testid attributes
interface ComponentProps {
  "data-mcp"?: string
  "data-testid"?: string
  children?: React.ReactNode
}

// Pass through to underlying DOM elements for stable selectors
<div data-mcp={dataMcp} data-testid={dataTestId}>
  {/* Component content */}
</div>
```

## Component Architecture

### Atomic Design Structure
- **Atoms**: Basic UI elements (Button, Input, Badge)
- **Molecules**: Simple component combinations (FormField, SearchBar)
- **Organisms**: Complex components (DataTable, Calendar)
- **Templates**: Page layout structures (DashboardLayout)
- **Pages**: Complete page implementations

### Component Patterns
- **Compound Components**: Related components that work together
- **Render Props**: Flexible component APIs
- **Higher-Order Components**: Logic reuse across components
- **Custom Hooks**: Shared stateful logic

## Theming System

### Theme Provider Implementation
```typescript
// src/components/theme-provider.tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

### Theme Toggle Component
```typescript
// src/components/theme-toggle.tsx
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" data-testid="theme-toggle">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

## Responsive Design

### Breakpoint System
```typescript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    }
  }
}
```

### Responsive Component Pattern
```typescript
// Responsive table that becomes card list on mobile
export function LeaveTable({ leaves }: { leaves: Leave[] }) {
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaves.map((leave) => (
              <TableRow key={leave.id}>
                <TableCell>{leave.employeeName}</TableCell>
                <TableCell>{leave.leaveType}</TableCell>
                <TableCell>{leave.dateRange}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(leave.status)}>
                    {leave.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {leaves.map((leave) => (
          <Card key={leave.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{leave.employeeName}</CardTitle>
                  <CardDescription>{leave.leaveType}</CardDescription>
                </div>
                <Badge variant={getStatusVariant(leave.status)}>
                  {leave.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{leave.dateRange}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
```

## Accessibility Guidelines

### ARIA Implementation
- **Semantic HTML**: Use proper heading hierarchy (h1-h6)
- **ARIA Labels**: Provide descriptive labels for complex components
- **Live Regions**: Announce dynamic content changes
- **Focus Management**: Maintain logical tab order
- **Color Contrast**: Ensure WCAG AA compliance (4.5:1 ratio)

### Keyboard Navigation
- **Tab Order**: Logical navigation flow
- **Skip Links**: Allow users to skip repetitive content
- **Focus Indicators**: Visible focus states for all interactive elements
- **Keyboard Shortcuts**: Common shortcuts for power users

### Screen Reader Support
```typescript
// Proper ARIA implementation
<Card role="region" aria-labelledby="leave-card-title">
  <CardHeader>
    <CardTitle id="leave-card-title">Leave Request Details</CardTitle>
  </CardHeader>
  <CardContent>
    <dl>
      <dt className="sr-only">Employee Name</dt>
      <dd>{employeeName}</dd>
      <dt className="sr-only">Leave Type</dt>
      <dd>{leaveType}</dd>
    </dl>
  </CardContent>
</Card>
```

## Performance Optimization

### Component Optimization
- **React.memo**: Prevent unnecessary re-renders
- **useMemo/useCallback**: Optimize expensive computations
- **Code Splitting**: Lazy load non-critical components
- **Virtual Scrolling**: Handle large lists efficiently

### Bundle Optimization
```typescript
// Dynamic imports for code splitting
const HeavyComponent = lazy(() => import('./HeavyComponent'))

// Tree shaking with proper exports
export { Button } from './button'
export { Input } from './input'
```

### Image Optimization
- **Next.js Image**: Automatic optimization and lazy loading
- **WebP/AVIF**: Modern image formats for better compression
- **Responsive Images**: Different sizes for different viewports

## MCP Integration

### Design System MCP Features
- **Component Discovery**: Search and find appropriate components
- **Usage Examples**: Get implementation examples for components
- **Accessibility Validation**: Automated accessibility checking
- **Design Token Management**: Consistent token usage across components

### MCP Component Patterns
```typescript
// MCP-enhanced component development
const Button = ({ variant, size, children, ...props }) => {
  // Use MCP to validate component props
  const validation = await mcp.validateComponentProps('Button', props)

  // Get accessibility attributes from MCP
  const accessibility = await mcp.getAccessibilityAttributes('Button')

  return (
    <button
      className={getButtonClasses(variant, size)}
      {...accessibility}
      {...props}
    >
      {children}
    </button>
  )
}
```

## Design System Governance

### Component Lifecycle
- **Proposal**: Document new component needs
- **Development**: Follow established patterns and conventions
- **Review**: Design and accessibility review process
- **Documentation**: Update component documentation
- **Maintenance**: Regular updates and deprecation process

### Quality Assurance
- **Visual Testing**: Automated screenshot testing
- **Accessibility Testing**: Automated axe-core testing
- **Performance Testing**: Component load time monitoring
- **Cross-browser Testing**: Ensure consistent behavior

## Best Practices Summary

### Component Development
- Follow established naming conventions (PascalCase for components)
- Implement proper TypeScript interfaces for all props
- Include JSDoc comments for public APIs
- Export both the component and its variant functions

### Styling Guidelines
- Use CSS custom properties for theming
- Implement responsive design first (mobile-first approach)
- Maintain consistent spacing using the design scale
- Ensure proper contrast ratios for accessibility

### Performance Considerations
- Optimize bundle size with tree shaking
- Use React DevTools for performance profiling
- Implement proper loading states for async operations
- Consider code splitting for large component libraries
