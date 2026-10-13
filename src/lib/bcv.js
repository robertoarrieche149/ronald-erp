/**
 * Servicio para obtener la tasa de cambio BCV (Banco Central de Venezuela)
 * Usa un proxy CORS-friendly. Si falla, retorna null para activar el fallback manual.
 */

// APIs públicas que exponen la tasa BCV
const BCV_ENDPOINTS = [
  'https://pydolarve.org/api/v1/dollar?page=bcv',
  'https://ve.dolarapi.com/v1/dolares/oficial',
]

/**
 * Intenta obtener la tasa BCV desde múltiples endpoints
 * @returns {Promise<number|null>} Tasa USD/VES o null si falla
 */
export async function fetchTasaBCV() {
  for (const endpoint of BCV_ENDPOINTS) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)

      const res = await fetch(endpoint, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      })
      clearTimeout(timeout)

      if (!res.ok) continue

      const data = await res.json()

      // Normalizar respuesta según el endpoint
      let tasa = null
      if (data?.price) tasa = parseFloat(data.price)           // pydolarve
      else if (data?.promedio) tasa = parseFloat(data.promedio) // dolarapi
      else if (data?.tasa) tasa = parseFloat(data.tasa)

      if (tasa && tasa > 0) return tasa
    } catch {
      // Continúa al siguiente endpoint
    }
  }
  return null
}
