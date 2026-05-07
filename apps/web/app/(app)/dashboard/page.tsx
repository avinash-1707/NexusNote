'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWorkspaces } from '@/lib/queries'
import { WorkspaceCreateModal } from '@/components/WorkspaceCreateModal'

export default function DashboardPage() {
  const router = useRouter()
  const { data: workspaces, isLoading } = useWorkspaces()
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    if (isLoading) return
    if (!workspaces) return
    if (workspaces.length > 0) {
      router.replace(`/workspace/${workspaces[0].id}/notes`)
    } else {
      setShowCreate(true)
    }
  }, [workspaces, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="h-5 w-5 rounded-full border-2 border-border-default border-t-accent-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <WorkspaceCreateModal
        open={showCreate}
        onOpenChange={setShowCreate}
        isFirstWorkspace
        onCreated={(ws) => router.push(`/workspace/${ws.id}/notes`)}
      />
    </div>
  )
}
