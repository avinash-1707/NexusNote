'use client'

import { useEffect, useState } from 'react'
import { getToken } from '@/lib/auth'
import { apiFetch } from '@/lib/api'

type EmbedStatus = 'idle' | 'pending' | 'processing' | 'done' | 'error'
type EmbedStatusResponse = { status: Exclude<EmbedStatus, 'idle'> }

export function useEmbeddingStatus(workspaceId: number, jobId: number | null) {
  const [status, setStatus] = useState<EmbedStatus>('idle')

  useEffect(() => {
    if (!jobId) {
      setStatus('idle')
      return
    }

    setStatus('pending')

    const token = getToken()
    if (!token) {
      setStatus('error')
      return
    }

    let cancelled = false
    let intervalId: number | null = null

    const pollStatus = async () => {
      try {
        const response = await apiFetch<EmbedStatusResponse>(
          `/workspaces/${workspaceId}/embeddings/status/${jobId}`,
          { token },
        )
        if (cancelled) return

        setStatus(response.status)

        if (response.status === 'done' || response.status === 'error') {
          if (intervalId !== null) {
            window.clearInterval(intervalId)
          }
        }
      } catch {
        if (!cancelled) {
          setStatus('error')
        }
        if (intervalId !== null) {
          window.clearInterval(intervalId)
        }
      }
    }

    void pollStatus()
    intervalId = window.setInterval(() => {
      void pollStatus()
    }, 3000)

    return () => {
      cancelled = true
      if (intervalId !== null) {
        window.clearInterval(intervalId)
      }
    }
  }, [jobId, workspaceId])

  return status
}
