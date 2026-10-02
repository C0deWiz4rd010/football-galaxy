import { QueryCache, QueryClient } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client'

import { toast } from '@/components/ui/toast'
import { isNotFoundError } from '@/services/errors'

/** Persisted data older than this is discarded on boot. */
const PERSIST_MAX_AGE_MS = 24 * 60 * 60_000

export function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      // One toast per failing query (not per subscribed component), and only
      // when there is nothing on screen: a failed background refresh keeps the
      // last good data visible silently.
      onError: (error, query) => {
        if (query.state.data !== undefined || isNotFoundError(error) || query.meta?.silent) return
        toast({ titleKey: 'loadFailedTitle', description: error.message })
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 5 * 60_000,
        // Must be >= the persist max age, otherwise restored entries are
        // garbage-collected before they can be used.
        gcTime: PERSIST_MAX_AGE_MS,
        // The fetch client already retries transient upstream failures per
        // request; one extra attempt covers composite loaders. A missing
        // entity is final.
        retry: (failureCount, error) => !isNotFoundError(error) && failureCount < 1,
        refetchOnWindowFocus: false,
      },
    },
  })
}

function safeLocalStorage(): Storage | undefined {
  try {
    const storage = window.localStorage
    const probe = '__fg_probe__'
    storage.setItem(probe, probe)
    storage.removeItem(probe)
    return storage
  } catch {
    return undefined
  }
}

export function createPersistOptions(): Omit<PersistQueryClientOptions, 'queryClient'> {
  return {
    persister: createSyncStoragePersister({
      storage: typeof window === 'undefined' ? undefined : safeLocalStorage(),
      key: 'fg-query-cache',
      throttleTime: 2000,
    }),
    maxAge: PERSIST_MAX_AGE_MS,
    // A new deploy may change data shapes: start from a clean cache.
    buster: __APP_VERSION__,
    dehydrateOptions: {
      shouldDehydrateQuery: (query) =>
        query.state.status === 'success' && query.meta?.persist !== false,
    },
  }
}
