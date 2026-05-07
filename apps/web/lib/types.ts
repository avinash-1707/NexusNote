export interface Workspace {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export interface Note {
  id: number
  workspace_id: number
  title: string
  content_md: string
  created_at: string
  updated_at: string
}

export interface PDF {
  id: number
  workspace_id: number
  title: string
  cloudinary_url: string
  created_at: string
}

export interface Link {
  id: number
  workspace_id: number
  url: string
  title: string
  created_at: string
}

export interface EmbedResponse {
  job_id: number
  status: 'pending' | 'processing' | 'done' | 'error'
}

export interface ChatSession {
  id: number
  workspace_id: number
  title: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: number
  session_id: number
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}
