import { useState } from 'react'
import { ArrowRight, Eye, EyeOff, GraduationCap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [nomorInduk, setNomorInduk] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(nomorInduk, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login gagal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <div className="login-brand">
          <span>
            <GraduationCap size={24} />
          </span>

          <b>
            Edu<span>Smart</span>
          </b>
        </div>

        <div className="login-illustration">
          <GraduationCap size={150} strokeWidth={1} />
        </div>

        <h1>Kelola sekolah lebih mudah.</h1>

        <p>
          Satu platform untuk mengelola akademik, presensi, jadwal,
          dan aktivitas sekolah.
        </p>
      </section>

      <section className="login-form-panel">
        <form className="login-card" onSubmit={submit}>
          <p className="eyebrow">SELAMAT DATANG</p>

          <h2>Masuk ke EduSmart</h2>

          <p className="login-subtitle">
            Gunakan akun sekolahmu untuk melanjutkan.
          </p>

          <label>
            Nomor Induk

            <input
              type="text"
              value={nomorInduk}
              onChange={e => setNomorInduk(e.target.value)}
              placeholder="Masukkan nomor induk"
              required
              autoComplete="username"
            />
          </label>

          <label>
            Password

            <div className="password-field">
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan password"
                required
                autoComplete="current-password"
              />

              <button
                type="button"
                onClick={() => setShow(!show)}
                aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Masuk'}
            <ArrowRight size={18} />
          </button>
        </form>
      </section>
    </main>
  )
}