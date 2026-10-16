
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BookOpen,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  GraduationCap,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import Swal from 'sweetalert2'

import {
  addKelas,
  deleteKelas,
  getAllKelas,
  updateKelas,
} from '../services/classService'
import { getAllJurusan } from '../services/jurusanService'

import Panel from '../components/ui/Panel'
import { PageTitle } from '../components/layout/Topbar'
import '../styles/class.css'

const EMPTY_CLASS = {
  tingkat: '',
  urutanKelas: '',
  idJurusan: '',
}

const getJurusanId = (kelas) =>
  kelas?.idJurusan ?? kelas?.jurusan?.idJurusan ?? ''

const getJurusanName = (kelas, jurusanList = []) => {
  const directName =
    kelas?.namaJurusan ??
    kelas?.jurusan?.namaJurusan ??
    kelas?.jurusan?.nama

  if (directName) return directName

  const id = getJurusanId(kelas)
  const match = jurusanList.find((item) => item.idJurusan === id)

  return match?.namaJurusan ?? '-'
}

const getKelasLabel = (kelas, jurusanList) =>
  [
    kelas?.tingkat,
    getJurusanName(kelas, jurusanList),
    kelas?.urutanKelas,
  ]
    .filter((value) => value && value !== '-')
    .join(' ') || 'ini'

function unwrapList(response) {
  const result = response?.data?.data ?? response?.data ?? response

  if (Array.isArray(result)) return result
  if (Array.isArray(result?.items)) return result.items
  if (Array.isArray(result?.content)) return result.content

  return []
}

function ModalShell({ title, saving, onClose, children, onSubmit }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !saving) onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, saving])

  return (
    <div
      className="class-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose()
      }}
    >
      <form
        className="class-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="class-modal-title"
        onSubmit={onSubmit}
      >
        <div className="class-modal-header">
          <div className="class-modal-icon">
            <GraduationCap size={23} />
          </div>

          <button
            type="button"
            className="class-icon-button"
            onClick={onClose}
            disabled={saving}
            aria-label="Tutup modal"
          >
            <X size={20} />
          </button>
        </div>

        <h2 id="class-modal-title">{title}</h2>
        {children}
      </form>
    </div>
  )
}

function ClassFormModal({
  mode,
  initialValues,
  jurusanList,
  saving,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(initialValues)

  useEffect(() => {
    setForm(initialValues)
  }, [initialValues])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const values = {
      tingkat: String(form.tingkat).trim(),
      urutanKelas: String(form.urutanKelas).trim(),
      idJurusan: String(form.idJurusan).trim(),
    }

    if (!values.tingkat || !values.urutanKelas || !values.idJurusan) {
      Swal.fire({
        icon: 'warning',
        title: 'Data belum lengkap',
        text: 'Lengkapi tingkat, urutan kelas, dan jurusan terlebih dahulu.',
      })
      return
    }

    onSubmit(values)
  }

  return (
    <ModalShell
      title={mode === 'edit' ? 'Edit Kelas' : 'Tambah Kelas'}
      saving={saving}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <p className="class-modal-description">
        {mode === 'edit'
          ? 'Perbarui informasi kelas di bawah ini.'
          : 'Tambahkan kelas baru ke data master sekolah.'}
      </p>

      <div className="class-form-fields">
        <label className="class-field">
          <span>Tingkat <b>*</b></span>
          <input
            name="tingkat"
            value={form.tingkat}
            onChange={handleChange}
            placeholder="Contoh: 10"
            required
            autoFocus
            disabled={saving}
          />
        </label>

        <label className="class-field">
          <span>Urutan Kelas <b>*</b></span>
          <input
            name="urutanKelas"
            value={form.urutanKelas}
            onChange={handleChange}
            placeholder="Contoh: 1"
            required
            disabled={saving}
          />
        </label>

        <label className="class-field class-field-full">
          <span>Jurusan <b>*</b></span>
          <select
            name="idJurusan"
            value={form.idJurusan}
            onChange={handleChange}
            required
            disabled={saving || jurusanList.length === 0}
          >
            <option value="">
              {jurusanList.length
                ? 'Pilih jurusan'
                : 'Data jurusan belum tersedia'}
            </option>

            {jurusanList.map((jurusan) => (
              <option
                key={jurusan.idJurusan}
                value={jurusan.idJurusan}
              >
                {jurusan.namaJurusan}
              </option>
            ))}
          </select>

          <small>
            Pilih nama jurusan. ID jurusan akan dikirim otomatis.
          </small>
        </label>
      </div>

      <div className="class-modal-actions">
        <button
          type="button"
          className="class-button class-button-secondary"
          onClick={onClose}
          disabled={saving}
        >
          Batal
        </button>

        <button
          type="submit"
          className="class-button class-button-primary"
          disabled={saving || jurusanList.length === 0}
        >
          {saving ? (
            <>
              <RefreshCw size={16} className="class-spin" />
              Menyimpan...
            </>
          ) : (
            mode === 'edit' ? 'Simpan Perubahan' : 'Tambah Kelas'
          )}
        </button>
      </div>
    </ModalShell>
  )
}

