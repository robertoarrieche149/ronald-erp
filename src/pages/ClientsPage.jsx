import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Search, Pencil, X, Loader2, Users, CreditCard, Save, AlertTriangle } from 'lucide-react'
import { useTasaStore } from '../stores/useTasaStore'

const EMPTY_FORM = {
  nombre: '', telefono: '', cedula: '', email: '',
  tiene_credito: false, limite_credito_usd: '', activo: true,
}

function ClienteForm({ cliente, onClose, onSave }) {
  const [form, setForm] = useState(cliente ?? EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return }
    setSaving(true)
    const payload = {
      ...form,
      limite_credito_usd: parseFloat(form.limite_credito_usd) || 0,
    }
    let err
    if (cliente?.id) {
      ;({ error: err } = await supabase.from('clientes').update(payload).eq('id', cliente.id))
    } else {
      ;({ error: err } = await supabase.from('clientes').insert(payload))
    }
    setSaving(false)
    if (err) { setError(err.message); return }
    onSave(); onClose()
  }

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-4 flex items-end sm:items-center justify-center fade-in">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-card rounded-2xl shadow-app-lg slide-up flex flex-col my-auto max-h-[85vh] sm:max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-app flex-shrink-0">
          <h2 className="font-black text-app text-lg">{cliente ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-sub hover:text-app transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scroll-mobile px-5 py-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-sub uppercase tracking-wider mb-1.5 block">Nombre *</label>
            <input className="input" required value={form.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Nombre completo" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-sub uppercase tracking-wider mb-1.5 block">Cédula</label>
              <input className="input" value={form.cedula} onChange={(e) => set('cedula', e.target.value)} placeholder="V-00000000" />
            </div>
            <div>
              <label className="text-xs font-semibold text-sub uppercase tracking-wider mb-1.5 block">Teléfono</label>
              <input className="input" value={form.telefono} onChange={(e) => set('telefono', e.target.value)} placeholder="04XX-XXXXXXX" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-sub uppercase tracking-wider mb-1.5 block">Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="cliente@email.com" />
          </div>

          {/* Crédito */}
          <div className="p-3 rounded-xl bg-muted">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-app">Habilitar Crédito</p>
                <p className="text-[11px] text-sub">Permite ventas a crédito a este cliente</p>
              </div>
              <button
                type="button"
                onClick={() => set('tiene_credito', !form.tiene_credito)}
                className={`w-12 h-6 rounded-full transition-colors relative ${form.tiene_credito ? 'bg-orange-500' : 'bg-border'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.tiene_credito ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            {form.tiene_credito && (
              <div>
                <label className="text-xs font-semibold text-sub uppercase tracking-wider mb-1.5 block">Límite de Crédito (USD)</label>
                <input
                  className="input" type="number" step="0.01" min="0"
                  value={form.limite_credito_usd}
                  onChange={(e) => set('limite_credito_usd', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-app flex-shrink-0 bg-card">
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? <><Loader2 size={18} className="animate-spin" /> Guardando...</> : <><Save size={18} /> Guardar Cliente</>}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function ClientsPage() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editando, setEditando] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const { formatUsd } = useTasaStore()

  const cargar = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('clientes').select('*').eq('activo', true).order('nombre')
    if (search) q = q.or(`nombre.ilike.%${search}%,cedula.ilike.%${search}%`)
    const { data } = await q
    setClientes(data ?? [])
    setLoading(false)
  }, [search])

  useEffect(() => { cargar() }, [cargar])

  return (
    <div className="flex flex-col h-full" style={{ paddingBottom: '5rem' }}>
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-black text-app">Clientes</h1>
          <button onClick={() => { setEditando(null); setShowForm(true) }} className="btn-primary py-2 px-4 text-sm">
            <Plus size={16} /> Nuevo
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sub" size={16} />
          <input
            className="input pl-9 text-sm"
            placeholder="Buscar por nombre o cédula..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-mobile px-4">
        {loading ? (
          <div className="space-y-2 mt-2">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
          </div>
        ) : clientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="text-orange-300 mb-3" size={48} />
            <p className="text-app font-semibold">Sin clientes registrados</p>
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            {clientes.map((c) => (
              <div key={c.id} className="card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-app">{c.nombre}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {c.cedula && <span className="text-[11px] text-sub">CI: {c.cedula}</span>}
                      {c.telefono && <span className="text-[11px] text-sub">📞 {c.telefono}</span>}
                    </div>
                    {c.tiene_credito && (
                      <div className="flex items-center gap-2 mt-2">
                        <CreditCard size={13} className="text-orange-500" />
                        <span className="text-xs font-semibold text-sub">
                          Saldo pendiente:
                          <span className={`ml-1 font-bold ${c.saldo_credito_usd > 0 ? 'text-red-400' : 'text-green-500'}`}>
                            {formatUsd(c.saldo_credito_usd)}
                          </span>
                        </span>
                        {c.saldo_credito_usd > c.limite_credito_usd && (
                          <AlertTriangle size={13} className="text-red-400" />
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => { setEditando(c); setShowForm(true) }}
                    className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sub hover:text-orange-500 transition-colors flex-shrink-0"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <ClienteForm
          cliente={editando}
          onClose={() => setShowForm(false)}
          onSave={cargar}
        />
      )}
    </div>
  )
}
