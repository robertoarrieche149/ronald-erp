# Documentación del Proyecto: Minimarket POS & Mini-ERP

## 1. Descripción General

Aplicación web progresiva (PWA) con enfoque **Mobile-First** diseñada para la gestión rápida de ventas y control de inventario en un minimarket. El sistema permite facturar de manera ágil desde un dispositivo móvil, manejar una doble moneda (USD/Bs) con tasa de cambio dinámica, registrar pagos mixtos y llevar control de créditos y auditorías de inventario.

## 2. Stack Tecnológico

* **Frontend:** React.js, Vite.
* **Estilos:** Tailwind CSS (Soporte nativo para modo claro Blanco/Naranja y modo oscuro).
* **Gestión de Estado:** Zustand.
* **Iconos:** Lucide-React.
* **PWA:** `vite-plugin-pwa`.
* **Backend & Base de Datos:** Supabase (PostgreSQL, Autenticación, Row Level Security).
* **Integración Externa:** API del Banco Central de Venezuela (BCV) para tasa de cambio.

## 3. Roles y Permisos

### 3.1. Administrador (Dueño)

* Acceso total al sistema.
* **Gestión de Inventario:** Crear, leer, actualizar y eliminar productos.
* **Reportes:** Ver métricas de ventas, ganancias y métodos de pago consolidados.
* **Clientes:** Gestionar listado de clientes a crédito, ver deudas y registrar abonos.
* **Auditorías:** Revisar resultados del arqueo de inventario (Físico vs. Sistema) para identificar descuadres.
* **Configuración:** Establecer tasa de cambio manual o activar sincronización con BCV.

### 3.2. Empleado (Cajero)

* **POS (Punto de Venta):** Buscar productos, agregar al carrito y procesar cobros.
* **Auditoría (Arqueo):** Contar la mercancía física e ingresar la cantidad al sistema (solo reporta, no modifica el stock base).
* *Restricciones:* No tiene acceso a reportes financieros, ni puede modificar la información base de los productos.

## 4. Características Principales

### 4.1. Módulo de Ventas (POS)

* **Buscador en Tiempo Real:** Barra de búsqueda superior para filtrar productos rápidamente en el móvil.
* **Doble Moneda:** El precio base del producto está en USD, pero la interfaz muestra constantemente su equivalente en Bs.
* **Paperless:** Las ventas solo se registran en la base de datos (sin impresión de tickets o facturas físicas).

### 4.2. Pagos Mixtos y Créditos

* **Múltiples Líneas de Pago:** Un mismo recibo puede pagarse con una combinación de métodos (ej. $10 en Efectivo USD + 200 Bs en Pago Móvil).
* **Campos de Pago:** Método (Efectivo, Pago Móvil, Punto, Zelle), Moneda, Monto, Referencia (Obligatorio para pagos electrónicos).
* **Ventas a Crédito:** Al seleccionar "A crédito", el sistema obliga al cajero a asignar un cliente registrado en la base de datos. Para ventas de contado, el cliente es anónimo.

### 4.3. Configuración de Tasa de Cambio

* **Modo Automático:** Consulta al iniciar sesión la tasa actual mediante una API del BCV.
* **Modo Manual:** Interruptor (*switch*) de emergencia que permite al Administrador fijar la tasa de cambio en caso de caída del servicio de la API.

## 5. Esquema de Base de Datos (Supabase)

A continuación, la estructura relacional sugerida para PostgreSQL:

| Tabla | Descripción | Columnas Principales | 
| ----- | ----- | ----- | 
| `users` | Usuarios del sistema | `id`, `email`, `role` ('admin', 'employee') | 
| `products` | Catálogo de inventario | `id`, `name`, `barcode`, `price_usd`, `stock` | 
| `customers` | Clientes para créditos | `id`, `name`, `phone`, `document_id`, `balance_usd` | 
| `sales` | Registro de facturas | `id`, `user_id`, `customer_id` (nullable), `total_usd`, `status` ('paid', 'credit'), `created_at` | 
| `sale_items` | Productos por venta | `id`, `sale_id`, `product_id`, `quantity`, `unit_price_usd` | 
| `sale_payments` | Líneas de pago mixto | `id`, `sale_id`, `method`, `currency`, `amount`, `reference_number` | 
| `inventory_audits` | Arqueos de caja | `id`, `employee_id`, `product_id`, `system_stock`, `physical_count`, `difference`, `created_at` | 
| `settings` | Configuración global | `id`, `exchange_rate`, `is_rate_manual`, `updated_at` | 

## 6. Consideraciones de UI/UX

* **Bottom Navigation Bar:** Navegación principal en la parte inferior de la pantalla (Inicio, POS, Clientes, Ajustes).
* **Botones de Acción (CTAs):** Botones grandes y accesibles con el pulgar.
* **Modo Oscuro:** Implementado globalmente para reducir la fatiga visual, configurable según la preferencia del dispositivo del usuario.

## 7. Despliegue e Instalación Local

Para levantar el entorno de desarrollo:

1. Clonar el repositorio.
2. Crear un archivo `.env.local` con las variables de entorno de Supabase (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
3. Instalar dependencias: `npm install`
4. Iniciar servidor: `npm run dev`