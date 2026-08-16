/**
 * Bun build for external/core Claude Code.
 *
 *   bun run scripts/build.ts --js
 *   bun run scripts/build.ts --linux-x64
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join, resolve } from 'path'

const ROOT = resolve(import.meta.dir, '..')
const OUT_DIR = join(ROOT, 'dist')
const ENTRY = join(ROOT, 'src/entrypoints/cli.tsx')
const MANIFEST_PATH = join(ROOT, 'scripts/stubs/packages/manifest.json')

const VERSION = process.env.CLAUDE_CODE_VERSION || '2.1.233-core'
const mode = process.argv.includes('--js') ? 'js' : 'linux-x64'

mkdirSync(OUT_DIR, { recursive: true })

const NATIVE_TS_ALIASES: Record<string, string> = {
  'color-diff-napi': resolve(ROOT, 'src/native-ts/color-diff/index.ts'),
}

const packageStubs: Record<string, string> = existsSync(MANIFEST_PATH)
  ? JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'))
  : {}

const defines: Record<string, string> = {
  // Critical: without this React may embed both dev+prod copies → Invalid hook call
  'process.env.NODE_ENV': JSON.stringify('production'),
  'process.env.USER_TYPE': JSON.stringify('external'),
  'process.env.CLAUDE_CODE_ENTRYPOINT': JSON.stringify('cli'),
  'MACRO.VERSION': JSON.stringify(VERSION),
  'MACRO.BUILD_TIME': JSON.stringify(new Date().toISOString()),
  'MACRO.PACKAGE_URL': JSON.stringify('claude-code-core'),
  'MACRO.NATIVE_PACKAGE_URL': JSON.stringify(''),
  'MACRO.VERSION_CHANGELOG': JSON.stringify(''),
  'MACRO.FEEDBACK_CHANNEL': JSON.stringify(
    'https://github.com/anthropics/claude-code/issues',
  ),
  'MACRO.ISSUES_EXPLAINER': JSON.stringify('report it on GitHub'),
}

const reactAliases: Record<string, string> = {
  react: Bun.resolveSync('react', ROOT),
  'react/jsx-runtime': Bun.resolveSync('react/jsx-runtime', ROOT),
  'react/jsx-dev-runtime': Bun.resolveSync('react/jsx-dev-runtime', ROOT),
  'react-reconciler': Bun.resolveSync('react-reconciler', ROOT),
  'react-reconciler/constants': Bun.resolveSync(
    'react-reconciler/constants',
    ROOT,
  ),
}
try {
  reactAliases['react/compiler-runtime'] = Bun.resolveSync(
    'react/compiler-runtime',
    ROOT,
  )
} catch {
  // optional
}

const stubPlugin = {
  name: 'core-stubs',
  setup(build: {
    onResolve: (
      opts: { filter: RegExp },
      cb: (args: { path: string }) => { path: string } | undefined | void,
    ) => void
  }) {
    for (const [name, path] of Object.entries(NATIVE_TS_ALIASES)) {
      build.onResolve({ filter: new RegExp(`^${name}$`) }, () => ({ path }))
    }
    for (const [name, path] of Object.entries(reactAliases)) {
      build.onResolve(
        { filter: new RegExp(`^${name.replaceAll('/', '\\/')}$`) },
        () => ({ path }),
      )
    }
    for (const [name, path] of Object.entries(packageStubs)) {
      build.onResolve(
        { filter: new RegExp(`^${name.replaceAll('/', '\\/')}$`) },
        () => ({ path }),
      )
    }
  },
}

console.log(`Building ${mode} from ${ENTRY}`)

if (mode === 'js') {
  const result = await Bun.build({
    entrypoints: [ENTRY],
    outdir: OUT_DIR,
    target: 'bun',
    plugins: [stubPlugin],
    define: defines,
    naming: 'claude.js',
    sourcemap: 'external',
    packages: 'bundle',
  })
  if (!result.success) {
    console.error(...result.logs)
    process.exit(1)
  }
  console.log(`OK: ${join(OUT_DIR, 'claude.js')}`)
} else {
  const outfile = join(OUT_DIR, 'claude')
  const result = await Bun.build({
    entrypoints: [ENTRY],
    plugins: [stubPlugin],
    define: defines,
    minify: true,
    packages: 'bundle',
    compile: {
      target: 'bun-linux-x64',
      outfile,
    },
  })
  if (!result.success) {
    console.error(...result.logs)
    process.exit(1)
  }
  // Bun may write beside outfile; normalize marker
  writeFileSync(join(OUT_DIR, '.build-target'), 'bun-linux-x64\n')
  console.log(`OK: ${outfile}`)
}
