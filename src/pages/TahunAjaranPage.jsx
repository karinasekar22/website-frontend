
import { useCallback, useEffect, useState } from 'react'
import {
  BookOpen,
  CalendarDays,
  Edit,
  Plus,
  RefreshCw,
  X,
} from 'lucide-react'
import Swal from 'sweetalert2'

import {
  addTahunAjaran,
  getAllTahunAjaran,
  updateTahunAjaran,
} from '../services/tahunAjaranService'
import '../styles/tahunAjaran.css'

import Panel, { PanelHeading } from '../components/ui/Panel'
import { PageTitle } from '../components/layout/Topbar'

const EMPTY_FORM = {
  tahunMulai: '',
  tahunSelesai: '',
  semester: 'GANJIL',
  status: 'ACTIVE',
}

const SEMESTER_OPTIONS = ['GANJIL', 'GENAP']
const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE']

function getErrorMessage(error) {
  return error?.message || 'Terjadi kesalahan. Silakan coba lagi.'
}

function formatDate(value) {
  if (!value) return '-'

  const date = new Date(value.replace(' ', 'T'))

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getItems(response) {
  const result = response?.data?.data ?? response?.data ?? response

  if (Array.isArray(result)) return result

  return result?.items ?? result?.content ?? result?.data ?? []
}

function ModalShell({ title, onClose, children, onSubmit, loading }) {
  return (
    <div
      className="up-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose()
        }
      }}
    >
      <form
        className="up-modal"
        onSubmit={onSubmit}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="up-modal-header">
          <div>
            <h2>{title}</h2>
            <p>Lengkapi informasi tahun ajaran di bawah ini.</p>
          </div>

          <button
            type="button"
            className="up-icon-button"
            onClick={onClose}
            disabled={loading}
            aria-label="Tutup modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="up-modal-body">{children}</div>

        <div className="up-modal-footer">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  )
}

function TahunAjaranModal({
  initialData,
  onClose,
  onSave,
  loading,
}) {
  const isEdit = Boolean(initialData)

  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    ...(initialData
      ? {
        tahunMulai: initialData.tahunMulai ?? '',
        tahunSelesai: initialData.tahunSelesai ?? '',
        semester: initialData.semester ?? 'GANJIL',
        status: initialData.status ?? 'ACTIVE',
      }
      : {}),
  }))

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const tahunMulai = Number(form.tahunMulai)
    const tahunSelesai = Number(form.tahunSelesai)

    if (
      !form.tahunMulai ||
      !form.tahunSelesai ||
      !Number.isInteger(tahunMulai) ||
      !Number.isInteger(tahunSelesai) ||
      tahunMulai < 1900 ||
      tahunSelesai < 1900
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Data belum valid',
        text: 'Masukkan tahun mulai dan tahun selesai yang valid.',
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

    if (tahunSelesai <= tahunMulai) {
      Swal.fire({
        icon: 'warning',
        title: 'Rentang tahun tidak valid',
        text: 'Tahun selesai harus lebih besar daripada tahun mulai.',
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

    onSave({
      tahunMulai: String(tahunMulai),
      tahunSelesai: String(tahunSelesai),
      semester: form.semester,
      status: form.status,
    })
  }

  return (
    <ModalShell
      title={isEdit ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran'}
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={loading}
    >
      <div className="up-field">
        <label htmlFor="tahunMulai">Tahun Mulai</label>
        <input
          id="tahunMulai"
          name="tahunMulai"
          type="number"
          min="1900"
          max="9999"
          placeholder="Contoh: 2026"
          value={form.tahunMulai}
          onChange={handleChange}
          required
        />
      </div>

      <div className="up-field">
        <label htmlFor="tahunSelesai">Tahun Selesai</label>
        <input
          id="tahunSelesai"
          name="tahunSelesai"
          type="number"
          min="1900"
          max="9999"
          placeholder="Contoh: 2027"
          value={form.tahunSelesai}
          onChange={handleChange}
          required
        />
      </div>

      <div className="up-field">
        <label htmlFor="semester">Semester</label>
        <select
          id="semester"
          name="semester"
          value={form.semester}
          onChange={handleChange}
          required
        >
          {SEMESTER_OPTIONS.map((semester) => (
            <option key={semester} value={semester}>
              {semester}
            </option>
          ))}
        </select>
      </div>

      {isEdit && (
        <div className="up-field">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
            required
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status === 'ACTIVE' ? 'Aktif' : 'Tidak Aktif'}
              </option>
            ))}
          </select>
        </div>
      )}
    </ModalShell>
  )
}

