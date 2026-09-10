import { supabase } from './supabaseClient'

export const login = async (username, password) => {
    console.info('login_attempt', { username, configured: Boolean(supabase), persistentSession: true })
    try {
      if (!supabase) throw new Error('Sign-in is not configured.')
      if (username.trim().toLowerCase() !== 'yair') throw new Error('Incorrect username or password.')
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'yair@users.victoriashift.invalid', password,
      })
      if (error) throw error
      console.info('login_succeeded', { userId: data.user.id })
    } catch (error) {
      console.error('login_failed', { reason: error.message, code: error.code ?? null, status: error.status ?? null })
      throw new Error(error.code === 'invalid_credentials' ? 'Incorrect username or password.' : error.message)
    }
  }

