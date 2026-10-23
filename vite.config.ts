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

/** Public pages for the sitemap (detail pages depend on live data and are reached by links). */
const SITEMAP_PATHS = [
  '',
  ...Object.keys(espnSlugByLeague),
  'live',
  'players',
  'teams',
  'compare',
  'galaxy',
  'world-cup-2026',
  'world-cup-2026/matches',
  'world-cup-2026/groups',
  'world-cup-2026/bracket',
  'world-cup-2026/teams',
]

/**
 * robots.txt always; with VITE_SITE_URL (the public origin + base, e.g.
 * https://example.com) also sitemap.xml and absolute Open Graph URLs, which
 * link previews require.
 */
function siteFiles(): Plugin {
  let siteUrl: string | undefined
  return {
    name: 'fg-site-files',
    configResolved(config) {
      siteUrl = normalizeProxyBase(config.env.VITE_SITE_URL)
    },
    transformIndexHtml() {
      if (!siteUrl) return []
      return [
        { tag: 'meta', injectTo: 'head', attrs: { property: 'og:url', content: `${siteUrl}/` } },
        { tag: 'meta', injectTo: 'head', attrs: { property: 'og:image', content: `${siteUrl}/og-image.jpg` } },
        { tag: 'meta', injectTo: 'head', attrs: { name: 'twitter:image', content: `${siteUrl}/og-image.jpg` } },
      ]
    },
    generateBundle() {
      const sitemap = siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml\n` : ''
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n${sitemap}` })
      if (!siteUrl) return
      const urls = SITEMAP_PATHS.map((path) => `  <url><loc>${siteUrl}/${path}</loc></url>`).join('\n')
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      })
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
  plugins: [react(), preloadMainFont(), preloadLeagueData(), siteFiles()],
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
      // Floors just below the measured values (plan 20, phase 7: 51 % lines overall);
      // the data and helper layers carry the logic and stay near full coverage.
      thresholds: {
        lines: 50,
        functions: 60,
        branches: 65,
        statements: 50,
        'src/services/espn/**': { lines: 90, statements: 90 },
        'src/services/net/**': { lines: 90, statements: 90 },
        'src/lib/**': { lines: 85, statements: 85 },
      },
    },
  },
})
