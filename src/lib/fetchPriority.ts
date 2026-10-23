/**
 * React 18 does not know the camelCase `fetchPriority` prop and warns; the
 * lowercase attribute is passed straight through to the DOM.
 */
export const HIGH_FETCH_PRIORITY = { fetchpriority: 'high' } as Record<string, string>
