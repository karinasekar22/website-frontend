import { useCallback, useEffect, useState } from 'react'
import {
  Search,
  RefreshCw,
  Pencil,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  X,
} from 'lucide-react'
import Swal from 'sweetalert2'

import { getAllAbsensi, updateAbsensi } from '../services/absensiService'
import Panel, { PanelHeading } from '../components/ui/Panel'
import { PageTitle } from '../components/layout/Topbar'
import '../styles/absensi.css'

const PAGE_SIZE = 10

const STATUS_OPTIONS = [
  { value: 'HADIR', label: 'Hadir' },
  { value: 'IZIN', label: 'Izin' },
  { value: 'SAKIT', label: 'Sakit' },
  { value: 'ALPHA', label: 'Alpha' },
]

const SESSION_OPTIONS = [
  { value: 'CLOCK-IN', label: 'Clock In' },
  { value: 'CLOCK-OUT', label: 'Clock Out' },
]

function getValue(object, keys, fallback = '-') {
  for (const key of keys) {
    const value = object?.[key]

    if (value !== undefined && value !== null && value !== '') {
      return value
    }
  }

  return fallback
}

function getResponseData(response) {
  return response?.data ?? response
}

function getAbsensiList(response) {
  const data = response?.data

  if (Array.isArray(data?.items)) {
    return data.items
  }

  return []
}

function getPagination(response) {
  const data = response?.data

  return {
    totalItems: Number(data?.totalCount ?? data?.total ?? 0),
    totalPages: Number(data?.pages ?? 0),
    hasNext:
      Number(data?.pageNum ?? 1) < Number(data?.pages ?? 0),
  }
}

