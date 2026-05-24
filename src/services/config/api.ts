const DEFAULT_BASE_URL = 'https://www.thesportsdb.com/api/v1/json'
const DEFAULT_API_KEY = '123'

export function getTheSportsDbApiConfig() {
  return {
    baseUrl:
      import.meta.env.VITE_THESPORTSDB_API_BASE_URL?.trim() || DEFAULT_BASE_URL,
    apiKey: import.meta.env.VITE_THESPORTSDB_API_KEY?.trim() || DEFAULT_API_KEY,
  }
}
