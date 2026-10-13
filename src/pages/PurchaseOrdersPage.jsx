import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/useAuthStore'
import { useTasaStore } from '../stores/useTasaStore'
import {
  Plus, Search, X, Loader2, Save, ShoppingBag, Trash2,
  PackageCheck, FileText, ChevronRight, AlertCircle,
} from 'lucide-react'

const ESTADOS = {
  borrador: { label: 'Borrador', color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
  confirmada: { label: 'Confirmada', color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
  recibida: { label: 'Recibida', color: 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400' },
  cancelada: { label: 'Cancelada', color: 'bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-400' },
}

function EstadoBadge({ estado }) {
  const cfg = ESTADOS[estado] ?? ESTADOS.borrador
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
}

// ─── Formulario de nueva orden ───
function OrdenForm({ onClose, onSave }) {
  const user = useAuthStore((s) => s.user)
  const { formatUsd } = useTasaStore()
  const [proveedores, setProveedores] = useState([])
  const [productos, setProductos] = useState([])
  const [idProveedor, setIdProveedor] = useState('')
  const [fechaEsperada, setFechaEsperada] = useState('')
  const [notas, setNotas] = useState('')
  const [lineas, setLineas] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cargar = async () => {
      const [pRes, prRes] = await Promise.all([
        supabase.from('productos').select('id, nombre, costo_usd, precio_usd').eq('disponible', true).order('nombre'),
        supabase.from('proveedores').select('id, nombre').eq('activo', true).order('nombre'),
      ])
      setProductos(pRes.data ?? [])
      setProveedores(prRes.data ?? [])
    }
    cargar()
  }, [])

  const addLinea = () => {
    setLineas((prev) => [...prev, { key: Date.now(), id_producto: '', cantidad_pedida: 1, costo_unitario_usd: '' }])
  }

  const updateLinea = (key, changes) => {
    setLineas((prev) => prev.map((l) => l.key === key ? { ...l, ...changes } : l))
  }

  const removeLinea = (key) => {
    setLineas((prev) => prev.filter((l) => l.key !== key))
  }

  const totalOrden = lineas.reduce((acc, l) => {
    return acc + (parseInt(l.cantidad_pedida) || 0) * (parseFloat(l.costo_unitario_usd) || 0)
  }, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!idProveedor) { setError('Selecciona un proveedor'); return }
    if (lineas.length === 0) { setError('Agrega al menos un producto'); return }
    for (const l of lineas) {
      if (!l.id_producto) { setError('Todos los productos deben estar seleccionados'); return }
      if (!l.cantidad_pedida || parseInt(l.cantidad_pedida) <= 0) { setError('La cantidad debe ser mayor a 0'); return }
      if (!l.costo_unitario_usd || parseFloat(l.costo_unitario_usd) <= 0) { setError('El costo debe ser mayor a 0'); return }
    }

    setSaving(true)
    setError(null)

    try {
      // 1. Crear la orden
      const { data: orden, error: ordErr } = await supabase
        .from('ordenes_compra')
        .insert({
          id_proveedor: parseInt(idProveedor),
          registrado_por: user.id,
          estado: 'borrador',
          total_usd: totalOrden,
          notas: notas || null,
          fecha_esperada: fechaEsperada || null,
        })
        .select()
        .single()
      if (ordErr) throw ordErr

      // 2. Insertar líneas
      const detalles = lineas.map((l) => ({
        id_orden: orden.id,
        id_producto: parseInt(l.id_producto),
        cantidad_pedida: parseInt(l.cantidad_pedida),
        costo_unitario_usd: parseFloat(l.costo_unitario_usd),
      }))
      const { error: detErr } = await supabase.from('detalles_orden_compra').insert(detalles)
      if (detErr) throw detErr

      onSave()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-4 flex items-end sm:items-center justify-center fade-in">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-card rounded-2xl shadow-app-lg slide-up flex flex-col my-auto max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-app flex-shrink-0">
          <h2 className="font-black text-app text-lg">Nueva Orden de Compra</h2>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-sub hover:text-app transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scroll-mobile px-5 py-4 space-y-4">
          {/* Proveedor */}
          <div>
            <label className="text-xs font-semibold text-sub uppercase tracking-wider mb-1.5 block">Proveedor *</label>
            <select className="input" value={idProveedor} onChange={(e) => setIdProveedor(e.target.value)} required>
              <option value="">Seleccionar proveedor</option>
              {proveedores.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-sub uppercase tracking-wider mb-1.5 block">Fecha esperada de entrega</label>
            <input type="date" className="input" value={fechaEsperada} onChange={(e) => setFechaEsperada(e.target.value)} />
          </div>

          {/* Líneas de productos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-sub uppercase tracking-wider">Productos</label>
              <button type="button" onClick={addLinea} className="text-orange-500 text-xs font-bold flex items-center gap-1 hover:text-orange-600 transition-colors">
                <Plus size={14} /> Agregar línea
              </button>
            </div>

            {lineas.length === 0 ? (
              <div className="text-center py-6 text-sub text-sm bg-muted rounded-xl">
                <ShoppingBag className="mx-auto mb-2 text-orange-300" size={28} />
                Agrega productos a la orden
              </div>
            ) : (
              <div className="space-y-2">
                {lineas.map((l) => (
                  <div key={l.key} className="card p-3 relative">
                    <button
                      type="button"
                      onClick={() => removeLinea(l.key)}
                      className="absolute top-2 right-2 text-muted hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                    <div className="pr-5 mb-2">
                      <select
                        className="input text-sm"
                        value={l.id_producto}
                        onChange={(e) => {
                          const prod = productos.find((p) => p.id === parseInt(e.target.value))
                          updateLinea(l.key, {
                            id_producto: e.target.value,
                            costo_unitario_usd: prod?.costo_usd || '',
                          })
                        }}
                      >
                        <option value="">Seleccionar producto</option>
                        {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-sub font-semibold block mb-1">Cantidad</label>
                        <input
                          type="number" min="1" className="input text-sm"
                          value={l.cantidad_pedida}
                          onChange={(e) => updateLinea(l.key, { cantidad_pedida: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-sub font-semibold block mb-1">Costo USD</label>
                        <input
                          type="number" step="0.01" min="0" className="input text-sm"
                          value={l.costo_unitario_usd}
                          onChange={(e) => updateLinea(l.key, { costo_unitario_usd: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-sub uppercase tracking-wider mb-1.5 block">Notas</label>
            <textarea className="input resize-none" rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Observaciones de la orden..." />
          </div>

          {/* Total */}
          {lineas.length > 0 && (
            <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-between">
              <span className="text-sm font-semibold text-app">Total estimado</span>
              <span className="text-lg font-black text-orange-500">{formatUsd(totalOrden)}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-app flex-shrink-0 bg-card">
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? <><Loader2 size={18} className="animate-spin" /> Creando...</> : <><Save size={18} /> Crear Orden</>}
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Modal de recepción de mercancía ───
function RecibirModal({ orden, onClose, onSave }) {
  const [detalles, setDetalles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase
        .from('detalles_orden_compra')
        .select('*, productos(nombre)')
        .eq('id_orden', orden.id)
      setDetalles((data ?? []).map((d) => ({ ...d, cantidad_recibida: d.cantidad_pedida })))
      setLoading(false)
    }
    cargar()
  }, [orden.id])

  const updateCantidad = (id, val) => {
    setDetalles((prev) => prev.map((d) => d.id === id ? { ...d, cantidad_recibida: parseInt(val) || 0 } : d))
  }

  const handleRecibir = async () => {
    setSaving(true)
    setError(null)
    try {
      // 1. Actualizar cantidades recibidas en cada detalle
      for (const d of detalles) {
        await supabase.from('detalles_orden_compra')
          .update({ cantidad_recibida: d.cantidad_recibida })
          .eq('id', d.id)
      }
      // 2. Cambiar estado a 'recibida' → el trigger suma stock
      const { error: err } = await supabase
        .from('ordenes_compra')
        .update({ estado: 'recibida' })
        .eq('id', orden.id)
      if (err) throw err
      onSave()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-4 flex items-end sm:items-center justify-center fade-in">
      <div className="w-full max-w-lg bg-card rounded-2xl shadow-app-lg slide-up flex flex-col my-auto max-h-[88vh] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-app flex-shrink-0">
          <h2 className="font-black text-app text-lg">Recibir Mercancía</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-sub hover:text-app transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scroll-mobile px-5 py-4 space-y-3">
          <p className="text-sm text-sub">Ajusta las cantidades realmente recibidas por producto:</p>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          ) : (
            detalles.map((d) => (
              <div key={d.id} className="card p-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-app truncate">{d.productos?.nombre}</p>
                  <p className="text-[11px] text-sub">Pedidos: {d.cantidad_pedida}</p>
                </div>
                <div className="w-20">
                  <input
                    type="number" min="0" max={d.cantidad_pedida * 2}
                    className="input text-center text-sm font-bold"
                    value={d.cantidad_recibida}
                    onChange={(e) => updateCantidad(d.id, e.target.value)}
                  />
                </div>
              </div>
            ))
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-app flex-shrink-0 bg-card">
          <button onClick={handleRecibir} disabled={saving} className="btn-primary w-full">
            {saving
              ? <><Loader2 size={18} className="animate-spin" /> Procesando...</>
              : <><PackageCheck size={18} /> Confirmar Recepción</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Página principal de órdenes ───
export default function PurchaseOrdersPage() {
  const [ordenes, setOrdenes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [recibirOrden, setRecibirOrden] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState(null)
  const { formatUsd } = useTasaStore()

  const cargar = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('ordenes_compra')
      .select('*, proveedores(nombre)')
      .order('created_at', { ascending: false })
    if (filtroEstado) q = q.eq('estado', filtroEstado)
    const { data } = await q
    setOrdenes(data ?? [])
    setLoading(false)
  }, [filtroEstado])

  useEffect(() => { cargar() }, [cargar])

  const cambiarEstado = async (id, nuevoEstado) => {
    const msgs = {
      confirmada: '¿Confirmar esta orden de compra?',
      cancelada: '¿Cancelar esta orden? Esta acción no se puede deshacer.',
    }
    if (msgs[nuevoEstado] && !confirm(msgs[nuevoEstado])) return
    await supabase.from('ordenes_compra').update({ estado: nuevoEstado }).eq('id', id)
    cargar()
  }

  return (
    <div className="flex flex-col h-full" style={{ paddingBottom: '5rem' }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-black text-app">Órdenes de Compra</h1>
          <button onClick={() => setShowForm(true)} className="btn-primary py-2 px-4 text-sm">
            <Plus size={16} /> Nueva Orden
          </button>
        </div>

        {/* Filtros de estado */}
        <div className="flex gap-2 overflow-x-auto pb-1 scroll-mobile">
          <button
            onClick={() => setFiltroEstado(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              !filtroEstado ? 'bg-orange-500 text-white shadow-sm' : 'bg-muted text-sub'
            }`}
          >
            Todas
          </button>
          {Object.entries(ESTADOS).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setFiltroEstado(filtroEstado === key ? null : key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filtroEstado === key ? 'bg-orange-500 text-white shadow-sm' : 'bg-muted text-sub'
              }`}
            >
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto scroll-mobile px-4">
        {loading ? (
          <div className="space-y-2 mt-2">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
          </div>
        ) : ordenes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="text-orange-300 mb-3" size={48} />
            <p className="text-app font-semibold">Sin órdenes</p>
            <p className="text-sub text-sm mt-1">Crea tu primera orden de compra</p>
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            {ordenes.map((o) => (
              <div key={o.id} className="card p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-app">Orden #{o.id}</p>
                      <EstadoBadge estado={o.estado} />
                    </div>
                    <p className="text-[11px] text-sub">{o.proveedores?.nombre}</p>
                  </div>
                  <p className="text-sm font-black text-orange-500">{formatUsd(o.total_usd)}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-sub">
                  <span>{new Date(o.created_at).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  {o.fecha_esperada && <span>Entrega: {new Date(o.fecha_esperada + 'T12:00:00').toLocaleDateString('es-VE', { day: '2-digit', month: 'short' })}</span>}
                </div>

                {/* Acciones según estado */}
                {o.estado === 'borrador' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => cambiarEstado(o.id, 'confirmada')}
                      className="btn-primary flex-1 py-2 text-xs"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => cambiarEstado(o.id, 'cancelada')}
                      className="btn-secondary flex-1 py-2 text-xs text-red-400"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
                {o.estado === 'confirmada' && (
                  <button
                    onClick={() => setRecibirOrden(o)}
                    className="btn-primary w-full py-2 text-xs mt-3"
                  >
                    <PackageCheck size={14} /> Recibir Mercancía
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && <OrdenForm onClose={() => setShowForm(false)} onSave={cargar} />}
      {recibirOrden && <RecibirModal orden={recibirOrden} onClose={() => setRecibirOrden(null)} onSave={cargar} />}
    </div>
  )
}
