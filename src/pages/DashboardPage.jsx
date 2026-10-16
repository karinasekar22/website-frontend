
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Users,
  School,
  ClipboardCheck,
  FileText,
  CalendarDays,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Clock3,
  HeartPulse,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext'
import Panel, { PanelHeading } from '../components/ui/Panel'
import { PageTitle } from '../components/layout/Topbar'
import '../styles/dashboard.css'

function localDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatLongDate(date = new Date()) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function unwrapObject(value) {
  return value && typeof value === 'object' ? value : {}
}

function getField(item, fields, fallback = '') {
  for (const field of fields) {
    const value = item?.[field]

    if (value !== undefined && value !== null && value !== '') {
      return value
    }
  }

  return fallback
}

function normalizeStatus(value) {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replaceAll(' ', '_')
}

function getPermissionStatus(item) {
  return normalizeStatus(
    getField(item, ['status', 'statusIzin', 'statusPerizinan'])
  )
}

function getAttendanceStatus(item) {
  return normalizeStatus(
    getField(item, ['status', 'statusAbsensi'])
  )
}

function isPendingPermission(item) {
  const status = getPermissionStatus(item)

  return [
    'PENDING',
    'MENUNGGU',
    'DIAJUKAN',
    'MENUNGGU_PERSETUJUAN',
    'BELUM_DIVERIFIKASI',
  ].includes(status)
}

