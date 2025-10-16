import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { runDiagnostics, type DiagnosticsReport, type DiagnosticCheck } from "@/lib/diagnostics"

function StatusBadge({ status }: { status: DiagnosticCheck["status"] }) {
  const map: Record<DiagnosticCheck["status"], string> = {
    pass: "bg-green-600",
    warn: "bg-yellow-600",
    fail: "bg-red-600",
  }
  return <Badge className={map[status]}>{status.toUpperCase()}</Badge>
}

export default async function DiagnosticsPage() {
  const report: DiagnosticsReport = await runDiagnostics()

  return (
    <div className="p-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>System Diagnostics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 label-muted">Run time: {new Date(report.timestamp).toLocaleString()}</p>
          <div className="grid gap-3">
            {report.checks.map((check) => (
              <div key={check.id} className="flex items-center justify-between rounded-md border border-white/20 p-3">
                <div>
                  <p className="font-medium">{check.title}</p>
                  {check.details ? (
                    <p className="text-sm opacity-80">{check.details}</p>
                  ) : null}
                </div>
                <StatusBadge status={check.status} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}