
import { api } from './api'

function unwrap(response) {
  const body = response?.data ?? response
  return body?.data ?? body
}

export async function getAllMapel(pageNum = 1) {
  const response = await api.get(
    `/referensi/get-mapel?pageNum=${pageNum}`
  )

  const result = unwrap(response)

  // Menyesuaikan kemungkinan bentuk response backend.
  if (Array.isArray(result)) return result
  return result?.items ?? result?.content ?? result?.data ?? []
}

export async function addMapel(namaMapel) {
  const response = await api.post(
    `/referensi/add-mapel?namaMapel=${encodeURIComponent(namaMapel)}`
  )

  return unwrap(response)
}

export async function updateMapel(idMapel, namaMapel) {
  const response = await api.put(
    `/referensi/update-mapel/${encodeURIComponent(idMapel)}?namaMapel=${encodeURIComponent(namaMapel)}`
  )

  return unwrap(response)
}

export async function deleteMapel(idMapel) {
  // Menggunakan helper DELETE jika tersedia di api.js.
  if (typeof api.delete === 'function') {
    const response = await api.delete(
      `/referensi/delete-mapel/${encodeURIComponent(idMapel)}`
    )
    return unwrap(response)
  }

  // Fallback apabila api.js belum menyediakan api.delete.
  const baseURL = import.meta.env.VITE_API_BASE_URL || ''
  const token = localStorage.getItem('access_token')

  const response = await fetch(
    `${baseURL}/referensi/delete-mapel/${encodeURIComponent(idMapel)}`,
    {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  )

  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(body?.message || 'Gagal menghapus mata pelajaran')
  }

  if (body?.statusCode >= 400 || body?.status === 'ERROR') {
    throw new Error(body?.message || 'Gagal menghapus mata pelajaran')
  }

  return unwrap(body)
}
