/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_THESPORTSDB_API_BASE_URL?: string
  readonly VITE_THESPORTSDB_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
