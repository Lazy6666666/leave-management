# ===============================================================
#  LOCAL VARIABLE IMPLEMENTATION AUDITOR (Windows Edition)
#  Author: ChatGPT (for Supreme Leader Bringer of Chaos)
# ===============================================================

Write-Host "===============================" -ForegroundColor Yellow
Write-Host "⚙️  LOCAL IMPLEMENTATION AUDIT"
Write-Host "===============================" -ForegroundColor Yellow

$ProjectDir = Get-Location
$FrontendSrcDir = Join-Path $ProjectDir "frontend\src"
$EnvFile = Join-Path $ProjectDir ".env.local"
$FrontendPkgFile = Join-Path $ProjectDir "frontend\package.json"

# 1️⃣ ENV VARIABLES
Write-Host "`n🔍 Checking environment variables..." -ForegroundColor Cyan
$EnvVars = @(
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
)

foreach ($var in $EnvVars) {
    if (Select-String -Path $EnvFile -Pattern $var -Quiet) {
        $found = (Get-ChildItem -Path $FrontendSrcDir -Recurse -Include *.ts,*.tsx,*.js,*.jsx | Select-String -Pattern $var -Quiet)
        if ($found) {
            Write-Host "✅ $var implemented in codebase" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $var present in .env.local but not used anywhere" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ $var missing from .env.local" -ForegroundColor Red
    }
}

# 2️⃣ UI DEPENDENCIES
Write-Host "`n🔍 Checking UI dependencies..." -ForegroundColor Cyan
$UIDeps = @(
  "@radix-ui/react-hover-card",
  "@radix-ui/react-progress",
  "@radix-ui/react-scroll-area",
  "@radix-ui/react-slider",
  "@radix-ui/react-toggle",
  "recharts"
)

foreach ($dep in $UIDeps) {
    if (Select-String -Path $FrontendPkgFile -Pattern $dep -SimpleMatch -Quiet) {
        $found = (Get-ChildItem -Path $FrontendSrcDir -Recurse -Include *.ts,*.tsx,*.js,*.jsx | Select-String -Pattern $dep -SimpleMatch)
        if ($null -ne $found) {
            Write-Host "✅ $dep implemented in source code" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $dep installed but not imported anywhere" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ $dep not installed" -ForegroundColor Red
    }
}

# 3️⃣ SUPABASE TABLES
Write-Host "`n🔍 Checking Supabase table usage..." -ForegroundColor Cyan
$Tables = @(
  "employees",
  "leave_types",
  "leave_balances",
  "leaves",
  "company_documents",
  "audit_logs"
)

foreach ($tbl in $Tables) {
    $isFound = $false
    $files = Get-ChildItem -Path $FrontendSrcDir -Recurse -Include *.ts,*.tsx,*.js,*.jsx
    foreach ($file in $files) {
        if (Select-String -Path $file.FullName -Pattern "from('$tbl')" -SimpleMatch -Quiet) {
            $isFound = $true
            break
        }
    }

    if ($isFound) {
        Write-Host "✅ Table '$tbl' queried in codebase" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Table '$tbl' not referenced" -ForegroundColor Yellow
    }
}

# 4️⃣ ESLINT STATIC ANALYSIS
Write-Host "`n🔍 Running ESLint static analysis..." -ForegroundColor Cyan
$eslintConfig = Join-Path $ProjectDir "frontend\eslint.config.mjs"

if (Test-Path $eslintConfig) {
    npm run lint --workspace=frontend -- --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ ESLint passed cleanly" -ForegroundColor Green
    } else {
        Write-Host "⚠️ ESLint detected issues or warnings." -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️ ESLint not configured." -ForegroundColor Yellow
}

Write-Host "`n===============================" -ForegroundColor Yellow
Write-Host "🧾 AUDIT COMPLETE"
Write-Host "===============================" -ForegroundColor Yellow
