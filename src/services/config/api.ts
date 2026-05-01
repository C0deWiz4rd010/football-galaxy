const DEFAULT_BASE_URL = 'https://api.football-data.org/v4'

export function getFootballDataApiConfig() {
  return {
    baseUrl:
      import.meta.env.VITE_FOOTBALL_DATA_API_BASE_URL?.trim() ||
      DEFAULT_BASE_URL,
    apiToken: import.meta.env.VITE_FOOTBALL_DATA_API_TOKEN?.trim() || '',
  }
}
