
import { api } from './api'

export const getAllTahunAjaran = (pageNum = 1) => {
  return api.get(
    `/referensi/get-tahun-ajaran?pageNum=${pageNum}`
  )
}

export const addTahunAjaran = ({
  tahunMulai,
  tahunSelesai,
  semester,
}) => {
  const params = new URLSearchParams({
    tahunMulai: String(tahunMulai),
    tahunSelesai: String(tahunSelesai),
    semester,
  })

  return api.post(
    `/referensi/add-tahun-ajaran?${params.toString()}`,
    {}
  )
}

export const updateTahunAjaran = ({
  idTahun,
  tahunMulai,
  tahunSelesai,
  semester,
  status,
}) => {
  const params = new URLSearchParams({
    idTahun: String(idTahun),
    tahunMulai: String(tahunMulai),
    tahunSelesai: String(tahunSelesai),
    semester,
    status,
  })

  return api.put(
    `/referensi/update-tahun-ajaran?${params.toString()}`,
    {}
  )
}
