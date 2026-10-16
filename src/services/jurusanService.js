
const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function request(method, path, params = {}) {
  const token = localStorage.getItem('access_token')

  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value)
    }
  })

  const queryString = query.toString()
  const url = `${BASE_URL}${path}${
    queryString ? `?${queryString}` : ''
  }`

  const headers = {
    Accept: 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    method,
    headers,
  })

  let result = null

  try {
    result = await response.json()
  } catch {
    // Respons boleh kosong, misalnya pada operasi DELETE.
  }

  const failed =
    !response.ok ||
    (result?.statusCode != null &&
      Number(result.statusCode) >= 400) ||
    (typeof result?.status === 'string' &&
      result.status.toUpperCase() === 'ERROR')

  if (failed) {
    const errorMessage =
      result?.message ||
      result?.errors?.message ||
      (typeof result?.errors === 'string' ? result.errors : null) ||
      'Permintaan ke server gagal.'

    throw new Error(errorMessage)
  }

  return result
}

export const getAllJurusan = () =>
  request('GET', '/referensi/get-jurusan')

export const addJurusan = (namaJurusan) =>
  request('POST', '/referensi/add-jurusan', {
    namaJurusan,
  })

export const updateJurusan = (idJurusan, namaJurusan) =>
  request(
    'PUT',
    `/referensi/update-jurusan/${encodeURIComponent(idJurusan)}`,
    { namaJurusan }
  )

export const deleteJurusan = (idJurusan) =>
  request(
    'DELETE',
    `/referensi/delete-jurusan/${encodeURIComponent(idJurusan)}`
  )
