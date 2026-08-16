/**
 * Fail if known secret patterns appear in tracked source files.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'fs'
import { join, relative, resolve } from 'path'

const ROOT = resolve(import.meta.dir, '..')
const SKIP = new Set(['node_modules', 'dist', '.git', '.cursor'])

const PATTERNS: Array<{ name: string; re: RegExp }> = [
  // Real API tokens look like sk-<hex>-… — not Anthropic beta header ids (sk-ant-…)
  { name: 'router-api-key', re: /sk-[a-f0-9]{8,}[-_][a-z0-9_-]{8,}/gi },
  { name: 'aws-key', re: /AKIA[0-9A-Z]{16}/g },
  {
    name: 'vps-pass-marker',
    // Detect the previously leaked password without embedding it verbatim.
    re: /\bPASS\b\s*[:=]\s*[`'\"]?Kurr\d{3}@/i,
  },
]

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) walk(p, out)
    else if (/\.(ts|tsx|js|jsx|md|json|yml|yaml|env|sh|ps1)$/i.test(name)) {
      out.push(p)
    }
  }
  return out
}

let failed = false
for (const file of [
  ...walk(join(ROOT, 'src')),
  ...walk(join(ROOT, 'scripts')),
  join(ROOT, 'README.md'),
  join(ROOT, 'OPENAI_ROUTER_PROMPT.md'),
  join(ROOT, 'package.json'),
]) {
  if (!existsSync(file)) continue
  const text = readFileSync(file, 'utf8')
  // Allow placeholder tokens in docs
  const scrubbed = text
    .replace(/<your-router-token>/g, '')
    .replace(/\$\{?ANTHROPIC_[A-Z_]+\}?/g, '')
  for (const { name, re } of PATTERNS) {
    re.lastIndex = 0
    if (re.test(scrubbed)) {
      console.error(
        `SECRET:${name} in ${relative(ROOT, file).replace(/\\/g, '/')}`,
      )
      failed = true
    }
  }
}

if (failed) {
  console.error('FAIL: secrets detected')
  process.exit(1)
}
console.log('OK: no hardcoded secrets found')
