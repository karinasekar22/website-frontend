
import { api } from './api'

function unwrap(response) {
  const body = response?.data ?? response
  return body?.data ?? body
}

export async function getAllTdMapel({
  pageNum = 1,
  pageSize = 10,
  orderBy = 'created_at desc',
  namaMapel = '',
  namaKelas = '',
} = {}) {
  const response = await api.post('/referensi/get-all-td-mapel', {
    pageNum,
    pageSize,
    orderBy,
    namaMapel,
    namaKelas,
  })

  const result = unwrap(response)

  if (Array.isArray(result)) {
    return {
      items: result,
      total: result.length,
      pages: 1,
      pageNum,
    }
  }

  return {
    ...result,
    items: result?.items ?? result?.content ?? result?.data ?? [],
    total: result?.totalCount ?? result?.total ?? 0,
    pages: result?.pages ?? 1,
    pageNum: result?.pageNum ?? pageNum,
  }
}

export async function getTdMapelOptions() {
  const response = await api.post('/referensi/get-all-td-mapel', {
    pageNum: 1,
    pageSize: 1000,
    orderBy: 'created_at desc',
    namaMapel: '',
    namaKelas: '',
  })

  const result = unwrap(response)
  const items = Array.isArray(result)
    ? result
    : result?.items ?? result?.content ?? []

  const mapelMap = new Map()
  const kelasMap = new Map()

  items.forEach((item) => {
    const idMapel = item?.idMapel ?? item?.mapel?.idMapel
    const namaMapel = item?.namaMapel ?? item?.mapel?.namaMapel

    const idKelas = item?.idKelas ?? item?.kelas?.idKelas
    const namaKelas = item?.namaKelas ?? item?.kelas?.namaKelas

    if (idMapel && namaMapel) {
      mapelMap.set(String(idMapel), {
        id: String(idMapel),
        nama: namaMapel,
      })
    }

    if (idKelas && namaKelas) {
      kelasMap.set(String(idKelas), {
        id: String(idKelas),
        nama: namaKelas,
      })
    }
  })

  return {
    mapel: [...mapelMap.values()],
    kelas: [...kelasMap.values()],
  }
}

export async function addTdMapel({ idMapel, idKelas }) {
  const response = await api.post('/referensi/add-td-mapel', {
    idMapel,
    idKelas,
    createdAt: '',
    updatedAt: '',
  })

  return unwrap(response)
}

export async function updateTdMapel(idTdMapel, status) {
  const response = await api.put(
    `/referensi/update-td-mapel/${encodeURIComponent(idTdMapel)}?status=${encodeURIComponent(status)}`
  )

  return unwrap(response)
}


export async function importTdMapelExcel(file) {
  const formData = new FormData()

  formData.append('file', file)

  const response = await api.post(
    '/referensi/add-td-mapel-excel',
    formData
  )

  return unwrap(response)
}

