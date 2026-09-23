# Punto 4 — Supervisión financiera administrativa

Implementado el 23 de septiembre de 2026. Sección Finanzas, disponible únicamente para ADMIN y SUPERADMIN.

## Alcance

- Resumen histórico por moneda: bruto y comisión de consultas completadas, neto disponible, custodia, reserva para retiros, retiros registrados completados y fondos que requieren revisión.
- Pagos, reembolsos y retiros paginados; búsqueda por nombre o referencia, estado, moneda y rango de fecha de creación/solicitud. Las fechas del formulario se interpretan en la zona local del navegador.
- Detalle de pago con cita, referencias del procesador e historial de intentos; no expone notas clínicas, contraseñas, claves de idempotencia ni errores internos del procesador.
- CLABE siempre enmascarada. Respuestas financieras con Cache-Control: no-store.
- Cálculos del resumen en Decimal y lectura transaccional consistente. No suma monedas diferentes. Los filtros del listado no alteran el resumen histórico.

## API

- GET /api/admin/finance/summary?currency=MXN
- GET /api/admin/finance/payments
- GET /api/admin/finance/refunds
- GET /api/admin/finance/payouts
- GET /api/admin/finance/payments/:id

Listados: currency, page, limit (máximo 100), status, search, from/to (ISO UTC). Importes serializados como decimales en texto, no nuevos campos Float.

## Límites explícitos

Este bloque es de consulta, no mueve dinero ni modifica estados de pagos/retiros. No implementa Stripe Connect ni habilita pagos live. No se añaden migraciones.

Los saldos son contabilidad interna, no una consulta o conciliación del saldo de Stripe. Los retiros históricos no certifican una transferencia real; los registros MOCK continúan siendo simulaciones. El proveedor configurado no sustituye al proveedor histórico de cada intento.

Disponible = neto SUCCEEDED de citas COMPLETED menos retiros REQUESTED/PROCESSING/COMPLETED. Pagos SUCCEEDED de citas PENDING/CONFIRMED quedan en custodia; CANCELLED/NO_SHOW requieren revisión. REFUND_PENDING y PARTIALLY_REFUNDED no liberan saldo. Las comisiones mostradas no restan tarifas del procesador.

El modelo no conserva el importe de un reembolso parcial. Se muestra una alerta y no se inventa el monto devuelto. La pestaña Reembolsos muestra el importe original, con esta aclaración. Una futura conciliación necesitará ampliar el registro de reembolsos.

## Verificación

- TypeScript de backend y frontend sin errores; compilación Vite correcta.
- 103 comprobaciones de integración administrativa, incluidas 59 nuevas financieras: permisos, cuentas inactivas, moneda, saldos, reembolsos, filtros, paginación y ausencia de datos confidenciales.
- Pruebas en esquema PostgreSQL temporal aislado, sin cargos externos.
- Verificación en navegador con datos sintéticos del resumen, detalle con intentos y retiros con CLABE enmascarada.

Ejecutar desde MindEase-back: `node -r ts-node/register tests/admin.integration.js`. Desde MindEase-Admin: `node --test tests/admin.test.cjs`.
