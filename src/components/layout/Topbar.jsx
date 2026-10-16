import { Bell, CalendarDays, ChevronDown, Menu, Search } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function Topbar({ onMenu }) {
  const { user } = useAuth()
  return (
    <header className="topbar">
      <button className="mobile-menu" onClick={onMenu}><Menu size={21} /></button>
      <div className="search"><Search size={18} /><input placeholder="Cari sesuatu..." aria-label="Cari" /></div>
      <div className="top-actions">
        <button className="notification" aria-label="Notifikasi"><Bell size={20} /><i /></button>
        <span className="top-divider" />
        <div className="mini-user">
          <div className="avatar small">{user?.initials || 'HN'}</div>
          <div><b>{user?.name || 'Hesti Nurwanti'}</b><small>{user?.title || 'Administrator'}</small></div>
          <ChevronDown size={16} />
        </div>
      </div>
    </header>
  )
}

export function PageTitle({ title, eyebrow = 'Beranda' }) {
  return (
    <div className="page-title">
      <div><p>{eyebrow}</p><h1>{title}</h1></div>
      <button className="date-button"><CalendarDays size={17} /> 7 Oktober 2026 <ChevronDown size={15} /></button>
    </div>
  )
}