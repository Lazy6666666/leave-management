import { NextResponse } from "next/server"
import { runDiagnostics } from "@/lib/diagnostics"

export async function GET() {
  const report = await runDiagnostics()
  return NextResponse.json(report)
}