import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: true,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (loading) => set({ loading }),

      get isAdmin() {
        return get().profile?.rol === 'admin'
      },
      get isEmployee() {
        return get().profile?.rol === 'employee'
      },

      loadProfile: async (userId) => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle()
          
          if (data) {
            set({ profile: data })
            return data
          }

          // Si el perfil no se encuentra en la tabla, crear o sincronizar en Supabase
          const defaultProfile = {
            id: userId,
            nombre: 'Administrador',
            rol: 'admin',
            activo: true
          }
          await supabase.from('profiles').upsert(defaultProfile)
          set({ profile: defaultProfile })
          return defaultProfile
        } catch (err) {
          console.error('Error al cargar perfil:', err)
          const fallback = { id: userId, nombre: 'Usuario', rol: 'admin', activo: true }
          set({ profile: fallback })
          return fallback
        }
      },

      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null, profile: null })
      },
    }),
    {
      name: 'auth-store',
      partialize: (s) => ({ profile: s.profile }),
    }
  )
)
