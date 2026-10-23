#!/usr/bin/env node
/**
 * Starts a proxy implementation on a spare port and runs the contract tests
 * (proxy/tests) against it.
 *
 *   node scripts/test-proxy.mjs          # Node dev proxy
 *   node scripts/test-proxy.mjs --php    # PHP proxy via `php -S` (needs php + curl)
 *   PROXY_TEST_NETWORK=1 …               # include a real upstream round trip
 */
import { spawn } from 'node:child_process'
import { cpSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const usePhp = process.argv.includes('--php')
const port = usePhp ? 8798 : 8799
const env = { ...process.env, ALLOWED_ORIGINS: 'http://localhost:5173', PROXY_PORT: String(port) }

let root
let server
let proxyUrl
if (usePhp) {
  // Same layout as the Hostinger upload: api/live.php next to rules.json.
  root = mkdtempSync(join(tmpdir(), 'fg-proxy-'))
  cpSync('deploy/hostinger/api', join(root, 'api'), { recursive: true })
  cpSync('proxy/rules.json', join(root, 'api', 'rules.json'))
  env.FG_PROXY_DATA_DIR = join(root, 'data')
  server = spawn('php', ['-S', `127.0.0.1:${port}`, '-t', root], { env, stdio: 'inherit' })
  proxyUrl = `http://127.0.0.1:${port}/api/live.php`
} else {
  server = spawn(process.execPath, ['proxy/football-data-proxy.mjs'], { env, stdio: 'inherit' })
  proxyUrl = `http://127.0.0.1:${port}/api/live`
}

async function waitForHealth() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      if ((await fetch(`${proxyUrl}?health=1`)).ok) return
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  throw new Error(`Proxy did not start at ${proxyUrl}`)
}

let exitCode = 1
try {
  await waitForHealth()
  const tests = spawn(process.execPath, ['--test', 'proxy/tests/proxy.test.mjs'], { env: { ...env, PROXY_URL: proxyUrl }, stdio: 'inherit' })
  exitCode = await new Promise((resolve) => tests.on('exit', (code) => resolve(code ?? 1)))
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
} finally {
  server.kill()
  if (root) rmSync(root, { recursive: true, force: true })
}
process.exitCode = exitCode
