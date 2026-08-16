/**
 * Generate stub modules for unresolved local imports and private/optional npm packages.
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'fs'
import { dirname, join, relative, resolve } from 'path'

const ROOT = resolve(import.meta.dir, '..')
const SRC = join(ROOT, 'src')
const PKG_STUB_DIR = join(ROOT, 'scripts/stubs/packages')

const NPM_STUBS = new Set([
  '@ant/claude-for-chrome-mcp',
  '@ant/computer-use-mcp',
  '@ant/computer-use-input',
  '@ant/computer-use-swift',
  'audio-capture-napi',
  'image-processor-napi',
  'url-handler-napi',
  'modifiers-napi',
  'color-diff-napi',
  'sharp',
  'plist',
  '@anthropic-ai/foundry-sdk',
  '@anthropic-ai/bedrock-sdk',
  '@anthropic-ai/vertex-sdk',
  '@anthropic-ai/mcpb',
  '@aws-sdk/client-bedrock',
  '@aws-sdk/client-bedrock-runtime',
  '@aws-sdk/client-sts',
  '@aws-sdk/credential-providers',
  '@aws-sdk/credential-provider-node',
  '@azure/identity',
  '@opentelemetry/exporter-metrics-otlp-grpc',
  '@opentelemetry/exporter-metrics-otlp-proto',
  '@opentelemetry/exporter-prometheus',
  '@opentelemetry/exporter-logs-otlp-grpc',
  '@opentelemetry/exporter-logs-otlp-proto',
  '@opentelemetry/exporter-trace-otlp-grpc',
  '@opentelemetry/exporter-trace-otlp-proto',
  '@opentelemetry/exporter-logs-otlp-http',
  '@opentelemetry/exporter-metrics-otlp-http',
  '@opentelemetry/exporter-trace-otlp-http',
  'google-auth-library',
  '@smithy/core',
  '@smithy/node-http-handler',
])

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === 'dist' || name === 'stubs') continue
      walk(p, out)
    } else if (/\.(ts|tsx)$/.test(name)) out.push(p)
  }
  return out
}

function candidates(spec: string, fromFile: string): string[] {
  const abs = spec.startsWith('src/')
    ? join(ROOT, spec)
    : resolve(dirname(fromFile), spec)
  const noExt = abs.replace(/\.js$/, '')
  return [
    noExt + '.ts',
    noExt + '.tsx',
    join(noExt, 'index.ts'),
    join(noExt, 'index.tsx'),
  ]
}

function resolveLocal(spec: string, fromFile: string): boolean {
  return candidates(spec, fromFile).some(p => existsSync(p))
}

function targetPath(spec: string, fromFile: string): string {
  const abs = spec.startsWith('src/')
    ? join(ROOT, spec)
    : resolve(dirname(fromFile), spec)
  return abs.replace(/\.js$/, '') + '.ts'
}

function pkgStubPath(pkg: string): string {
  return join(PKG_STUB_DIR, pkg.replace(/[\/@]/g, '_') + '.ts')
}

type StubInfo = { names: Set<string>; defaultImport: boolean; samples: string[] }

const localStubs = new Map<string, StubInfo>()
const npmStubs = new Map<string, StubInfo>()

function ensure(map: Map<string, StubInfo>, key: string): StubInfo {
  let info = map.get(key)
  if (!info) {
    info = { names: new Set(), defaultImport: false, samples: [] }
    map.set(key, info)
  }
  return info
}

const importRe =
  /(?:import|export)\s+(type\s+)?(?:(\*\s+as\s+(\w+))|(\{[^}]*\})|(\w+))?\s*(?:,\s*(?:(\{[^}]*\})|(\w+)))?\s*from\s*['"]([^'"]+)['"]|require\(\s*['"]([^'"]+)['"]\s*\)|import\(\s*['"]([^'"]+)['"]\s*\)/g

function absorbNamed(info: StubInfo, named: string | undefined) {
  if (!named) return
  for (const part of named.replace(/[{}]/g, '').split(',')) {
    const raw = part.trim()
    if (!raw) continue
    const name = raw
      .replace(/^type\s+/, '')
      .split(/\s+as\s+/)[0]
      .trim()
    if (name && name !== '*') info.names.add(name)
  }
}

for (const file of walk(SRC)) {
  const text = readFileSync(file, 'utf8')
  for (const m of text.matchAll(importRe)) {
    const spec = m[8] || m[9] || m[10]
    if (!spec) continue

    let info: StubInfo | null = null
    if (spec.startsWith('.') || spec.startsWith('src/')) {
      if (resolveLocal(spec, file)) continue
      info = ensure(localStubs, targetPath(spec, file))
    } else {
      const pkg = NPM_STUBS.has(spec)
        ? spec
        : [...NPM_STUBS].find(p => spec === p || spec.startsWith(p + '/'))
      if (!pkg) continue
      info = ensure(npmStubs, pkg)
    }

    absorbNamed(info, m[4] || m[6])
    if ((m[5] || m[7]) && !m[3]) info.defaultImport = true
    if (m[3]) info.names.add('__namespace_' + m[3])
    if (info.samples.length < 2) {
      info.samples.push(relative(ROOT, file).replace(/\\/g, '/'))
    }
  }
}

function writeStub(file: string, info: StubInfo) {
  mkdirSync(dirname(file), { recursive: true })
  const lines = [
    '/** Auto-generated stub for incomplete source dump. */',
    `// referenced from: ${info.samples.join(', ')}`,
    'const _stub: any = new Proxy(function () { return _stub }, { get: () => _stub, apply: () => _stub })',
  ]
  if (info.defaultImport) lines.push('export default _stub')
  for (const name of [...info.names].sort()) {
    if (name.startsWith('__namespace_')) {
      lines.push(`export const ${name.slice('__namespace_'.length)}: any = _stub`)
      continue
    }
    if (!/^[A-Za-z_$][\w$]*$/.test(name)) continue
    lines.push(`export const ${name}: any = _stub`)
    lines.push(`export type ${name} = any`)
  }
  if (!info.defaultImport && info.names.size === 0) {
    lines.push('export default _stub')
    lines.push('export {}')
  }
  writeFileSync(file, lines.join('\n') + '\n')
}

let written = 0
for (const [file, info] of localStubs) {
  if (existsSync(file)) continue
  writeStub(file, info)
  written++
}
mkdirSync(PKG_STUB_DIR, { recursive: true })
const manifest: Record<string, string> = {}
for (const [pkg, info] of npmStubs) {
  const file = pkgStubPath(pkg)
  writeStub(file, info)
  manifest[pkg] = file
  written++
}
// Always write empty defaults for listed packages even if unused yet
for (const pkg of NPM_STUBS) {
  if (manifest[pkg]) continue
  const file = pkgStubPath(pkg)
  writeStub(file, {
    names: new Set(),
    defaultImport: true,
    samples: ['(preseeded)'],
  })
  manifest[pkg] = file
  written++
}
writeFileSync(
  join(PKG_STUB_DIR, 'manifest.json'),
  JSON.stringify(manifest, null, 2),
)
console.log(`Wrote/updated stubs; files touched≈${written}; npm stubs=${Object.keys(manifest).length}`)
