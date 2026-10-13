---
description: Estándares de documentación de arquitectura, código, APIs y manual de usuario
globs: docs/**/*, **/*.md
alwaysApply: false
---

# 📚 Documentation & Technical Writing Standards

La documentación clara y concisa asegura la transferibilidad del código y la autonomía del equipo operativo.

## 1. Documentación a Nivel de Código (Self-Documenting Code)
- **Nombres Expresivos:**
  - Nombres claros en español o inglés consistente que describan propósito (`calcularTotalVenta`, `obtenerTasaBCVDelDia`, `useCartStore`).
  - Evitar abreviaciones oscuras (`p`, `calc`, `tmp`, `fn1`).
- **JSDoc en Funciones Críticas:**
  - Documentar parámetros, retornos y excepciones esperadas en funciones utilitarias y hooks:
```javascript
/**
 * Calcula el vuelto en Bolívares para un pago multimoneda.
 * @param {number} totalUSD - Total de la venta en dólares.
 * @param {number} pagadoUSD - Monto entregado por el cliente en dólares.
 * @param {number} tasaBCV - Tasa de cambio oficial del día.
 * @returns {number} Monto a devolver en Bolívares (VES) redondeado a 2 decimales.
 */
```

## 2. Decisiones Arquitectónicas (ADRs - Architecture Decision Records)
- Al adoptar una tecnología crítica o cambiar una convención mayor (ej. migrar de Context API a Zustand, o estructurar el arqueo de caja con eventos append-only), documentar brevemente:
  1. **Contexto:** ¿Qué problema se estaba resolviendo?
  2. **Decisión:** ¿Qué patrón o herramienta se eligió?
  3. **Consecuencias:** Beneficios obtenidos y compromisos asumidos.

## 3. Manual Operativo del ERP
- Mantener guías directas para las personas que usan el sistema:
  - **Cajeros:** Pasos para abrir turno, registrar venta mixta, cobrar ticket, aplicar descuento y cerrar turno (Arqueo X/Z).
  - **Administradores:** Gestión de catálogo de productos, ajuste de inventario, cambio manual de tasa BCV y exportación de reportes de ventas.
