import { useState, useEffect } from 'react'
import { X, Plus, Trash2, CreditCard, User, UserPlus, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useCartStore } from '../../stores/useCartStore'
import { useTasaStore } from '../../stores/useTasaStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useClientes } from '../../hooks/useClientes'
import { supabase } from '../../lib/supabase'

const METODOS_PAGO = ['Efectivo', 'Pago Móvil', 'Punto', 'Zelle']
const MONEDAS = ['USD', 'VES']
const REFERENCIA_REQUERIDA = ['Pago Móvil', 'Punto', 'Zelle']

function LineaPago({ linea, onUpdate, onRemove, totalPendiente }) {
  const { tasa } = useTasaStore()
  const requiereRef = REFERENCIA_REQUERIDA.includes(linea.metodo)

  return (
    <div className="card p-3 mb-2 relative">
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 text-muted hover:text-red-400 transition-colors"
      >
        <X size={14} />
      </button>

      <div className="grid grid-cols-2 gap-2 mb-2 pr-5">
        {/* Método */}
        <div>
          <label className="text-[10px] font-semibold text-sub uppercase tracking-wider mb-1 block">Método</label>
          <select
            className="input text-sm py-2"
            value={linea.metodo}
            onChange={(e) => onUpdate({ metodo: e.target.value, referencia: '' })}
          >
            {METODOS_PAGO.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Moneda */}
        <div>
          <label className="text-[10px] font-semibold text-sub uppercase tracking-wider mb-1 block">Moneda</label>
          <select
            className="input text-sm py-2"
            value={linea.moneda}
            onChange={(e) => onUpdate({ moneda: e.target.value })}
          >
            {MONEDAS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Monto */}
      <div className="mb-2">
        <label className="text-[10px] font-semibold text-sub uppercase tracking-wider mb-1 block">
          Monto {linea.moneda === 'VES' ? '(Bs.)' : '(USD)'}
        </label>
        <div className="relative">
          <input
            type="number"
            step="0.01"
            min="0"
            className="input text-sm"
            placeholder={`0.00`}
            value={linea.monto}
            onChange={(e) => onUpdate({ monto: e.target.value })}
          />
          {linea.monto > 0 && linea.moneda === 'VES' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-sub">
              ≈ ${(parseFloat(linea.monto) / tasa).toFixed(2)}
            </span>
          )}
          {linea.monto > 0 && linea.moneda === 'USD' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-sub">
              Bs {(parseFloat(linea.monto) * tasa).toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Referencia */}
      {requiereRef && (
        <div>
          <label className="text-[10px] font-semibold text-sub uppercase tracking-wider mb-1 block">
            Referencia <span className="text-red-400">*obligatorio</span>
          </label>
          <input
            type="text"
            className="input text-sm"
            placeholder="Nro. de referencia / confirmación"
            value={linea.referencia}
            onChange={(e) => onUpdate({ referencia: e.target.value })}
            required
          />
        </div>
      )}
    </div>
  )
}

