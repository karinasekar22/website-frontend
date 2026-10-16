import {
  CalendarDays,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
  BookOpen, 
  Layers,
  School,
  Clock
} from 'lucide-react'

export const navigation = [
  { id: 'dashboard', path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'GURU', 'WALIKELAS'] },
  { id: 'user', path: '/user', label: 'Data User', icon: Users, roles: ['ADMIN'] },
  { id: 'class', path: '/class', label: 'Data Kelas', icon: Users, roles: ['ADMIN', 'GURU'] },
  { id: 'attendance', path: '/attendance', label: 'Presensi', icon: Clock, roles: ['ADMIN', 'GURU'] },
  { id: 'jurusan', path: '/major', label: 'Jurusan', icon: ClipboardCheck, roles: ['ADMIN', 'GURU'] },
  { id: 'tahun-ajaran', path: '/tahun-ajaran', label: 'Tahun Ajaran', icon: CalendarDays, roles: ['ADMIN', 'GURU'] },
  { id: 'permissions', path: '/permissions', label: 'Perizinan', icon: FileText, roles: ['ADMIN', 'GURU'] },
  { id: 'mapel-master', path: '/mapel-master', label: 'Data Mapel', icon: BookOpen, roles: ['ADMIN', 'GURU'] },
  { id: 'mapel-per-kelas', path: '/mapel', label: 'Pembagian Mapel', icon: Layers, roles: ['ADMIN', 'GURU'] },
]

export const secondaryNavigation = [
  { id: 'info', path: '/information', label: 'Informasi', icon: School, roles: ['ADMIN', 'GURU'] },
  { id: 'settings', path: '/settings', label: 'Pengaturan', icon: Settings, roles: ['ADMIN', 'GURU', 'WALIKELAS'] },
]