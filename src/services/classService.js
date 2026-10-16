const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// Merangkum field "errors" dari backend jadi satu teks yang mudah dibaca
const formatErrors = (errors) => {
  if (!errors || typeof errors !== 'object') return ''
  return Object.entries(errors)
    .map(([key, value]) =>
      `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`,
    )
    .join(', ')
}

// Endpoint kelas menerima parameter lewat query string (bukan body),
// jadi helper ini menyusun ?key=value dan membuang nilai yang kosong.
async function request(method, path, query = {}) {
  const token = localStorage.getItem('token')

  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value)
    }
  })
  const qs = params.toString()

  const res = await fetch(`${BASE_URL}${path}${qs ? `?${qs}` : ''}`, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  let data = null
  try {
    data = await res.json()
  } catch {
    // response bukan JSON
  }

  // Backend bisa membalas HTTP 200 tapi statusCode di body-nya error,
  // jadi dua-duanya dicek.
  const bodyFailed = data?.statusCode && data.statusCode >= 400

  if (!res.ok || bodyFailed) {
    const message = data?.message || `Request gagal (${res.status})`
    const detail = formatErrors(data?.errors)
    throw new Error(detail ? `${message} (${detail})` : message)
  }

  return data
}

// GET /referensi/get-all-kelas?pageNum=
export const getAllKelas = (pageNum = 1) =>
  request('GET', '/referensi/get-all-kelas', { pageNum })

// POST /referensi/add-kelas?urutanKelas=&tingkat=&idJurusan=
export const addKelas = ({ urutanKelas, tingkat, idJurusan }) =>
  request('POST', '/referensi/add-kelas', { urutanKelas, tingkat, idJurusan })

// PUT /referensi/update-kelas/{idKelas}?urutanKelas=&tingkat=&idJurusan=
export const updateKelas = (idKelas, { urutanKelas, tingkat, idJurusan }) =>
  request(
    'PUT',
    `/referensi/update-kelas/${encodeURIComponent(idKelas)}`,
    { urutanKelas, tingkat, idJurusan },
  )

// DELETE /referensi/delete-kelas/{idKelas}
export const deleteKelas = (idKelas) =>
  request('DELETE', `/referensi/delete-kelas/${encodeURIComponent(idKelas)}`)