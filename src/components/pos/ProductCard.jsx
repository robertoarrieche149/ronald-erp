import { useTasaStore } from '../../stores/useTasaStore'
import { useCartStore } from '../../stores/useCartStore'
import { Plus, Package } from 'lucide-react'

export default function ProductCard({ producto }) {
  const { formatUsd, formatVes } = useTasaStore()
  const addItem = useCartStore((s) => s.addItem)

  const handleAdd = () => {
    addItem(producto)
  }

  const stockBajo = producto.stock <= producto.stock_minimo && producto.stock > 0
  const sinStock = producto.stock === 0

  return (
    <div className="card overflow-hidden scale-in group active:scale-95 transition-transform flex flex-col justify-between">
      <div>
        {/* Imagen o placeholder */}
        <div className="relative h-28 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
          {producto.imagen_url ? (
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <Package className="text-orange-300 dark:text-slate-400" size={36} />
          )}

          {/* Badge stock */}
          {sinStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="badge badge-red text-xs">Sin Stock</span>
            </div>
          )}
          {stockBajo && !sinStock && (
            <div className="absolute top-1.5 right-1.5">
              <span className="badge badge-orange text-[10px]">Stock bajo</span>
            </div>
          )}
        </div>

        <div className="p-2.5">
          <h3 className="text-xs font-semibold text-app leading-tight line-clamp-2 mb-1">
            {producto.nombre}
          </h3>

          {/* Precios */}
          <div className="mb-2">
            <p className="text-sm font-bold text-orange-500">
              {formatUsd(producto.precio_usd)}
            </p>
            <p className="text-[10px] text-sub">
              {formatVes(producto.precio_usd)}
            </p>
          </div>
        </div>
      </div>

      <div className="p-2.5 pt-0">
        <button
          disabled={sinStock}
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg
            bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold
            active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={14} />
          Agregar
        </button>
      </div>
    </div>
  )
}
