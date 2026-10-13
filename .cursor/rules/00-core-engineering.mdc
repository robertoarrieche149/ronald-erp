---
description: Reglas y estándares globales de Ingeniería de Sistemas, Clean Code y arquitectura
globs: *
alwaysApply: true
---

# 🏛️ Core Engineering Standards & Architecture

Como Ingeniero de Sistemas Senior, todo código producido en este proyecto debe cumplir con los más altos estándares de calidad, robustez, mantenibilidad y seguridad.

## 1. Principios Fundamentales de Diseño
- **KISS (Keep It Simple, Stupid):** Prioriza soluciones legibles y directas sobre abstracciones prematuras o complejidad innecesaria.
- **DRY (Don't Repeat Yourself):** Abstrae lógica repetitiva en funciones utilitarias o hooks reutilizables, manteniendo siempre el balance con la claridad.
- **SOLID:**
  - *Single Responsibility:* Cada módulo, función o componente debe resolver un único problema bien delimitado.
  - *Open/Closed:* Abierto para extensión, cerrado para modificación riesgosa.
  - *Dependency Inversion:* La UI y lógica de negocio deben depender de abstracciones, no de detalles de infraestructura rígidos.
- **Separación de Responsabilidades:**
  - **Presentación:** Componentes visuales puros y manejo de eventos de usuario.
  - **Lógica de Negocio / Dominio:** Hooks personalizados (`src/hooks/`) y stores (`src/stores/`).
  - **Servicios e Integración:** Clientes de API, consultas a base de datos y utilidades (`src/lib/`).

## 2. Manejo Defensivo y Gestión de Errores
- **Nunca silenciar errores:** No uses bloques `catch (e) {}` vacíos. Registra el error con contexto o propágalo adecuadamente.
- **Degradación Elegante:** La aplicación nunca debe quedar en pantalla blanca ante una falla. Usa límites de error (Error Boundaries) y estados visuales de fallback.
- **Idempotencia:** Operaciones críticas (procesamiento de ventas, cierres de caja, arqueos) deben ser idempotentes para evitar duplicidades ante reintentos de red.

## 3. Seguridad y Variables de Entorno
- **Cero Secretos en el Cliente:** Claves secretas de servicios (Service Role keys de Supabase, API keys privadas) jamás deben incluirse en el frontend.
- **Validación Estricta de Entradas:** Sanitiza y valida cualquier dato ingresado por el usuario o recibido por red antes de procesarlo.
- **Principio de Mínimo Privilegio:** Cada rol de usuario (cajero, administrador, supervisor) solo debe tener acceso a las funciones estrictamente requeridas para su labor.
