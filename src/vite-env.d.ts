/// <reference types="vite/client" />

declare const __APP_VERSION__: string

interface ImportMetaEnv {
  /** Public URL of the live-data proxy, e.g. https://example.com/api/live.php */
  readonly VITE_LIVE_DATA_PROXY_URL?: string
  /** Set to "true" to call upstream APIs directly in dev (no local proxy). */
  readonly VITE_DISABLE_DEV_LIVE_PROXY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
