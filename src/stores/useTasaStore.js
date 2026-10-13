import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { fetchTasaBCV } from '../lib/bcv'

export const useTasaStore = create(
  persist(
    (set, get) => ({
      tasa: 1,            // tasa USD/VES actual
      fuente: 'bcv',      // 'bcv' | 'manual'
      tasaManual: null,   // tasa forzada por el admin
      lastUpdate: null,
      loading: false,
      error: null,

      // Convierte USD a Bs
      toVes: (usd) => {
        const t = get().tasa
        return usd * t
      },

      // Convierte Bs a USD
      toUsd: (ves) => {
        const t = get().tasa
        return t > 0 ? ves / t : 0
      },

      // Formatea precio en Bs
      formatVes: (usd) => {
        const ves = get().toVes(usd)
        return new Intl.NumberFormat('es-VE', {
          style: 'currency',
          currency: 'VES',
          minimumFractionDigits: 2,
        }).format(ves)
      },

      // Formatea precio en USD
      formatUsd: (usd) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
        }).format(usd)
      },

      setTasaManual: async (tasa, userId) => {
        set({ tasaManual: tasa, tasa, fuente: 'manual' })
        // Guardar en Supabase
        const { error } = await supabase
          .from('tasa_cambio')
          .upsert({
            tasa,
            fuente: 'manual',
            es_activa: true,
            registrado_por: userId,
            updated_at: new Date().toISOString(),
          })
        if (!error) set({ lastUpdate: new Date().toISOString(), error: null })
      },

      fetchTasa: async (userId) => {
        const { tasaManual } = get()

        // Si hay tasa manual forzada, usarla
        if (tasaManual) {
          set({ tasa: tasaManual, fuente: 'manual' })
          return
        }

        set({ loading: true, error: null })

        // Intentar BCV
        const tasaBCV = await fetchTasaBCV()
        if (tasaBCV) {
          set({ tasa: tasaBCV, fuente: 'bcv', loading: false, lastUpdate: new Date().toISOString() })
          // Persistir en Supabase
          if (userId) {
            await supabase.from('tasa_cambio').upsert({
              tasa: tasaBCV,
              fuente: 'bcv',
              es_activa: true,
              registrado_por: userId,
              updated_at: new Date().toISOString(),
            })
          }
          return
        }

        // Fallback: leer última tasa de Supabase
        const { data } = await supabase
          .from('tasa_cambio')
          .select('tasa, fuente')
          .order('fecha_vigencia', { ascending: false })
          .limit(1)
          .single()

        if (data) {
          set({ tasa: data.tasa, fuente: data.fuente, loading: false, lastUpdate: new Date().toISOString() })
        } else {
          set({ loading: false, error: 'No se pudo obtener la tasa de cambio' })
        }
      },

      clearManual: () => set({ tasaManual: null }),
    }),
    {
      name: 'tasa-store',
      partialize: (s) => ({ tasa: s.tasa, fuente: s.fuente, tasaManual: s.tasaManual, lastUpdate: s.lastUpdate }),
    }
  )
)
