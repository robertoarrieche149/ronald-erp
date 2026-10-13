import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  TrendingUp, ShoppingBag, Users, DollarSign,
  ArrowUpRight, ArrowDownRight, Package, AlertTriangle,
  BarChart3, Truck, ClipboardList, ChevronRight,
} from 'lucide-react'
import { useTasaStore } from '../stores/useTasaStore'
import AdminReportsTab from '../components/admin/AdminReportsTab'

function StatCard({ title, value, sub, icon: Icon, trend, color = 'orange' }) {
  const colors = {
    orange: 'bg-orange-50 dark:bg-orange-500/10 text-orange-500',
    green: 'bg-green-50 dark:bg-green-500/10 text-green-500',
    blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-500',
    red: 'bg-red-50 dark:bg-red-500/10 text-red-500',
  }
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon size={20} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-bold ${trend >= 0 ? 'text-green-500' : 'text-red-400'}`}>
            {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-xl font-black text-app">{value}</p>
      <p className="text-xs text-sub mt-0.5">{title}</p>
      {sub && <p className="text-[11px] text-muted mt-0.5">{sub}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const { formatUsd } = useTasaStore()
  const [activeTab, setActiveTab] = useState('resumen')
  const [stats, setStats] = useState(null)
  const [ventasHoy, setVentasHoy] = useState([])
  const [stockBajo, setStockBajo] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarStats()
  }, [])

  const cargarStats = async () => {
    setLoading(true)
    const hoy = new Date().toISOString().split('T')[0]

    const [ventasRes, clientesRes, productosRes, stockRes, proveedoresRes, comprasRes] = await Promise.all([
      supabase
        .from('pedidos')
        .select('total_usd, created_at')
        .gte('created_at', `${hoy}T00:00:00`)
        .eq('estado_pago', 'pagado'),
      supabase.from('clientes').select('id', { count: 'exact', head: true }).eq('activo', true),
      supabase.from('productos').select('id', { count: 'exact', head: true }).eq('disponible', true),
      supabase.from('productos').select('id, nombre, stock, stock_minimo, unidad').filter('stock', 'lte', 'stock_minimo').eq('disponible', true).limit(5),
      supabase.from('proveedores').select('id', { count: 'exact', head: true }).eq('activo', true),
      supabase.from('ordenes_compra').select('id', { count: 'exact', head: true }).eq('estado', 'pendiente'),
    ])

    const totalHoy = (ventasRes.data ?? []).reduce((a, v) => a + (v.total_usd ?? 0), 0)
    setStats({
      totalHoy,
      cantidadVentasHoy: (ventasRes.data ?? []).length,
      totalClientes: clientesRes.count ?? 0,
      totalProductos: productosRes.count ?? 0,
      totalProveedores: proveedoresRes.count ?? 0,
      comprasPendientes: comprasRes.count ?? 0,
    })
    setVentasHoy(ventasRes.data ?? [])
    setStockBajo(stockRes.data ?? [])
    setLoading(false)
  }

  return (
    <div className="overflow-y-auto scroll-mobile px-4 pt-4" style={{ paddingBottom: '5rem' }}>
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-black text-app">Panel de Control</h1>
        <p className="text-sub text-xs mt-0.5">
          {new Date().toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Tabs superiores */}
      <div className="flex gap-2 p-1 bg-muted rounded-2xl mb-5">
        <button
          onClick={() => setActiveTab('resumen')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'resumen'
              ? 'bg-card text-orange-500 shadow-sm'
              : 'text-sub hover:text-app'
          }`}
        >
          <TrendingUp size={15} />
          <span>Resumen</span>
        </button>
        <button
          onClick={() => setActiveTab('reportes')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'reportes'
              ? 'bg-card text-orange-500 shadow-sm'
              : 'text-sub hover:text-app'
          }`}
        >
          <BarChart3 size={15} />
          <span>Reportes</span>
        </button>
        <button
          onClick={() => setActiveTab('operaciones')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'operaciones'
              ? 'bg-card text-orange-500 shadow-sm'
              : 'text-sub hover:text-app'
          }`}
        >
          <ShoppingBag size={15} />
          <span>Compras</span>
        </button>
      </div>

      {/* Contenido según la pestaña activa */}
      {activeTab === 'reportes' ? (
        <AdminReportsTab />
      ) : activeTab === 'operaciones' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center mb-2">
                <ShoppingBag size={20} />
              </div>
              <p className="text-xl font-black text-app">{stats?.comprasPendientes ?? 0}</p>
              <p className="text-xs text-sub mt-0.5">Órdenes pendientes</p>
            </div>
            <div className="card p-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2">
                <Truck size={20} />
              </div>
              <p className="text-xl font-black text-app">{stats?.totalProveedores ?? 0}</p>
              <p className="text-xs text-sub mt-0.5">Proveedores activos</p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xs font-bold text-sub uppercase tracking-wider mb-2">
              Gestión de Compras y Abastecimiento
            </h2>

            <Link
              to="/compras"
              className="card p-4 flex items-center justify-between hover:border-orange-500 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-app">Órdenes de Compra</p>
                  <p className="text-xs text-sub">Gestiona pedidos a proveedores e ingresos a stock</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-sub" />
            </Link>

            <Link
              to="/proveedores"
              className="card p-4 flex items-center justify-between hover:border-orange-500 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Truck size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-app">Directorio de Proveedores</p>
                  <p className="text-xs text-sub">Registro, teléfonos y datos fiscales de proveedores</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-sub" />
            </Link>

            <Link
              to="/arqueo"
              className="card p-4 flex items-center justify-between hover:border-orange-500 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-500 flex items-center justify-center">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-app">Cierre y Arqueo de Caja</p>
                  <p className="text-xs text-sub">Control de efectivo, descuadres y cortes por turno</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-sub" />
            </Link>
          </div>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <StatCard
              title="Ventas hoy"
              value={formatUsd(stats?.totalHoy ?? 0)}
              sub={`${stats?.cantidadVentasHoy} transacciones`}
              icon={TrendingUp}
              color="orange"
            />
            <StatCard
              title="Clientes"
              value={stats?.totalClientes ?? 0}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Productos activos"
              value={stats?.totalProductos ?? 0}
              icon={Package}
              color="green"
            />
            <StatCard
              title="Stock bajo"
              value={stockBajo.length}
              sub={stockBajo.length > 0 ? 'requieren atención' : 'todo en orden'}
              icon={AlertTriangle}
              color={stockBajo.length > 0 ? 'red' : 'green'}
            />
          </div>

          {/* Alertas stock bajo */}
          {stockBajo.length > 0 && (
            <div className="mb-5">
              <h2 className="text-sm font-bold text-app mb-2 flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-400" /> Productos con Stock Bajo
              </h2>
              <div className="space-y-2">
                {stockBajo.map((p) => (
                  <div key={p.id} className="card p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-app">{p.nombre}</p>
                      <p className="text-[11px] text-sub">Mínimo: {p.stock_minimo} {p.unidad}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black ${p.stock === 0 ? 'text-red-500' : 'text-orange-500'}`}>
                        {p.stock}
                      </p>
                      <p className="text-[10px] text-sub">{p.unidad}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ventas recientes de hoy */}
          {ventasHoy.length > 0 && (
            <div className="mb-5">
              <h2 className="text-sm font-bold text-app mb-2">Ventas de Hoy</h2>
              <div className="space-y-2">
                {ventasHoy.slice(0, 5).map((v, i) => (
                  <div key={i} className="card p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                        <ShoppingBag size={16} className="text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-app">Venta contado</p>
                        <p className="text-[11px] text-sub">
                          {new Date(v.created_at).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-orange-500">{formatUsd(v.total_usd)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
