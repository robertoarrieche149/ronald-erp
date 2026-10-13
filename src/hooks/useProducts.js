import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Hook para cargar productos con sus categorías
 * Soporta búsqueda de texto y filtrado por categoría
 */
export function useProducts(searchQuery = '', categoriaId = null) {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCategorias = useCallback(async () => {
    const { data } = await supabase
      .from('categorias')
      .select('id, nombre')
      .eq('activa', true)
      .order('orden')
    if (data) setCategorias(data)
  }, [])

  const fetchProductos = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('productos')
      .select(`
        id, nombre, descripcion, imagen_url, precio_usd, costo_usd,
        stock, stock_minimo, codigo_barras, unidad, disponible, id_categoria,
        categorias(nombre)
      `)
      .eq('disponible', true)
      .order('nombre')

    if (categoriaId) query = query.eq('id_categoria', categoriaId)
    if (searchQuery?.trim()) {
      query = query.or(
        `nombre.ilike.%${searchQuery}%,codigo_barras.ilike.%${searchQuery}%,descripcion.ilike.%${searchQuery}%`
      )
    }

    const { data, error: err } = await query
    if (err) setError(err.message)
    else setProductos(data ?? [])
    setLoading(false)
  }, [searchQuery, categoriaId])

  useEffect(() => { fetchCategorias() }, [fetchCategorias])
  useEffect(() => { fetchProductos() }, [fetchProductos])

  return { productos, categorias, loading, error, refetch: fetchProductos }
}
