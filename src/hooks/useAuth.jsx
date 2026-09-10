import { createContext, useContext, useEffect, useState } from 'react'
import { login } from '../services/authService'
import { supabase } from '../services/supabaseClient'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [authError, setAuthError] = useState('')
  useEffect(() => {
    if (!supabase) {
      setAuthError('Sign-in requires VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.')
      setReady(true)
      return
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.info('auth_session_changed', { event, userId: session?.user?.id ?? null, persistentSession: true })
      setUser(session?.user ?? null)
      setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const logout = async () => {
    console.info('logout_attempt', { userId: user?.id })
    const { error } = await supabase.auth.signOut({ scope: 'local' })
    if (error) {
      console.error('logout_failed', { reason: error.message })
      throw error
    }
    console.info('logout_succeeded')
  }
  return <AuthContext.Provider value={{ user, login, logout, authError }}>
    {ready ? children : <p className="status-banner">Restoring session…</p>}
  </AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
