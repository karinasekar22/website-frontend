
import { api } from './api'

const BASE_URL = '/referensi'

function unwrapResponse(response) {
  return response?.data?.data ?? response?.data ?? response
}

export async function getInfoSekolah() {
  const response = await api.get(`${BASE_URL}/get-info-sekolah`)
  return unwrapResponse(response)
}

export async function addInfoSekolah(payload) {
  const response = await api.post(
    `${BASE_URL}/info-sekolah`,
    payload
  )

  return response
}

export async function updateInfoSekolah(payload) {
  const response = await api.put(
    `${BASE_URL}/info-sekolah`,
    payload
  )

  return response
}
