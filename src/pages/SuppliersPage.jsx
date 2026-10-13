import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Search, Pencil, Trash2, X, Loader2, Truck, Save, Phone, Mail, MapPin } from 'lucide-react'

const EMPTY_FORM = {
  nombre: '', rif: '', telefono: '', email: '', direccion: '', notas: '', activo: true,
}

function ProveedorForm({ proveedor, onClose, onSave }) {
  const [form, setForm] = useState(proveedor ?? EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return }
    setSaving(true)
    setError(null)

    let err
    if (proveedor?.id) {
      ;({ error: err } = await supabase.from('proveedores').update(form).eq('id', proveedor.id))
    } else {
      ;({ error: err } = await supabase.from('proveedores').insert(form))
    }
    setSaving(false)
    if (err) { setError(err.message); return }
    onSave()
    onClose()
  }

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-4 flex items-end sm:items-center justify-center fade-in">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-card rounded-2xl shadow-app-lg slide-up flex flex-col my-auto max-h-[88vh] sm:max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-app flex-shrink-0">
          <h2 className="font-black text-app text-lg">
            {proveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </h2>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-sub hover:text-app transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scroll-mobile px-5 py-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-sub uppercase tracking-wider mb-1.5 block">Nombre / Razón Social *</label>
            <input className="input" required value={form.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Distribuidora, proveedor..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-sub uppercase tracking-wider mb-1.5 block">RIF</label>
              <input className="input" value={form.rif} onChange={(e) => set('rif', e.target.value)} placeholder="J-00000000-0" />
            </div>
            <div>
              <label className="text-xs font-semibold text-sub uppercase tracking-wider mb-1.5 block">Teléfono</label>
              <input className="input" value={form.telefono} onChange={(e) => set('telefono', e.target.value)} placeholder="0414-0000000" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-sub uppercase tracking-wider mb-1.5 block">Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="correo@ejemplo.com" />
          </div>

          <div>
            <label className="text-xs font-semibold text-sub uppercase tracking-wider mb-1.5 block">Dirección</label>
            <input className="input" value={form.direccion} onChange={(e) => set('direccion', e.target.value)} placeholder="Dirección del proveedor" />
          </div>

          <div>
            <label className="text-xs font-semibold text-sub uppercase tracking-wider mb-1.5 block">Notas</label>
            <textarea className="input resize-none" rows={2} value={form.notas} onChange={(e) => set('notas', e.target.value)} placeholder="Observaciones..." />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-muted">
            <div>
              <p className="text-sm font-semibold text-app">Proveedor activo</p>
              <p className="text-[11px] text-sub">Aparecerá disponible al crear órdenes de compra</p>
            </div>
            <button
              type="button"
              onClick={() => set('activo', !form.activo)}
              className={`w-12 h-6 rounded-full transition-colors relative ${form.activo ? 'bg-orange-500' : 'bg-border'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.activo ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-app flex-shrink-0 bg-card">
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? <><Loader2 size={18} className="animate-spin" /> Guardando...</> : <><Save size={18} /> Guardar Proveedor</>}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function SuppliersPage() {
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editando, setEditando] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const cargar = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('proveedores').select('*').order('nombre')
    if (search) q = q.ilike('nombre', `%${search}%`)
    const { data } = await q
    setProveedores(data ?? [])
    setLoading(false)
  }, [search])

  useEffect(() => { cargar() }, [cargar])

  const desactivar = async (id) => {
    if (!confirm('¿Desactivar este proveedor?')) return
    await supabase.from('proveedores').update({ activo: false }).eq('id', id)
    cargar()
  }

  return (
    <div className="flex flex-col h-full" style={{ paddingBottom: '5rem' }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-black text-app">Proveedores</h1>
          <button onClick={() => { setEditando(null); setShowForm(true) }} className="btn-primary py-2 px-4 text-sm">
            <Plus size={16} /> Nuevo Proveedor
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sub" size={16} />
          <input
            className="input pl-9 text-sm"
            placeholder="Buscar proveedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto scroll-mobile px-4">
        {loading ? (
          <div className="space-y-2 mt-2">
            {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
          </div>
        ) : proveedores.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Truck className="text-orange-300 mb-3" size={48} />
            <p className="text-app font-semibold">Sin proveedores</p>
            <p className="text-sub text-sm mt-1">Registra tu primer proveedor</p>
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            {proveedores.map((p) => (
              <div key={p.id} className={`card p-4 ${!p.activo ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-app truncate">{p.nombre}</p>
                      {!p.activo && <span className="badge badge-gray">Inactivo</span>}
                    </div>
                    {p.rif && (
                      <p className="text-[11px] text-sub mb-1">RIF: {p.rif}</p>
                    )}
                    <div className="flex flex-wrap gap-3 text-[11px] text-sub">
                      {p.telefono && (
                        <span className="flex items-center gap-1">
                          <Phone size={10} /> {p.telefono}
                        </span>
                      )}
                      {p.email && (
                        <span className="flex items-center gap-1">
                          <Mail size={10} /> {p.email}
                        </span>
                      )}
                      {p.direccion && (
                        <span className="flex items-center gap-1">
                          <MapPin size={10} /> {p.direccion}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => { setEditando(p); setShowForm(true) }}
                      className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sub hover:text-orange-500 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    {p.activo && (
                      <button
                        onClick={() => desactivar(p.id)}
                        className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sub hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <ProveedorForm
          proveedor={editando}
          onClose={() => setShowForm(false)}
          onSave={cargar}
        />
      )}
    </div>
  )
}
