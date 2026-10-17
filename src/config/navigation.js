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
  Clock,
  DoorOpenIcon,
  BookOpenText,
  BookA,
  CalendarCheckIcon,
  Layers2Icon,
  DoorOpen,
  PanelsRightBottom
} from 'lucide-react'

export const navigation = [
  { id: 'dashboard', path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'GURU', 'WALIKELAS'] },
  { id: 'user', path: '/user', label: 'Manage User', icon: Users, roles: ['ADMIN'] },
  { id: 'class', path: '/class', label: 'Manage Kelas', icon: BookOpenText, roles: ['ADMIN', 'GURU'] },
  { id: 'attendance', path: '/attendance', label: 'Presensi', icon: Clock, roles: ['ADMIN', 'GURU'] },
  { id: 'permissions', path: '/permissions', label: 'Perizinan', icon: FileText, roles: ['GURU'] },
  { id: 'mapel-per-kelas', path: '/mapel', label: 'Pembagian Mapel', icon: Layers, roles: ['ADMIN', 'GURU'] },
  { id: 'jadwal-per-mapel', path: '/jadwal', label: 'Jadwal Pelajaran', icon: CalendarDays, roles: ['ADMIN', 'GURU'] },
]

export const secondaryNavigation = [
  { id: 'info', path: '/information', label: 'Informasi', icon: School, roles: ['ADMIN'] },
  { id: 'class-master', path: '/master-kelas', label: 'Data Kelas', icon: PanelsRightBottom, roles: ['ADMIN'] },
  { id: 'mapel-master', path: '/mapel-master', label: 'Data Mapel', icon: BookA, roles: ['ADMIN'] },
  { id: 'tahun-ajaran', path: '/tahun-ajaran', label: 'Tahun Ajaran', icon: CalendarCheckIcon, roles: ['ADMIN', 'GURU'] },
  { id: 'jurusan', path: '/major', label: 'Jurusan', icon: Layers2Icon, roles: ['ADMIN', 'GURU'] },
  { id: 'settings', path: '/settings', label: 'Pengaturan', icon: Settings, roles: ['ADMIN', 'GURU', 'WALIKELAS'] },
]