function BuscadorCliente({ onSelect }) {
  const { clientes, loading, buscarClientes } = useClientes()
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', telefono: '', cedula: '' })
  const { crearCliente } = useClientes()
  const [creando, setCreando] = useState(false)

  useEffect(() => {
    buscarClientes(query)
  }, [query, buscarClientes])

  const handleCrear = async () => {
    if (!nuevoCliente.nombre.trim()) return
    setCreando(true)
    const { data, error } = await crearCliente(nuevoCliente)
    setCreando(false)
    if (!error && data) {
      onSelect(data)
      setShowForm(false)
    }
  }

  return (
    <div>
      <div className="relative mb-2">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-sub" size={16} />
        <input
          type="text"
          className="input pl-9 text-sm"
          placeholder="Buscar cliente por nombre, cédula..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {/* Lista resultados */}
      <div className="max-h-40 overflow-y-auto scroll-mobile mb-2">
        {loading && <p className="text-center text-sub text-xs py-2">Buscando...</p>}
        {!loading && clientes.length === 0 && query && (
          <p className="text-center text-muted text-xs py-2">No se encontraron clientes</p>
        )}
        {clientes.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c)}
            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
          >
            <p className="text-sm font-semibold text-app">{c.nombre}</p>
            <div className="flex gap-2 text-[11px] text-sub mt-0.5">
              {c.cedula && <span>CI: {c.cedula}</span>}
              {c.telefono && <span>📞 {c.telefono}</span>}
              {c.tiene_credito && (
                <span className="text-orange-500 font-medium">
                  Crédito: ${c.saldo_credito_usd.toFixed(2)}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Crear cliente */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-orange-300 text-orange-500 text-sm font-medium hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors"
        >
          <UserPlus size={16} /> Crear nuevo cliente
        </button>
      ) : (
        <div className="card p-3 mt-2">
          <p className="text-xs font-bold text-app mb-2">Nuevo Cliente</p>
          <input
            className="input text-sm mb-2"
            placeholder="Nombre completo *"
            value={nuevoCliente.nombre}
            onChange={(e) => setNuevoCliente((p) => ({ ...p, nombre: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              className="input text-sm"
              placeholder="Cédula"
              value={nuevoCliente.cedula}
              onChange={(e) => setNuevoCliente((p) => ({ ...p, cedula: e.target.value }))}
            />
            <input
              className="input text-sm"
              placeholder="Teléfono"
              value={nuevoCliente.telefono}
              onChange={(e) => setNuevoCliente((p) => ({ ...p, telefono: e.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 py-2 text-sm">
              Cancelar
            </button>
            <button
              onClick={handleCrear}
              disabled={creando || !nuevoCliente.nombre.trim()}
              className="btn-primary flex-1 py-2 text-sm"
            >
              {creando ? <Loader2 size={14} className="animate-spin" /> : 'Crear'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const nuevaLinea = () => ({
  id: Date.now(),
  metodo: 'Efectivo',
  moneda: 'USD',
  monto: '',
  referencia: '',
})

export default function PaymentModal({ onClose, onSuccess }) {
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const totalUsd = useCartStore((s) => s.items.reduce((a, i) => a + i.precio_usd * i.cantidad, 0))
  const { tasa, formatUsd, formatVes } = useTasaStore()
  const user = useAuthStore((s) => s.user)

  const [lineas, setLineas] = useState([nuevaLinea()])
  const [esCredito, setEsCredito] = useState(false)
  const [cliente, setCliente] = useState(null)
  const [mostrarBuscador, setMostrarBuscador] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Total pagado en USD
  const totalPagado = lineas.reduce((acc, l) => {
    if (!l.monto || isNaN(parseFloat(l.monto))) return acc
    const monto = parseFloat(l.monto)
    return acc + (l.moneda === 'VES' ? monto / tasa : monto)
  }, 0)

  const diferencia = totalPagado - totalUsd

  const updateLinea = (id, cambios) => {
    setLineas((prev) => prev.map((l) => (l.id === id ? { ...l, ...cambios } : l)))
  }

  const removeLinea = (id) => {
    if (lineas.length === 1) return
    setLineas((prev) => prev.filter((l) => l.id !== id))
  }

  const validar = () => {
    if (esCredito && !cliente) return 'Debes seleccionar un cliente para ventas a crédito'
    for (const l of lineas) {
      if (!l.monto || parseFloat(l.monto) <= 0) return 'Todos los montos deben ser mayores a 0'
      if (REFERENCIA_REQUERIDA.includes(l.metodo) && !l.referencia.trim()) {
        return `La referencia es obligatoria para pagos por ${l.metodo}`
      }
    }
    if (!esCredito && totalPagado < totalUsd - 0.01) return 'El monto pagado es insuficiente'
    return null
  }

  const procesarVenta = async () => {
    const errMsg = validar()
    if (errMsg) { setError(errMsg); return }

    setProcesando(true)
    setError(null)

    try {
      // 1. Crear venta / pedido
      const { data: pedido, error: pedidoErr } = await supabase
        .from('pedidos')
        .insert({
          registrado_por: user.id,
          id_cliente: cliente?.id ?? null,
          tipo: 'directo',
          estado_pago: esCredito ? 'credito' : 'pagado',
          subtotal_usd: totalUsd,
          total_usd: totalUsd,
          total_ves: totalUsd * tasa,
          tasa_cambio_aplicada: tasa,
          es_credito: esCredito,
        })
        .select()
        .single()

      if (pedidoErr) throw pedidoErr

      // 2. Insertar detalles de la venta
      const detalles = items.map((item) => ({
        id_pedido: pedido.id,
        id_producto: item.producto.id,
        cantidad: item.cantidad,
        precio_congelado_usd: item.precio_usd,
        subtotal_usd: item.precio_usd * item.cantidad,
      }))

      const { error: detErr } = await supabase.from('detalles_pedido').insert(detalles)
      if (detErr) throw detErr

      // 3. Insertar pagos (solo si no es crédito puro)
      if (!esCredito) {
        const pagosData = lineas.map((l) => ({
          id_pedido: pedido.id,
          monto_usd: l.moneda === 'USD' ? parseFloat(l.monto) : parseFloat(l.monto) / tasa,
          monto_ves: l.moneda === 'VES' ? parseFloat(l.monto) : parseFloat(l.monto) * tasa,
          metodo_pago: l.metodo,
          moneda: l.moneda,
          referencia: l.referencia || null,
          tasa_aplicada: tasa,
          registrado_por: user.id,
        }))
        const { error: pagosErr } = await supabase.from('pagos').insert(pagosData)
        if (pagosErr) throw pagosErr
      } else {
        // Actualizar saldo de crédito del cliente
        const nuevoSaldo = (cliente.saldo_credito_usd ?? 0) + totalUsd
        await supabase
          .from('clientes')
          .update({ saldo_credito_usd: nuevoSaldo, updated_at: new Date().toISOString() })
          .eq('id', cliente.id)
      }

      setSuccess(true)
      setTimeout(() => {
        clearCart()
        onSuccess?.()
        onClose()
      }, 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setProcesando(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="card p-8 text-center max-w-xs w-full scale-in">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="text-green-500" size={32} />
          </div>
          <h2 className="text-xl font-black text-app">¡Venta Registrada!</h2>
          <p className="text-sub text-sm mt-2">{formatUsd(totalUsd)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-4 flex items-end sm:items-center justify-center fade-in">
      <div className="w-full max-w-lg bg-card rounded-2xl shadow-app-lg slide-up flex flex-col my-auto max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-app flex-shrink-0">
          <div>
            <h2 className="font-black text-app text-lg flex items-center gap-2">
              <CreditCard className="text-orange-500" size={20} /> Cobrar
            </h2>
            <p className="text-sm text-sub mt-0.5">
              Total: <span className="font-bold text-orange-500">{formatUsd(totalUsd)}</span>
              <span className="text-muted ml-1">/ {formatVes(totalUsd)}</span>
            </p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-sub hover:text-app transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto scroll-mobile px-5 py-4 space-y-4">

          {/* Tipo de venta */}
          <div>
            <label className="text-xs font-semibold text-sub uppercase tracking-wider mb-2 block">
              Tipo de Venta
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setEsCredito(false); setCliente(null); setMostrarBuscador(false) }}
                className={`py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                  !esCredito
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400'
                    : 'border-app bg-muted text-sub'
                }`}
              >
                💵 Contado
              </button>
              <button
                onClick={() => { setEsCredito(true); setMostrarBuscador(true) }}
                className={`py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                  esCredito
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400'
                    : 'border-app bg-muted text-sub'
                }`}
              >
                📋 A Crédito
              </button>
            </div>
          </div>

          {/* Selección de cliente */}
          {(esCredito || mostrarBuscador) && (
            <div>
              <label className="text-xs font-semibold text-sub uppercase tracking-wider mb-2 block">
                Cliente {esCredito && <span className="text-red-400">*obligatorio</span>}
              </label>
              {cliente ? (
                <div className="flex items-center justify-between card p-3">
                  <div>
                    <p className="font-semibold text-app text-sm">{cliente.nombre}</p>
                    {cliente.cedula && <p className="text-sub text-[11px]">CI: {cliente.cedula}</p>}
                  </div>
                  <button
                    onClick={() => { setCliente(null); setMostrarBuscador(true) }}
                    className="text-sub hover:text-red-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <BuscadorCliente onSelect={(c) => { setCliente(c); setMostrarBuscador(false) }} />
              )}
            </div>
          )}

          {/* Líneas de pago — solo en contado */}
          {!esCredito && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-sub uppercase tracking-wider">
                  Métodos de Pago
                </label>
                <button
                  onClick={() => setLineas((p) => [...p, nuevaLinea()])}
                  className="flex items-center gap-1 text-orange-500 text-xs font-semibold"
                >
                  <Plus size={14} /> Agregar método
                </button>
              </div>

              {lineas.map((linea) => (
                <LineaPago
                  key={linea.id}
                  linea={linea}
                  onUpdate={(cambios) => updateLinea(linea.id, cambios)}
                  onRemove={() => removeLinea(linea.id)}
                  totalPendiente={totalUsd - totalPagado + (parseFloat(linea.monto) || 0)}
                />
              ))}

              {/* Resumen de pagos */}
              <div className="mt-3 p-3 rounded-xl bg-muted">
                <div className="flex justify-between text-sm">
                  <span className="text-sub">Total venta:</span>
                  <span className="font-bold text-app">{formatUsd(totalUsd)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-sub">Total pagado:</span>
                  <span className={`font-bold ${totalPagado >= totalUsd ? 'text-green-500' : 'text-red-400'}`}>
                    {formatUsd(totalPagado)}
                  </span>
                </div>
                {diferencia > 0.01 && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-sub">Vuelto:</span>
                    <span className="font-bold text-orange-500">{formatUsd(diferencia)}</span>
                  </div>
                )}
                {diferencia < -0.01 && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-sub">Falta:</span>
                    <span className="font-bold text-red-400">{formatUsd(Math.abs(diferencia))}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
              <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-app flex-shrink-0 bg-card">
          <button
            onClick={procesarVenta}
            disabled={procesando}
            className="btn-primary w-full text-base"
          >
            {procesando ? (
              <><Loader2 size={18} className="animate-spin" /> Procesando...</>
            ) : esCredito ? (
              '📋 Registrar a Crédito'
            ) : (
              '✅ Confirmar Venta'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
