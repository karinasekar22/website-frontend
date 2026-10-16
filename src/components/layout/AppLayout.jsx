import { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <main className="school-app">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="main-area">
        <Topbar onMenu={() => setMobileOpen(true)} />
        <div className="content">{children}</div>
      </div>
    </main>
  )
}