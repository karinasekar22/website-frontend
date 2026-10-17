
import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, Save, School } from 'lucide-react'
import Swal from 'sweetalert2'

import {
  getInfoSekolah,
  addInfoSekolah,
  updateInfoSekolah,
} from '../services/infoService'
import '../styles/info.css'

const emptyForm = {
  npsp: '',
  namaSekolah: '',
  nomorTelepon: '',
  emailSekolah: '',
  alamatSekolah: '',
  clockIn: '06:30',
  clockOut: '15:00',
  inDuration: 15,
  outDuration: 15,
  latitude: '',
  longitude: '',
  radiusAbsensi: 100,
}

function formatTime(value) {
  if (!value) return ''

  // Mendukung response backend berbentuk "06:30:00"
  // maupun object { hour, minute, second, nano }.
  if (typeof value === 'string') {
    return value.slice(0, 5)
  }

  if (typeof value === 'object') {
    const hour = String(value.hour ?? 0).padStart(2, '0')
    const minute = String(value.minute ?? 0).padStart(2, '0')
    return `${hour}:${minute}`
  }

  return ''
}

function toTimeObject(value) {
  const [hour = '0', minute = '0'] = value.split(':')

  return {
    hour: Number(hour),
    minute: Number(minute),
    second: 0,
    nano: 0,
  }
}

function mapResponseToForm(data) {
  return {
    npsp: data.npsp ?? '',
    namaSekolah: data.namaSekolah ?? '',
    nomorTelepon: data.nomorTelepon ?? '',
    emailSekolah: data.emailSekolah ?? '',
    alamatSekolah: data.alamatSekolah ?? '',
    clockIn: formatTime(data.clockIn) || emptyForm.clockIn,
    clockOut: formatTime(data.clockOut) || emptyForm.clockOut,
    inDuration: data.inDuration ?? 15,
    outDuration: data.outDuration ?? 15,
    latitude: data.latitude ?? '',
    longitude: data.longitude ?? '',
    radiusAbsensi: data.radiusAbsensi ?? 100,
  }
}

function Field({ label, name, value, onChange, ...props }) {
  return (
    <label className="info-field">
      <span>{label}</span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        {...props}
      />
    </label>
  )
}

function Section({ title, children }) {
  return (
    <section className="info-section">
      <h3>{title}</h3>
      <div className="info-grid">{children}</div>
    </section>
  )
}

