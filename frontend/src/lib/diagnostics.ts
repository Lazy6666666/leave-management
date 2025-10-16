import fs from "node:fs"

export type DiagnosticStatus = "pass" | "warn" | "fail"

export interface DiagnosticCheck {
  id: string
  title: string
  status: DiagnosticStatus
  details?: string
}

export interface DiagnosticsReport {
  timestamp: string
  checks: DiagnosticCheck[]
}

function checkEnv(name: string): DiagnosticCheck {
  const present = typeof process.env[name] === "string" && process.env[name]!.length > 0
  return {
    id: `env-${name.toLowerCase()}`,
    title: `Env var ${name}`,
    status: present ? "pass" : "warn",
    details: present ? undefined : `${name} is missing or empty`,
  }
}

function checkFile(path: string, title: string): DiagnosticCheck {
  const exists = fs.existsSync(path)
  return {
    id: `file-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    title,
    status: exists ? "pass" : "fail",
    details: exists ? undefined : `${path} not found`,
  }
}

export async function runDiagnostics(): Promise<DiagnosticsReport> {
  const checks: DiagnosticCheck[] = []

  // Theme & styling assets
  checks.push(checkFile("frontend/src/app/globals.css", "Global CSS (globals.css) present"))
  checks.push(checkFile("frontend/tailwind.config.ts", "Tailwind config present"))
  checks.push(checkFile("frontend/components.json", "Shadcn components config present"))

  // Auth & routing essentials
  checks.push(checkFile("frontend/src/app/auth/login/page.tsx", "Login page present"))
  checks.push(checkFile("frontend/src/components/auth/login-form.tsx", "Login form present"))

  // Env vars
  checks.push(checkEnv("NEXT_PUBLIC_SUPABASE_URL"))
  checks.push(checkEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"))

  // Packages & tooling markers
  checks.push(checkFile("frontend/package.json", "Frontend package.json present"))
  checks.push(checkFile(".github/workflows/validate-and-test.yml", "CI validate-and-test workflow present"))

  return {
    timestamp: new Date().toISOString(),
    checks,
  }
}