import { useState } from 'react'
import { useAuthStore } from '../stores/useAuthStore'
import { useTasaStore } from '../stores/useTasaStore'
import EmployeeManager from '../components/settings/EmployeeManager'
import {
  Settings, RefreshCw, Loader2, Save, LogOut,
  TrendingUp, AlertTriangle, CheckCircle2, Moon, Sun, User,
} from 'lucide-react'

export default function SettingsPage() {
  const { user, profile, logout } = useAuthStore()
  const { tasa, fuente, tasaManual, lastUpdate, fetchTasa, setTasaManual, clearManual, loading, error } = useTasaStore()
  const [tasaInput, setTasaInput] = useState(tasaManual ?? tasa)
  const [modoManual, setModoManual] = useState(fuente === 'manual')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'))

  const handleFetchBCV = async () => {
    await fetchTasa(user?.id)
    setModoManual(false)
    setTasaInput(tasa)
  }

  const handleGuardarManual = async () => {
    if (!tasaInput || isNaN(parseFloat(tasaInput)) || parseFloat(tasaInput) <= 0) return
    setSaving(true)
    await setTasaManual(parseFloat(tasaInput), user?.id)
    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
  }

  const handleClearManual = () => {
    clearManual()
    setModoManual(false)
    fetchTasa(user?.id)
  }

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <div className="overflow-y-auto scroll-mobile px-4 pt-4" style={{ paddingBottom: '5rem' }}>
      <h1 className="text-xl font-black text-app mb-4">Configuración</h1>

      {/* Perfil */}
      <section className="mb-5">
        <h2 className="text-xs font-semibold text-sub uppercase tracking-wider mb-2">Mi Perfil</h2>
        <div className="card p-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
              <User className="text-white" size={24} />
            </div>
            <div>
              <p className="font-bold text-app text-base">{profile?.nombre ?? 'Usuario'}</p>
              <span className={`badge mt-1 ${profile?.rol === 'admin' ? 'badge-orange' : 'badge-gray'}`}>
                {profile?.rol === 'admin' ? '👑 Administrador' : '👤 Empleado'}
              </span>
              {user?.email && <p className="text-[11px] text-sub mt-1">{user.email}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* Tasa de Cambio */}
      <section className="mb-5">
        <h2 className="text-xs font-semibold text-sub uppercase tracking-wider mb-2">Tasa de Cambio BCV</h2>

        {/* Estado actual */}
        <div className={`card p-4 mb-3 border-2 ${fuente === 'bcv' ? 'border-green-300 dark:border-green-500/40' : 'border-orange-300 dark:border-orange-500/40'}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className={fuente === 'bcv' ? 'text-green-500' : 'text-orange-500'} />
                <p className="text-sm font-semibold text-app">
                  Tasa actual: <span className="text-orange-500 font-black text-base">{tasa.toFixed(2)} Bs/USD</span>
                </p>
              </div>
              <p className="text-[11px] text-sub mt-0.5">
                Fuente: {fuente === 'bcv' ? '🏦 BCV (automático)' : '✏️ Manual (forzada)'}
              </p>
              {lastUpdate && (
                <p className="text-[10px] text-muted mt-0.5">
                  Actualizado: {new Date(lastUpdate).toLocaleString('es-VE')}
                </p>
              )}
            </div>
            {fuente === 'manual' && (
              <span className="badge badge-orange">Manual</span>
            )}
          </div>
        </div>

        {/* Botón actualizar BCV */}
        <button
          onClick={handleFetchBCV}
          disabled={loading}
          className="btn-secondary w-full mb-3"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Consultando BCV...</>
          ) : (
            <><RefreshCw size={16} /> Actualizar desde BCV</>
          )}
        </button>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 mb-3">
            <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Tasa manual */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-app">Forzar Tasa Manual</p>
              <p className="text-[11px] text-sub">Usar si la API del BCV falla</p>
            </div>
            <button
              onClick={() => setModoManual(!modoManual)}
              className={`w-12 h-6 rounded-full transition-colors relative ${modoManual ? 'bg-orange-500' : 'bg-border'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${modoManual ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {modoManual && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-sub uppercase tracking-wider mb-1.5 block">
                  Tasa manual (Bs. por 1 USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  className="input"
                  value={tasaInput}
                  onChange={(e) => setTasaInput(e.target.value)}
                  placeholder="Ej: 48.50"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={handleClearManual} className="btn-secondary flex-1 text-sm">
                  Usar BCV
                </button>
                <button
                  onClick={handleGuardarManual}
                  disabled={saving}
                  className="btn-primary flex-1 text-sm"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : success ? (
                    <><CheckCircle2 size={16} /> Guardado</>
                  ) : (
                    <><Save size={16} /> Guardar</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Gestión de Empleados (Solo Admin) */}
      {profile?.rol === 'admin' && (
        <section className="mb-5">
          <EmployeeManager />
        </section>
      )}

      {/* Apariencia */}
      <section className="mb-5">
        <h2 className="text-xs font-semibold text-sub uppercase tracking-wider mb-2">Apariencia</h2>
        <div className="card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDark ? <Moon size={20} className="text-blue-400" /> : <Sun size={20} className="text-orange-400" />}
            <div>
              <p className="text-sm font-semibold text-app">Tema {isDark ? 'Oscuro' : 'Claro'}</p>
              <p className="text-[11px] text-sub">Interfaz de la aplicación</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`w-14 h-7 rounded-full transition-colors relative ${isDark ? 'bg-blue-500' : 'bg-orange-500'}`}
          >
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${isDark ? 'left-8' : 'left-1'}`} />
          </button>
        </div>
      </section>

      {/* Cerrar sesión */}
      <section className="mb-5">
        <button
          onClick={() => { if (confirm('¿Cerrar sesión?')) logout() }}
          className="btn-danger w-full"
        >
          <LogOut size={18} /> Cerrar Sesión
        </button>
      </section>

      <p className="text-center text-muted text-[11px] mb-4">MiniMarket POS v1.0.0</p>
    </div>
  )
}
