
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BookOpen,
  Edit,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import Swal from 'sweetalert2'

import { addMapel, deleteMapel, getAllMapel, updateMapel } from '../services/mapelService'
import Panel, { PanelHeading } from '../components/ui/Panel'
import { PageTitle } from '../components/layout/Topbar'
import '../styles/mapel.css'

function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Terjadi kesalahan.'
}

function getMapelId(item) {
  return item?.idMapel ?? item?.id_mapel ?? item?.id ?? ''
}

function getMapelName(item) {
  return item?.namaMapel ?? item?.nama_mapel ?? item?.name ?? ''
}

function Modal({ title, onClose, children }) {
  return (
    <div className="mp-overlay" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className="mp-modal" role="dialog" aria-modal="true" aria-label={title}>
        <header className="mp-modal-header">
          <h2>{title}</h2>
          <button type="button" className="mp-icon-button" onClick={onClose} aria-label="Tutup">
            <X size={19} />
          </button>
        </header>
        {children}
      </section>
    </div>
  )
}

export default function MapelPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [namaMapel, setNamaMapel] = useState('')
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    setError('')

    try {
      const data = await getAllMapel(1)
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    if (!keyword) return items

    return items.filter((item) =>
      String(getMapelName(item)).toLowerCase().includes(keyword)
    )
  }, [items, search])

  function openAdd() {
    setEditing(null)
    setNamaMapel('')
    setModalOpen(true)
  }

  function openEdit(item) {
    setEditing(item)
    setNamaMapel(getMapelName(item))
    setModalOpen(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const name = namaMapel.trim()

    if (!name) {
      Swal.fire('Periksa kembali', 'Nama mata pelajaran wajib diisi.', 'warning')
      return
    }

    setSaving(true)

    try {
      if (editing) {
        const id = getMapelId(editing)
        if (!id) throw new Error('ID mata pelajaran tidak ditemukan di response.')

        await updateMapel(id, name)
        await Swal.fire({
          title: 'Berhasil',
          text: `Mata pelajaran berhasil diperbarui.`,
          icon: 'success',
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
        await addMapel(name)
        await Swal.fire({
          title: 'Berhasil',
          text: `Mata pelajaran berhasil ditambahkan.`,
          icon: 'success',
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
      await loadData(true)
    } catch (err) {
      Swal.fire({
        title: 'Gagal',
        text: `${getErrorMessage(err)}`,
        icon: 'error',
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

  async function handleDelete(item) {
    const id = getMapelId(item)

    if (!id) {
      Swal.fire({
        title: 'Gagal',
        text: `ID mata pelajaran tidak ditemukan.`,
        icon: 'error',
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

    const result = await Swal.fire({
      title: 'Hapus mata pelajaran?',
      text: `Mata pelajaran "${getMapelName(item)}" akan dihapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
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

    if (!result.isConfirmed) return

    try {
      await deleteMapel(id)
      await Swal.fire({
        title: 'Berhasil',
        text: `Mata pelajaran berhasil dihapus.`,
        icon: 'success',
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
      await loadData(true)
    } catch (err) {
      Swal.fire({
        title: 'Gagal',
        text: `${getErrorMessage(err)}`,
        icon: 'error',
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
  }

  return (
    <div className="page-container mp-page">
      <PageTitle
        title="Mata Pelajaran"
        subtitle="Kelola daftar master mata pelajaran sekolah."
      />

      <div className="mp-summary-grid">
        <Panel>
          <div className="mp-summary">
            <div className="mp-summary-icon"><BookOpen size={22} /></div>
            <div>
              <p>Total Mata Pelajaran</p>
              <strong>{items.length}</strong>
            </div>
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHeading title="Daftar Mata Pelajaran" />

        <div className="mp-toolbar">
          <label className="mp-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama mata pelajaran..."
            />
          </label>

          <div className="mp-toolbar-actions">
            <button
              type="button"
              className="mp-button mp-button-secondary"
              onClick={() => loadData(true)}
              disabled={refreshing}
            >
              <RefreshCw size={16} className={refreshing ? 'mp-spin' : ''} />
              Refresh
            </button>
            <button type="button" className="mp-button mp-button-primary" onClick={openAdd}>
              <Plus size={17} />
              Tambah Mapel
            </button>
          </div>
        </div>

        {error && (
          <div className="mp-error">
            <span>{error}</span>
            <button type="button" onClick={() => loadData(true)}>Coba lagi</button>
          </div>
        )}

        <div className="mp-table-wrap">
          <table className="mp-table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>No.</th>
                <th>Nama Mata Pelajaran</th>
                <th style={{ width: 150 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="mp-empty">Memuat data...</td></tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="mp-empty">
                    {search ? 'Tidak ada mapel yang cocok dengan pencarian.' : 'Belum ada data mata pelajaran.'}
                  </td>
                </tr>
              ) : filteredItems.map((item, index) => (
                <tr key={getMapelId(item) || `${getMapelName(item)}-${index}`}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="mp-name-cell">
                      <span className="mp-row-icon"><BookOpen size={17} /></span>
                      <strong>{getMapelName(item) || '-'}</strong>
                    </div>
                  </td>
                  <td>
                    <div className="mp-row-actions">
                      <button
                        type="button"
                        className="mp-action mp-action-edit"
                        onClick={() => openEdit(item)}
                        title="Edit nama mapel"
                        aria-label="Edit nama mapel"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        className="mp-action mp-action-delete"
                        onClick={() => handleDelete(item)}
                        title="Hapus mapel"
                        aria-label="Hapus mapel"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mp-table-footer">
          Menampilkan {filteredItems.length} dari {items.length} mata pelajaran
        </div>
      </Panel>

      {modalOpen && (
        <Modal
          title={editing ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}
          onClose={() => !saving && setModalOpen(false)}
        >
          <form onSubmit={handleSubmit}>
            <div className="mp-modal-body">
              <label className="mp-field">
                <span>Nama Mata Pelajaran <i>*</i></span>
                <input
                  autoFocus
                  value={namaMapel}
                  onChange={(event) => setNamaMapel(event.target.value)}
                  placeholder="Contoh: Matematika"
                  maxLength={100}
                  required
                />
              </label>
            </div>
            <footer className="mp-modal-footer">
              <button
                type="button"
                className="mp-button mp-button-secondary"
                onClick={() => setModalOpen(false)}
                disabled={saving}
              >
                Batal
              </button>
              <button type="submit" className="mp-button mp-button-primary" disabled={saving}>
                {saving ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Simpan Mapel'}
              </button>
            </footer>
          </form>
        </Modal>
      )}
    </div>
  )
}
