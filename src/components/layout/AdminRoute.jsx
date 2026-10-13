import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { ShieldX } from 'lucide-react'

export default function AdminRoute() {
  const profile = useAuthStore((s) => s.profile)

  if (profile?.rol !== 'admin') {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-app p-6">
        <div className="card p-8 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldX className="text-red-500" size={28} />
          </div>
          <h2 className="text-xl font-bold text-app mb-2">Acceso Denegado</h2>
          <p className="text-sub text-sm">No tienes permisos para ver esta sección.</p>
          <a href="/pos" className="btn-primary w-full mt-6 block">Ir al POS</a>
        </div>
      </div>
    )
  }

  return <Outlet />
}
