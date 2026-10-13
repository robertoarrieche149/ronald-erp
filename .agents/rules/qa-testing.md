---
description: Estándares de Aseguramiento de Calidad (QA), pruebas unitarias, integración y validación
globs: **/*.test.{js,jsx,ts,tsx}, **/*.spec.{js,jsx,ts,tsx}, tests/**/*
alwaysApply: false
---

# 🧪 QA & Testing Engineering Standards

El software de gestión empresarial y puntos de venta maneja dinero, stock y facturación. Un fallo en producción significa pérdidas económicas directas.

## 1. Pirámide de Pruebas
- **Pruebas Unitarias (Base de la pirámide):**
  - Pruebas exhaustivas para toda la lógica matemática y contable:
    - Cálculo de subtotales, descuentos por porcentaje y montos fijos.
    - Conversión multimoneda (USD a VES con tasa BCV vigente).
    - Desglose de impuestos (IVA, exentos, IGTF si aplica).
    - Cuadre de caja y cálculo de diferencias en arqueos (faltante / sobrante).
- **Pruebas de Integración:**
  - Validar el flujo del carrito de compras (`useCartStore`): agregar producto, incrementar cantidad, sobrepasar stock disponible, aplicar descuento, vaciar carrito.
  - Validación de formularios: ingreso de cédula/RIF, correo, montos de pago en múltiples métodos (efectivo, pago móvil, tarjeta, zelle).
- **Pruebas de Flujo Extremo (Edge Cases):**
  - Pago exacto, pago con vuelto en bolívares, pago mixto (parte USD, parte VES).
  - Venta con producto en stock 0 o decimal (productos pesados como charcutería/frutas).

## 2. Estructura de Pruebas (Patrón AAA)
Cada test debe estructurarse limpiamente en tres fases:
```javascript
test('debe calcular correctamente el vuelto en bolívares al pagar con USD', () => {
  // 1. Arrange (Preparar datos y contexto)
  const totalUSD = 10.0;
  const tasaBCV = 45.0;
  const montoPagadoUSD = 20.0;

  // 2. Act (Ejecutar la función bajo prueba)
  const vueltoEnVES = calcularVuelto(totalUSD, montoPagadoUSD, tasaBCV);

  // 3. Assert (Verificar el resultado esperado)
  expect(vueltoEnVES).toBe(450.0);
});
```

## 3. Pruebas Deterministas y Mocks
- **Aislamiento Total:**
  - Las pruebas unitarias no deben hacer peticiones de red reales ni conectarse a la base de datos de producción.
  - Mockea las respuestas de Supabase y las APIs externas (ej. API de tasa BCV).
- **Cero Flakiness:**
  - Evitar timeouts arbitrarios (`sleep(1000)`). Esperar estados específicos mediante utilidades como `waitFor`.
