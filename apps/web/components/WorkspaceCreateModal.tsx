'use client'

import { useState } from 'react'
import { useCreateWorkspace } from '@/lib/queries'
import type { Workspace } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  isFirstWorkspace?: boolean
  onCreated?: (workspace: Workspace) => void
}

export function WorkspaceCreateModal({
  open,
  onOpenChange,
  isFirstWorkspace = false,
  onCreated,
}: Props) {
  const [name, setName] = useState('')
  const { mutateAsync, isPending, error } = useCreateWorkspace()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    try {
      const ws = await mutateAsync(trimmed)
      setName('')
      onOpenChange(false)
      onCreated?.(ws)
    } catch {
      // error shown via `error` state below
    }
  }

  return (
    <Dialog open={open} onOpenChange={isFirstWorkspace ? undefined : onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="lp-display">
            {isFirstWorkspace ? 'Create your first workspace' : 'New workspace'}
          </DialogTitle>
          <DialogDescription>
            {isFirstWorkspace
              ? 'Give your knowledge base a name to get started.'
              : 'Workspaces keep your content isolated. You can have up to 5.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="ws-name"
              className="lp-display text-xs font-semibold tracking-wide block"
              style={{ color: 'var(--lp-body)' }}
            >
              Workspace name
            </label>
            <input
              id="ws-name"
              className="lp-auth-input"
              placeholder="e.g. Research, Side Project, Thesis…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          {error && (
            <p className="text-xs" style={{ color: 'var(--lp-coral)' }}>
              {(error as Error).message}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            {!isFirstWorkspace && (
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="px-4 py-2 rounded-full text-sm lp-display font-medium transition-opacity hover:opacity-70 disabled:opacity-40"
                style={{ color: 'var(--lp-body)' }}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!name.trim() || isPending}
              className="px-5 py-2 rounded-full text-sm lp-display font-semibold transition-opacity hover:opacity-85 disabled:opacity-50"
              style={{ backgroundColor: 'var(--lp-ink)', color: 'var(--lp-bg)' }}
            >
              {isPending ? 'Creating…' : 'Create workspace'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
