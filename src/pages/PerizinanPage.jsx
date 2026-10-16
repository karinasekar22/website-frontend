
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Search,
  RefreshCw,
  Eye,
  Pencil,
  Check,
  X,
  Download,
  FileText,
  CalendarDays,
} from 'lucide-react'
import Swal from 'sweetalert2'

import {
  getIzin,
  getDetailIzin,
  updateStatusIzin,
  updateDataIzin,
  updateFileIzin,
  downloadFileIzin,
} from '../services/perizinanService'
import '../styles/perizinan.css'

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'PENDING', label: 'Menunggu' },
  { value: 'APPROVED', label: 'Disetujui' },
  { value: 'REJECTED', label: 'Ditolak' },
]

const EMPTY_FORM = {
  tanggalMulai: '',
  tanggalSelesai: '',
  alasan: '',
  jenisIzin: '',
}

function unwrapList(response) {
  if (Array.isArray(response)) return response

  if (typeof response === 'string') {
    try {
      return unwrapList(JSON.parse(response))
    } catch {
      return []
    }
  }

  if (!response || typeof response !== 'object') return []

  const candidates = [
    response.content,
    response.items,
    response.records,
    response.data,
    response.list,
    response.result,
  ]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate
    if (candidate && typeof candidate === 'object') {
      const nested = unwrapList(candidate)
      if (nested.length) return nested
    }
  }

  return []
}

function readId(item) {
  return item?.idIzin ?? item?.id ?? item?.izinId ?? ''
}

function readStudent(item) {
  return (
    item?.namaSiswa ??
    item?.namaLengkap ??
    item?.namaUser ??
    item?.nama ??
    item?.siswa?.nama ??
    item?.user?.nama ??
    item?.nomorInduk ??
    '-'
  )
}

function readStatus(item) {
  return String(item?.status ?? 'PENDING').toUpperCase()
}

function formatDate(value) {
  if (!value) return '-'

  const date = String(value).slice(0, 10)
  const parts = date.split('-')

  if (parts.length !== 3) return value
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}

function toDateInput(value) {
  return value ? String(value).slice(0, 10) : ''
}

function statusLabel(status) {
  const normalized = String(status || '').toUpperCase()

  if (['APPROVED', 'DISETUJUI', 'DISETUJUI'].includes(normalized)) {
    return 'Disetujui'
  }

  if (['REJECTED', 'DITOLAK'].includes(normalized)) {
    return 'Ditolak'
  }

  if (['CANCELLED', 'DIBATALKAN'].includes(normalized)) {
    return 'Dibatalkan'
  }

  if (['PENDING', 'MENUNGGU', 'DIAJUKAN'].includes(normalized)) {
    return 'Menunggu'
  }

  return status || 'Menunggu'
}

function statusClass(status) {
  const value = String(status || '').toUpperCase()

  if (['APPROVED', 'DISETUJUI'].includes(value)) return 'approved'
  if (['REJECTED', 'DITOLAK'].includes(value)) return 'rejected'
  if (['CANCELLED', 'DIBATALKAN'].includes(value)) return 'cancelled'

  return 'pending'
}

function Field({ label, children }) {
  return (
    <label className="izin-field">
      <span>{label}</span>
      {children}
    </label>
  )
}

