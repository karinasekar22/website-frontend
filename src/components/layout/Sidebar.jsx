
import { useState } from 'react'
import {
  LogOut,
  X,
  Search,
  CircleX,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import {
  navigation,
  secondaryNavigation,
} from '../../config/navigation'

import { useAuth } from '../../contexts/AuthContext'
import '../../styles/global.css'

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [searchMenu, setSearchMenu] = useState('')

  const keyword = searchMenu.trim().toLowerCase()

  // Filter menu berdasarkan role user.
  const allowed = [...navigation, ...secondaryNavigation].filter(
    (item) => item.roles.includes(user?.role)
  )

  // Filter menu berdasarkan nama dan path.
  const filterMenus = (menus) =>
    menus.filter(
      (item) =>
        item.label.toLowerCase().includes(keyword) ||
        item.path.toLowerCase().includes(keyword)
    )

  const mainMenus = filterMenus(
    allowed.filter((item) => navigation.includes(item))
  )

  const otherMenus = filterMenus(
    allowed.filter((item) => secondaryNavigation.includes(item))
  )

  const noResults = mainMenus.length === 0 && otherMenus.length === 0

  return (
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="brand">
        <img
          className="school-logo"
          src="/logo.jpg"
          alt="Logo SMAN 1 Brebek"
          width={56}
        />

        <h5>SMAN 1 BREBEK</h5>

        <button
          type="button"
          className="close-menu"
          onClick={onClose}
          aria-label="Tutup menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Search menu */}
      <div className="sidebar-search">
        <Search size={18} className="sidebar-search-icon" />

        <input
          type="search"
          value={searchMenu}
          onChange={(event) => setSearchMenu(event.target.value)}
          placeholder="Cari menu..."
          aria-label="Cari menu sidebar"
        />

        {searchMenu && (
          <button
            type="button"
            className="sidebar-search-clear"
            onClick={() => setSearchMenu('')}
            aria-label="Hapus pencarian"
          >
            <CircleX size={16} />
          </button>
        )}
      </div>

      <nav>
        {mainMenus.length > 0 && (
          <>
            <p className="nav-label">MENU UTAMA</p>

            {mainMenus.map(({ path, label, icon: Icon, id }) => (
              <Link
                key={id}
                to={path}
                className={location.pathname === path ? 'active' : ''}
                onClick={onClose}
              >
                <Icon size={18} />
                <span>{label}</span>
                {id === 'permissions' && <em>3</em>}
              </Link>
            ))}
          </>
        )}

        {otherMenus.length > 0 && (
          <>
            <p className="nav-label second">SETTING</p>

            {otherMenus.map(({ path, label, icon: Icon, id }) => (
              <Link
                key={id}
                to={path}
                className={location.pathname === path ? 'active' : ''}
                onClick={onClose}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
          </>
        )}

        {noResults && (
          <div className="sidebar-no-results">
            <Search size={22} />
            <span>Menu tidak ditemukan</span>
            <small>Coba kata kunci lain.</small>
          </div>
        )}
      </nav>

      <button type="button" className="logout" onClick={logout}>
        <LogOut size={18} />
        <span>Keluar</span>
      </button>
    </aside>
  )
}
