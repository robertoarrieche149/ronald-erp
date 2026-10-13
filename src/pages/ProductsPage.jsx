import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Plus, Search, Pencil, Trash2, X, Loader2, Package, Save, TrendingUp, Tags, ShoppingBag, Truck } from 'lucide-react'
import { useTasaStore } from '../stores/useTasaStore'
import CategoryManagerModal from '../components/inventory/CategoryManagerModal'

const EMPTY_FORM = {
  nombre: '', descripcion: '', precio_usd: '', costo_usd: '', stock: '', stock_minimo: 5,
  codigo_barras: '', unidad: 'und', disponible: true, id_categoria: '',
}

function ProductForm({ producto, categorias, onClose, onSave, onOpenCategoryModal }) {
  const [form, setForm] = useState(producto ?? EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const { formatVes, tasa } = useTasaStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const payload = {
      ...form,
      precio_usd: parseFloat(form.precio_usd) || 0,
      costo_usd: parseFloat(form.costo_usd) || 0,
      stock: parseInt(form.stock) || 0,
      stock_minimo: parseInt(form.stock_minimo) || 5,
      id_categoria: form.id_categoria || null,
    }
    let error
    if (producto?.id) {
      ;({ error } = await supabase.from('productos').update(payload).eq('id', producto.id))
    } else {
      ;({ error } = await supabase.from('productos').insert(payload))
    }
    setSaving(false)
    if (error) { setError(error.message); return }
    onSave()
    onClose()
  }

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }))

  const precioNum = parseFloat(form.precio_usd) || 0
  const costoNum = parseFloat(form.costo_usd) || 0
  const margen = precioNum > 0 && costoNum > 0
    ? (((precioNum - costoNum) / costoNum) * 100).toFixed(1)
    : null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-4 flex items-end sm:items-center justify-center fade-in">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-card rounded-2xl shadow-app-lg slide-up flex flex-col my-auto max-h-[88vh] sm:max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-app flex-shrink-0">
          <h2 className="font-black text-app text-lg">
            {producto ? 'Editar Producto' : 'Agregar Producto'}
          </h2>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-sub hover:text-app transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scroll-mobile px-5 py-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-sub uppercase tracking-wider mb-1.5 block">Nombre *</label>
            <input className="input" required value={form.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Nombre del producto" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-sub uppercase tracking-wider mb-1.5 block">Precio Venta USD *</label>
              <input
                className="input" type="number" step="0.01" min="0" required
                value={form.precio_usd}
                onChange={(e) => set('precio_usd', e.target.value)}
                placeholder="0.00"
              />
              {precioNum > 0 && (
                <p className="text-[11px] text-sub mt-1">≈ {formatVes(precioNum)}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-sub uppercase tracking-wider mb-1.5 block">Costo USD</label>
              <input
                className="input" type="number" step="0.01" min="0"
                value={form.costo_usd}
                onChange={(e) => set('costo_usd', e.target.value)}
                placeholder="0.00"
              />
              {margen !== null && (
                <p className={`text-[11px] mt-1 font-semibold ${parseFloat(margen) > 0 ? 'text-green-500' : 'text-red-400'}`}>
                  Margen: {margen}%
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-sub uppercase tracking-wider mb-1.5 block">Stock actual</label>
              <input
                className="input" type="number" min="0"
                value={form.stock}
                onChange={(e) => set('stock', e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-sub uppercase tracking-wider mb-1.5 block">Stock mínimo</label>
              <input
                className="input" type="number" min="0"
                value={form.stock_minimo}
                onChange={(e) => set('stock_minimo', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-sub uppercase tracking-wider mb-1.5 block">Unidad</label>
              <select className="input" value={form.unidad} onChange={(e) => set('unidad', e.target.value)}>
                {['und', 'kg', 'g', 'lt', 'ml', 'caja', 'paq', 'bolsa'].map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-sub uppercase tracking-wider block">Categoría</label>
                {onOpenCategoryModal && (
                  <button
                    type="button"
                    onClick={onOpenCategoryModal}
                    className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-0.5"
                  >
                    <Plus size={13} /> Nueva
                  </button>
                )}
              </div>
              <select className="input" value={form.id_categoria} onChange={(e) => set('id_categoria', e.target.value)}>
                <option value="">Sin categoría</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-sub uppercase tracking-wider mb-1.5 block">Código de barras</label>
            <input className="input" value={form.codigo_barras} onChange={(e) => set('codigo_barras', e.target.value)} placeholder="Escanear o ingresar" />
          </div>

          <div>
            <label className="text-xs font-semibold text-sub uppercase tracking-wider mb-1.5 block">Descripción</label>
            <textarea className="input resize-none" rows={2} value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} placeholder="Descripción opcional..." />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-muted">
            <div>
              <p className="text-sm font-semibold text-app">Disponible para venta</p>
              <p className="text-[11px] text-sub">Se mostrará en el POS</p>
            </div>
            <button
              type="button"
              onClick={() => set('disponible', !form.disponible)}
              className={`w-12 h-6 rounded-full transition-colors relative ${form.disponible ? 'bg-orange-500' : 'bg-border'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.disponible ? 'left-7' : 'left-1'}`} />
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
            {saving ? <><Loader2 size={18} className="animate-spin" /> Guardando...</> : <><Save size={18} /> Guardar Producto</>}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function ProductsPage() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editando, setEditando] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showCategoriasModal, setShowCategoriasModal] = useState(false)
  const [catFiltro, setCatFiltro] = useState(null)
  const { formatUsd } = useTasaStore()

  const cargar = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('productos').select('*, categorias(nombre)').order('nombre')
    if (search) q = q.ilike('nombre', `%${search}%`)
    if (catFiltro) q = q.eq('id_categoria', catFiltro)
    const [prodRes, catRes] = await Promise.all([
      q,
      supabase.from('categorias').select('id, nombre, orden').order('orden', { ascending: true })
    ])
    setProductos(prodRes.data ?? [])
    setCategorias(catRes.data ?? [])
    setLoading(false)
  }, [search, catFiltro])

  useEffect(() => { cargar() }, [cargar])

  const eliminar = async (id) => {
    if (!confirm('¿Deseas desactivar este producto? Ya no aparecerá en el POS.')) return
    await supabase.from('productos').update({ disponible: false }).eq('id', id)
    cargar()
  }

  const eliminarPermanente = async (id) => {
    if (!confirm('⚠️ ¿Eliminar PERMANENTEMENTE este producto? Esta acción no se puede deshacer.')) return
    const { error } = await supabase.from('productos').delete().eq('id', id)
    if (error) {
      alert('No se puede eliminar: este producto tiene ventas o arqueos asociados.')
      return
    }
    cargar()
  }

  return (
    <div className="flex flex-col h-full" style={{ paddingBottom: '5rem' }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3 gap-2">
          <div>
            <h1 className="text-xl font-black text-app">Inventario</h1>
            <p className="text-xs text-sub">Catálogo general y stock disponible</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCategoriasModal(true)}
              className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5"
              title="Gestionar categorías"
            >
              <Tags size={15} className="text-orange-500" />
              <span>Categorías</span>
            </button>
            <button
              onClick={() => { setEditando(null); setShowForm(true) }}
              className="btn-primary py-2 px-3 text-xs flex items-center gap-1.5"
            >
              <Plus size={15} />
              <span>Agregar Producto</span>
            </button>
          </div>
        </div>

        {/* Accesos rápidos a Órdenes y Proveedores */}
        <div className="flex items-center gap-2 mb-3">
          <Link
            to="/compras"
            className="flex-1 py-1.5 px-3 rounded-xl bg-card border border-app hover:border-orange-500/50 flex items-center justify-center gap-1.5 text-xs font-semibold text-sub hover:text-orange-500 transition-colors"
          >
            <ShoppingBag size={14} className="text-orange-500" />
            <span>Órdenes de Compra</span>
          </Link>
          <Link
            to="/proveedores"
            className="flex-1 py-1.5 px-3 rounded-xl bg-card border border-app hover:border-orange-500/50 flex items-center justify-center gap-1.5 text-xs font-semibold text-sub hover:text-orange-500 transition-colors"
          >
            <Truck size={14} className="text-blue-500" />
            <span>Proveedores</span>
          </Link>
        </div>

        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sub" size={16} />
          <input
            className="input pl-9 text-sm"
            placeholder="Buscar en inventario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filtros de categoría */}
        {categorias.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scroll-mobile items-center">
            <button
              onClick={() => setCatFiltro(null)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                !catFiltro ? 'bg-orange-500 text-white shadow-sm' : 'bg-muted text-sub'
              }`}
            >
              Todos
            </button>
            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCatFiltro(catFiltro === cat.id ? null : cat.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  catFiltro === cat.id ? 'bg-orange-500 text-white shadow-sm' : 'bg-muted text-sub'
                }`}
              >
                {cat.nombre}
              </button>
            ))}
            <button
              onClick={() => setShowCategoriasModal(true)}
              className="flex-shrink-0 px-2 py-1.5 rounded-xl text-xs font-semibold text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors flex items-center gap-1"
              title="Nueva categoría"
            >
              <Plus size={14} /> Nueva
            </button>
          </div>
        )}
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto scroll-mobile px-4">
        {loading ? (
          <div className="space-y-2 mt-2">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
          </div>
        ) : productos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="text-orange-300 mb-3" size={48} />
            <p className="text-app font-semibold">Inventario vacío</p>
            <p className="text-sub text-sm mt-1">Agrega tu primer producto al inventario</p>
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            {productos.map((p) => (
              <div key={p.id} className={`card p-3 ${!p.disponible ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center flex-shrink-0">
                    {p.imagen_url ? (
                      <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <Package size={20} className="text-orange-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-sm font-bold text-app truncate">{p.nombre}</p>
                      {!p.disponible && <span className="badge badge-gray flex-shrink-0">Inactivo</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-orange-500 font-bold text-sm">{formatUsd(p.precio_usd)}</span>
                      {p.costo_usd > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] font-semibold text-green-500">
                          <TrendingUp size={10} />
                          {(((p.precio_usd - p.costo_usd) / p.costo_usd) * 100).toFixed(0)}%
                        </span>
                      )}
                      {p.categorias && <span className="badge badge-gray text-[10px]">{p.categorias.nombre}</span>}
                      <span className={`text-[11px] font-medium ${p.stock <= p.stock_minimo ? 'text-red-400' : 'text-sub'}`}>
                        Stock: {p.stock} {p.unidad}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => { setEditando(p); setShowForm(true) }}
                      className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sub hover:text-orange-500 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => p.disponible ? eliminar(p.id) : eliminarPermanente(p.id)}
                      className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sub hover:text-red-400 transition-colors"
                      title={p.disponible ? 'Desactivar' : 'Eliminar permanentemente'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <ProductForm
          producto={editando}
          categorias={categorias}
          onClose={() => setShowForm(false)}
          onSave={cargar}
          onOpenCategoryModal={() => setShowCategoriasModal(true)}
        />
      )}

      {showCategoriasModal && (
        <CategoryManagerModal
          onClose={() => setShowCategoriasModal(false)}
          onUpdated={cargar}
        />
      )}
    </div>
  )
}
