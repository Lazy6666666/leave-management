"use client"

import * as React from "react"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

/**
 * Test Page for Glassmorphism Components
 *
 * This page showcases all enhanced glassmorphism components for E2E testing.
 * Used by Playwright tests to verify visual effects, accessibility, and interactions.
 */
export default function TestComponentsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Ensure theme is hydrated on client
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen p-8 space-y-12">
      {/* Page Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold" data-testid="page-title">
            Glassmorphism Components Test
          </h1>
          <p className="text-muted-foreground mt-2">
            Testing glassmorphism effects, accessibility, and interactions
          </p>
        </div>

        {/* Theme Toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          data-testid="theme-toggle"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" data-testid="sun-icon" />
          ) : (
            <Moon className="h-5 w-5" data-testid="moon-icon" />
          )}
        </Button>
      </header>

      {/* StatusBadge Section */}
      <section data-testid="status-badge-section" className="space-y-4">
        <h2 className="text-2xl font-semibold">StatusBadge Component</h2>
        <div className="flex flex-wrap gap-4">
          <StatusBadge status="pending" data-testid="badge-pending" />
          <StatusBadge status="approved" data-testid="badge-approved" />
          <StatusBadge status="rejected" data-testid="badge-rejected" />
          <StatusBadge status="cancelled" data-testid="badge-cancelled" />
        </div>
        <div className="flex flex-wrap gap-4">
          <StatusBadge status="pending" data-testid="badge-pending-custom">
            Awaiting Review
          </StatusBadge>
          <StatusBadge status="approved" data-testid="badge-approved-custom">
            Approved by Manager
          </StatusBadge>
        </div>
      </section>

      {/* Button Glass Variant Section */}
      <section data-testid="button-glass-section" className="space-y-4">
        <h2 className="text-2xl font-semibold">Button Glass Variant</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="glass" data-testid="button-glass-default">
            Glass Button
          </Button>
          <Button variant="glass" size="sm" data-testid="button-glass-sm">
            Small Glass
          </Button>
          <Button variant="glass" size="lg" data-testid="button-glass-lg">
            Large Glass
          </Button>
          <Button variant="glass" disabled data-testid="button-glass-disabled">
            Disabled Glass
          </Button>
        </div>
      </section>

      {/* Dialog Section */}
      <section data-testid="dialog-section" className="space-y-4">
        <h2 className="text-2xl font-semibold">Dialog Glassmorphism</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button data-testid="dialog-trigger">Open Dialog</Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-content">
            <DialogHeader>
              <DialogTitle data-testid="dialog-title">
                Glass Dialog
              </DialogTitle>
              <DialogDescription data-testid="dialog-description">
                This dialog has glassmorphism effects with backdrop blur and
                transparent background.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                The dialog overlay and content both use glass effects for a
                modern, layered appearance.
              </p>
              <div className="flex gap-2">
                <Button variant="default" data-testid="dialog-confirm">
                  Confirm
                </Button>
                <Button variant="outline" data-testid="dialog-cancel">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </section>

      {/* Popover Section */}
      <section data-testid="popover-section" className="space-y-4">
        <h2 className="text-2xl font-semibold">Popover Glassmorphism</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" data-testid="popover-trigger">
              Open Popover
            </Button>
          </PopoverTrigger>
          <PopoverContent data-testid="popover-content">
            <div className="space-y-2">
              <h4 className="font-medium leading-none" data-testid="popover-title">
                Glass Popover
              </h4>
              <p className="text-sm text-muted-foreground" data-testid="popover-description">
                This popover uses medium glass effect (16px blur, 60-75%
                opacity).
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </section>

      {/* Dropdown Menu Section */}
      <section data-testid="dropdown-section" className="space-y-4">
        <h2 className="text-2xl font-semibold">Dropdown Menu Glassmorphism</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" data-testid="dropdown-trigger">
              Open Dropdown
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent data-testid="dropdown-content">
            <DropdownMenuLabel data-testid="dropdown-label">
              My Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem data-testid="dropdown-item-profile">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="dropdown-item-settings">
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="dropdown-item-team">
              Team
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem data-testid="dropdown-item-logout">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>

      {/* Table Section */}
      <section data-testid="table-section" className="space-y-4">
        <h2 className="text-2xl font-semibold">Table Glass Styling</h2>

        {/* Regular Table */}
        <div>
          <h3 className="text-lg font-medium mb-2">Regular Table</h3>
          <Table data-testid="table-regular">
            <TableCaption>Regular table without glass effects</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Days</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>John Doe</TableCell>
                <TableCell>
                  <StatusBadge status="approved" />
                </TableCell>
                <TableCell>5</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Jane Smith</TableCell>
                <TableCell>
                  <StatusBadge status="pending" />
                </TableCell>
                <TableCell>3</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Glass Table */}
        <div>
          <h3 className="text-lg font-medium mb-2">Glass Table</h3>
          <Table glass data-testid="table-glass">
            <TableCaption>Glass table with glassmorphism effects</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Days</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>John Doe</TableCell>
                <TableCell>
                  <StatusBadge status="approved" />
                </TableCell>
                <TableCell>5</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Jane Smith</TableCell>
                <TableCell>
                  <StatusBadge status="pending" />
                </TableCell>
                <TableCell>3</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Bob Johnson</TableCell>
                <TableCell>
                  <StatusBadge status="rejected" />
                </TableCell>
                <TableCell>2</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Alice Brown</TableCell>
                <TableCell>
                  <StatusBadge status="cancelled" />
                </TableCell>
                <TableCell>1</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Interactive Test Section */}
      <section data-testid="interactive-section" className="space-y-4">
        <h2 className="text-2xl font-semibold">Interactive Elements</h2>
        <div className="space-y-2">
          <p>Test keyboard navigation and focus indicators:</p>
          <div className="flex gap-2">
            <Button tabIndex={0} data-testid="focus-test-1">
              Focus Test 1
            </Button>
            <Button variant="glass" tabIndex={0} data-testid="focus-test-2">
              Focus Test 2
            </Button>
            <Button variant="outline" tabIndex={0} data-testid="focus-test-3">
              Focus Test 3
            </Button>
          </div>
        </div>
      </section>

      {/* Accessibility Test Section */}
      <section data-testid="accessibility-section" className="space-y-4">
        <h2 className="text-2xl font-semibold">Accessibility Features</h2>
        <div className="space-y-2">
          <p>All components have proper ARIA attributes:</p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>StatusBadge: role="status", aria-label with status text</li>
            <li>Button: Proper focus indicators and keyboard support</li>
            <li>Dialog: Proper focus trap and Escape key support</li>
            <li>Dropdown: Arrow key navigation and Enter/Escape support</li>
          </ul>
        </div>
      </section>
    </div>
  )
}
