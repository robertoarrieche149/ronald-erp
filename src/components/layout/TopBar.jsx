import { useLocation } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'
import { useAuthStore } from '../../stores/useAuthStore'
import { useTasaStore } from '../../stores/useTasaStore'

const PAGE_TITLES = {
  '/pos': 'Punto de Venta',
  '/arqueo': 'Arqueo de Inventario',
  '/admin': 'Panel Admin',
  '/inventario': 'Inventario',
  '/clientes': 'Clientes',
  '/proveedores': 'Proveedores',
  '/compras': 'Órdenes de Compra',
  '/reportes': 'Reportes',
  '/configuracion': 'Configuración',
}

export default function TopBar() {
  const location = useLocation()
  const profile = useAuthStore((s) => s.profile)
  const { tasa, fuente } = useTasaStore()

  const title = PAGE_TITLES[location.pathname] ?? 'MiniMarket'

  return (
    <header
      className="sticky top-0 z-40 bg-card border-b border-app px-4 flex items-center justify-between"
      style={{ height: '3.5rem', paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Logo + Título */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-white text-sm font-bold">M</span>
        </div>
        <div>
          <h1 className="text-sm font-bold text-app leading-tight">{title}</h1>
          {profile && (
            <p className="text-[10px] text-sub leading-tight capitalize">{profile.nombre}</p>
          )}
        </div>
      </div>

      {/* Indicador de Tasa de Cambio */}
      {tasa > 1 && (
        <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-500/10 px-2.5 py-1 rounded-lg">
          <TrendingUp size={12} className="text-orange-500" />
          <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400">
            Bs {tasa.toFixed(2)}
          </span>
          {fuente === 'manual' && (
            <span className="text-[9px] text-orange-400 font-bold">(M)</span>
          )}
        </div>
      )}
    </header>
  )
}

