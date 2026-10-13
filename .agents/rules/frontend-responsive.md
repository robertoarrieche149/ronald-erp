---
description: Estándares de Frontend moderno, diseño responsive adaptativo, ergonomía para POS y accesibilidad
globs: src/**/*.{jsx,tsx,js,ts,css}
alwaysApply: false
---

# 📱 Frontend Responsive & POS UI/UX Standards

El frontend del ERP / POS debe ser visualmente pulcro, intuitivo, ágil y perfectamente responsivo en cualquier dispositivo (pantallas táctiles de punto de venta, tablets, laptops y móviles).

## 1. Diseño Responsive & Ergonomía
- **Filosofía Mobile-First / Fluid Breakpoints:**
  - Móvil (`< 640px`): Navegación simplificada, barras de acción inferiores fijas, vistas verticales colapsables.
  - Tablet (`640px - 1024px`): Diseño adaptable en cuadrícula de 2 columnas (catálogo + carrito lateral o modal).
  - Desktop / Pantallas POS (`>= 1024px`): Panel dividido de alto rendimiento (catálogo multitarea, resumen de ticket y panel de cobro permanente sin scroll innecesario).
- **Zonas de Toque Táctil (Touch Targets):**
  - Todo elemento interactivo (botones numéricos, botones de cobro, selector de categorías) debe tener una zona táctil mínima de **44x44px** (idealmente **48x48px** en pantallas de caja).
- **Atajos de Teclado (Fast Keyboard POS):**
  - Facilita atajos de teclado rápidos para cajeros frecuentes: búsqueda rápida de producto (`F2` o `/`), abrir cobro (`F10` o `Espacio`), cancelar (`Esc`).

## 2. Arquitectura de Componentes
- **Atomicidad y Reusabilidad:**
  - Componentes pequeños, desacoplados y con responsabilidad única (`CartItem`, `ProductCard`, `PaymentModal`, `CurrencyBadge`).
  - Evitar componentes gigantescos monolíticos de más de 300 líneas; modularizar en subcomponentes locales.
- **Gestión de Estado Eficiente:**
  - **Estado Local (`useState`, `useReducer`):** Para controles de formulario, modales y toggles inmediatos.
  - **Estado Global (`Zustand`):** Para el carrito de compras, usuario autenticado, turno de caja activo y tasa de cambio actual.
  - Evitar re-renderizados innecesarios: usar selectores específicos de Zustand (`useCartStore(state => state.items)`).

## 3. Estética y Sistema de Diseño
- **Paleta de Color Curada:**
  - Contrastes nítidos para visibilidad en entornos de caja con iluminación variable.
  - Estados claros para transacciones: Verde para cobros exitosos, Ámbar para advertencias de stock bajo, Rojo para errores o stock agotado.
- **Micro-interacciones:**
  - Feedback instantáneo al añadir productos al carrito (animación sutil o haptic/sonido opcional).
  - Spinners y esqueletos de carga (`Skeleton loaders`) en listas de productos para evitar saltos de layout (CLS - Cumulative Layout Shift).

## 4. Accesibilidad (a11y)
- Semántica HTML limpia (`<main>`, `<section>`, `<nav>`, `<button>` en lugar de `div` con `onClick`).
- Atributos `aria-label` en botones con solo icono (ej. botón eliminar del carrito o cerrar modal).
- Enfoque visual claro (`focus-visible`) para navegación fluida mediante teclado.