function formatDate(value) {
  if (!value || value === '-') return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return String(value)

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function normalizeStatus(status) {
  return String(status ?? '')
    .trim()
    .toUpperCase()
}

function StatusBadge({ status }) {
  const normalized = normalizeStatus(status)

  const className =
    normalized === 'HADIR'
      ? 'status-hadir'
      : normalized === 'IZIN'
        ? 'status-izin'
        : normalized === 'SAKIT'
          ? 'status-sakit'
          : normalized === 'ALPHA'
            ? 'status-alpa'
            : 'status-default'

  const label =
    STATUS_OPTIONS.find((item) => item.value === normalized)?.label ??
    (status || 'Belum ada status')

  return (
    <span className={`absensi-status ${className}`}>
      {label}
    </span>
  )
}

function extractError(error) {
  return error?.message || 'Terjadi kesalahan. Silakan coba lagi.'
}

export default function AbsensiPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [pageNum, setPageNum] = useState(1)
  const [pagination, setPagination] = useState({
    totalItems: null,
    totalPages: null,
    hasNext: false,
  })

  const [filters, setFilters] = useState({
    namaMapel: '',
    createdSession: '',
    namaSiswa: '',
    nomorInduk: '',
    status: '',
    jenisSession: '',
  })

  const [appliedFilters, setAppliedFilters] = useState(filters)
  const [selectedAbsensi, setSelectedAbsensi] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('')

  const loadAbsensi = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await getAllAbsensi({
        ...appliedFilters,
        pageNum,
        pageSize: PAGE_SIZE,
        orderBy: 'createdSession desc',
      })

      const list = getAbsensiList(response)

      setRows(list)
      setPagination(getPagination(response))
    } catch (err) {
      setRows([])
      setPagination({
        totalItems: null,
        totalPages: null,
        hasNext: false,
      })
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }, [appliedFilters, pageNum])

  useEffect(() => {
    loadAbsensi()
  }, [loadAbsensi])

  function handleFilterChange(event) {
    const { name, value } = event.target

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function handleSearch(event) {
    event.preventDefault()
    setPageNum(1)
    setAppliedFilters({ ...filters })
  }

  function handleReset() {
    const emptyFilters = {
      namaMapel: '',
      createdSession: '',
      namaSiswa: '',
      nomorInduk: '',
      status: '',
      jenisSession: '',
    }

    setFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
    setPageNum(1)
  }

  function openEdit(absensi) {
    const id = getValue(absensi, ['idAbsen'], '')

    if (!id) {
      Swal.fire({
        icon: 'error',
        title: 'ID presensi tidak ditemukan',
        text: 'Periksa nama field ID pada response backend.',
        width: '360px',
        customClass: {
          popup: 'swal-small-popup',
          icon: 'swal-small-icon',
          title: 'swal-small-title',
          htmlContainer: 'swal-small-text',
          actions: 'swal-small-actions',
          confirmButton: 'swal-small-button',
          cancelButton: 'swal-small-button',
        },
      })
      return
    }

    setSelectedAbsensi(absensi)
    setSelectedStatus(
      normalizeStatus(
        getValue(absensi, ['status', 'statusAbsensi'], '')
      )
    )
  }

  function closeEdit() {
    if (saving) return

    setSelectedAbsensi(null)
    setSelectedStatus('')
  }

  async function handleUpdateStatus(event) {
    event.preventDefault()

    const id = getValue(selectedAbsensi, ['idAbsen'], '')

    if (!id || !selectedStatus) {
      Swal.fire({
        icon: 'warning',
        title: 'Data belum lengkap',
        text: 'Pastikan ID dan status presensi sudah tersedia.',
        width: '360px',
        customClass: {
          popup: 'swal-small-popup',
          icon: 'swal-small-icon',
          title: 'swal-small-title',
          htmlContainer: 'swal-small-text',
          actions: 'swal-small-actions',
          confirmButton: 'swal-small-button',
          cancelButton: 'swal-small-button',
        },
      })
      return
    }

    const confirmation = await Swal.fire({
      title: 'Simpan perubahan?',
      text: 'Status presensi akan diperbarui.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, simpan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#2563eb',
      width: '360px',
      customClass: {
        popup: 'swal-small-popup',
        icon: 'swal-small-icon',
        title: 'swal-small-title',
        htmlContainer: 'swal-small-text',
        actions: 'swal-small-actions',
        confirmButton: 'swal-small-button',
        cancelButton: 'swal-small-button',
      },
    })

    if (!confirmation.isConfirmed) return

    setSaving(true)

    try {
      await updateAbsensi(id, selectedStatus)

      setSelectedAbsensi(null)
      setSelectedStatus('')

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Status presensi berhasil diperbarui.',
        timer: 1500,
        showConfirmButton: false,
        width: '360px',
        customClass: {
          popup: 'swal-small-popup',
          icon: 'swal-small-icon',
          title: 'swal-small-title',
          htmlContainer: 'swal-small-text',
          actions: 'swal-small-actions',
          confirmButton: 'swal-small-button',
          cancelButton: 'swal-small-button',
        },
      })

      await loadAbsensi()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal memperbarui presensi',
        text: extractError(err),
        width: '360px',
        customClass: {
          popup: 'swal-small-popup',
          icon: 'swal-small-icon',
          title: 'swal-small-title',
          htmlContainer: 'swal-small-text',
          actions: 'swal-small-actions',
          confirmButton: 'swal-small-button',
          cancelButton: 'swal-small-button',
        },
      })
    } finally {
      setSaving(false)
    }
  }

  const canGoPrevious = pageNum > 1
  const canGoNext = pageNum < (pagination.totalPages || 1)

  return (
    <>
      <PageTitle title="Data Presensi" />

      <section className="absensi-intro">
        <div className="absensi-intro-icon">
          <ClipboardCheck size={26} />
        </div>

        <div>
          <h2>Data Presensi</h2>
          <p>
            Pantau kehadiran siswa dan perbarui status presensi.
          </p>
        </div>
      </section>

      <Panel className="absensi-panel">
        <PanelHeading
          title="Daftar Presensi"
          subtitle={
            pagination.totalItems !== null
              ? `${pagination.totalItems} data presensi`
              : 'Cari, filter, dan kelola status presensi'
          }
          action={
            <button
              type="button"
              className="absensi-refresh-button"
              onClick={loadAbsensi}
              disabled={loading}
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          }
        />

        <form className="absensi-filters" onSubmit={handleSearch}>
          <div className="absensi-filter-field">
            <label htmlFor="namaSiswa">Nama siswa</label>
            <input
              id="namaSiswa"
              name="namaSiswa"
              value={filters.namaSiswa}
              onChange={handleFilterChange}
              placeholder="Cari nama siswa"
            />
          </div>

          <div className="absensi-filter-field">
            <label htmlFor="nomorInduk">Nomor induk</label>
            <input
              id="nomorInduk"
              name="nomorInduk"
              value={filters.nomorInduk}
              onChange={handleFilterChange}
              placeholder="Masukkan nomor induk"
            />
          </div>

          <div className="absensi-filter-field">
            <label htmlFor="namaMapel">Mata pelajaran</label>
            <input
              id="namaMapel"
              name="namaMapel"
              value={filters.namaMapel}
              onChange={handleFilterChange}
              placeholder="Cari mata pelajaran"
            />
          </div>

          <div className="absensi-filter-field">
            <label htmlFor="createdSession">Tanggal presensi</label>
            <input
              id="createdSession"
              name="createdSession"
              type="date"
              value={filters.createdSession}
              onChange={handleFilterChange}
            />
          </div>

          <div className="absensi-filter-field">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">Semua status</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="absensi-filter-field">
            <label htmlFor="jenisSession">Jenis sesi</label>
            <select
              id="jenisSession"
              name="jenisSession"
              value={filters.jenisSession}
              onChange={handleFilterChange}
            >
              <option value="">Semua sesi</option>
              {SESSION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="absensi-filter-actions">
            <button type="submit" className="absensi-primary-button">
              <Search size={16} />
              Cari data
            </button>

            <button
              type="button"
              className="absensi-secondary-button"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </form>

        {error && (
          <div className="absensi-error">
            <span>{error}</span>
            <button type="button" onClick={loadAbsensi}>
              Coba lagi
            </button>
          </div>
        )}

        <div className="absensi-table-wrapper">
          <table className="absensi-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Siswa</th>
                <th>Mata Pelajaran</th>
                <th>Tanggal</th>
                <th>Jenis Sesi</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="absensi-empty">
                    <RefreshCw size={18} className="absensi-spin" />
                    Memuat data presensi...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="absensi-empty">
                    Tidak ada data presensi yang ditemukan.
                  </td>
                </tr>
              ) : (
                rows.map((item, index) => {
                  const id = item.idAbsen

                  const nama = getValue(
                    item,
                    ['namaSiswa', 'namaLengkap', 'nama', 'studentName']
                  )

                  const nomorInduk = getValue(
                    item,
                    ['nomorInduk', 'nis', 'nisn']
                  )

                  return (
                    <tr key={id}>
                      <td>{(pageNum - 1) * PAGE_SIZE + index + 1}</td>

                      <td>
                        <div className="absensi-student">
                          <strong>{nama}</strong>
                          <small>{nomorInduk}</small>
                        </div>
                      </td>

                      <td>
                        {getValue(item, [
                          'namaMapel',
                          'namaMataPelajaran',
                          'mataPelajaran',
                        ])}
                      </td>

                      <td>
                        {formatDate(
                          getValue(
                            item,
                            ['createdSession', 'tanggal', 'createdAt'],
                            ''
                          )
                        )}
                      </td>

                      <td>
                        {getValue(
                          item,
                          ['jenisSession', 'jenisSesi'],
                          '-'
                        )}
                      </td>

                      <td>
                        <StatusBadge
                          status={getValue(
                            item,
                            ['status', 'statusAbsensi'],
                            ''
                          )}
                        />
                      </td>

                      <td>
                        <button
                          type="button"
                          className="absensi-edit-button"
                          onClick={() => openEdit(item)}
                          title="Edit status presensi"
                        >
                          <Pencil size={15} />
                          Edit
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="absensi-pagination">
          <span>
            Halaman {pageNum}
            {pagination.pages
              ? ` dari ${pagination.pages}`
              : ''}
          </span>

          <div className="absensi-pagination-buttons">
            <button
              type="button"
              disabled={!canGoPrevious || loading}
              onClick={() => setPageNum((page) => Math.max(1, page - 1))}
            >
              <ChevronLeft size={16} />
              Sebelumnya
            </button>

            <button
              type="button"
              disabled={!canGoNext || loading}
              onClick={() => setPageNum((page) => page + 1)}
            >
              Berikutnya
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </Panel>

      {selectedAbsensi && (
        <div
          className="absensi-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEdit()
          }}
        >
          <section
            className="absensi-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="absensi-modal-title"
          >
            <div className="absensi-modal-header">
              <div>
                <h3 id="absensi-modal-title">Edit Status Presensi</h3>
                <p>
                  {getValue(selectedAbsensi, [
                    'namaSiswa',
                    'namaLengkap',
                    'nama',
                    'studentName',
                  ])}
                </p>
              </div>

              <button
                type="button"
                className="absensi-modal-close"
                onClick={closeEdit}
                disabled={saving}
                aria-label="Tutup"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus}>
              <div className="absensi-modal-field">
                <label htmlFor="edit-status">Status presensi</label>

                <select
                  id="edit-status"
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value)}
                  required
                >
                  <option value="" disabled>
                    Pilih status
                  </option>

                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="absensi-modal-actions">
                <button
                  type="button"
                  className="absensi-secondary-button"
                  onClick={closeEdit}
                  disabled={saving}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="absensi-primary-button"
                  disabled={saving || !selectedStatus}
                >
                  {saving ? 'Menyimpan...' : 'Simpan perubahan'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  )
}
