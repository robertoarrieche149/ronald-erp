import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/useAuthStore'
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react'

export default function LoginPage() {
  const { user, setUser, loadProfile, setLoading } = useAuthStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLocalLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      navigate('/pos', { replace: true })
    }
  }, [user, navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLocalLoading(true)
    setError(null)
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError
      setUser(data.user)
      await loadProfile(data.user.id)
      setLoading(false)
      navigate('/pos', { replace: true })
    } catch (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'Correo o contraseña incorrectos.'
        : err.message)
    } finally {
      setLocalLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-5">
      <div className="w-full max-w-sm fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-xl mb-4">
            <span className="text-white text-4xl font-black">M</span>
          </div>
          <h1 className="text-2xl font-black text-app tracking-tight">MiniMarket POS</h1>
          <p className="text-sub text-sm mt-1">Sistema de punto de venta</p>
        </div>

        {/* Formulario */}
        <div className="card p-6 shadow-app-lg">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-sub uppercase tracking-wider mb-1.5 block">
                Correo electrónico
              </label>
              <input
                type="email"
                className="input"
                placeholder="correo@minimarket.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-sub uppercase tracking-wider mb-1.5 block">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sub hover:text-app transition-colors p-1"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl px-4 py-3">
                <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Ingresando...</>
              ) : (
                <><LogIn size={18} /> Ingresar</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sub text-xs mt-6">
          © {new Date().getFullYear()} MiniMarket POS — Todos los derechos reservados
        </p>
      </div>
    </div>
  )
}
