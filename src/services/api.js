
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const TOKEN_KEY = 'access_token'
const USER_KEY = 'current_user'

let onUnauthorized = null

// Callback dipasang oleh AuthContext
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

async function request(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY)

  // Bedakan request JSON dengan upload FormData
  const isFormData = options.body instanceof FormData

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const contentType = response.headers.get('content-type') || ''

  // Tangani sesi kedaluwarsa
  if (response.status === 401) {
    const isLoginRequest = path.includes('/auth/login')

    if (!isLoginRequest && token) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      onUnauthorized?.()
    }

    const body = contentType.includes('application/json')
      ? await response.json().catch(() => ({}))
      : await response.text().catch(() => '')

    const message =
      typeof body === 'object' && body?.message
        ? body.message
        : 'Sesi kamu telah berakhir. Silakan login kembali.'

    throw new Error(message)
  }

  const body = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const message =
      typeof body === 'object' && body?.message
        ? body.message
        : typeof body === 'string' && body
          ? body
          : 'Request API gagal'

    throw new Error(message)
  }

  return body
}

export const api = {
  get: (path, options = {}) =>
    request(path, { ...options, method: 'GET' }),

  post: (path, data, options = {}) =>
    request(path, {
      ...options,
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  put: (path, data, options = {}) =>
    request(path, {
      ...options,
      method: 'PUT',
      body:
        data instanceof FormData
          ? data
          : data !== undefined
            ? JSON.stringify(data)
            : undefined,
    }),

  patch: (path, data, options = {}) =>
    request(path, {
      ...options,
      method: 'PATCH',
      body:
        data instanceof FormData
          ? data
          : data !== undefined
            ? JSON.stringify(data)
            : undefined,
    }),

  delete: (path, options = {}) =>
    request(path, { ...options, method: 'DELETE' }),
}

export { API_BASE_URL }