# Punto 5 — Supervisión de citas y consultas

Implementado el 23 de septiembre de 2026.

## Alcance

Sección Citas y consultas disponible para ADMIN y SUPERADMIN, en modo de solo lectura.

- Listado paginado con paciente, psicólogo, horario programado y estados independientes de cita, consulta y pago.
- Búsqueda por nombre o ID de cita; filtros por los tres estados y por inicio programado. Se puede filtrar por ausencia de consulta o pago.
- Contadores de citas por estado sobre todos los resultados filtrados, no únicamente la página visible.
- Detalle operativo con fechas de creación/actualización, inicio/fin registrados de consulta y referencia del pago.
- Fechas del formulario y visualización en hora local del navegador; API en ISO UTC.
- Cargas cancelables para evitar sobrescribir filtros recientes con respuestas anteriores. Paginación con orden startAt/id y lectura transaccional consistente de listado y contadores.

## Seguridad

Endpoints GET /api/admin/appointments y GET /api/admin/appointments/:id. Autenticación, validación de cuenta activa y acceso exclusivo ADMIN/SUPERADMIN.

Selección explícita de campos: nunca retorna clinicalNotes, meetingUrl, cancellationReason, credenciales, datos bancarios o documentos. Los motivos libres de cancelación pueden contener información clínica y se excluyen deliberadamente. Respuestas con Cache-Control: no-store.

No añade facultades para modificar estados, cancelar citas, iniciar/finalizar sesiones o mover dinero. Tampoco implementa chat privado ni Jitsi. No requiere migraciones.

## Pruebas

- TypeScript de backend y frontend compilado sin errores; build Vite correcto.
- Integración administrativa: 141 comprobaciones aprobadas, incluidas 38 nuevas de este módulo.
- Frontend: 12 pruebas aprobadas, incluidas permisos y contrato del cliente de citas.
- Integración con datos sintéticos en esquema PostgreSQL temporal aislado; comprobaciones de permisos, campos sensibles ausentes, filtros, estados independientes, rangos, paginación, cuentas inactivas y errores 400/404.
- En esta entrega no se ejecutaron pruebas visuales automatizadas del nuevo módulo.

Comandos: `node -r ts-node/register tests/admin.integration.js` desde MindEase-back y `node --test tests/admin.test.cjs` desde MindEase-Admin.
