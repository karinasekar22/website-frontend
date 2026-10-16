const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const pendingUserRequests = new Map()

const formatErrors = (errors) => {
  if (!errors || typeof errors !== 'object') return ''

  return Object.entries(errors)
    .map(([key, value]) =>
      `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`,
    )
    .join(', ')
}

async function post(path, body) {
  const token = localStorage.getItem('access_token')

  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })

  let data = null

  try {
    data = await response.json()
  } catch {
    // Response bukan JSON.
  }

  const bodyFailed =
    typeof data?.statusCode === 'number' &&
    data.statusCode >= 400

  if (!response.ok || bodyFailed) {
    const message =
      data?.message || `Request gagal (${response.status})`

    const detail = formatErrors(data?.errors)

    throw new Error(
      detail ? `${message} (${detail})` : message,
    )
  }

  return data
}

export const getAllUsers = (payload) => {
  const key = JSON.stringify(payload ?? {})

  if (pendingUserRequests.has(key)) {
    return pendingUserRequests.get(key)
  }

  const request = post('/user/get-all-user', payload).finally(() => {
    pendingUserRequests.delete(key)
  })

  pendingUserRequests.set(key, request)

  return request
}

export const addUser = (payload) =>
  post('/user/addUser', payload)
