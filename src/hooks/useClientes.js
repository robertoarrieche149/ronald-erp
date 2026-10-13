import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useClientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(false)

  const buscarClientes = useCallback(async (query = '') => {
    setLoading(true)
    let q = supabase
      .from('clientes')
      .select('id, nombre, telefono, cedula, tiene_credito, limite_credito_usd, saldo_credito_usd')
      .eq('activo', true)
      .order('nombre')
      .limit(20)

    if (query.trim()) {
      q = q.or(`nombre.ilike.%${query}%,cedula.ilike.%${query}%,telefono.ilike.%${query}%`)
    }

    const { data } = await q
    setClientes(data ?? [])
    setLoading(false)
  }, [])

  const crearCliente = useCallback(async (datos) => {
    const { data, error } = await supabase
      .from('clientes')
      .insert(datos)
      .select()
      .single()
    return { data, error }
  }, [])

  const actualizarCredito = useCallback(async (clienteId, nuevoSaldo) => {
    return supabase
      .from('clientes')
      .update({ saldo_credito_usd: nuevoSaldo, updated_at: new Date().toISOString() })
      .eq('id', clienteId)
  }, [])

  return { clientes, loading, buscarClientes, crearCliente, actualizarCredito }
}
