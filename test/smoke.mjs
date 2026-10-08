// Smoke test for the host half: the plugin must register its routes and tools
// against a cordis-like context, and the host store must round-trip records.
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import assert from 'node:assert/strict'
import { apply, name } from '../lib/index.js'
import { HostStore } from '../lib/store.js'
import { sshHostsTool } from '../lib/tools.js'

const registered = { tools: [], routes: [] }
const ctx = {
  effect(fn) {
    const dispose = fn()
    return () => { if (typeof dispose === 'function') dispose() }
  },
  webServer: { register(route) { registered.routes.push(route.path); return () => {} } },
  tools: { register(tool) { registered.tools.push(tool.name); return () => {} } },
}

assert.equal(name, 'ssh-workspace', 'plugin name')
apply(ctx)
assert.deepEqual(registered.tools.sort(), ['ssh_exec', 'ssh_hosts', 'ssh_ls', 'ssh_read'], 'agent tools')
assert.equal(registered.routes.length, 4, 'routes')
assert.ok(registered.routes.every(path => path.startsWith('/api/dsh-ssh-workspace/')), 'route family')
console.log('routes:', registered.routes.join(', '))
console.log('tools :', registered.tools.join(', '))

const dir = mkdtempSync(join(tmpdir(), 'dsh-ssh-ws-'))
try {
  const store = new HostStore(join(dir, 'hosts.json'))
  assert.equal(store.list().length, 0, 'empty registry')

  const saved = store.upsert({ alias: 'prod', host: '10.0.0.9', user: 'deploy', auth: 'password', password: 's3cret', workspaceRoot: '/srv/app' })
  assert.equal(saved.createdAt, saved.updatedAt, 'timestamps on insert')
  assert.equal(store.list().length, 1, 'insert')

  const view = HostStore.toPublic(store.get('prod'))
  assert.equal(view.hasPassword, true, 'password presence flag')
  assert.equal(JSON.stringify(view).includes('s3cret'), false, 'public view leaks no password')
  assert.equal(view.workspaceRoot, '/srv/app', 'workspace root')

  store.upsert({ alias: 'prod', host: '10.0.0.10', user: 'deploy', auth: 'password', password: 'next', workspaceRoot: '/srv/app' })
  assert.equal(store.list().length, 1, 'update does not duplicate')
  assert.equal(store.get('prod').host, '10.0.0.10', 'update applied')

  assert.throws(() => store.upsert({ alias: 'bad alias', host: 'h', user: 'u' }), /invalid alias/, 'alias validation')
  assert.throws(() => store.upsert({ alias: 'x', host: '', user: 'u' }), /host is required/, 'host validation')
  assert.throws(() => store.upsert({ alias: 'x', host: 'h', user: 'u', auth: 'key' }), /privateKeyPath/, 'key auth validation')

  store.setWorkspaceRoot('prod', '/opt/site')
  assert.equal(store.get('prod').workspaceRoot, '/opt/site', 'workspace root update')
  assert.equal(store.remove('prod'), true, 'remove')
  assert.equal(store.remove('prod'), false, 'remove twice')
} finally {
  rmSync(dir, { recursive: true, force: true })
}

const fakeEngine = {
  list: () => [{ alias: 'prod', host: '10.0.0.9', port: 22, user: 'deploy', auth: 'agent', createdAt: 1, updatedAt: 1 }],
}
const hostsTool = sshHostsTool(fakeEngine)
assert.equal(hostsTool.name, 'ssh_hosts', 'hosts tool name')
const result = await hostsTool.execute({}, {})
assert.equal(result.hosts.length, 1, 'hosts tool result')
assert.equal(result.hosts[0].alias, 'prod', 'hosts tool row')
console.log('smoke: OK')