export default function InfoPage() {
  const [form, setForm] = useState(emptyForm)
  const [infoId, setInfoId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadInfo = useCallback(async () => {
    setLoading(true)

    try {
      const data = await getInfoSekolah()

      if (!data || typeof data !== 'object') {
        throw new Error('Data informasi sekolah tidak ditemukan.')
      }

      setForm(mapResponseToForm(data))
      setInfoId(data.id ?? null)
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Gagal memuat informasi sekolah',
        text: error.message || 'Terjadi kesalahan saat mengambil data.',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInfo()
  }, [loadInfo])

  function handleChange(event) {
    const { name, value, type } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: type === 'number' && value !== '' ? Number(value) : value,
    }))
  }

  function validateForm() {
    if (
      !form.npsp.trim() ||
      !form.namaSekolah.trim() ||
      !form.nomorTelepon.trim() ||
      !form.emailSekolah.trim() ||
      !form.alamatSekolah.trim()
    ) {
      return 'Identitas, kontak, dan alamat sekolah wajib diisi.'
    }

    if (!form.clockIn || !form.clockOut) {
      return 'Jam masuk dan jam pulang wajib diisi.'
    }

    if (
      form.latitude === '' ||
      form.longitude === '' ||
      Number(form.latitude) < -90 ||
      Number(form.latitude) > 90 ||
      Number(form.longitude) < -180 ||
      Number(form.longitude) > 180
    ) {
      return 'Latitude harus antara -90 sampai 90 dan longitude antara -180 sampai 180.'
    }

    if (
      Number(form.inDuration) < 0 ||
      Number(form.outDuration) < 0 ||
      Number(form.radiusAbsensi) < 0
    ) {
      return 'Durasi dan radius absensi tidak boleh negatif.'
    }

    return null
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationError = validateForm()

    if (validationError) {
      await Swal.fire({
        icon: 'warning',
        title: 'Periksa kembali form',
        text: validationError,
      })
      return
    }

    const confirmation = await Swal.fire({
      icon: 'question',
      title: infoId ? 'Update informasi sekolah?' : 'Simpan informasi sekolah?',
      text: 'Pastikan data yang dimasukkan sudah benar.',
      showCancelButton: true,
      confirmButtonText: infoId ? 'Ya, update' : 'Ya, simpan',
      cancelButtonText: 'Batal',
      reverseButtons: true,
    })

    if (!confirmation.isConfirmed) return

    const payload = {
      npsp: form.npsp.trim(),
      namaSekolah: form.namaSekolah.trim(),
      nomorTelepon: form.nomorTelepon.trim(),
      emailSekolah: form.emailSekolah.trim(),
      alamatSekolah: form.alamatSekolah.trim(),
      clockIn: formatTime(form.clockIn),
      clockOut: formatTime(form.clockOut),
      inDuration: Number(form.inDuration),
      outDuration: Number(form.outDuration),
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      radiusAbsensi: Number(form.radiusAbsensi),
    }

    setSaving(true)

    try {
      if (infoId) {
        await updateInfoSekolah(payload)
      } else {
        await addInfoSekolah(payload)
      }

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: infoId
          ? 'Informasi sekolah berhasil diperbarui.'
          : 'Informasi sekolah berhasil disimpan.',
        timer: 1800,
        showConfirmButton: false,
      })

      await loadInfo()
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Gagal menyimpan data',
        text: error.message || 'Terjadi kesalahan pada server.',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="info-loading">
        <RefreshCw size={20} className="info-spin" />
        <span>Memuat informasi sekolah...</span>
      </div>
    )
  }

  return (
    <div className="info-page">
      <div className="info-page-heading">
        <div>
          <div className="info-title-icon">
            <School size={23} />
          </div>
          <div>
            <h1>Informasi Sekolah</h1>
            <p>Kelola identitas sekolah dan pengaturan absensi.</p>
          </div>
        </div>

        <button
          type="button"
          className="info-refresh-btn"
          onClick={loadInfo}
          disabled={saving}
        >
          <RefreshCw size={16} />
          Muat Ulang
        </button>
      </div>

      <form className="info-card" onSubmit={handleSubmit}>
        <Section title="Identitas Sekolah">
          <Field
            label="NPSP"
            name="npsp"
            value={form.npsp}
            onChange={handleChange}
            placeholder="Masukkan NPSP"
            required
          />

          <Field
            label="Nama Sekolah"
            name="namaSekolah"
            value={form.namaSekolah}
            onChange={handleChange}
            placeholder="Nama lengkap sekolah"
            required
          />

          <Field
            label="Nomor Telepon"
            name="nomorTelepon"
            type="tel"
            value={form.nomorTelepon}
            onChange={handleChange}
            placeholder="Contoh: 082321797871"
            required
          />

          <Field
            label="Email Sekolah"
            name="emailSekolah"
            type="email"
            value={form.emailSekolah}
            onChange={handleChange}
            placeholder="email@sekolah.sch.id"
            required
          />

          <label className="info-field info-full">
            <span>Alamat Sekolah</span>
            <textarea
              name="alamatSekolah"
              value={form.alamatSekolah}
              onChange={handleChange}
              placeholder="Masukkan alamat lengkap sekolah"
              rows={3}
              required
            />
          </label>
        </Section>

        <Section title="Pengaturan Absensi">
          <Field
            label="Jam Masuk"
            name="clockIn"
            type="time"
            value={form.clockIn}
            onChange={handleChange}
            required
          />

          <Field
            label="Jam Pulang"
            name="clockOut"
            type="time"
            value={form.clockOut}
            onChange={handleChange}
            required
          />

          <Field
            label="Durasi Toleransi Masuk (menit)"
            name="inDuration"
            type="number"
            min="0"
            value={form.inDuration}
            onChange={handleChange}
            required
          />

          <Field
            label="Durasi Toleransi Pulang (menit)"
            name="outDuration"
            type="number"
            min="0"
            value={form.outDuration}
            onChange={handleChange}
            required
          />

          <Field
            label="Radius Absensi (meter)"
            name="radiusAbsensi"
            type="number"
            min="0"
            value={form.radiusAbsensi}
            onChange={handleChange}
            required
          />
        </Section>

        <Section title="Lokasi Sekolah">
          <Field
            label="Latitude"
            name="latitude"
            type="number"
            step="any"
            min="-90"
            max="90"
            value={form.latitude}
            onChange={handleChange}
            placeholder="-6.230000"
            required
          />

          <Field
            label="Longitude"
            name="longitude"
            type="number"
            step="any"
            min="-180"
            max="180"
            value={form.longitude}
            onChange={handleChange}
            placeholder="106.930000"
            required
          />
        </Section>

        <div className="info-form-footer">
          <p>
            {infoId
              ? 'Informasi sekolah sudah tersedia. Perubahan akan memperbarui data tersebut.'
              : 'Belum ada ID informasi sekolah yang diterima dari backend.'}
          </p>

          <button
            type="submit"
            className="info-submit-btn"
            disabled={saving}
          >
            {saving ? (
              <>
                <RefreshCw size={17} className="info-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={17} />
                {infoId ? 'Update Informasi' : 'Simpan Informasi'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
