# Panel administrativo — correcciones e integración

## Implementado en este bloque

- Selección de especialidades por UUID completo al editar/eliminar, incluso después de filtrar.
- Rutas reales de Community, recuperación de todas las páginas de reportes y cargas independientes por bandeja.
- Inspección del contenido de publicaciones; ocultar/reactivar publicaciones y comentarios; activar/desactivar canales denunciados solo para administradores.
- Apertura de evidencias a través de enlaces autorizados del backend, sin compartir el token de sesión.
- Perfil real obtenido mediante `/users/profile`, navegación y cargas según roles, cierre de sesión y manejo central de 401.
- Credenciales de demostración eliminadas del login. Si eran válidas, aún debe rotarse la contraseña de esa cuenta; quitar código no revoca credenciales.
- Acciones rápidas de rechazo/corrección abren el expediente para documentar el dictamen, sin motivos genéricos automáticos.
- Auditoría conserva la acción real y no inventa direcciones IP.
- Catálogos no persistentes marcados como demostración, sin edición. Búsqueda global y botones decorativos sin funcionalidad retirados.
- Consola de soporte: búsqueda, filtro por estado, paginación, detalle, asignación propia/desasignación, estado, prioridad, respuesta pública, nota interna y adjuntos privados.
- Backend: moderadores pueden consultar evidencias de reportes de conducta, no archivos arbitrarios de soporte. Notificaciones administrativas restringidas a su destinatario.

El enlace de expediente desde Usuarios se conserva: el backend ya acepta tanto el ID de solicitud como el de perfil. No era necesario cambiarlo.

## Validación y despliegue

`npm test` ejecuta pruebas con el runner de Node; compila en memoria los servicios TypeScript reales y sustituye HTTP/navegador. Incluye una comprobación estructural de selección de especialidades. No son pruebas visuales extremo a extremo.

`npm run build` compila el panel. Las pruebas de soporte del backend comprueban también el aislamiento de evidencias y notificaciones en un esquema temporal.

Los cambios de backend de este bloque no requieren migraciones. Es necesario reconstruir el contenedor local para activar las nuevas reglas de autorización; no se ha hecho automáticamente. El panel se debe servir con `VITE_API_URL` apuntando al backend correcto. No se modificaron claves Stripe ni se realizaron cobros.

## Pendientes explícitos

- Panel financiero y endpoints administrativos específicos (pagos, comisiones, custodia, reembolsos y retiros); no se añadieron acciones monetarias manuales.
- Supervisión administrativa de citas y consultas sin notas clínicas.
- Administración general de canales/categorías fuera de los reportes, y persistencia real de los catálogos marcados como demostración.
- Asignación de tickets a un agente distinto del usuario conectado y dashboard de métricas de soporte.
- Pruebas visuales y extremo a extremo por rol. ESLint aún presenta deuda de tipos y hooks en archivos existentes.
- Chat privado y Jitsi pertenecen a fase 6 y no forman parte de este bloque del panel.
