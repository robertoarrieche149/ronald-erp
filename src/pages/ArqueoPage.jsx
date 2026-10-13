import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/useAuthStore'
import { ClipboardList, Plus, ChevronRight, CheckCircle2, Loader2, Package, Hash } from 'lucide-react'
import { format } from '../lib/dateUtils'

export default function ArqueoPage() {
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)
  const [arqueos, setArqueos] = useState([])
  const [arqueoActivo, setArqueoActivo] = useState(null)
  const [productos, setProductos] = useState([])
  const [conteos, setConteos] = useState({}) // { [productId]: cantidad }
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [step, setStep] = useState('lista') // 'lista' | 'conteo' | 'resumen'

  useEffect(() => {
    cargarArqueos()
  }, [])

  const cargarArqueos = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('arqueos')
      .select('*, profiles!realizado_por(nombre)')
      .order('created_at', { ascending: false })
      .limit(20)
    setArqueos(data ?? [])
    setLoading(false)
  }

  const cargarProductos = async () => {
    const { data } = await supabase
      .from('productos')
      .select('id, nombre, stock, unidad, categorias(nombre)')
      .eq('disponible', true)
      .order('nombre')
    setProductos(data ?? [])
    // Inicializar conteos con stock actual
    const init = {}
    data?.forEach((p) => { init[p.id] = '' })
    setConteos(init)
  }

  const iniciarArqueo = async () => {
    setGuardando(true)
    const { data: arqueo, error } = await supabase
      .from('arqueos')
      .insert({ realizado_por: user.id, estado: 'en_progreso' })
      .select()
      .single()
    setGuardando(false)
    if (!error) {
      setArqueoActivo(arqueo)
      await cargarProductos()
      setStep('conteo')
    }
  }

  const guardarConteos = async () => {
    setGuardando(true)
    const detalles = productos
      .filter((p) => conteos[p.id] !== '' && conteos[p.id] !== undefined)
      .map((p) => ({
        id_arqueo: arqueoActivo.id,
        id_producto: p.id,
        stock_sistema: p.stock,
        cantidad_contada: parseInt(conteos[p.id]) || 0,
      }))

    if (detalles.length === 0) {
      setGuardando(false)
      return
    }

    const { error } = await supabase.from('detalles_arqueo').insert(detalles)

    if (!error) {
      await supabase
        .from('arqueos')
        .update({ estado: 'completado', closed_at: new Date().toISOString() })
        .eq('id', arqueoActivo.id)
      setStep('resumen')
      cargarArqueos()
    }
    setGuardando(false)
  }

  if (step === 'conteo') {
    const productosPendientes = productos.filter((p) => conteos[p.id] === '')
    const productosContados = productos.filter((p) => conteos[p.id] !== '')

    return (
      <div className="flex flex-col h-full" style={{ paddingBottom: '5rem' }}>
        {/* Header conteo */}
        <div className="sticky top-14 z-20 bg-orange-500 text-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base">Conteo en Progreso</h2>
              <p className="text-orange-100 text-xs mt-0.5">
                {productosContados.length}/{productos.length} productos contados
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <span className="font-black text-lg">
                {Math.round((productosContados.length / productos.length) * 100)}%
              </span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-1.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${(productosContados.length / productos.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Lista productos */}
        <div className="flex-1 overflow-y-auto scroll-mobile px-4 pt-3">
          {productos.map((p) => {
            const valor = conteos[p.id]
            const diferencia = valor !== '' ? parseInt(valor) - p.stock : null
            return (
              <div
                key={p.id}
                className={`card p-3 mb-2 transition-all ${valor !== '' ? 'border-green-300 dark:border-green-500/40' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-app truncate">{p.nombre}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-sub">Sistema: {p.stock} {p.unidad}</span>
                      {diferencia !== null && (
                        <span className={`text-[11px] font-bold ${diferencia > 0 ? 'text-green-500' : diferencia < 0 ? 'text-red-400' : 'text-sub'}`}>
                          {diferencia > 0 ? `+${diferencia}` : diferencia} {p.unidad}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-24 flex-shrink-0">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      placeholder="Contar..."
                      className="input text-sm text-center py-2"
                      value={conteos[p.id]}
                      onChange={(e) =>
                        setConteos((prev) => ({ ...prev, [p.id]: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>
            )
          })}
          <div className="h-4" />
        </div>

        {/* Footer */}
        <div className="fixed bottom-16 left-0 right-0 px-4 py-3 bg-card border-t border-app"
          style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
        >
          <button
            onClick={guardarConteos}
            disabled={guardando || productosContados.length === 0}
            className="btn-primary w-full"
          >
            {guardando ? (
              <><Loader2 size={18} className="animate-spin" /> Guardando...</>
            ) : (
              <><CheckCircle2 size={18} /> Finalizar Arqueo ({productosContados.length} contados)</>
            )}
          </button>
        </div>
      </div>
    )
  }

  if (step === 'resumen') {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-6 text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="text-green-500" size={36} />
        </div>
        <h2 className="text-2xl font-black text-app">¡Arqueo Completado!</h2>
        <p className="text-sub text-sm mt-2 mb-6">
          Los datos han sido registrados. El administrador podrá ver las diferencias.
        </p>
        <button onClick={() => setStep('lista')} className="btn-primary">
          Ver historial de arqueos
        </button>
      </div>
    )
  }

  // Lista de arqueos
  return (
    <div className="flex flex-col h-full" style={{ paddingBottom: '5rem' }}>
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-xl font-black text-app">Arqueo de Inventario</h1>
        <p className="text-sub text-sm mt-0.5">Registro de conteo físico de productos</p>
      </div>

      {/* Botón nuevo arqueo */}
      <div className="px-4 mb-4">
        <button
          onClick={iniciarArqueo}
          disabled={guardando}
          className="btn-primary w-full"
        >
          {guardando ? (
            <><Loader2 size={18} className="animate-spin" /> Iniciando...</>
          ) : (
            <><Plus size={18} /> Iniciar Nuevo Arqueo</>
          )}
        </button>
      </div>

      {/* Historial */}
      <div className="flex-1 overflow-y-auto scroll-mobile px-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
          </div>
        ) : arqueos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ClipboardList className="text-orange-300 mb-3" size={48} />
            <p className="text-app font-semibold">Sin arqueos registrados</p>
            <p className="text-sub text-sm mt-1">Inicia tu primer arqueo arriba</p>
          </div>
        ) : (
          <div className="space-y-2">
            {arqueos.map((a) => (
              <div key={a.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-app text-sm">Arqueo #{a.id}</p>
                    <p className="text-[11px] text-sub mt-0.5">
                      {a.profiles?.nombre} · {new Date(a.created_at).toLocaleDateString('es-VE')}
                    </p>
                  </div>
                  <span className={`badge ${
                    a.estado === 'completado' ? 'badge-green' :
                    a.estado === 'revisado' ? 'badge-orange' : 'badge-gray'
                  }`}>
                    {a.estado === 'en_progreso' ? 'En progreso' :
                     a.estado === 'completado' ? 'Completado' : 'Revisado'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
