'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query'
import { ApiError } from '@/lib/api'
import { removeToken } from '@/lib/auth'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError(error) {
            if (error instanceof ApiError && error.status === 401) {
              removeToken()
              window.location.href = '/login'
            }
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: (failureCount, error) => {
              if (error instanceof ApiError && error.status === 401) return false
              if (error instanceof ApiError && error.status === 403) return false
              if (error instanceof ApiError && error.status === 404) return false
              return failureCount < 2
            },
          },
        },
      }),
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
