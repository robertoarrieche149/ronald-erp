import { useState, useEffect } from 'react'
import { X, Plus, Pencil, Trash2, Check, Loader2, Tags, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function CategoryManagerModal({ onClose, onUpdated }) {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [nombreNueva, setNombreNueva] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)
  const [editandoId, setEditandoId] = useState(null)
  const [editNombre, setEditNombre] = useState('')

  const cargarCategorias = async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('categorias')
      .select('*')
      .order('orden', { ascending: true })
      .order('nombre', { ascending: true })
    if (err) setError(err.message)
    else setCategorias(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    cargarCategorias()
  }, [])

  const handleCrear = async (e) => {
    e.preventDefault()
    if (!nombreNueva.trim()) return
    setGuardando(true)
    setError(null)

    const nuevoOrden = categorias.length > 0
      ? Math.max(...categorias.map(c => c.orden || 0)) + 1
      : 1

    const { error: err } = await supabase
      .from('categorias')
      .insert({
        nombre: nombreNueva.trim(),
        activa: true,
        orden: nuevoOrden,
      })

    setGuardando(false)
    if (err) {
      setError(err.message)
      return
    }

    setNombreNueva('')
    await cargarCategorias()
    onUpdated?.()
  }

  const handleToggleActiva = async (cat) => {
    const { error: err } = await supabase
      .from('categorias')
      .update({ activa: !cat.activa })
      .eq('id', cat.id)
    if (err) {
      setError(err.message)
      return
    }
    await cargarCategorias()
    onUpdated?.()
  }

  const handleGuardarEdicion = async (id) => {
    if (!editNombre.trim()) return
    const { error: err } = await supabase
      .from('categorias')
      .update({ nombre: editNombre.trim() })
      .eq('id', id)
    if (err) {
      setError(err.message)
      return
    }
    setEditandoId(null)
    await cargarCategorias()
    onUpdated?.()
  }

  const handleEliminar = async (cat) => {
    if (!confirm(`¿Eliminar la categoría "${cat.nombre}"? Si hay productos asociados, no se podrá eliminar.`)) return
    const { error: err } = await supabase
      .from('categorias')
      .delete()
      .eq('id', cat.id)
    if (err) {
      alert(`No se puede eliminar la categoría: ${err.message}`)
      return
    }
    await cargarCategorias()
    onUpdated?.()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-4 flex items-end sm:items-center justify-center fade-in">
      <div className="w-full max-w-lg bg-card rounded-2xl shadow-app-lg slide-up flex flex-col my-auto max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-app flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500">
              <Tags size={18} />
            </div>
            <div>
              <h2 className="font-black text-app text-lg">Categorías</h2>
              <p className="text-xs text-sub">Organiza tus productos en el POS e Inventario</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-sub hover:text-app transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario rápido para nueva categoría */}
        <div className="p-4 border-b border-app bg-surface">
          <form onSubmit={handleCrear} className="flex gap-2">
            <input
              type="text"
              className="input flex-1 text-sm py-2"
              placeholder="Nueva categoría (ej: Bebidas, Snacks)..."
              value={nombreNueva}
              onChange={(e) => setNombreNueva(e.target.value)}
              disabled={guardando}
            />
            <button
              type="submit"
              disabled={guardando || !nombreNueva.trim()}
              className="btn-primary py-2 px-4 text-sm flex-shrink-0"
            >
              {guardando ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Plus size={16} /> Agregar
                </>
              )}
            </button>
          </form>
          {error && (
            <p className="text-xs text-red-500 mt-2 font-medium">{error}</p>
          )}
        </div>

        {/* Lista de categorías */}
        <div className="flex-1 overflow-y-auto scroll-mobile p-4 space-y-2">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton h-12 rounded-xl" />
              ))}
            </div>
          ) : categorias.length === 0 ? (
            <div className="text-center py-8">
              <Tags className="mx-auto text-orange-300 mb-2" size={36} />
              <p className="text-sub text-sm">No hay categorías registradas</p>
            </div>
          ) : (
            categorias.map((cat) => {
              const esEditando = editandoId === cat.id
              return (
                <div
                  key={cat.id}
                  className={`card p-3 flex items-center justify-between gap-2 transition-all ${
                    !cat.activa ? 'opacity-50 bg-muted/50' : ''
                  }`}
                >
                  {esEditando ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        className="input py-1 text-sm flex-1"
                        value={editNombre}
                        onChange={(e) => setEditNombre(e.target.value)}
                        autoFocus
                      />
                      <button
                        onClick={() => handleGuardarEdicion(cat.id)}
                        className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditandoId(null)}
                        className="w-8 h-8 rounded-lg bg-muted text-sub flex items-center justify-center hover:text-app transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-[11px] font-bold text-sub">
                          {cat.orden || '•'}
                        </span>
                        <span className="text-sm font-semibold text-app truncate">
                          {cat.nombre}
                        </span>
                        {!cat.activa && (
                          <span className="badge badge-gray text-[10px]">Oculta</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Activar/Desactivar */}
                        <button
                          type="button"
                          onClick={() => handleToggleActiva(cat)}
                          title={cat.activa ? 'Ocultar categoría' : 'Mostrar categoría'}
                          className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sub hover:text-orange-500 transition-colors"
                        >
                          {cat.activa ? <Eye size={15} /> : <EyeOff size={15} />}
                        </button>

                        {/* Editar nombre */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditandoId(cat.id)
                            setEditNombre(cat.nombre)
                          }}
                          className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sub hover:text-app transition-colors"
                        >
                          <Pencil size={15} />
                        </button>

                        {/* Eliminar */}
                        <button
                          type="button"
                          onClick={() => handleEliminar(cat)}
                          className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sub hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-app flex-shrink-0 bg-card text-right">
          <button onClick={onClose} className="btn-secondary py-2 px-5 text-sm">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
