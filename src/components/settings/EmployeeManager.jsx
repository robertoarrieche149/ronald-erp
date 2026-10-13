import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { UserPlus, Users, Loader2, ShieldCheck, UserCheck, X, Check, AlertCircle } from 'lucide-react'

export default function EmployeeManager() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  // Formulario nuevo empleado
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState('employee')

  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (!err && data) {
      setProfiles(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  const handleCreateEmployee = async (e) => {
    e.preventDefault()
    if (!nombre.trim() || !email.trim() || !password) return
    setCreating(true)
    setError(null)
    setSuccessMsg(null)

    try {
      // 1. Crear usuario en Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre,
            rol,
          },
        },
      })

      if (authError) throw authError

      // 2. Si el trigger o RLS no creó la fila automáticamente, insertarla manualmente
      if (data.user) {
        const { error: profileErr } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            nombre,
            rol,
            email,
            activo: true,
          })
        if (profileErr) console.warn('Aviso upsert profile:', profileErr.message)
      }

      setSuccessMsg(`Empleado ${nombre} registrado exitosamente.`)
      setNombre('')
      setEmail('')
      setPassword('')
      setRol('employee')
      setShowModal(false)
      fetchProfiles()
    } catch (err) {
      setError(err.message === 'User already registered' ? 'Este correo ya está registrado.' : err.message)
    } finally {
      setCreating(false)
    }
  }

  const toggleEstadoEmpleado = async (profileId, estadoActual) => {
    const { error: err } = await supabase
      .from('profiles')
      .update({ activo: !estadoActual })
      .eq('id', profileId)
    if (!err) fetchProfiles()
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-orange-500" />
          <h3 className="font-bold text-app text-sm">Gestión de Empleados</h3>
        </div>
        <button
          onClick={() => { setError(null); setShowModal(true) }}
          className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
        >
          <UserPlus size={14} />
          <span>Agregar</span>
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs mb-3">
          <Check size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="animate-spin text-orange-500" size={20} />
        </div>
      ) : profiles.length === 0 ? (
        <p className="text-xs text-sub text-center py-4">No hay empleados registrados.</p>
      ) : (
        <div className="space-y-2">
          {profiles.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-muted/50 border border-app/50"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${p.rol === 'admin' ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400' : 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'}`}>
                  {p.rol === 'admin' ? <ShieldCheck size={16} /> : <UserCheck size={16} />}
                </div>
                <div>
                  <p className="text-xs font-bold text-app">{p.nombre}</p>
                  <p className="text-[10px] text-sub">
                    {p.email ? p.email : `Rol: ${p.rol === 'admin' ? 'Admin' : 'Empleado'}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`badge text-[9px] ${p.rol === 'admin' ? 'badge-orange' : 'badge-gray'}`}>
                  {p.rol === 'admin' ? 'Admin' : 'Empleado'}
                </span>
                <button
                  onClick={() => toggleEstadoEmpleado(p.id, p.activo)}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-colors ${p.activo ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-500/20 text-red-500'}`}
                >
                  {p.activo ? 'Activo' : 'Inactivo'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para agregar empleado */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-4 flex items-center justify-center fade-in">
          <div className="w-full max-w-sm bg-card rounded-2xl shadow-xl slide-up my-auto flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-app flex-shrink-0">
              <h3 className="font-bold text-app text-base flex items-center gap-2">
                <UserPlus size={18} className="text-orange-500" />
                Nuevo Empleado
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-sub hover:text-app transition-colors p-1 rounded-lg hover:bg-muted"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="flex-1 overflow-y-auto scroll-mobile p-5 space-y-3">
              <div>
                <label className="text-xs font-semibold text-sub uppercase tracking-wider block mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Pedro Pérez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-sub uppercase tracking-wider block mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  required
                  placeholder="empleado@minimarket.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-sub uppercase tracking-wider block mb-1">
                  Contraseña inicial
                </label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-sub uppercase tracking-wider block mb-1">
                  Rol del usuario
                </label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  className="input"
                >
                  <option value="employee">Empleado (Caja / Arqueos)</option>
                  <option value="admin">Administrador (Acceso total)</option>
                </select>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 text-xs">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary flex-1"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
