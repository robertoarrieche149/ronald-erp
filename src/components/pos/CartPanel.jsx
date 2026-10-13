import { useCartStore } from '../../stores/useCartStore'
import { useTasaStore } from '../../stores/useTasaStore'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'

function CartItemRow({ item }) {
  const { updateCantidad, removeItem } = useCartStore()
  const { formatUsd, formatVes } = useTasaStore()
  const subtotal = item.precio_usd * item.cantidad

  return (
    <div className="flex items-center gap-2 py-3 border-b border-app last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-app leading-tight truncate">
          {item.producto.nombre}
        </p>
        <p className="text-[11px] text-sub mt-0.5">
          {formatUsd(item.precio_usd)} c/u
        </p>
      </div>

      {/* Controles cantidad */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
        <button
          onClick={() => updateCantidad(item.key, item.cantidad - 1)}
          className="w-7 h-7 flex items-center justify-center rounded-md text-sub hover:text-red-500 transition-colors active:scale-90"
        >
          {item.cantidad === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
        </button>
        <span className="w-6 text-center text-sm font-bold text-app">{item.cantidad}</span>
        <button
          onClick={() => updateCantidad(item.key, item.cantidad + 1)}
          className="w-7 h-7 flex items-center justify-center rounded-md text-orange-500 hover:text-orange-600 transition-colors active:scale-90"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Subtotal */}
      <div className="text-right w-16 flex-shrink-0">
        <p className="text-sm font-bold text-orange-500">{formatUsd(subtotal)}</p>
        <p className="text-[10px] text-sub">{formatVes(subtotal)}</p>
      </div>
    </div>
  )
}

export default function CartPanel({ onCobrar }) {
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const totalUsd = useCartStore((s) => s.items.reduce((a, i) => a + i.precio_usd * i.cantidad, 0))
  const { formatUsd, formatVes } = useTasaStore()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 px-4 text-center">
        <div className="w-16 h-16 bg-orange-50 dark:bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4">
          <ShoppingBag className="text-orange-300" size={28} />
        </div>
        <p className="text-sub font-medium text-sm">Carrito vacío</p>
        <p className="text-muted text-xs mt-1">Toca un producto para agregar</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <h2 className="font-bold text-app text-sm">
          Carrito <span className="text-sub font-normal">({items.length} ítem{items.length !== 1 ? 's' : ''})</span>
        </h2>
        <button
          onClick={clearCart}
          className="text-xs text-red-400 font-medium flex items-center gap-1 hover:text-red-500 transition-colors"
        >
          <Trash2 size={12} /> Limpiar
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-4 scroll-mobile">
        {items.map((item) => (
          <CartItemRow key={item.key} item={item} />
        ))}
      </div>

      {/* Total + Cobrar */}
      <div className="px-4 py-4 border-t border-app bg-card">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sub text-sm">Total a pagar:</span>
        </div>
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-2xl font-black text-app">{formatUsd(totalUsd)}</p>
            <p className="text-sm text-sub">{formatVes(totalUsd)}</p>
          </div>
        </div>
        <button onClick={onCobrar} className="btn-primary w-full text-base">
          💳 Cobrar
        </button>
      </div>
    </div>
  )
}
