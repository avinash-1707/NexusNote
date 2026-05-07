'use client'

import { useEffect, useRef, useState } from 'react'
import { getToken } from '@/lib/auth'

type EmbedStatus = 'idle' | 'pending' | 'processing' | 'done' | 'error'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export function useEmbeddingStatus(workspaceId: number, jobId: number | null) {
  const [status, setStatus] = useState<EmbedStatus>('idle')
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!jobId) return

    setStatus('pending')

    const token = getToken()
    const url = `${API_URL}/workspaces/${workspaceId}/embeddings/status/${jobId}?token=${token}`
    const es = new EventSource(url)
    esRef.current = es

    es.addEventListener('status', (e: MessageEvent) => {
      const s = e.data as EmbedStatus
      setStatus(s)
      if (s === 'done' || s === 'error') {
        es.close()
        esRef.current = null
      }
    })

    es.onerror = () => {
      setStatus('error')
      es.close()
      esRef.current = null
    }

    return () => {
      es.close()
      esRef.current = null
    }
  }, [jobId, workspaceId])

  return status
}
