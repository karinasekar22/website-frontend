import { BookOpen, ClipboardCheck, FileText, Users } from 'lucide-react'

const icons = { users: Users, attendance: ClipboardCheck, book: BookOpen, file: FileText }

export default function StatCard({ label, value, change, tone, icon }) {
  const Icon = icons[icon] || Users
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={21} /></div>
      <div className="stat-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small><b>↗ {change}</b> dari bulan lalu</small>
      </div>
    </div>
  )
}