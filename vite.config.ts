import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

import { DEV_PROXY_URL, normalizeProxyBase } from './src/services/config/proxyUrl'
import { espnSlugByLeague, leagueCoreUrls } from './src/services/espn/endpoints'

/** Preloads the Latin Inter file so text does not swap fonts after first paint. */
function preloadMainFont(): Plugin {
  let base = '/'
  return {
    name: 'fg-preload-main-font',
    apply: 'build',
    configResolved(config) {
      base = config.base
    },
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const font = Object.values(ctx.bundle ?? {}).find((file) => file.fileName.includes('inter-latin-wght-normal'))
        if (!font) return []
        return [{ tag: 'link', injectTo: 'head', attrs: { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: base + font.fileName } }]
      },
    },
  }
}

/**
 * Starts the league dashboard's four data requests from index.html, while the
 * JavaScript is still downloading: an inline script picks the league from the
 * URL and adds `<link rel="preload" as="fetch">` for exactly the URLs the
 * fetch client will request, so the app reuses those responses.
 */
function preloadLeagueData(): Plugin {
  let script = ''
  return {
    name: 'fg-preload-league-data',
    configResolved(config) {
      const proxy = normalizeProxyBase(
        config.env.VITE_LIVE_DATA_PROXY_URL ||
          (config.command === 'serve' && config.env.VITE_DISABLE_DEV_LIVE_PROXY !== 'true' ? DEV_PROXY_URL : ''),
      )
      if (!proxy) return
      const urls = Object.fromEntries(
        Object.entries(espnSlugByLeague).map(([leagueId, slug]) => [leagueId, Object.values(leagueCoreUrls(slug))]),
      )
      // "/" redirects to the Premier League.
      script = `(function(){var u=${JSON.stringify(urls)},b=${JSON.stringify(config.base)},p=${JSON.stringify(proxy)};var s=location.pathname.indexOf(b)===0?location.pathname.slice(b.length).split('/')[0]:'';var l=u[s||'premier-league'];if(!l)return;l.forEach(function(t){var e=document.createElement('link');e.rel='preload';e.as='fetch';e.crossOrigin='anonymous';e.href=p+'?target='+encodeURIComponent(t);document.head.appendChild(e)})})()`
    },
    transformIndexHtml() {
      return script ? [{ tag: 'script', injectTo: 'head-prepend', children: script }] : []
    },
  }
}

const pkg = JSON.parse(readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf-8'))

// https://vite.dev/config/
export default defineConfig({
  // Allows GitHub Pages (served from /football-galaxy/) and root hosts (Hostinger)
  // to share the same build. The CI workflow sets VITE_BASE for Pages.
  base: process.env.VITE_BASE ?? '/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [react(), preloadMainFont(), preloadLeagueData()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Only the React core is pinned to one long-cached chunk; everything
        // else is split by the import graph, so libraries load with the first
        // page that needs them (charts, tables, Zod, cmdk stay off the shell).
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          // ANALYZE=1 npm run build: one chunk per package to see what weighs what.
          if (process.env.ANALYZE) return 'pkg-' + (/node_modules[\\/]((?:@[^\\/]+[\\/])?[^\\/]+)/.exec(id)?.[1] ?? 'other').replace(/[@\\/]/g, '_')
          if (/node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom|@remix-run)[\\/]/.test(id)) return 'react'
          return undefined
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
    // proxy/tests need a running proxy: `npm run test:proxy`.
    exclude: ['node_modules/**', 'dist/**', 'dist-hostinger/**', 'proxy/**'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/vite-env.d.ts'],
      reporter: ['text-summary', 'html'],
      // Raised after Phase 2 (2026-10-02). Raised step by step; target in Phase 10.
      thresholds: { lines: 30, functions: 58, branches: 62, statements: 30 },
    },
  },
})
