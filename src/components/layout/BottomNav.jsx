import { useLocation, Link } from 'react-router-dom'
import {
  ShoppingCart, Warehouse, LayoutDashboard,
  Users, Settings, ClipboardList,
} from 'lucide-react'
import { useAuthStore } from '../../stores/useAuthStore'
import { useCartStore } from '../../stores/useCartStore'

const EMPLOYEE_TABS = [
  { path: '/pos', icon: ShoppingCart, label: 'POS' },
  { path: '/arqueo', icon: ClipboardList, label: 'Arqueo' },
]

const ADMIN_TABS = [
  { path: '/pos', icon: ShoppingCart, label: 'POS' },
  { path: '/admin', icon: LayoutDashboard, label: 'Panel' },
  { path: '/inventario', icon: Warehouse, label: 'Inventario' },
  { path: '/clientes', icon: Users, label: 'Clientes' },
  { path: '/configuracion', icon: Settings, label: 'Config' },
]

export default function BottomNav() {
  const location = useLocation()
  const profile = useAuthStore((s) => s.profile)
  const totalItems = useCartStore((s) => s.items.reduce((a, i) => a + i.cantidad, 0))

  const tabs = profile?.rol === 'admin' ? ADMIN_TABS : EMPLOYEE_TABS

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-app h-bottom-nav"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex h-16">
        {tabs.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path
          const isCart = path === '/pos'
          return (
            <Link
              key={path}
              to={path}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors duration-150
                ${isActive
                  ? 'text-orange-500'
                  : 'text-sub hover:text-app'
                }`}
            >
              {/* Indicador activo */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-orange-500 rounded-b-full" />
              )}

              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.75} />
                {/* Badge carrito */}
                {isCart && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center bounce-in">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </div>

              <span className={`text-[10px] font-medium ${isActive ? 'text-orange-500' : ''}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