export default function TahunAjaranPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [pageNum, setPageNum] = useState(1)
  const [pagination, setPagination] = useState({
    pageNum: 1,
    pages: 1,
    total: 0,
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const fetchTahunAjaran = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await getAllTahunAjaran(pageNum)
      const result = response?.data?.data ?? response?.data ?? response

      setItems(getItems(response))
      setPagination({
        pageNum: result?.pageNum ?? pageNum,
        pages: result?.pages ?? 1,
        total: result?.totalCount ?? result?.total ?? getItems(response).length,
      })
    } catch (err) {
      setError(getErrorMessage(err))
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [pageNum])

  useEffect(() => {
    fetchTahunAjaran()
  }, [fetchTahunAjaran])

  const openAddModal = () => {
    setSelectedItem(null)
    setModalOpen(true)
  }

  const openEditModal = (item) => {
    setSelectedItem(item)
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return

    setModalOpen(false)
    setSelectedItem(null)
  }

  const handleSave = async (form) => {
    setSaving(true)

    try {
      if (selectedItem) {
        const idTahun =
          selectedItem.idTahunAjaran ?? selectedItem.idTahun

        if (!idTahun) {
          throw new Error('ID tahun ajaran tidak ditemukan.')
        }

        await updateTahunAjaran({
          idTahun,
          ...form,
        })

        await Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Tahun ajaran berhasil diperbarui.',
          timer: 1600,
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
      } else {
        await addTahunAjaran(form)

        await Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Tahun ajaran berhasil ditambahkan.',
          timer: 1600,
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
      }

      setModalOpen(false)
      setSelectedItem(null)
      await fetchTahunAjaran()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal menyimpan',
        text: getErrorMessage(err),
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

  const activeCount = items.filter(
    (item) => item.status === 'ACTIVE'
  ).length

  return (
    <div className="page-container ta-page">
      <PageTitle
        title="Tahun Ajaran"
        subtitle="Kelola periode tahun ajaran dan semester sekolah."
      />

      <div className="user-summary-grid">
        <div className="user-summary-card">
          <div className="user-summary-icon">
            <CalendarDays size={22} />
          </div>
          <div>
            <p>Total Tahun Ajaran</p>
            <h3>{pagination.total}</h3>
          </div>
        </div>

        <div className="user-summary-card">
          <div className="user-summary-icon">
            <BookOpen size={22} />
          </div>
          <div>
            <p>Aktif di Halaman Ini</p>
            <h3>{activeCount}</h3>
          </div>
        </div>
      </div>

      <Panel>
        <PanelHeading
          title="Daftar Tahun Ajaran"
          subtitle="Daftar periode akademik yang terdaftar di sistem."
        />

        <div className="user-page-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={fetchTahunAjaran}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? 'spin' : ''}
            />
            Refresh
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={openAddModal}
          >
            <Plus size={17} />
            Tambah Tahun Ajaran
          </button>
        </div>

        {error && (
          <div className="error-message" role="alert">
            <span>{error}</span>
            <button type="button" onClick={fetchTahunAjaran}>
              Coba lagi
            </button>
          </div>
        )}

        <div className="table-wrap up-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Periode Tahun Ajaran</th>
                <th>Semester</th>
                <th>Status</th>
                <th>Dibuat Pada</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="table-empty">
                    Memuat data tahun ajaran...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-empty">
                    <CalendarDays size={28} />
                    <p>Belum ada data tahun ajaran.</p>
                    <span>Tambahkan tahun ajaran untuk mulai mengelola periode akademik.</span>
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr
                    key={
                      item.idTahunAjaran ??
                      `${item.tahunMulai}-${item.tahunSelesai}-${item.semester}-${index}`
                    }
                  >
                    <td>
                      {(pagination.pageNum - 1) * 10 + index + 1}
                    </td>

                    <td>
                      <div className="user-person-cell">
                        <div className="user-avatar">
                          <CalendarDays size={18} />
                        </div>
                        <div>
                          <strong>
                            {item.tahunMulai} / {item.tahunSelesai}
                          </strong>
                          <span>Periode akademik</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="user-role-badge">
                        {item.semester || '-'}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`user-status-badge ${item.status === 'ACTIVE'
                            ? 'is-active'
                            : item.status === 'INACTIVE'
                              ? 'is-inactive'
                              : 'is-unknown'
                          }`}
                      >
                        {item.status === 'ACTIVE'
                          ? 'Aktif'
                          : item.status === 'INACTIVE'
                            ? 'Tidak Aktif'
                            : 'Belum diatur'}
                      </span>
                    </td>

                    <td>{formatDate(item.createdAt)}</td>

                    <td>
                      <button
                        type="button"
                        className="table-action"
                        onClick={() => openEditModal(item)}
                        title="Edit tahun ajaran"
                        aria-label={`Edit tahun ajaran ${item.tahunMulai}/${item.tahunSelesai}`}
                      >
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="user-pagination">
          <span>
            Halaman {pagination.pageNum} dari {pagination.pages}
          </span>

          <div>
            <button
              type="button"
              className="secondary-button"
              disabled={loading || pageNum <= 1}
              onClick={() => setPageNum((current) => current - 1)}
            >
              Sebelumnya
            </button>

            <button
              type="button"
              className="secondary-button"
              disabled={loading || pageNum >= pagination.pages}
              onClick={() => setPageNum((current) => current + 1)}
            >
              Berikutnya
            </button>
          </div>
        </div>
      </Panel>

      {modalOpen && (
        <TahunAjaranModal
          initialData={selectedItem}
          onClose={closeModal}
          onSave={handleSave}
          loading={saving}
        />
      )}
    </div>
  )
}
