import { useState, useCallback } from 'react'
import { Search, SlidersHorizontal, ShoppingCart } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import ProductCard from '../components/pos/ProductCard'
import CartPanel from '../components/pos/CartPanel'
import PaymentModal from '../components/pos/PaymentModal'
import { useCartStore } from '../stores/useCartStore'

function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-28" />
      <div className="p-2.5 space-y-2">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-8 w-full" />
      </div>
    </div>
  )
}

export default function POSPage() {
  const [search, setSearch] = useState('')
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null)
  const [showCart, setShowCart] = useState(false)
  const [showPayment, setShowPayment] = useState(false)

  const { productos, categorias, loading } = useProducts(search, categoriaSeleccionada)
  const totalItems = useCartStore((s) => s.items.reduce((a, i) => a + i.cantidad, 0))

  const handleCobrar = useCallback(() => {
    setShowCart(false)
    setShowPayment(true)
  }, [])

  return (
    <div className="flex flex-col h-full" style={{ paddingBottom: '4rem' }}>

      {/* Barra de búsqueda */}
      <div className="sticky top-14 z-30 bg-surface px-4 pt-3 pb-2 border-b border-app">
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sub" size={18} />
          <input
            type="search"
            inputMode="search"
            className="input pl-10 pr-4 py-3 text-base"
            placeholder="Buscar producto o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-app transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filtro de categorías */}
        <div className="flex gap-2 overflow-x-auto pb-1 scroll-mobile">
          <button
            onClick={() => setCategoriaSeleccionada(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              !categoriaSeleccionada
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-muted text-sub'
            }`}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaSeleccionada(cat.id === categoriaSeleccionada ? null : cat.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                categoriaSeleccionada === cat.id
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-muted text-sub'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de productos */}
      <div className="flex-1 overflow-y-auto scroll-mobile px-4 pt-3">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : productos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-app font-semibold">Sin resultados</p>
            <p className="text-sub text-sm mt-1">
              {search ? `No hay productos para "${search}"` : 'No hay productos disponibles'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-[11px] text-sub mb-2">{productos.length} producto{productos.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-2 gap-3">
              {productos.map((p) => (
                <ProductCard key={p.id} producto={p} />
              ))}
            </div>
            <div className="h-4" />
          </>
        )}
      </div>

      {/* FAB Carrito */}
      {totalItems > 0 && !showCart && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center shadow-xl bounce-in"
          style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom) + 1rem)' }}
        >
          <div className="relative">
            <ShoppingCart size={24} />
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-orange-500 text-[11px] font-black rounded-full flex items-center justify-center">
              {totalItems > 9 ? '9+' : totalItems}
            </span>
          </div>
        </button>
      )}

      {/* Bottom Sheet — Carrito */}
      {showCart && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 fade-in"
            onClick={() => setShowCart(false)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl shadow-app-lg slide-up"
            style={{ height: '80dvh', paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 bg-border rounded-full" />
            </div>
            <CartPanel onCobrar={handleCobrar} />
          </div>
        </>
      )}

      {/* Modal de Pago */}
      {showPayment && (
        <PaymentModal
          onClose={() => setShowPayment(false)}
          onSuccess={() => { setShowCart(false) }}
        />
      )}
    </div>
  )
}
