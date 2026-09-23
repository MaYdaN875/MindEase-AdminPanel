# Panel administrativo — estado al 23 de septiembre de 2026

## Tres bloques implementados

1. Activación y seguridad: panel local http://localhost:4173, identidad real, navegación por rol, cierre de sesión y manejo de 401. Solo la cuenta de demostración autorizada quedó INACTIVE, con auditoría DISABLE_DEMO_ACCOUNT. Adjuntos privados con autorización, visor interno, descarga y renovación de enlaces temporales; moderadores sin acceso a archivos ajenos de soporte.
2. Soporte: asignación a otros agentes activos, filtros por estado/prioridad/categoría/agente, paginación consistente, métricas con tamaño de muestra, navegación reporte → ticket, respuestas públicas, notas internas y adjuntos privados.
3. Community: administración general de canales, categorías, publicaciones, comentarios e historial. Categorías editables solo por ADMIN/SUPERADMIN. Moderación con motivo y auditoría transaccional. No se permite publicar borradores mediante reactivación ni que el profesional reactive un canal deshabilitado por administración. Desactivar categorías no oculta canales existentes.

Se conservan las correcciones de selección de especialidades por UUID, dictámenes documentados, auditoría sin IP inventada y notificaciones restringidas al destinatario.

## Validación y datos

- Frontend: 8 pruebas aprobadas; compilación TypeScript/Vite exitosa.
- Integración administrativa: 44 comprobaciones aprobadas.
- Regresión de soporte: 64 comprobaciones aprobadas.
- Regresión de Community: 38 comprobaciones aprobadas.
- Navegador con datos sintéticos: ADMIN, SUPERADMIN, REVISOR, MODERATOR y SUPPORT; creación de categoría, asignación de agente, navegación reporte → ticket y carga efectiva de imagen privada en el visor.
- Esquemas de prueba temporales aislados. No se sustituyó la base existente ni se requirieron migraciones.
- Conteos conservados: 20 usuarios, 23 citas, 10 pagos, 1 canal y 1 publicación. Ningún usuario eliminado.
- Respaldo preventivo: MindEase-back/storage/backups/before_admin_blocks_20260922.sql.
- No se modificaron claves Stripe ni se realizaron cobros.
- Prueba administrativa: `node -r ts-node/register tests/admin.integration.js` desde MindEase-back.

Estas comprobaciones no equivalen a una auditoría completa de seguridad ni cubren todos los flujos de producción.

## Pendientes

- Panel financiero de consulta implementado (ver FINANCE_IMPLEMENTATION.md). Quedan pendientes operaciones monetarias administrativas, conciliación con Stripe y retiros reales mediante Connect.
- Supervisión de citas y consultas implementada en modo lectura; ver APPOINTMENTS_IMPLEMENTATION.md. No expone notas clínicas ni enlaces de videollamada.
- Persistencia de los demás catálogos aún marcados como demostración.
- Deuda existente de ESLint, tipos y hooks; ampliar pruebas visuales y de accesibilidad.
- Chat privado, Jitsi y estados de consulta de fase 6 quedan fuera de estos tres bloques administrativos.
