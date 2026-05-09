import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch, apiUpload } from '@/lib/api'
import { useAuth } from '@/providers/AuthProvider'
import type {
  ChatMessage,
  ChatSession,
  EmbedResponse,
  Link,
  Note,
  PDF,
  TokenResponse,
  Workspace,
} from '@/lib/types'

// ─── Query key factory ───────────────────────────────────────────────────────

export const qk = {
  workspaces: () => ['workspaces'] as const,
  notes: (workspaceId: number) => ['notes', workspaceId] as const,
  note: (workspaceId: number, noteId: number) => ['notes', workspaceId, noteId] as const,
  pdfs: (workspaceId: number) => ['pdfs', workspaceId] as const,
  links: (workspaceId: number) => ['links', workspaceId] as const,
  sessions: (workspaceId: number) => ['sessions', workspaceId] as const,
  messages: (sessionId: number) => ['messages', sessionId] as const,
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export function useLogin() {
  return useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      apiFetch<TokenResponse>('/auth/login', { method: 'POST', body }),
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      apiFetch<TokenResponse>('/auth/register', { method: 'POST', body }),
  })
}

// ─── Workspaces ──────────────────────────────────────────────────────────────

export function useWorkspaces() {
  const { token } = useAuth()
  return useQuery({
    queryKey: qk.workspaces(),
    queryFn: () => apiFetch<Workspace[]>('/workspaces', { token: token! }),
    enabled: !!token,
  })
}

export function useCreateWorkspace() {
  const { token } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) =>
      apiFetch<Workspace>('/workspaces', { method: 'POST', body: { name }, token: token! }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.workspaces() }),
  })
}

export function useRenameWorkspace() {
  const { token } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      apiFetch<Workspace>(`/workspaces/${id}`, { method: 'PATCH', body: { name }, token: token! }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.workspaces() }),
  })
}

export function useDeleteWorkspace() {
  const { token } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<{ ok: boolean }>(`/workspaces/${id}`, { method: 'DELETE', token: token! }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.workspaces() }),
  })
}

// ─── Notes ───────────────────────────────────────────────────────────────────

export function useNotes(workspaceId: number) {
  const { token } = useAuth()
  return useQuery({
    queryKey: qk.notes(workspaceId),
    queryFn: () =>
      apiFetch<Note[]>(`/workspaces/${workspaceId}/notes`, { token: token! }),
    enabled: !!token && !!workspaceId,
  })
}

export function useNote(workspaceId: number, noteId: number) {
  const { token } = useAuth()
  return useQuery({
    queryKey: qk.note(workspaceId, noteId),
    queryFn: () =>
      apiFetch<Note>(`/workspaces/${workspaceId}/notes/${noteId}`, { token: token! }),
    enabled: !!token && !!workspaceId && !!noteId,
  })
}

export function useCreateNote(workspaceId: number) {
  const { token } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (title: string = 'Untitled') =>
      apiFetch<Note>(`/workspaces/${workspaceId}/notes`, {
        method: 'POST',
        body: { title },
        token: token!,
      }),
    onSuccess: (note) => {
      qc.setQueryData<Note[]>(qk.notes(workspaceId), (old) => [note, ...(old ?? [])])
      qc.setQueryData(qk.note(workspaceId, note.id), note)
    },
  })
}

export function useUpdateNote(workspaceId: number) {
  const { token } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      noteId,
      title,
      content_md,
    }: {
      noteId: number
      title?: string
      content_md?: string
    }) =>
      apiFetch<Note>(`/workspaces/${workspaceId}/notes/${noteId}`, {
        method: 'PATCH',
        body: { title, content_md },
        token: token!,
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: qk.notes(workspaceId) })
      qc.invalidateQueries({ queryKey: qk.note(workspaceId, vars.noteId) })
    },
  })
}

export function useRenameNote(workspaceId: number) {
  const { token } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ noteId, title }: { noteId: number; title: string }) =>
      apiFetch<Note>(`/workspaces/${workspaceId}/notes/${noteId}`, {
        method: 'PATCH',
        body: { title },
        token: token!,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.notes(workspaceId) }),
  })
}

export function useDeleteNote(workspaceId: number) {
  const { token } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (noteId: number) =>
      apiFetch<{ ok: boolean }>(`/workspaces/${workspaceId}/notes/${noteId}`, {
        method: 'DELETE',
        token: token!,
      }),
    onSuccess: (_, noteId) => {
      qc.invalidateQueries({ queryKey: qk.notes(workspaceId) })
      qc.removeQueries({ queryKey: qk.note(workspaceId, noteId) })
    },
  })
}

// ─── PDFs ────────────────────────────────────────────────────────────────────

export function usePDFs(workspaceId: number) {
  const { token } = useAuth()
  return useQuery({
    queryKey: qk.pdfs(workspaceId),
    queryFn: () => apiFetch<PDF[]>(`/workspaces/${workspaceId}/pdfs`, { token: token! }),
    enabled: !!token && !!workspaceId,
  })
}

