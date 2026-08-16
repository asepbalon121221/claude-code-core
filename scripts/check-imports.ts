/**
 * Report unresolved local imports under src/.
 * Classifies missing modules as core | feature | type | other.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'fs'
import { dirname, join, normalize, relative, resolve } from 'path'

const ROOT = resolve(import.meta.dir, '..')
const SRC = join(ROOT, 'src')

const FEATURE_HINTS = [
  'proactive',
  'contextCollapse',
  'snipCompact',
  'reactiveCompact',
  'MonitorTool',
  'MonitorMcpTask',
  'WorkflowTool',
  'WebBrowserTool',
  'SendUserFileTool',
  'TungstenTool',
  'OverflowTestTool',
  'ReviewArtifactTool',
  'TerminalCaptureTool',
  'VerifyPlanExecutionTool',
  'skillSearch',
  'assistant/index',
  'voice',
  'computerUse',
  'claudeInChrome',
  'bridge/peerSessions',
  'daemon',
]

const CORE_HINTS = [
  'types/message',
  'types/tools',
  'types/utils',
  'constants/querySource',
  'entrypoints/sdk',
  'QueryEngine',
  'services/api',
  'tools/BashTool',
  'tools/File',
  'tools/GrepTool',
  'tools/GlobTool',
]

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === 'dist') continue
      walk(p, out)
    } else if (/\.(ts|tsx)$/.test(name) && !name.endsWith('.d.ts')) {
      out.push(p)
    }
  }
  return out
}

function candidates(spec: string, fromFile: string): string[] {
  let abs: string
  if (spec.startsWith('src/')) abs = join(ROOT, spec)
  else abs = resolve(dirname(fromFile), spec)
  abs = normalize(abs.replace(/\\/g, '/'))
  const noExt = abs.replace(/\.js$/, '')
  return [
    noExt + '.ts',
    noExt + '.tsx',
    noExt + '.js',
    join(noExt, 'index.ts'),
    join(noExt, 'index.tsx'),
    join(noExt, 'index.js'),
  ]
}

function resolveLocal(spec: string, fromFile: string): boolean {
  return candidates(spec, fromFile).some(p => existsSync(p))
}

function classify(spec: string): 'core' | 'feature' | 'type' | 'other' {
  const s = spec.replace(/\\/g, '/')
  if (FEATURE_HINTS.some(h => s.includes(h))) return 'feature'
  if (s.includes('/types/') || s.endsWith('Types.js') || s.includes('.d.ts'))
    return 'type'
  if (CORE_HINTS.some(h => s.includes(h))) return 'core'
  return 'other'
}

const importRe =
  /(?:import|export)\s+(?:type\s+)?(?:[^'"\n]*?\s+from\s+)?['"]([^'"]+)['"]|require\(\s*['"]([^'"]+)['"]\s*\)|import\(\s*['"]([^'"]+)['"]\s*\)/g

const missing = new Map<
  string,
  { count: number; kind: string; samples: string[] }
>()

for (const file of walk(SRC)) {
  const text = readFileSync(file, 'utf8')
  for (const m of text.matchAll(importRe)) {
    const spec = m[1] || m[2] || m[3]
    if (!spec) continue
    if (
      !(
        spec.startsWith('.') ||
        spec.startsWith('src/') ||
        spec.startsWith('/')
      )
    )
      continue
    if (spec.includes('node:') || spec.includes('bun:')) continue
    if (resolveLocal(spec, file)) continue
    const key = spec.startsWith('src/')
      ? spec
      : relative(SRC, resolve(dirname(file), spec)).replace(/\\/g, '/')
    const cur = missing.get(key) || {
      count: 0,
      kind: classify(key),
      samples: [],
    }
    cur.count++
    if (cur.samples.length < 3) {
      cur.samples.push(relative(ROOT, file).replace(/\\/g, '/'))
    }
    missing.set(key, cur)
  }
}

const rows = [...missing.entries()].sort((a, b) => b[1].count - a[1].count)
const core = rows.filter(([, v]) => v.kind === 'core')
const feature = rows.filter(([, v]) => v.kind === 'feature')
const other = rows.filter(([, v]) => v.kind === 'other' || v.kind === 'type')

console.log(`Unresolved local imports: ${rows.length}`)
console.log(`  core: ${core.length}`)
console.log(`  feature: ${feature.length}`)
console.log(`  other/type: ${other.length}`)
console.log('\nTop unresolved:')
for (const [k, v] of rows.slice(0, 40)) {
  console.log(`  [${v.kind}] ${v.count}x  ${k}`)
}

if (core.length > 0) {
  console.error('\nFAIL: unresolved CORE imports remain')
  process.exit(1)
}
console.log('\nOK: no unresolved core imports')
