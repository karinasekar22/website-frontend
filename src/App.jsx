import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import UserPage from './pages/UserPage'
import SettingsPage from './pages/SettingsPage'
import ClassPage from './pages/ClassPage'
import JurusanPage from './pages/JurusanPage'
import TahunAjaranPage from './pages/TahunAjaranPage'
import MapelPage from './pages/MapelPage'
import TdMapelPage from './pages/TdMapelPage'
import InfoPage from './pages/InfoPage'
import PerizinanPage from './pages/PerizinanPage'
import AbsensiPage from './pages/AbsensiPage'

function ProtectedRoutes() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/user" element={<UserPage type="users" />} />
        <Route path="/class" element={<ClassPage type="class" />} />
        <Route path="/major" element={<JurusanPage type="jurusan" />} />
        <Route path="/tahun-ajaran" element={<TahunAjaranPage type="tahun-ajaran" />} />
        <Route path="/mapel-master" element={<MapelPage type="mapel-master" />} />
        <Route path="/mapel" element={<TdMapelPage type="mapel" />} />
        <Route path="/attendance" element={<AbsensiPage type="attendance" />} />
        <Route path="/permissions" element={<PerizinanPage type="permissions" />} />
        <Route path="/information" element={<InfoPage type="information" />} />
        <Route path="/settings" element={<SettingsPage type="settings" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  )
}

export default function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  )
}