import { api } from './api'

export async function getAllAbsensi(filters = {}) {
  const payload = {
    pageNum: filters.pageNum ?? 1,
    pageSize: filters.pageSize ?? 10,
    orderBy: filters.orderBy ?? 'createdSession desc',
    namaMapel: filters.namaMapel ?? '',
    createdSession: filters.createdSession ?? '',
    namaSiswa: filters.namaSiswa ?? '',
    nomorInduk: filters.nomorInduk ?? '',
    status: filters.status ?? '',
    jenisSession: filters.jenisSession ?? '',
  }

  return api.post('/absensi/get-absen', payload)
}

export async function updateAbsensi(id, status) {
  if (!id) {
    throw new Error('ID presensi tidak ditemukan.')
  }

  if (!status) {
    throw new Error('Status presensi harus dipilih.')
  }

  const path =
    `/absensi/edit-${encodeURIComponent(id)}` +
    `?status=${encodeURIComponent(status)}`

  return api.put(path, {})
}