function formatDate(value) {
  if (!value) return 'Tanggal tidak tersedia'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return String(value)

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function permissionStatusLabel(item) {
  const status = getPermissionStatus(item)

  if (['PENDING', 'MENUNGGU', 'DIAJUKAN'].includes(status)) {
    return 'Menunggu'
  }

  if (['APPROVED', 'DISETUJUI', 'DITERIMA'].includes(status)) {
    return 'Disetujui'
  }

  if (['REJECTED', 'DITOLAK'].includes(status)) {
    return 'Ditolak'
  }

  return getField(item, ['status', 'statusIzin'], 'Status belum tersedia')
}

function getTotal(raw, rows) {
  const data = unwrapObject(raw)

  const value = getField(data, [
    'totalElements',
    'totalItems',
    'totalData',
    'total',
    'jumlah',
  ])

  if (value !== '') {
    const total = Number(value)
    if (Number.isFinite(total)) return total
  }

  // Fallback hanya menghitung data yang diterima dari API.
  return rows.length
}

function StatCard({ title, value, subtitle, icon: Icon, tone, to }) {
  const content = (
    <>
      <div className={`dashboard-stat-icon ${tone}`}>
        <Icon size={22} />
      </div>

      <div className="dashboard-stat-content">
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{subtitle}</small>
      </div>

      {to && <ArrowRight className="dashboard-stat-arrow" size={17} />}
    </>
  )

  if (to) {
    return (
      <Link to={to} className="dashboard-stat-card">
        {content}
      </Link>
    )
  }

  return <div className="dashboard-stat-card">{content}</div>
}

function AttendanceItem({ label, count, total, icon: Icon, tone }) {
  const percentage = total > 0
    ? Math.min(100, Math.round((count / total) * 100))
    : 0

  return (
    <div className="attendance-item">
      <div className="attendance-item-top">
        <span className={`attendance-item-icon ${tone}`}>
          <Icon size={17} />
        </span>

        <span className="attendance-item-label">{label}</span>
        <strong>{count}</strong>
      </div>

      <div className="attendance-progress">
        <div
          className={`attendance-progress-fill ${tone}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <small>{total > 0 ? `${percentage}% dari data presensi` : 'Belum ada data'}</small>
    </div>
  )
}

function PermissionItem({ item }) {
  const name = getField(item, [
    'namaSiswa',
    'namaLengkap',
    'nama',
    'namaPemohon',
  ], 'Nama pemohon tidak tersedia')

  const reason = getField(item, [
    'alasan',
    'keterangan',
    'jenisIzin',
  ], 'Pengajuan izin')

  const date = getField(item, [
    'createdAt',
    'tanggalPengajuan',
    'tanggalMulai',
  ])

  const status = permissionStatusLabel(item)
  const pending = isPendingPermission(item)

  return (
    <div className="dashboard-permission-item">
      <span className={`dashboard-permission-icon ${pending ? 'purple' : 'blue'}`}>
        <FileText size={17} />
      </span>

      <div className="dashboard-permission-detail">
        <strong>{name}</strong>
        <span>{reason}</span>
        <small>{formatDate(date)}</small>
      </div>

      <span className={`dashboard-permission-status ${pending ? 'pending' : ''}`}>
        {status}
      </span>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()

  const [data, setData] = useState({
    users: { rows: [], raw: null },
    classes: { rows: [], raw: null },
    attendance: { rows: [], raw: null },
    permissions: { rows: [], raw: null },
    errors: [],
  })

  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [pageError, setPageError] = useState('')

  const today = localDateString()

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setPageError('')

    try {
      const { getDashboardData } = await import('../services/dashboardService')
      const result = await getDashboardData(today)

      setData(result)
      setLastUpdated(new Date())
    } catch (error) {
      setPageError(error?.message || 'Gagal memuat dashboard.')
    } finally {
      setLoading(false)
    }
  }, [today])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const attendanceSummary = useMemo(() => {
    const rows = data.attendance.rows

    const summary = {
      hadir: 0,
      izin: 0,
      sakit: 0,
      alpa: 0,
    }

    rows.forEach((item) => {
      const status = getAttendanceStatus(item)

      if (['HADIR', 'PRESENT', 'ATTEND'].includes(status)) {
        summary.hadir += 1
      } else if (['IZIN', 'PERMISSION', 'EXCUSED'].includes(status)) {
        summary.izin += 1
      } else if (['SAKIT', 'SICK'].includes(status)) {
        summary.sakit += 1
      } else if (['ALPA', 'ALPHA', 'ABSENT', 'TIDAK_HADIR'].includes(status)) {
        summary.alpa += 1
      }
    })

    return summary
  }, [data.attendance.rows])

  const pendingPermissions = useMemo(
    () => data.permissions.rows.filter(isPendingPermission),
    [data.permissions.rows]
  )

  const greetingName = getField(user, [
    'namaLengkap',
    'nama',
    'name',
    'fullName',
    'username',
  ], 'Pengguna')

  const userTotal = getTotal(data.users.raw, data.users.rows)
  const classTotal = getTotal(data.classes.raw, data.classes.rows)

  const stats = [
    {
      title: 'Total Pengguna',
      value: userTotal,
      icon: Users,
      tone: 'blue',
      to: '/user',
    },
    {
      title: 'Total Kelas',
      value: classTotal,
      icon: School,
      tone: 'green',
      to: '/class',
    },
    {
      title: 'Presensi Hari Ini',
      value: data.attendance.rows.length,
      icon: ClipboardCheck,
      tone: 'orange',
      to: '/attendance',
    },
    {
      title: 'Perlu Ditinjau',
      value: pendingPermissions.length,
      icon: FileText,
      tone: 'purple',
      to: '/permissions',
    },
  ]

  const recentPermissions = [...data.permissions.rows]
    .sort((a, b) => {
      const dateA = new Date(getField(a, ['createdAt', 'tanggalPengajuan'], 0)).getTime() || 0
      const dateB = new Date(getField(b, ['createdAt', 'tanggalPengajuan'], 0)).getTime() || 0
      return dateB - dateA
    })
    .slice(0, 5)

  return (
    <>
      <PageTitle title="Dashboard" />

      <section className="welcome-card">
        <div>
          <p className="eyebrow">{formatLongDate()}</p>
          <h2>Halo, {greetingName}!</h2>
          <p>
            Berikut ringkasan kondisi sekolah berdasarkan data yang berhasil
            diambil dari server.
          </p>
        </div>

        <div className="welcome-art">
          <School size={68} strokeWidth={1.3} />
        </div>
      </section>

      <div className="dashboard-toolbar">
        <div>
          <strong>Ringkasan Sekolah</strong>
          <p>
            {lastUpdated
              ? `Diperbarui pukul ${lastUpdated.toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}`
              : 'Menunggu data dari server'}
          </p>
        </div>

        <button
          type="button"
          className="dashboard-refresh"
          onClick={loadDashboard}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'dashboard-spinning' : ''} />
          {loading ? 'Memuat...' : 'Refresh data'}
        </button>
      </div>

      {pageError && (
        <div className="dashboard-error">
          <AlertCircle size={18} />
          {pageError}
        </div>
      )}

      {data.errors.length > 0 && (
        <div className="dashboard-warning">
          <AlertCircle size={18} />
          <div>
            <strong>Sebagian data belum berhasil dimuat.</strong>
            <ul>
              {data.errors.map((item) => (
                <li key={item.name}>
                  {item.name}: {item.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="dashboard-stats-grid">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="dashboard-content-grid">
        <Panel className="dashboard-attendance-panel">
          <PanelHeading
            title="Ringkasan Presensi"
            subtitle={`Data tanggal ${formatLongDate(new Date(`${today}T12:00:00`))}`}
            action={
              <Link className="text-button" to="/attendance">
                Lihat presensi
              </Link>
            }
          />

          {loading && data.attendance.rows.length === 0 ? (
            <div className="dashboard-empty">
              <RefreshCw size={20} className="dashboard-spinning" />
              Memuat data presensi...
            </div>
          ) : data.attendance.rows.length === 0 ? (
            <div className="dashboard-empty">
              <ClipboardCheck size={24} />
              <strong>Belum ada data presensi</strong>
              <span>Belum ada data yang dikembalikan API untuk tanggal ini.</span>
            </div>
          ) : (
            <div className="attendance-summary-list">
              <AttendanceItem
                label="Hadir"
                count={attendanceSummary.hadir}
                total={data.attendance.rows.length}
                icon={CheckCircle2}
                tone="green"
              />
              <AttendanceItem
                label="Izin"
                count={attendanceSummary.izin}
                total={data.attendance.rows.length}
                icon={FileText}
                tone="blue"
              />
              <AttendanceItem
                label="Sakit"
                count={attendanceSummary.sakit}
                total={data.attendance.rows.length}
                icon={HeartPulse}
                tone="orange"
              />
              <AttendanceItem
                label="Alpa"
                count={attendanceSummary.alpa}
                total={data.attendance.rows.length}
                icon={XCircle}
                tone="red"
              />
            </div>
          )}
        </Panel>

        <Panel className="dashboard-permissions-panel">
          <PanelHeading
            title="Perizinan Terbaru"
            subtitle="Pengajuan dari API perizinan"
            action={
              <Link className="text-button" to="/permissions">
                Lihat semua
              </Link>
            }
          />

          {loading && data.permissions.rows.length === 0 ? (
            <div className="dashboard-empty">
              <RefreshCw size={20} className="dashboard-spinning" />
              Memuat pengajuan...
            </div>
          ) : recentPermissions.length === 0 ? (
            <div className="dashboard-empty">
              <FileText size={24} />
              <strong>Belum ada data perizinan</strong>
              <span>Data pengajuan akan tampil di sini jika tersedia dari API.</span>
            </div>
          ) : (
            <div className="dashboard-permission-list">
              {recentPermissions.map((item, index) => (
                <PermissionItem
                  key={getField(item, ['idIzin', 'id'], `izin-${index}`)}
                  item={item}
                />
              ))}
            </div>
          )}
        </Panel>
      </div>

      <div className="dashboard-content-grid dashboard-bottom-grid">
        <Panel>
          <PanelHeading
            title="Jadwal Hari Ini"
            subtitle="Lihat jadwal pelajaran sekolah"
            action={
              <Link className="text-button" to="/schedule">
                Buka jadwal
              </Link>
            }
          />

          <div className="dashboard-schedule-placeholder">
            <CalendarDays size={28} />
            <strong>Jadwal terhubung melalui halaman Jadwal</strong>
            <span>
              Endpoint jadwal belum dikonfigurasi di dashboard ini. Gunakan
              halaman jadwal untuk melihat data yang sudah tersedia.
            </span>
            <Link to="/schedule" className="dashboard-inline-link">
              Buka halaman jadwal <ArrowRight size={15} />
            </Link>
          </div>
        </Panel>

        <Panel>
          <PanelHeading
            title="Akses Cepat"
            subtitle="Pilih modul yang ingin dikelola"
          />

          <div className="dashboard-quick-links">
            <Link to="/attendance" className="dashboard-quick-link">
              <span className="dashboard-quick-icon green">
                <ClipboardCheck size={19} />
              </span>
              <span>
                <strong>Data Presensi</strong>
                <small>Lihat dan ubah status presensi</small>
              </span>
              <ArrowRight size={16} />
            </Link>

            <Link to="/permissions" className="dashboard-quick-link">
              <span className="dashboard-quick-icon purple">
                <FileText size={19} />
              </span>
              <span>
                <strong>Data Perizinan</strong>
                <small>Tinjau pengajuan izin siswa</small>
              </span>
              <ArrowRight size={16} />
            </Link>

            <Link to="/user" className="dashboard-quick-link">
              <span className="dashboard-quick-icon blue">
                <Users size={19} />
              </span>
              <span>
                <strong>Data User</strong>
                <small>Kelola akun pengguna</small>
              </span>
              <ArrowRight size={16} />
            </Link>

            <Link to="/schedule" className="dashboard-quick-link">
              <span className="dashboard-quick-icon orange">
                <CalendarDays size={19} />
              </span>
              <span>
                <strong>Jadwal Pelajaran</strong>
                <small>Lihat jadwal sekolah</small>
              </span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </Panel>
      </div>
    </>
  )
}
