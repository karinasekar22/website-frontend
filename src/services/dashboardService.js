
import { api } from './api'

const PAGE_SIZE = 1000

function unwrap(response) {
  let result = response

  for (let i = 0; i < 3; i += 1) {
    if (
      result &&
      !Array.isArray(result) &&
      typeof result === 'object' &&
      Object.prototype.hasOwnProperty.call(result, 'data')
    ) {
      result = result.data
    } else {
      break
    }
  }

  return result
}

function extractList(response) {
  const data = unwrap(response)

  if (Array.isArray(data)) return data
  if (!data || typeof data !== 'object') return []

  const keys = [
    'content',
    'items',
    'records',
    'results',
    'list',
    'users',
    'kelas',
    'absensi',
    'absens',
    'perizinan',
  ]

  for (const key of keys) {
    if (Array.isArray(data[key])) return data[key]
  }

  return []
}

export async function getDashboardUsers() {
  const response = await api.post('/user/get-all-user', {
    pageNum: 0,
    pageSize: PAGE_SIZE,
    orderBy: 'createdAt,desc',
  })

  return {
    rows: extractList(response),
    raw: unwrap(response),
  }
}

export async function getDashboardClasses() {
  const response = await api.get('/referensi/get-all-kelas?pageNum=0')
  return {
    rows: extractList(response),
    raw: unwrap(response),
  }
}

export async function getDashboardAttendance(date) {
  const response = await api.post('/absensi/get-absen', {
    pageNum: 0,
    pageSize: PAGE_SIZE,
    orderBy: 'createdSession,desc',
    namaMapel: '',
    createdSession: date,
    namaSiswa: '',
    nomorInduk: '',
    status: '',
    jenisSession: '',
  })

  return {
    rows: extractList(response),
    raw: unwrap(response),
  }
}

export async function getDashboardPermissions() {
  const response = await api.get(
    '/perizinan/get-izin?status=all&pageNum=1'
  )

  return {
    rows: extractList(response),
    raw: unwrap(response),
  }
}

export async function getDashboardData(date) {
  const results = await Promise.allSettled([
    getDashboardUsers(),
    getDashboardClasses(),
    getDashboardAttendance(date),
    getDashboardPermissions(),
  ])

  const valueOrEmpty = (result) =>
    result.status === 'fulfilled'
      ? result.value
      : { rows: [], raw: null }

  return {
    users: valueOrEmpty(results[0]),
    classes: valueOrEmpty(results[1]),
    attendance: valueOrEmpty(results[2]),
    permissions: valueOrEmpty(results[3]),
    errors: results.map((result, index) => ({
      name: ['users', 'classes', 'attendance', 'permissions'][index],
      message:
        result.status === 'rejected'
          ? result.reason?.message || 'Gagal mengambil data'
          : '',
    })).filter((item) => item.message),
  }
}
