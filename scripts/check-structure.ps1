param()

$repoRoot = Split-Path -Parent $PSScriptRoot
$requiredRoots = @('docs','scripts','frontend','backend')

foreach ($r in $requiredRoots) {
    $p = Join-Path $repoRoot $r
    if (-not (Test-Path $p)) {
        Write-Error "Missing required top-level folder: $r"
        exit 2
    }
}

# Find md files outside docs
$mdFiles = Get-ChildItem -Path $repoRoot -Recurse -File -Include *.md | Where-Object { $_.FullName -notmatch "\\docs\\" }
if ($mdFiles.Count -gt 0) {
    Write-Error "Found .md files outside docs/: `n$($mdFiles.FullName -join "`n")"
    exit 2
}

Write-Host '✅ Repo structure validation passed'
exit 0
