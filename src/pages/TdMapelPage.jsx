
import { useCallback, useEffect, useState } from 'react'
import {
  BookOpen,
  FileSpreadsheet,
  Filter,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Upload,
  X,
} from 'lucide-react'
import Swal from 'sweetalert2'

import {
  addTdMapel,
  getAllTdMapel,
  getTdMapelOptions,
  importTdMapelExcel,
  updateTdMapel,
} from '../services/tdMapelService'
import Panel, { PanelHeading } from '../components/ui/Panel'
import { PageTitle } from '../components/layout/Topbar'
import '../styles/mapel.css'

function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Terjadi kesalahan.'
}

function getId(item) {
  return item?.idTdMapel ?? item?.id_td_mapel ?? item?.id ?? ''
}

function getName(item) {
  return item?.namaMapel ?? item?.nama_mapel ?? item?.mapel?.namaMapel ?? '-'
}

function getClassName(item) {
  return item?.namaKelas ?? item?.nama_kelas ?? item?.kelas?.namaKelas ?? '-'
}

function getStatus(item) {
  return String(item?.status ?? '').toUpperCase()
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

export default function TdMapelPage() {
  const [items, setItems] = useState([])
  const [pageNum, setPageNum] = useState(1)
  const [pageSize] = useState(10)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const [filterMapel, setFilterMapel] = useState('')
  const [filterKelas, setFilterKelas] = useState('')
  const [appliedMapel, setAppliedMapel] = useState('')
  const [appliedKelas, setAppliedKelas] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [idMapel, setIdMapel] = useState('')
  const [idKelas, setIdKelas] = useState('')
  const [saving, setSaving] = useState(false)

  const [excelFile, setExcelFile] = useState(null)
  const [importing, setImporting] = useState(false)

  const [mapelOptions, setMapelOptions] = useState([])
  const [kelasOptions, setKelasOptions] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(false)

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    setError('')

    try {
      const result = await getAllTdMapel({
        pageNum,
        pageSize,
        orderBy: 'created_at desc',
        namaMapel: appliedMapel,
        namaKelas: appliedKelas,
      })

      setItems(Array.isArray(result.items) ? result.items : [])
      setTotal(Number(result.total) || 0)
      setPages(Math.max(1, Number(result.pages) || 1))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [pageNum, pageSize, appliedMapel, appliedKelas])

  useEffect(() => {
    loadData()
  }, [loadData])

  function handleFilter(event) {
    event.preventDefault()
    setPageNum(1)
    setAppliedMapel(filterMapel.trim())
    setAppliedKelas(filterKelas.trim())
  }

  async function openAdd() {
    setIdMapel('')
    setIdKelas('')
    setModalOpen(true)
    setLoadingOptions(true)

    try {
      const options = await getTdMapelOptions()

      setMapelOptions(options.mapel)
      setKelasOptions(options.kelas)

      if (!options.mapel.length || !options.kelas.length) {
        Swal.fire({
          title: 'Opsi belum tersedia',
          text: `Response endpoint belum menyediakan ID dan nama mapel atau kelas yang lengkap.`,
          icon: 'warning',
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
    } catch (err) {
      setModalOpen(false)
      Swal.fire({
        title: 'Gagal memuat opsi',
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
      setLoadingOptions(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!idMapel.trim() || !idKelas.trim()) {
      Swal.fire({
        title: 'Periksa kembali',
        text: `Mapel dan Kelas wajib diisi.`,
        icon: 'warning',
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

    setSaving(true)

    try {
      await addTdMapel({
        idMapel: idMapel.trim(),
        idKelas: idKelas.trim(),
      })

      await Swal.fire({
        title: 'Berhasil',
        text: `Mapel berhasil dihubungkan dengan kelas.`,
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

  async function handleStatus(item) {
    const id = getId(item)
    const currentStatus = getStatus(item)

    if (!id) {
      Swal.fire({
        title: 'Gagal',
        text: `ID relasi mapel-kelas tidak ditemukan di response.`,
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

    // Jangan menebak nilai status yang diterima backend.
    if (!currentStatus) {
      Swal.fire({
        title: 'Status tidak tersedia',
        text: `Response data ini tidak memiliki field status. Periksa bentuk response backend terlebih dahulu.`,
        icon: 'info',
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

    const nextStatus = ['ACTIVE', 'AKTIF'].includes(currentStatus)
      ? (currentStatus === 'AKTIF' ? 'NONAKTIF' : 'INACTIVE')
      : (currentStatus === 'NONAKTIF' ? 'AKTIF' : 'ACTIVE')

    const result = await Swal.fire({
      title: 'Ubah status mapel?',
      text: `Status akan diubah dari ${currentStatus} menjadi ${nextStatus}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, ubah',
      cancelButtonText: 'Batal',
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
      await updateTdMapel(id, nextStatus)
      await Swal.fire({
        title: 'Berhasil',
        text: `Status mapel per kelas berhasil diperbarui.`,
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

  async function handleImport(event) {
    event.preventDefault()

    if (!excelFile) {
      Swal.fire({
        title: 'Pilih file',
        text: `Pilih file Excel terlebih dahulu.`,
        icon: 'warning',
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

    setImporting(true)

    try {
      await importTdMapelExcel(excelFile)
      await Swal.fire({
        title: 'Berhasil',
        text: `Permintaan impor Excel berhasil dikirim.`,
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
      setExcelFile(null)
      event.currentTarget.reset()
      await loadData(true)
    } catch (err) {
      Swal.fire({
        title: 'Impor gagal',
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
      setImporting(false)
    }
  }

  return (
    <div className="page-container mp-page">
      <PageTitle
        title="Mapel per Kelas"
        subtitle="Atur hubungan mata pelajaran dengan kelas dan kelola statusnya."
      />

      <div className="mp-summary-grid mp-summary-grid-two">
        <Panel>
          <div className="mp-summary">
            <div className="mp-summary-icon"><Layers size={22} /></div>
            <div>
              <p>Total Relasi</p>
              <strong>{total}</strong>
            </div>
          </div>
        </Panel>
        <Panel>
          <div className="mp-summary">
            <div className="mp-summary-icon mp-summary-icon-green"><BookOpen size={22} /></div>
            <div>
              <p>Data di Halaman Ini</p>
              <strong>{items.length}</strong>
            </div>
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHeading title="Filter Mapel per Kelas" />
        <form className="mp-filter-form" onSubmit={handleFilter}>
          <label className="mp-field">
            <span>Nama Mata Pelajaran</span>
            <div className="mp-input-icon">
              <Search size={17} />
              <input
                value={filterMapel}
                onChange={(event) => setFilterMapel(event.target.value)}
                placeholder="Contoh: Matematika"
              />
            </div>
          </label>

          <label className="mp-field">
            <span>Nama Kelas</span>
            <div className="mp-input-icon">
              <Search size={17} />
              <input
                value={filterKelas}
                onChange={(event) => setFilterKelas(event.target.value)}
                placeholder="Contoh: X IPA 1"
              />
            </div>
          </label>

          <div className="mp-filter-actions">
            <button className="mp-button mp-button-primary" type="submit">
              <Filter size={16} />
              Terapkan Filter
            </button>
            <button
              className="mp-button mp-button-secondary"
              type="button"
              onClick={() => {
                setFilterMapel('')
                setFilterKelas('')
                setAppliedMapel('')
                setAppliedKelas('')
                setPageNum(1)
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </Panel>

      <Panel>
        <PanelHeading title="Daftar Mapel per Kelas" />

        <div className="mp-toolbar">
          <div className="mp-toolbar-note">
            <Layers size={17} />
            <span>Relasi mata pelajaran dan kelas</span>
          </div>
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
              Hubungkan Mapel
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
                <th>Mata Pelajaran</th>
                <th>Kelas</th>
                <th>Status</th>
                <th style={{ width: 140 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="mp-empty">Memuat data...</td></tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="mp-empty">
                    Belum ada data atau tidak ada hasil yang cocok dengan filter.
                  </td>
                </tr>
              ) : items.map((item, index) => {
                const status = getStatus(item)
                const active = ['ACTIVE', 'AKTIF'].includes(status)

                return (
                  <tr key={getId(item) || index}>
                    <td>{(pageNum - 1) * pageSize + index + 1}</td>
                    <td>
                      <div className="mp-name-cell">
                        <span className="mp-row-icon"><BookOpen size={17} /></span>
                        <strong>{getName(item)}</strong>
                      </div>
                    </td>
                    <td>{getClassName(item)}</td>
                    <td>
                      {status ? (
                        <span className={`mp-status ${active ? 'is-active' : 'is-inactive'}`}>
                          {status}
                        </span>
                      ) : (
                        <span className="mp-status is-unknown">Tidak tersedia</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`mp-button mp-status-button ${active ? 'mp-button-danger' : 'mp-button-secondary'}`}
                        onClick={() => handleStatus(item)}
                        disabled={!status}
                      >
                        {active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mp-pagination">
          <span>Halaman {pageNum} dari {pages}</span>
          <div>
            <button
              type="button"
              className="mp-button mp-button-secondary"
              disabled={pageNum <= 1 || loading}
              onClick={() => setPageNum((value) => Math.max(1, value - 1))}
            >
              Sebelumnya
            </button>
            <button
              type="button"
              className="mp-button mp-button-secondary"
              disabled={pageNum >= pages || loading}
              onClick={() => setPageNum((value) => Math.min(pages, value + 1))}
            >
              Berikutnya
            </button>
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelHeading title="Impor Mapel dari Excel" />
        <form className="mp-import-form" onSubmit={handleImport}>
          <div className="mp-import-info">
            <FileSpreadsheet size={23} />
            <div>
              <strong>Impor data secara massal</strong>
              <p>Pilih file Excel yang berisi data mapel per kelas sesuai format yang diterima backend.</p>
            </div>
          </div>

          <div className="mp-import-controls">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(event) => setExcelFile(event.target.files?.[0] ?? null)}
            />
            <button type="submit" className="mp-button mp-button-primary" disabled={importing}>
              <Upload size={16} />
              {importing ? 'Mengimpor...' : 'Impor Excel'}
            </button>
          </div>
        </form>
      </Panel>

      {modalOpen && (
        <Modal title="Hubungkan Mapel dengan Kelas" onClose={() => !saving && setModalOpen(false)}>
          <form onSubmit={handleSubmit}>
            <div className="mp-modal-body">
              {loadingOptions ? (
                <p>Memuat pilihan mata pelajaran dan kelas...</p>
              ) : (
                <>
                  <label className="mp-field">
                    <span>Mata Pelajaran <i>*</i></span>
                    <select
                      value={idMapel}
                      onChange={(event) => setIdMapel(event.target.value)}
                      required
                    >
                      <option value="">Pilih mata pelajaran</option>

                      {mapelOptions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nama}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="mp-field">
                    <span>Kelas <i>*</i></span>
                    <select
                      value={idKelas}
                      onChange={(event) => setIdKelas(event.target.value)}
                      required
                    >
                      <option value="">Pilih kelas</option>

                      {kelasOptions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nama}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              )}
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
                {saving ? 'Menyimpan...' : 'Simpan Relasi'}
              </button>
            </footer>
          </form>
        </Modal>
      )}
    </div>
  )
}