export function useUploadPDF(workspaceId: number) {
  const { token } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData()
      fd.append('file', file)
      return apiUpload<PDF>(`/workspaces/${workspaceId}/pdfs`, fd, token!)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.pdfs(workspaceId) }),
  })
}

export function useDeletePDF(workspaceId: number) {
  const { token } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (pdfId: number) =>
      apiFetch<{ ok: boolean }>(`/workspaces/${workspaceId}/pdfs/${pdfId}`, {
        method: 'DELETE',
        token: token!,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.pdfs(workspaceId) }),
  })
}

// ─── Links ───────────────────────────────────────────────────────────────────

export function useLinks(workspaceId: number) {
  const { token } = useAuth()
  return useQuery({
    queryKey: qk.links(workspaceId),
    queryFn: () => apiFetch<Link[]>(`/workspaces/${workspaceId}/links`, { token: token! }),
    enabled: !!token && !!workspaceId,
  })
}

export function useSaveLink(workspaceId: number) {
  const { token } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (url: string) =>
      apiFetch<Link>(`/workspaces/${workspaceId}/links`, {
        method: 'POST',
        body: { url },
        token: token!,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.links(workspaceId) }),
  })
}

export function useDeleteLink(workspaceId: number) {
  const { token } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (linkId: number) =>
      apiFetch<{ ok: boolean }>(`/workspaces/${workspaceId}/links/${linkId}`, {
        method: 'DELETE',
        token: token!,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.links(workspaceId) }),
  })
}

// ─── Embeddings ──────────────────────────────────────────────────────────────

export function useCreateEmbedding(workspaceId: number) {
  const { token } = useAuth()
  return useMutation({
    mutationFn: ({
      resource_type,
      resource_id,
    }: {
      resource_type: 'note' | 'pdf' | 'link'
      resource_id: number
    }) =>
      apiFetch<EmbedResponse>(`/workspaces/${workspaceId}/embeddings`, {
        method: 'POST',
        body: { resource_type, resource_id },
        token: token!,
      }),
  })
}

// ─── Chat sessions ───────────────────────────────────────────────────────────

export function useChatSessions(workspaceId: number) {
  const { token } = useAuth()
  return useQuery({
    queryKey: qk.sessions(workspaceId),
    queryFn: () =>
      apiFetch<ChatSession[]>(`/workspaces/${workspaceId}/chat/sessions`, { token: token! }),
    enabled: !!token && !!workspaceId,
  })
}

export function useCreateSession(workspaceId: number) {
  const { token } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (title: string = 'New Chat') =>
      apiFetch<ChatSession>(`/workspaces/${workspaceId}/chat/sessions`, {
        method: 'POST',
        body: { title },
        token: token!,
      }),
    onSuccess: (session) => {
      qc.setQueryData<ChatSession[]>(qk.sessions(workspaceId), (old) => [session, ...(old ?? [])])
    },
  })
}

export function useRenameSession(workspaceId: number) {
  const { token } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sessionId, title }: { sessionId: number; title: string }) =>
      apiFetch<ChatSession>(`/workspaces/${workspaceId}/chat/sessions/${sessionId}`, {
        method: 'PATCH',
        body: { title },
        token: token!,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.sessions(workspaceId) }),
  })
}

export function useDeleteSession(workspaceId: number) {
  const { token } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: number) =>
      apiFetch<{ ok: boolean }>(`/workspaces/${workspaceId}/chat/sessions/${sessionId}`, {
        method: 'DELETE',
        token: token!,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.sessions(workspaceId) }),
  })
}

// ─── Chat messages ────────────────────────────────────────────────────────────

export function useChatMessages(workspaceId: number, sessionId: number) {
  const { token } = useAuth()
  return useQuery({
    queryKey: qk.messages(sessionId),
    queryFn: () =>
      apiFetch<ChatMessage[]>(
        `/workspaces/${workspaceId}/chat/sessions/${sessionId}/messages`,
        { token: token! },
      ),
    enabled: !!token && !!workspaceId && !!sessionId,
  })
}

export function useSendMessage(workspaceId: number, sessionId: number) {
  const { token } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content: string) =>
      apiFetch<ChatMessage>(
        `/workspaces/${workspaceId}/chat/sessions/${sessionId}/messages`,
        { method: 'POST', body: { content }, token: token! },
      ),
    // POST blocks until the assistant reply is ready and only returns the assistant row,
    // so without this the UI would not show the user message until the request finished.
    onMutate: async (content) => {
      await qc.cancelQueries({ queryKey: qk.messages(sessionId) })
      const previous = qc.getQueryData<ChatMessage[]>(qk.messages(sessionId))
      const optimistic: ChatMessage = {
        id: -Date.now(),
        session_id: sessionId,
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      }
      qc.setQueryData<ChatMessage[]>(qk.messages(sessionId), (old) => [
        ...(old ?? []),
        optimistic,
      ])
      return { previous }
    },
    onError: (_err, _content, context) => {
      if (context?.previous !== undefined) {
        qc.setQueryData(qk.messages(sessionId), context.previous)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.messages(sessionId) })
    },
  })
}