export default function PerizinanPage() {
  const [items, setItems] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [pageNum, setPageNum] = useState(1)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [replacementFile, setReplacementFile] = useState(null)

  const loadIzin = useCallback(async () => {
    setLoading(true)

    try {
      const response = await getIzin({
        status: statusFilter,
        pageNum,
      })

      setItems(unwrapList(response))
    } catch (error) {
      setItems([])

      await Swal.fire({
        icon: 'error',
        title: 'Gagal memuat perizinan',
        text: error.message || 'Tidak dapat mengambil daftar perizinan.',
      })
    } finally {
      setLoading(false)
    }
  }, [statusFilter, pageNum])

  useEffect(() => {
    loadIzin()
  }, [loadIzin])

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    if (!keyword) return items

    return items.filter((item) => {
      const values = [
        readStudent(item),
        item?.jenisIzin,
        item?.alasan,
        item?.nomorInduk,
        readStatus(item),
        readId(item),
      ]

      return values.some((value) =>
        String(value ?? '').toLowerCase().includes(keyword)
      )
    })
  }, [items, search])

  function startEdit(item) {
    setSelected(item)
    setForm({
      tanggalMulai: toDateInput(item?.tanggalMulai),
      tanggalSelesai: toDateInput(item?.tanggalSelesai),
      alasan: item?.alasan ?? '',
      jenisIzin: item?.jenisIzin ?? '',
    })
    setReplacementFile(null)
    setEditing(true)
    setDetail(null)
  }

  async function openDetail(item) {
    setSelected(item)
    setDetail(null)
    setDetailLoading(true)
    setEditing(false)

    try {
      const response = await getDetailIzin(readId(item))
      let result = response

      if (typeof result === 'string') {
        try {
          result = JSON.parse(result)
        } catch {
          result = { detail: result }
        }
      }

      setDetail(
        result && typeof result === 'object'
          ? { ...item, ...(result.data ?? result) }
          : item
      )
    } catch (error) {
      // Tetap tampilkan data dari tabel jika endpoint detail gagal.
      setDetail(item)

      await Swal.fire({
        icon: 'warning',
        title: 'Detail belum berhasil dimuat',
        text: error.message || 'Data ringkas dari daftar tetap ditampilkan.',
      })
    } finally {
      setDetailLoading(false)
    }
  }

  function handleFormChange(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  async function handleSaveEdit(event) {
    event.preventDefault()

    if (!selected) return

    if (
      !form.tanggalMulai ||
      !form.tanggalSelesai ||
      !form.alasan.trim() ||
      !form.jenisIzin.trim()
    ) {
      await Swal.fire({
        icon: 'warning',
        title: 'Form belum lengkap',
        text: 'Tanggal, jenis izin, dan alasan wajib diisi.',
      })
      return
    }

    if (form.tanggalSelesai < form.tanggalMulai) {
      await Swal.fire({
        icon: 'warning',
        title: 'Tanggal tidak valid',
        text: 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai.',
      })
      return
    }

    const confirmation = await Swal.fire({
      icon: 'question',
      title: 'Simpan perubahan izin?',
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Batal',
    })

    if (!confirmation.isConfirmed) return

    setBusy(true)

    try {
      const idIzin = readId(selected)

      await updateDataIzin(idIzin, form)

      if (replacementFile) {
        await updateFileIzin(idIzin, replacementFile)
      }

      setEditing(false)
      setSelected(null)

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Informasi perizinan berhasil diperbarui.',
        timer: 1600,
        showConfirmButton: false,
      })

      await loadIzin()
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Gagal memperbarui izin',
        text: error.message || 'Terjadi kesalahan saat menyimpan perubahan.',
      })
    } finally {
      setBusy(false)
    }
  }

  async function handleUpdateStatus(item, nextStatus) {
    const idIzin = readId(item)

    if (!idIzin) {
      await Swal.fire({
        icon: 'error',
        title: 'ID izin tidak ditemukan',
        text: 'Data dari backend tidak memiliki idIzin.',
      })
      return
    }

    const isApprove = nextStatus === 'APPROVED'

    const result = await Swal.fire({
      icon: 'question',
      title: isApprove ? 'Setujui perizinan?' : 'Tolak perizinan?',
      input: 'textarea',
      inputLabel: 'Pesan untuk pemohon (opsional)',
      inputPlaceholder: 'Tulis catatan atau alasan...',
      showCancelButton: true,
      confirmButtonText: isApprove ? 'Ya, setujui' : 'Ya, tolak',
      cancelButtonText: 'Batal',
      confirmButtonColor: isApprove ? '#16a34a' : '#dc2626',
      reverseButtons: true,
    })

    if (!result.isConfirmed) return

    setBusy(true)

    try {
      await updateStatusIzin(idIzin, {
        status: nextStatus,
        message: result.value || '',
      })

      await Swal.fire({
        icon: 'success',
        title: 'Status diperbarui',
        text: `Perizinan berhasil diubah menjadi ${statusLabel(nextStatus).toLowerCase()}.`,
        timer: 1600,
        showConfirmButton: false,
      })

      await loadIzin()
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Gagal mengubah status',
        text: error.message || 'Terjadi kesalahan saat memperbarui status.',
      })
    } finally {
      setBusy(false)
    }
  }

  async function handleDownload(item) {
    try {
      const result = await downloadFileIzin(readId(item))
      const url = URL.createObjectURL(result.blob)
      const anchor = document.createElement('a')

      anchor.href = url
      anchor.download = result.filename
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Gagal mengunduh berkas',
        text: error.message || 'Berkas izin tidak dapat diunduh.',
      })
    }
  }

  const closeDialog = () => {
    if (busy) return
    setSelected(null)
    setDetail(null)
    setEditing(false)
    setReplacementFile(null)
  }

  return (
    <div className="perizinan-page">
      <div className="izin-heading">
        <div>
          <div className="izin-heading-icon">
            <FileText size={23} />
          </div>
          <div>
            <h1>Perizinan</h1>
            <p>Kelola pengajuan izin siswa dan status persetujuannya.</p>
          </div>
        </div>

        <button
          type="button"
          className="izin-button secondary"
          onClick={loadIzin}
          disabled={loading || busy}
        >
          <RefreshCw size={16} className={loading ? 'izin-spin' : ''} />
          Muat Ulang
        </button>
      </div>

      <div className="izin-toolbar">
        <div className="izin-search">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari siswa, jenis, alasan, atau ID..."
            aria-label="Cari perizinan"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value)
            setPageNum(1)
          }}
          aria-label="Filter status perizinan"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="izin-table-card">
        <div className="izin-table-top">
          <div>
            <h2>Daftar Pengajuan</h2>
            <p>{filteredItems.length} data pada halaman ini</p>
          </div>
        </div>

        <div className="izin-table-wrap">
          <table className="izin-table">
            <thead>
              <tr>
                <th>Siswa</th>
                <th>Jenis Izin</th>
                <th>Tanggal</th>
                <th>Alasan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="izin-empty">
                    <RefreshCw size={18} className="izin-spin" />
                    Memuat data perizinan...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="izin-empty">
                    <FileText size={25} />
                    <strong>Data perizinan tidak ditemukan</strong>
                    <span>Coba ubah kata kunci atau filter status.</span>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => {
                  const status = readStatus(item)

                  return (
                    <tr key={readId(item) || index}>
                      <td>
                        <div className="izin-student">
                          <span className="izin-avatar">
                            {String(readStudent(item)).slice(0, 1).toUpperCase()}
                          </span>
                          <div>
                            <strong>{readStudent(item)}</strong>
                            <small>{item?.nomorInduk ?? readId(item) ?? '-'}</small>
                          </div>
                        </div>
                      </td>

                      <td>{item?.jenisIzin || '-'}</td>

                      <td>
                        <div className="izin-date">
                          <CalendarDays size={15} />
                          <span>
                            {formatDate(item?.tanggalMulai)}
                            {item?.tanggalSelesai &&
                              item.tanggalSelesai !== item.tanggalMulai &&
                              ` – ${formatDate(item.tanggalSelesai)}`}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="izin-reason">
                          {item?.alasan || '-'}
                        </span>
                      </td>

                      <td>
                        <span className={`izin-status ${statusClass(status)}`}>
                          {statusLabel(status)}
                        </span>
                      </td>

                      <td>
                        <div className="izin-actions">
                          <button
                            type="button"
                            className="izin-icon-button"
                            title="Lihat detail"
                            aria-label="Lihat detail"
                            onClick={() => openDetail(item)}
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            className="izin-icon-button"
                            title="Edit izin"
                            aria-label="Edit izin"
                            onClick={() => startEdit(item)}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            className="izin-icon-button download"
                            title="Unduh berkas"
                            aria-label="Unduh berkas"
                            onClick={() => handleDownload(item)}
                          >
                            <Download size={16} />
                          </button>

                          <button
                            type="button"
                            className="izin-icon-button approve"
                            title="Setujui"
                            aria-label="Setujui"
                            disabled={busy}
                            onClick={() => handleUpdateStatus(item, 'APPROVED')}
                          >
                            <Check size={16} />
                          </button>

                          <button
                            type="button"
                            className="izin-icon-button reject"
                            title="Tolak"
                            aria-label="Tolak"
                            disabled={busy}
                            onClick={() => handleUpdateStatus(item, 'REJECTED')}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="izin-pagination">
          <span>Halaman {pageNum}</span>

          <div>
            <button
              type="button"
              className="izin-button secondary"
              disabled={pageNum <= 1 || loading}
              onClick={() => setPageNum((page) => Math.max(1, page - 1))}
            >
              Sebelumnya
            </button>

            <button
              type="button"
              className="izin-button secondary"
              disabled={loading || items.length === 0}
              onClick={() => setPageNum((page) => page + 1)}
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>

      {(selected && (editing || detail || detailLoading)) && (
        <div
          className="izin-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog()
          }}
        >
          <div
            className="izin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="izin-modal-title"
          >
            <div className="izin-modal-header">
              <div>
                <h2 id="izin-modal-title">
                  {editing ? 'Edit Perizinan' : 'Detail Perizinan'}
                </h2>
                <p>ID: {readId(selected) || '-'}</p>
              </div>

              <button
                type="button"
                className="izin-icon-button"
                onClick={closeDialog}
                aria-label="Tutup dialog"
              >
                <X size={18} />
              </button>
            </div>

            {editing ? (
              <form className="izin-edit-form" onSubmit={handleSaveEdit}>
                <div className="izin-modal-grid">
                  <Field label="Tanggal Mulai">
                    <input
                      type="date"
                      name="tanggalMulai"
                      value={form.tanggalMulai}
                      onChange={handleFormChange}
                      required
                    />
                  </Field>

                  <Field label="Tanggal Selesai">
                    <input
                      type="date"
                      name="tanggalSelesai"
                      value={form.tanggalSelesai}
                      onChange={handleFormChange}
                      min={form.tanggalMulai}
                      required
                    />
                  </Field>

                  <Field label="Jenis Izin">
                    <input
                      name="jenisIzin"
                      value={form.jenisIzin}
                      onChange={handleFormChange}
                      placeholder="Contoh: Sakit, Keperluan Keluarga"
                      required
                    />
                  </Field>

                  <Field label="Alasan">
                    <textarea
                      name="alasan"
                      value={form.alasan}
                      onChange={handleFormChange}
                      rows={3}
                      required
                    />
                  </Field>

                  <Field label="Ganti Berkas (opsional)">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(event) =>
                        setReplacementFile(event.target.files?.[0] ?? null)
                      }
                    />
                  </Field>
                </div>

                <div className="izin-modal-footer">
                  <button
                    type="button"
                    className="izin-button secondary"
                    onClick={closeDialog}
                    disabled={busy}
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="izin-button primary"
                    disabled={busy}
                  >
                    {busy ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="izin-detail-content">
                {detailLoading ? (
                  <div className="izin-detail-loading">
                    <RefreshCw size={18} className="izin-spin" />
                    Memuat detail...
                  </div>
                ) : (
                  <>
                    <div className="izin-detail-status">
                      <span className={`izin-status ${statusClass(readStatus(detail))}`}>
                        {statusLabel(readStatus(detail))}
                      </span>
                    </div>

                    <dl>
                      <dt>Nama Siswa</dt>
                      <dd>{readStudent(detail)}</dd>

                      <dt>Nomor Induk</dt>
                      <dd>{detail?.nomorInduk ?? '-'}</dd>

                      <dt>Jenis Izin</dt>
                      <dd>{detail?.jenisIzin ?? '-'}</dd>

                      <dt>Tanggal Mulai</dt>
                      <dd>{formatDate(detail?.tanggalMulai)}</dd>

                      <dt>Tanggal Selesai</dt>
                      <dd>{formatDate(detail?.tanggalSelesai)}</dd>

                      <dt>Alasan</dt>
                      <dd>{detail?.alasan ?? '-'}</dd>

                      <dt>Pesan / Catatan</dt>
                      <dd>{detail?.message ?? detail?.pesan ?? '-'}</dd>
                    </dl>

                    {detail?.detail && (
                      <p className="izin-raw-detail">{detail.detail}</p>
                    )}

                    <div className="izin-modal-footer">
                      <button
                        type="button"
                        className="izin-button secondary"
                        onClick={() => handleDownload(detail)}
                      >
                        <Download size={16} />
                        Unduh Berkas
                      </button>

                      <button
                        type="button"
                        className="izin-button primary"
                        onClick={closeDialog}
                      >
                        Tutup
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
