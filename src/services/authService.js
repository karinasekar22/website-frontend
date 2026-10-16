
import { api } from './api'

const TOKEN_KEY = 'access_token'
const USER_KEY = 'current_user'

export async function login(nomorInduk, password) {
  const response = await api.post('/auth/login', {
    nomorInduk,
    password,
  })

  const data = response?.data || {}

  const token =
    data.token ||
    data.accessToken ||
    response.token ||
    response.accessToken

  if (!token) {
    throw new Error('Login berhasil tetapi token tidak ditemukan.')
  }

  const user = data.user || data.profile || data

  const name = user.name || user.nama || user.namaLengkap || nomorInduk

  const session = {
    token,
    user: {
      ...user,
      nomorInduk,
      name,
      email: user.email || '',
      role: user.role || '',
      title: user.title || '',
      initials:
        user.initials ||
        name
          .split(' ')
          .map(word => word[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
    },
  }

  localStorage.setItem(TOKEN_KEY, session.token)
  localStorage.setItem(USER_KEY, JSON.stringify(session.user))

  return session
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
