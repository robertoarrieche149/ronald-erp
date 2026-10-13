---
description: Estándares de Base de Datos relacional, PostgreSQL, Supabase, integridad y optimización
globs: **/*.sql, supabase/**/*
alwaysApply: false
---

# 🗄️ Database & PostgreSQL / Supabase Standards

La base de datos es la fuente de verdad contable y operativa del ERP. La integridad referencial, el rendimiento de consultas y la seguridad son no negociables.

## 1. Diseño del Esquema e Integridad Referencial
- **Claves Primarias:** Usa siempre identificadores únicos (`id UUID DEFAULT gen_random_uuid() PRIMARY KEY` o `BIGINT GENERATED ALWAYS AS IDENTITY`).
- **Claves Foráneas (FK) e Índices:**
  - Toda clave foránea debe tener su índice correspondiente para acelerar `JOIN`s y evitar bloqueos en operaciones en cascada.
  - Define políticas de eliminación explícitas (`ON DELETE RESTRICT` para clientes/productos con ventas históricas; `ON DELETE CASCADE` solo para detalles dependientes como `venta_items`).
- **Restricciones de Negocio (`CHECK` constraints):**
  - Los precios y cantidades no pueden ser negativos (`stock >= 0`, `precio > 0`).
  - Los estados deben restringirse mediante `ENUM` o restricciones `CHECK (estado IN ('activo', 'inactivo', 'anulado'))`.

## 2. Optimización y Rendimiento de Consultas
- **Prevención de Problemas N+1:**
  - Recupera ventas con sus detalles mediante subconsultas o funciones agregadas en una sola petición (`select('*, venta_items(*)')`), jamás ejecutando una consulta por cada fila.
- **Índices Estratégicos:**
  - Índices B-Tree en columnas filtradas frecuentemente (`codigo_barra`, `categoria_id`, `created_at`, `cliente_id`).
  - Índices de texto completo (`pg_trgm` o `tsvector`) para búsqueda rápida de nombres de productos en tiempo real mientras el cajero escribe.
- **Transacciones Cortas:**
  - Mantén las transacciones breves para no agotar el pool de conexiones ni retener bloqueos en tablas concurridas.

## 3. Seguridad a Nivel de Filas (Row Level Security - RLS)
- **RLS Habilitado en Todas las Tablas:**
  - `ALTER TABLE <tabla> ENABLE ROW LEVEL SECURITY;`
- **Políticas Estrictas por Rol:**
  - **Cajeros:** Solo pueden insertar nuevas ventas y consultar productos/clientes activos. No pueden editar precios ni eliminar registros históricos.
  - **Administradores:** Acceso completo a reportes, auditorías, modificación de catálogos y configuración de usuarios.
- **Funciones de Seguridad Defensivas (`SECURITY DEFINER`):**
  - Toda función `SECURITY DEFINER` debe fijar explícitamente el `search_path`: `SET search_path = public;`.
