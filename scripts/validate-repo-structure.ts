import fs from 'fs'
import path from 'path'

// Simple repo structure validator
// Rules enforced:
// - All .md files must live under /docs
// - All scripts (.js/.ts) used for automation must live under /scripts or /supabase/migrations
// - Frontend and backend folders must exist at repo root

const repoRoot = path.resolve(__dirname, '..')

function listFiles(dir: string, filelist: string[] = []) {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const full = path.join(dir, file)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      // skip node_modules and .git
      if (file === 'node_modules' || file === '.git') continue
      listFiles(full, filelist)
    } else {
      filelist.push(full)
    }
  }
  return filelist
}

function fail(msg: string) {
  console.error('❌ Repo structure validation failed:', msg)
  process.exitCode = 2
}

function main() {
  const requiredRoots = ['docs', 'scripts', 'frontend', 'backend']
  for (const r of requiredRoots) {
    const p = path.join(repoRoot, r)
    if (!fs.existsSync(p)) {
      fail(`Missing required top-level folder: ${r}`)
      return
    }
  }

  const allFiles = listFiles(repoRoot)

  // Check that all .md files are under docs/
  const mdFilesOutsideDocs = allFiles.filter(f => f.endsWith('.md') && !f.includes(`\\docs\\`) && !f.includes('/docs/'))
  if (mdFilesOutsideDocs.length > 0) {
    fail(`Found .md files outside docs/:\n${mdFilesOutsideDocs.join('\n')}`)
    return
  }

  // Ensure scripts are only under scripts/ or supabase/migrations
  const scriptFilesOutside = allFiles.filter(f => {
    const isScript = f.endsWith('.js') || f.endsWith('.ts')
    if (!isScript) return false
    // ignore files under node_modules
    if (f.includes('node_modules')) return false
    const ok = f.includes(`\\scripts\\`) || f.includes('/scripts/') || f.includes('supabase\\migrations') || f.includes('supabase/migrations')
    // allow frontend/backend source files
    const allowedSrc = f.includes('frontend') || f.includes('backend')
    return isScript && !ok && !allowedSrc
  })

  if (scriptFilesOutside.length > 0) {
    fail(`Found script files outside scripts/ or supabase/migrations/:\n${scriptFilesOutside.join('\n')}`)
    return
  }

  console.log('✅ Repo structure validation passed')
}

if (require.main === module) main()
