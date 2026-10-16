
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
} from 'lucide-react'
import Swal from 'sweetalert2'

import {
  addJurusan,
  deleteJurusan,
  getAllJurusan,
  updateJurusan,
} from '../services/jurusanService'

import Panel from '../components/ui/Panel'
import { PageTitle } from '../components/layout/Topbar'
import '../styles/jurusan.css'

function getJurusanList(response) {
  const result = response?.data?.data ?? response?.data ?? response

  if (Array.isArray(result)) return result
  if (Array.isArray(result?.items)) return result.items
  if (Array.isArray(result?.content)) return result.content

  return []
}

function ModalJurusan({
  mode,
  initialName,
  saving,
  onClose,
  onSubmit,
}) {
  const [namaJurusan, setNamaJurusan] = useState(initialName || '')

  useEffect(() => {
    setNamaJurusan(initialName || '')
  }, [initialName])

  const handleSubmit = (event) => {
    event.preventDefault()

    const value = namaJurusan.trim()

    if (!value) {
      Swal.fire({
        icon: 'warning',
        title: 'Nama jurusan wajib diisi',
        text: 'Silakan masukkan nama jurusan terlebih dahulu.',
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

    onSubmit(value)
  }

  return (
    <div
      className="jurusan-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose()
        }
      }}
    >
      <section
        className="jurusan-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="jurusan-modal-title"
      >
        <div className="jurusan-modal-header">
          <div className="jurusan-modal-icon">
            <GraduationCap size={23} />
          </div>

          <button
            type="button"
            className="jurusan-icon-button"
            onClick={onClose}
            disabled={saving}
            aria-label="Tutup modal"
          >
            <X size={20} />
          </button>
        </div>

        <h2 id="jurusan-modal-title">
          {mode === 'edit' ? 'Edit Jurusan' : 'Tambah Jurusan'}
        </h2>

        <p className="jurusan-modal-description">
          {mode === 'edit'
            ? 'Ubah nama jurusan sesuai data terbaru.'
            : 'Tambahkan jurusan baru ke data master sekolah.'}
        </p>

        <form onSubmit={handleSubmit}>
          <label className="jurusan-field-label" htmlFor="namaJurusan">
            Nama Jurusan <span>*</span>
          </label>

          <input
            id="namaJurusan"
            className="jurusan-input"
            type="text"
            placeholder="Contoh: TKJ"
            value={namaJurusan}
            onChange={(event) => setNamaJurusan(event.target.value)}
            maxLength={100}
            autoFocus
            required
            disabled={saving}
          />

          <p className="jurusan-field-hint">
            Masukkan nama jurusan, misalnya TKJ, RPL, atau MOBILE.
          </p>

          <div className="jurusan-modal-actions">
            <button
              type="button"
              className="jurusan-button jurusan-button-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Batal
            </button>

            <button
              type="submit"
              className="jurusan-button jurusan-button-primary"
              disabled={saving || !namaJurusan.trim()}
            >
              {saving ? (
                <>
                  <RefreshCw size={16} className="jurusan-spin" />
                  Menyimpan...
                </>
              ) : (
                mode === 'edit' ? 'Simpan Perubahan' : 'Tambah Jurusan'
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default function JurusanPage() {
  const [jurusan, setJurusan] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const fetchJurusan = useCallback(async () => {
    setLoading(true)

    try {
      const response = await getAllJurusan()
      setJurusan(getJurusanList(response))
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal memuat jurusan',
        text: error.message || 'Terjadi kesalahan saat mengambil data.',
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
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchJurusan()
  }, [fetchJurusan])

  const filteredJurusan = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return jurusan.filter((item) =>
      String(item.namaJurusan || '').toLowerCase().includes(keyword)
    )
  }, [jurusan, search])

  const handleSubmit = async (namaJurusan) => {
    setSaving(true)

    try {
      if (modal.mode === 'edit') {
        await updateJurusan(modal.data.idJurusan, namaJurusan)

        await Swal.fire({
          icon: 'success',
          title: 'Jurusan diperbarui',
          text: `Nama jurusan berhasil diubah menjadi ${namaJurusan}.`,
          timer: 1800,
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
        await addJurusan(namaJurusan)

        await Swal.fire({
          icon: 'success',
          title: 'Jurusan ditambahkan',
          text: `${namaJurusan} berhasil ditambahkan.`,
          timer: 1800,
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

      setModal(null)
      await fetchJurusan()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal menyimpan',
        text: error.message || 'Silakan coba lagi.',
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

  const handleDelete = async (item) => {
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: 'Hapus jurusan?',
      html: `Jurusan <strong>${item.namaJurusan}</strong> akan dihapus. Tindakan ini tidak dapat dibatalkan.`,
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
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

    setDeletingId(item.idJurusan)

    try {
      await deleteJurusan(item.idJurusan)

      await Swal.fire({
        icon: 'success',
        title: 'Jurusan dihapus',
        text: `${item.namaJurusan} berhasil dihapus.`,
        timer: 1800,
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

      await fetchJurusan()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal menghapus jurusan',
        text:
          error.message ||
          'Jurusan tidak dapat dihapus. Periksa apakah jurusan masih digunakan oleh data kelas.',
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
      setDeletingId(null)
    }
  }

  return (
    <div className="jurusan-page">
      <PageTitle
        title="Data Jurusan"
        subtitle="Kelola data master jurusan sekolah."
      />

      <div className="jurusan-summary">
        <div className="jurusan-summary-icon">
          <BookOpen size={24} />
        </div>

        <div>
          <p className="jurusan-summary-label">Total Jurusan</p>
          <h2>{jurusan.length}</h2>
          <p className="jurusan-summary-caption">
            Jurusan yang terdaftar di sekolah
          </p>
        </div>
      </div>

      <Panel>
        <div className="jurusan-toolbar">
          <div className="jurusan-toolbar-copy">
            <h2>Daftar Jurusan</h2>
            <p>Kelola nama jurusan yang tersedia.</p>
          </div>

          <button
            type="button"
            className="jurusan-button jurusan-button-primary"
            onClick={() =>
              setModal({ mode: 'add', data: null })
            }
          >
            <Plus size={18} />
            Tambah Jurusan
          </button>
        </div>

        <div className="jurusan-table-tools">
          <div className="jurusan-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Cari nama jurusan..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Cari jurusan"
            />
            {search && (
              <button
                type="button"
                className="jurusan-search-clear"
                onClick={() => setSearch('')}
                aria-label="Hapus pencarian"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button
            type="button"
            className="jurusan-button jurusan-button-secondary jurusan-refresh"
            onClick={fetchJurusan}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? 'jurusan-spin' : ''}
            />
            Refresh
          </button>
        </div>

        <div className="jurusan-table-wrapper">
          <table className="jurusan-table">
            <thead>
              <tr>
                <th className="jurusan-number-column">No.</th>
                <th>Nama Jurusan</th>
                <th>Dibuat Pada</th>
                <th className="jurusan-action-column">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4}>
                    <div className="jurusan-state">
                      <RefreshCw size={23} className="jurusan-spin" />
                      <span>Memuat data jurusan...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredJurusan.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="jurusan-state">
                      <div className="jurusan-empty-icon">
                        <AlertCircle size={24} />
                      </div>
                      <strong>
                        {search
                          ? 'Jurusan tidak ditemukan'
                          : 'Belum ada data jurusan'}
                      </strong>
                      <span>
                        {search
                          ? 'Coba gunakan kata kunci lain.'
                          : 'Klik tombol Tambah Jurusan untuk memulai.'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredJurusan.map((item, index) => (
                  <tr key={item.idJurusan}>
                    <td className="jurusan-number-cell">
                      {String(index + 1).padStart(2, '0')}
                    </td>

                    <td>
                      <div className="jurusan-name-cell">
                        <div className="jurusan-row-icon">
                          <GraduationCap size={18} />
                        </div>
                        <span>{item.namaJurusan || '-'}</span>
                      </div>
                    </td>

                    <td className="jurusan-date-cell">
                      {item.createdAt || '-'}
                    </td>

                    <td>
                      <div className="jurusan-row-actions">
                        <button
                          type="button"
                          className="jurusan-action-button jurusan-edit-button"
                          title="Edit jurusan"
                          aria-label={`Edit ${item.namaJurusan}`}
                          onClick={() =>
                            setModal({ mode: 'edit', data: item })
                          }
                          disabled={deletingId === item.idJurusan}
                        >
                          <Pencil size={16} />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          className="jurusan-action-button jurusan-delete-button"
                          title="Hapus jurusan"
                          aria-label={`Hapus ${item.namaJurusan}`}
                          onClick={() => handleDelete(item)}
                          disabled={deletingId === item.idJurusan}
                        >
                          {deletingId === item.idJurusan ? (
                            <RefreshCw
                              size={16}
                              className="jurusan-spin"
                            />
                          ) : (
                            <Trash2 size={16} />
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

        {!loading && filteredJurusan.length > 0 && (
          <div className="jurusan-table-footer">
            Menampilkan <strong>{filteredJurusan.length}</strong> dari{' '}
            <strong>{jurusan.length}</strong> jurusan
          </div>
        )}
      </Panel>

      {modal && (
        <ModalJurusan
          mode={modal.mode}
          initialName={modal.data?.namaJurusan || ''}
          saving={saving}
          onClose={() => {
            if (!saving) setModal(null)
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