export default function ClassPage() {
  const [classes, setClasses] = useState([])
  const [jurusanList, setJurusanList] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingJurusan, setLoadingJurusan] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pages, setPages] = useState(1)

  const [modal, setModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const fetchClasses = useCallback(async (page = pageNum) => {
    setLoading(true)
    setError('')

    try {
      const response = await getAllKelas(page)
      const result = response?.data?.data ?? response?.data ?? response

      const items = Array.isArray(result?.items)
        ? result.items
        : Array.isArray(result?.content)
          ? result.content
          : Array.isArray(result)
            ? result
            : []

      setClasses(items)
      setPages(Math.max(1, Number(result?.pages) || 1))
      setPageSize(Math.max(1, Number(result?.pageSize) || 10))
    } catch (err) {
      setError(err.message || 'Gagal mengambil data kelas.')
      setClasses([])
    } finally {
      setLoading(false)
    }
  }, [pageNum])

  const fetchJurusan = useCallback(async () => {
    setLoadingJurusan(true)

    try {
      const response = await getAllJurusan()
      setJurusanList(unwrapList(response))
    } catch (err) {
      setJurusanList([])

      Swal.fire({
        icon: 'error',
        title: 'Gagal memuat jurusan',
        text: err.message || 'Daftar jurusan tidak dapat dimuat.',
      })
    } finally {
      setLoadingJurusan(false)
    }
  }, [])

  useEffect(() => {
    fetchClasses(pageNum)
  }, [fetchClasses, pageNum])

  useEffect(() => {
    fetchJurusan()
  }, [fetchJurusan])

  const filteredClasses = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    if (!keyword) return classes

    return classes.filter((kelas) => {
      const values = [
        kelas.tingkat,
        kelas.urutanKelas,
        getJurusanName(kelas, jurusanList),
      ]

      return values.some((value) =>
        String(value ?? '').toLowerCase().includes(keyword)
      )
    })
  }, [classes, jurusanList, search])

  const closeModal = useCallback(() => {
    if (!saving) setModal(null)
  }, [saving])

  const openAddModal = () => {
    setModal({
      mode: 'add',
      data: null,
      initialValues: { ...EMPTY_CLASS },
    })
  }

  const openEditModal = (kelas) => {
    setModal({
      mode: 'edit',
      data: kelas,
      initialValues: {
        tingkat: String(kelas.tingkat ?? ''),
        urutanKelas: String(kelas.urutanKelas ?? ''),
        idJurusan: String(getJurusanId(kelas)),
      },
    })
  }

  const handleSave = async (values) => {
    if (!modal) return

    const isEdit = modal.mode === 'edit'
    setSaving(true)

    try {
      if (isEdit) {
        // ID hanya dipakai untuk menentukan record yang diperbarui.
        // ID tidak menjadi field form dan tidak ikut dikirim sebagai data.
        await updateKelas(modal.data.idKelas, values)
      } else {
        await addKelas(values)
      }

      setModal(null)

      await Swal.fire({
        icon: 'success',
        title: isEdit ? 'Kelas diperbarui' : 'Kelas ditambahkan',
        text: isEdit
          ? 'Data kelas berhasil diperbarui.'
          : 'Data kelas berhasil ditambahkan.',
        timer: 1800,
        showConfirmButton: false,
      })

      await fetchClasses(pageNum)
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: isEdit ? 'Gagal memperbarui kelas' : 'Gagal menambahkan kelas',
        text: err.message || 'Terjadi kesalahan. Silakan coba lagi.',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (kelas) => {
    const label = getKelasLabel(kelas, jurusanList)

    const confirmation = await Swal.fire({
      icon: 'warning',
      title: 'Hapus kelas?',
      html: `Kelas <strong>${label}</strong> akan dihapus. Tindakan ini tidak dapat dibatalkan.`,
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
    })

    if (!confirmation.isConfirmed) return

    setDeletingId(kelas.idKelas)

    try {
      await deleteKelas(kelas.idKelas)

      await Swal.fire({
        icon: 'success',
        title: 'Kelas dihapus',
        text: 'Data kelas berhasil dihapus.',
        timer: 1800,
        showConfirmButton: false,
      })

      if (classes.length === 1 && pageNum > 1) {
        setPageNum((previous) => previous - 1)
      } else {
        await fetchClasses(pageNum)
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal menghapus kelas',
        text: err.message || 'Terjadi kesalahan. Silakan coba lagi.',
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="class-page">
      <PageTitle
        title="Data Kelas"
        subtitle="Kelola tingkat, urutan kelas, dan jurusan sekolah."
      />

      <div className="class-summary-grid">
        <div className="class-summary-card">
          <div className="class-summary-icon">
            <BookOpen size={24} />
          </div>
          <div>
            <p>Total Kelas</p>
            <h2>{loading && classes.length === 0 ? '—' : classes.length}</h2>
            <span>Kelas pada halaman ini</span>
          </div>
        </div>

        <div className="class-summary-card">
          <div className="class-summary-icon class-summary-icon-purple">
            <GraduationCap size={24} />
          </div>
          <div>
            <p>Total Jurusan</p>
            <h2>{loadingJurusan ? '—' : jurusanList.length}</h2>
            <span>Jurusan tersedia</span>
          </div>
        </div>
      </div>

      <Panel>
        <div className="class-toolbar">
          <div>
            <h2>Daftar Kelas</h2>
            <p>Kelola data kelas yang terdaftar di sekolah.</p>
          </div>

          <button
            type="button"
            className="class-button class-button-primary"
            onClick={openAddModal}
            disabled={loadingJurusan || jurusanList.length === 0}
            title={
              loadingJurusan
                ? 'Sedang memuat jurusan'
                : jurusanList.length === 0
                  ? 'Tambahkan data jurusan terlebih dahulu'
                  : 'Tambah kelas'
            }
          >
            <Plus size={18} />
            Tambah Kelas
          </button>
        </div>

        <div className="class-table-tools">
          <div className="class-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Cari tingkat, urutan, atau jurusan..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Cari kelas"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Hapus pencarian"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button
            type="button"
            className="class-button class-button-secondary"
            onClick={() => fetchClasses(pageNum)}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? 'class-spin' : ''}
            />
            Refresh
          </button>
        </div>

        {error && (
          <div className="class-error" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button type="button" onClick={() => fetchClasses(pageNum)}>
              Coba lagi
            </button>
          </div>
        )}

        <div className="class-table-wrapper">
          <table className="class-table">
            <thead>
              <tr>
                <th className="class-no-column">No.</th>
                <th>Tingkat</th>
                <th>Urutan Kelas</th>
                <th>Jurusan</th>
                <th className="class-action-column">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading && classes.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="class-state">
                      <RefreshCw size={23} className="class-spin" />
                      <span>Memuat data kelas...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="class-state">
                      <div className="class-empty-icon">
                        <AlertCircle size={24} />
                      </div>
                      <strong>
                        {error
                          ? 'Data kelas belum bisa ditampilkan'
                          : search
                            ? 'Kelas tidak ditemukan'
                            : 'Belum ada data kelas'}
                      </strong>
                      <span>
                        {search
                          ? 'Coba kata kunci pencarian yang berbeda.'
                          : error
                            ? 'Periksa koneksi dan coba muat ulang.'
                            : 'Klik Tambah Kelas untuk menambahkan data.'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClasses.map((kelas, index) => (
                  <tr key={kelas.idKelas ?? `${kelas.tingkat}-${index}`}>
                    <td className="class-number-cell">
                      {String((pageNum - 1) * pageSize + index + 1).padStart(2, '0')}
                    </td>

                    <td>
                      <span className="class-level-badge">
                        {kelas.tingkat ?? '-'}
                      </span>
                    </td>

                    <td>
                      <span className="class-sequence">
                        {kelas.urutanKelas ?? '-'}
                      </span>
                    </td>

                    <td>
                      <div className="class-jurusan-cell">
                        <div className="class-row-icon">
                          <GraduationCap size={18} />
                        </div>
                        <span>{getJurusanName(kelas, jurusanList)}</span>
                      </div>
                    </td>

                    <td>
                      <div className="class-row-actions">
                        <button
                          type="button"
                          className="class-action-button class-edit-button"
                          onClick={() => openEditModal(kelas)}
                          disabled={deletingId === kelas.idKelas}
                          aria-label={`Edit kelas ${getKelasLabel(kelas, jurusanList)}`}
                        >
                          <Pencil size={15} />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          className="class-action-button class-delete-button"
                          onClick={() => handleDelete(kelas)}
                          disabled={deletingId === kelas.idKelas}
                          aria-label={`Hapus kelas ${getKelasLabel(kelas, jurusanList)}`}
                        >
                          {deletingId === kelas.idKelas ? (
                            <RefreshCw size={15} className="class-spin" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="class-table-footer">
          <span>
            Menampilkan <strong>{filteredClasses.length}</strong> data
            {search ? ' hasil pencarian' : ''}
          </span>

          {pages > 1 && (
            <div className="class-pagination">
              <button
                type="button"
                className="class-pagination-button"
                onClick={() => setPageNum((previous) => previous - 1)}
                disabled={loading || pageNum <= 1}
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft size={17} />
              </button>

              <span>
                Halaman <strong>{pageNum}</strong> dari <strong>{pages}</strong>
              </span>

              <button
                type="button"
                className="class-pagination-button"
                onClick={() => setPageNum((previous) => previous + 1)}
                disabled={loading || pageNum >= pages}
                aria-label="Halaman berikutnya"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          )}
        </div>
      </Panel>

      {modal && (
        <ClassFormModal
          key={`${modal.mode}-${modal.data?.idKelas ?? 'new'}`}
          mode={modal.mode}
          initialValues={modal.initialValues}
          jurusanList={jurusanList}
          saving={saving}
          onClose={closeModal}
          onSubmit={handleSave}
        />
      )}
    </div>
  )
}
