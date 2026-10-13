import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { BarChart3, DollarSign, ShoppingBag, Calendar } from 'lucide-react'
import { useTasaStore } from '../../stores/useTasaStore'

const PERIODOS = [
  { label: 'Hoy', value: 'hoy' },
  { label: 'Esta semana', value: 'semana' },
  { label: 'Este mes', value: 'mes' },
]

export default function AdminReportsTab() {
  const [periodo, setPeriodo] = useState('hoy')
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(true)
  const { formatUsd, formatVes } = useTasaStore()

  useEffect(() => {
    cargarReporte()
  }, [periodo])

  const getDateRange = () => {
    const now = new Date()
    const hoy = now.toISOString().split('T')[0]
    if (periodo === 'hoy') return { from: `${hoy}T00:00:00`, to: now.toISOString() }
    if (periodo === 'semana') {
      const d = new Date(now)
      d.setDate(d.getDate() - 7)
      return { from: d.toISOString(), to: now.toISOString() }
    }
    const d = new Date(now)
    d.setDate(1)
    return { from: d.toISOString(), to: now.toISOString() }
  }

  const cargarReporte = async () => {
    setLoading(true)
    const { from, to } = getDateRange()
    const { data } = await supabase
      .from('pedidos')
      .select(`
        id, total_usd, total_ves, tasa_cambio_aplicada, es_credito,
        created_at, estado_pago,
        clientes(nombre),
        pagos(metodo_pago, monto_usd, moneda)
      `)
      .gte('created_at', from)
      .lte('created_at', to)
      .neq('estado_pago', 'cancelado')
      .order('created_at', { ascending: false })

    setVentas(data ?? [])
    setLoading(false)
  }

  const totalUsd = ventas.reduce((a, v) => a + (v.total_usd ?? 0), 0)
  const countContado = ventas.filter((v) => !v.es_credito).length
  const countCredito = ventas.filter((v) => v.es_credito).length

  // Agrupar por método de pago
  const metodoResumen = {}
  ventas.forEach((v) => {
    v.pagos?.forEach((p) => {
      if (!metodoResumen[p.metodo_pago]) metodoResumen[p.metodo_pago] = 0
      metodoResumen[p.metodo_pago] += p.monto_usd ?? 0
    })
  })

  return (
    <div className="space-y-4">
      {/* Selector de periodo */}
      <div className="flex gap-2">
        {PERIODOS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriodo(p.value)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
              periodo === p.value
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400'
                : 'border-app bg-muted text-sub'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Métricas clave */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4">
              <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mb-2">
                <DollarSign size={18} className="text-orange-500" />
              </div>
              <p className="text-xl font-black text-app">{formatUsd(totalUsd)}</p>
              <p className="text-xs text-sub mt-0.5">Total vendido</p>
              <p className="text-[11px] text-muted">{formatVes(totalUsd)}</p>
            </div>
            <div className="card p-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-2">
                <ShoppingBag size={18} className="text-blue-500" />
              </div>
              <p className="text-xl font-black text-app">{ventas.length}</p>
              <p className="text-xs text-sub mt-0.5">Ventas realizadas</p>
            </div>
            <div className="card p-3">
              <p className="text-lg font-black text-green-500">{countContado}</p>
              <p className="text-xs text-sub">Ventas contado</p>
            </div>
            <div className="card p-3">
              <p className="text-lg font-black text-orange-500">{countCredito}</p>
              <p className="text-xs text-sub">Ventas crédito</p>
            </div>
          </div>

          {/* Por método de pago */}
          {Object.keys(metodoResumen).length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-sub uppercase tracking-wider mb-2">
                Ingresos por Método
              </h2>
              <div className="card divide-y divide-app">
                {Object.entries(metodoResumen).map(([metodo, total]) => (
                  <div key={metodo} className="flex items-center justify-between p-3">
                    <span className="text-sm text-app font-medium">{metodo}</span>
                    <span className="text-sm font-bold text-orange-500">{formatUsd(total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detalle de ventas */}
          <div>
            <h2 className="text-xs font-bold text-sub uppercase tracking-wider mb-2">
              Detalle de Transacciones
            </h2>
            {ventas.length === 0 ? (
              <div className="card p-8 text-center">
                <BarChart3 className="mx-auto text-orange-300 mb-2" size={36} />
                <p className="text-sub font-medium text-sm">Sin transacciones registradas</p>
              </div>
            ) : (
              <div className="space-y-2">
                {ventas.map((v) => (
                  <div key={v.id} className="card p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-app">Venta #{v.id}</p>
                          <span className={`badge ${v.es_credito ? 'badge-orange' : 'badge-green'}`}>
                            {v.es_credito ? 'Crédito' : 'Contado'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-sub">
                          {v.clientes?.nombre && <span>{v.clientes.nombre}</span>}
                          <span>
                            {new Date(v.created_at).toLocaleTimeString('es-VE', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {v.pagos?.length > 0 && (
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {v.pagos.map((p, i) => (
                              <span key={i} className="badge badge-gray text-[10px]">
                                {p.metodo_pago}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-base font-black text-orange-500">
                          {formatUsd(v.total_usd)}
                        </p>
                        <p className="text-[11px] text-sub">{formatVes(v.total_usd)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
