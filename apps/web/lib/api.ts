function getApiUrl() {
  const productionApiUrl = 'https://nexusnote.onrender.com'
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim()

  if (apiUrl) {
    const normalizedApiUrl = apiUrl.replace(/\/$/, '')

    if (process.env.NODE_ENV === 'production' && normalizedApiUrl !== productionApiUrl) {
      throw new Error(`NEXT_PUBLIC_API_URL must be ${productionApiUrl} for production builds.`)
    }

    return normalizedApiUrl
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('NEXT_PUBLIC_API_URL must be set for production builds.')
  }

  return 'http://localhost:8000'
}

const API_URL = getApiUrl()

type RequestOptions = {
  method?: string
  body?: unknown
  token?: string
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiFetch<T>(
  path: string,
  { method = 'GET', body, token }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new ApiError(res.status, text)
  }

  return res.json() as Promise<T>
}

export async function apiUpload<T>(path: string, formData: FormData, token: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new ApiError(res.status, text)
  }

  return res.json() as Promise<T>
}

export { API_URL }
