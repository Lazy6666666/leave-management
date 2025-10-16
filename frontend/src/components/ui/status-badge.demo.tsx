/**
 * StatusBadge Component Demo
 *
 * This file demonstrates usage examples of the StatusBadge component.
 * To use in your application, import and use as shown below.
 */

import { StatusBadge } from "./status-badge"

export function StatusBadgeDemo() {
  return (
    <div className="space-y-4 p-8">
      <h2 className="text-2xl font-bold mb-6">StatusBadge Component Examples</h2>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Basic Status Badges</h3>
        <div className="flex gap-3 flex-wrap">
          <StatusBadge status="pending" />
          <StatusBadge status="approved" />
          <StatusBadge status="rejected" />
          <StatusBadge status="cancelled" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Custom Children</h3>
        <div className="flex gap-3 flex-wrap">
          <StatusBadge status="approved">
            Approved by Manager
          </StatusBadge>
          <StatusBadge status="rejected">
            Rejected - Insufficient Balance
          </StatusBadge>
          <StatusBadge status="pending">
            Awaiting HR Review
          </StatusBadge>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">With Additional Styling</h3>
        <div className="flex gap-3 flex-wrap">
          <StatusBadge status="approved" className="text-sm" />
          <StatusBadge status="pending" className="text-base px-4 py-2" />
          <StatusBadge status="rejected" className="shadow-lg" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">In a Table Context</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Employee</th>
              <th className="text-left p-2">Leave Type</th>
              <th className="text-left p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2">John Doe</td>
              <td className="p-2">Annual Leave</td>
              <td className="p-2">
                <StatusBadge status="approved" />
              </td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Jane Smith</td>
              <td className="p-2">Sick Leave</td>
              <td className="p-2">
                <StatusBadge status="pending" />
              </td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Bob Johnson</td>
              <td className="p-2">Personal Leave</td>
              <td className="p-2">
                <StatusBadge status="rejected" />
              </td>
            </tr>
            <tr>
              <td className="p-2">Alice Brown</td>
              <td className="p-2">Annual Leave</td>
              <td className="p-2">
                <StatusBadge status="cancelled" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">In a Card Context</h3>
        <div className="glass-card p-6 max-w-md">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-semibold">Leave Request #12345</h4>
              <p className="text-sm text-muted-foreground">Submitted on Jan 15, 2025</p>
            </div>
            <StatusBadge status="approved" />
          </div>
          <div className="space-y-2 text-sm">
            <p><strong>Type:</strong> Annual Leave</p>
            <p><strong>Duration:</strong> 5 days</p>
            <p><strong>Dates:</strong> Feb 1-5, 2025</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Usage in actual components:
 *
 * 1. Import the component:
 *    import { StatusBadge } from "@/components/ui/status-badge"
 *
 * 2. Use in your JSX:
 *    <StatusBadge status={leave.status} />
 *
 * 3. With custom content:
 *    <StatusBadge status={leave.status}>
 *      {leave.status === "approved" ? "Approved by " + leave.approver?.first_name : capitalizeFirst(leave.status)}
 *    </StatusBadge>
 *
 * 4. In a list or table:
 *    {leaves.map((leave) => (
 *      <tr key={leave.id}>
 *        <td>{leave.requester?.first_name}</td>
 *        <td><StatusBadge status={leave.status} /></td>
 *      </tr>
 *    ))}
 */
