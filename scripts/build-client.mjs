// Bundle the browser half into the module-loader wrapper the dsh web shell expects.
// Usage: node scripts/build-client.mjs (after tsc built the host half).
import { build } from 'esbuild'
import { mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outFile = join(root, 'lib', 'client.js')
const tmpFile = join(root, 'lib', '.client-body.cjs')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

mkdirSync(join(root, 'lib'), { recursive: true })

await build({
  entryPoints: [join(root, 'src', 'client', 'index.tsx')],
  outfile: tmpFile,
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  jsx: 'automatic',
  minify: false,
  sourcemap: false,
  logLevel: 'info',
  external: ['react', 'react-dom', 'react/jsx-runtime', '@deepseek-ai/*'],
})

const body = readFileSync(tmpFile, 'utf8')
rmSync(tmpFile, { force: true })

const wrapper = [
  'window.__ModuleLoader__.load({',
  '  id: ' + JSON.stringify(pkg.name) + ',',
  '  factory: (require) => {',
  '    var module = { exports: {} };',
  '    var exports = module.exports;',
  body,
  '    return module.exports;',
  '  },',
  '});',
  ''
].join('\n')

writeFileSync(outFile, wrapper)
writeFileSync(join(root, 'lib', 'client.d.ts'), 'export {}\n')
console.log('client bundle written:', outFile)
