import { create } from 'zustand'

export const useCartStore = create((set, get) => ({
  items: [],          // [{ producto, variante, cantidad, precio_usd }]
  clienteSeleccionado: null,
  esCredito: false,
  notaVenta: '',

  addItem: (producto) => {
    const items = get().items
    const key = `${producto.id}`
    const existing = items.find((i) => i.key === key)

    if (existing) {
      set({
        items: items.map((i) =>
          i.key === key ? { ...i, cantidad: i.cantidad + 1 } : i
        ),
      })
    } else {
      const precio = producto.precio_usd ?? 0
      set({
        items: [
          ...items,
          { key, producto, cantidad: 1, precio_usd: precio },
        ],
      })
    }
  },

  removeItem: (key) => set({ items: get().items.filter((i) => i.key !== key) }),

  updateCantidad: (key, cantidad) => {
    if (cantidad <= 0) {
      get().removeItem(key)
      return
    }
    set({ items: get().items.map((i) => (i.key === key ? { ...i, cantidad } : i)) })
  },

  clearCart: () => set({ items: [], clienteSeleccionado: null, esCredito: false, notaVenta: '' }),

  setCliente: (cliente) => set({ clienteSeleccionado: cliente }),

  setEsCredito: (v) => set({ esCredito: v }),

  setNota: (nota) => set({ notaVenta: nota }),

  get totalUsd() {
    return get().items.reduce((acc, i) => acc + i.precio_usd * i.cantidad, 0)
  },

  get totalItems() {
    return get().items.reduce((acc, i) => acc + i.cantidad, 0)
  },
}))
