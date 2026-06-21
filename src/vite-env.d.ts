/// <reference types="vite/client" />

declare const __APP_VERSION__: string

interface ImportMetaEnv {
  readonly VITE_THESPORTSDB_API_BASE_URL?: string
  readonly VITE_THESPORTSDB_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
