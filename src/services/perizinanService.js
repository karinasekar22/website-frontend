
import { api } from './api'

const BASE_URL = '/perizinan'

function unwrapResponse(response) {
  return response?.data?.data ?? response?.data ?? response
}

export async function getIzin({ status = 'all', pageNum = 1 } = {}) {
  const params = new URLSearchParams({
    status,
    pageNum: String(pageNum),
  })

  const response = await api.get(
    `${BASE_URL}/get-izin?${params.toString()}`
  )

  return unwrapResponse(response)
}

export async function getDetailIzin(idIzin) {
  const params = new URLSearchParams({ idIzin })

  const response = await api.get(
    `${BASE_URL}/get-view?${params.toString()}`
  )

  return unwrapResponse(response)
}

export async function updateStatusIzin(idIzin, payload) {
  const response = await api.put(
    `${BASE_URL}/update-status/${encodeURIComponent(idIzin)}`,
    {
      status: payload.status,
      message: payload.message ?? '',
    }
  )

  return response
}

export async function updateDataIzin(idIzin, payload) {
  const response = await api.put(
    `${BASE_URL}/update-izin/${encodeURIComponent(idIzin)}`,
    {
      tanggalMulai: payload.tanggalMulai,
      tanggalSelesai: payload.tanggalSelesai,
      alasan: payload.alasan,
      jenisIzin: payload.jenisIzin,
    }
  )

  return response
}

export async function updateFileIzin(idIzin, file) {
  // Endpoint Swagger menerima field "file" sebagai string.
  // File dikirim dalam bentuk Base64 agar sesuai dengan body JSON.
  const base64 = await fileToBase64(file)

  return api.put(
    `${BASE_URL}/update-file-izin/${encodeURIComponent(idIzin)}`,
    { file: base64 }
  )
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const result = String(reader.result || '')
      resolve(result.split(',')[1] || '')
    }

    reader.onerror = () => reject(new Error('Gagal membaca file.'))
    reader.readAsDataURL(file)
  })
}

export async function downloadFileIzin(idIzin) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  const token = localStorage.getItem('access_token')
  const params = new URLSearchParams({ idIzin })

  const response = await fetch(
    `${baseUrl}${BASE_URL}/download?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        Accept: '*/*',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  )

  if (!response.ok) {
    let message = 'Gagal mengunduh berkas izin.'

    try {
      const body = await response.clone().json()
      message = body?.message || message
    } catch {
      // Pertahankan pesan default jika respons bukan JSON.
    }

    throw new Error(message)
  }

  const blob = await response.blob()
  const disposition = response.headers.get('content-disposition')
  const filenameMatch = disposition?.match(/filename="?([^"]+)"?/i)
  const filename = filenameMatch?.[1] || `berkas-izin-${idIzin}`

  return { blob, filename }
}
