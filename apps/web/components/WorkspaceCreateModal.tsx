'use client'

import { useState } from 'react'
import { useCreateWorkspace } from '@/lib/queries'
import type { Workspace } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
    <Dialog
      open={open}
      onOpenChange={isFirstWorkspace ? undefined : onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isFirstWorkspace ? 'Create your first workspace' : 'New workspace'}
          </DialogTitle>
          <DialogDescription>
            {isFirstWorkspace
              ? 'Give your knowledge base a name to get started.'
              : 'Workspaces keep your content isolated. You can have up to 5.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="ws-name">Workspace name</Label>
            <Input
              id="ws-name"
              placeholder="e.g. Research, Side Project, Thesis…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          {error && (
            <p className="mt-2 text-xs text-state-error">{(error as Error).message}</p>
          )}

          <DialogFooter className="mt-5">
            {!isFirstWorkspace && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={!name.trim() || isPending}>
              {isPending ? 'Creating…' : 'Create workspace'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
