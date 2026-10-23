#!/usr/bin/env node
/**
 * Production build for Hostinger shared hosting → dist-hostinger/
 *
 * - app built for the domain root, data through the same-origin PHP proxy
 *   (/api/live.php);
 * - deploy/hostinger (.htaccess, api/live.php) and proxy/rules.json copied in;
 * - the CSP in .htaccess gets the hashes of the inline scripts in index.html,
 *   so no 'unsafe-inline' is needed for scripts.
 *
 * Upload the *contents* of dist-hostinger/ to public_html/ (see
 * docs/deploy-hostinger.md).
 */
import { createHash } from 'node:crypto'
import { cpSync, readFileSync, writeFileSync } from 'node:fs'

import { build } from 'vite'

const OUT = 'dist-hostinger'

// vite.config.ts reads VITE_BASE; VITE_* variables also reach the bundle.
process.env.VITE_BASE = '/'
process.env.VITE_LIVE_DATA_PROXY_URL = '/api/live.php'
await build({ build: { outDir: OUT, emptyOutDir: true } })

cpSync('deploy/hostinger', OUT, { recursive: true })
cpSync('proxy/rules.json', `${OUT}/api/rules.json`)
writeFileSync(
  `${OUT}/assets/.htaccess`,
  '# File names carry a content hash: cache them for a year.\n<IfModule mod_headers.c>\n  Header set Cache-Control "public, max-age=31536000, immutable"\n</IfModule>\n',
)

const html = readFileSync(`${OUT}/index.html`, 'utf8')
const hashes = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(
  ([, body]) => `'sha256-${createHash('sha256').update(body).digest('base64')}'`,
)
const htaccess = readFileSync(`${OUT}/.htaccess`, 'utf8').replace('__CSP_SCRIPT_HASHES__', hashes.join(' '))
writeFileSync(`${OUT}/.htaccess`, htaccess)

console.log(`\n${OUT}/ ready — ${hashes.length} inline script hash(es) in the CSP. Upload its contents to public_html/.`)
