---
description: Estándares de Backend, integración de APIs, transacciones seguras y lógica de negocio
globs: src/lib/**/*, src/services/**/*, src/stores/**/*
alwaysApply: false
---

# ⚙️ Backend & API Integration Standards

La comunicación con el backend (Supabase, servicios externos como BCV o pasarelas de pago) debe ser resiliente, predecible y consistente.

## 1. Arquitectura de Servicios y Capas
- **Capa de Abstracción de Datos:**
  - Los componentes de React nunca deben llamar consultas complejas directamente a `supabase.from(...)`.
  - Encapsular las llamadas en servicios o hooks reutilizables (`useProducts`, `useClientes`, `useSalesService`).
- **Separación de Lógica Contable y Monetaria:**
  - Cálculos financieros (subtotales, descuentos, cálculo de IVA, conversión USD <-> VES) deben realizarse en funciones puras y deterministas con redondeo bancario o precisión a 2 decimales (`Math.round((val + Number.EPSILON) * 100) / 100`).

## 2. Resiliencia ante Fallos de Red
- **Políticas de Reintento (Retry & Backoff):**
  - Para servicios externos sujetos a fallos transitorios (ej. consulta de tasa BCV), implementar reintentos con retraso exponencial antes de fallar.
- **Cache Local & Modo Offline-Aware:**
  - Si la conexión se interrumpe momentáneamente durante una venta, la aplicación debe alertar al usuario sin perder los datos acumulados en el carrito actual.
  - Almacenar temporalmente los productos más consultados para evitar bloqueos por latencia de red.

## 3. Integridad en Transacciones Críticas
- **Procesamiento de Ventas y Facturación:**
  - Cada venta debe emitirse con un identificador único (UUID o código de transacción).
  - La deducción de stock y el registro de la venta deben realizarse de forma atómica en base de datos mediante funciones RPC o transacciones para evitar inconsistencias de inventario.
- **Auditoría:**
  - Toda operación sensible (modificación de precios, anulación de tickets, ajuste manual de stock, apertura/cierre de caja) debe registrar quién la realizó, fecha y motivo.
