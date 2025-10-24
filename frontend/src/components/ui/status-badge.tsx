import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import type { LeaveStatus } from "@/types"
import { cn } from "@/lib/utils"

/**
 * StatusBadge Component
 *
 * A specialized badge component for displaying leave request status with gradient backgrounds
 * and glass effects. Automatically capitalizes status text and applies appropriate styling
 * based on the status type.
 *
 * @example
 * ```tsx
 * // Basic usage with status
 * <StatusBadge status="pending" />
 *
 * // With custom children
 * <StatusBadge status="approved">
 *   Approved by Manager
 * </StatusBadge>
 *
 * // With additional className
 * <StatusBadge status="rejected" className="ml-2" />
 * ```
 */

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      status: {
        pending: "bg-gradient-warning text-white",
        approved: "bg-gradient-success text-white",
        rejected: "bg-gradient-danger text-white",
        cancelled: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      status: "pending",
    },
  }
)

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  /**
   * The leave status to display
   */
  status: LeaveStatus
  /**
   * Optional custom children. If not provided, displays capitalized status text
   */
  children?: React.ReactNode
}

/**
 * Capitalizes the first letter of a string
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

function StatusBadge({
  className,
  status,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <div
      role="status"
      aria-label={`Leave status: ${status}`}
      className={cn(statusBadgeVariants({ status }), className)}
      {...props}
    >
      {children || capitalizeFirst(status)}
    </div>
  )
}

export { StatusBadge, statusBadgeVariants }
