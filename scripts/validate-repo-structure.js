#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const repoRoot = path.resolve(__dirname, '..')

function listFiles(dir, filelist = []) {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const full = path.join(dir, file)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      if (file === 'node_modules' || file === '.git') continue
      listFiles(full, filelist)
    } else {
      filelist.push(full)
    }
  }
  return filelist
}

function fail(msg) {
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

  const mdFilesOutsideDocs = allFiles.filter(f => f.endsWith('.md') && !f.includes('\\docs\\') && !f.includes('/docs/'))
  if (mdFilesOutsideDocs.length > 0) {
    fail(`Found .md files outside docs/:\n${mdFilesOutsideDocs.join('\n')}`)
    return
  }

  const scriptFilesOutside = allFiles.filter(f => {
    const isScript = f.endsWith('.js') || f.endsWith('.ts')
    if (!isScript) return false
    if (f.includes('node_modules')) return false
    const ok = f.includes('\\scripts\\') || f.includes('/scripts/') || f.includes('supabase\\migrations') || f.includes('supabase/migrations')
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
