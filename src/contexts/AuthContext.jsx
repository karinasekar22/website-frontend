
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import * as authService from '../services/authService'
import { setUnauthorizedHandler } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getStoredUser())

  useEffect(() => {
    setUnauthorizedHandler(() => {
      authService.logout()
      setUser(null)

      if (window.location.pathname !== '/login') {
        window.location.replace('/login')
      }
    })

    return () => {
      setUnauthorizedHandler(null)
    }
  }, [])

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),

    async login(nomorInduk, password) {
      const session = await authService.login(nomorInduk, password)
      setUser(session.user)
      return session
    },

    logout() {
      authService.logout()
      setUser(null)

      if (window.location.pathname !== '/login') {
        window.location.replace('/login')
      }
    },
  }), [user])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
