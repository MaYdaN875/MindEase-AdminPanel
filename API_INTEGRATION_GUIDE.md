# Guía de Integración de API - Panel Administrativo (MindEase-Admin)

Esta guía detalla los endpoints, esquemas de datos, flujo de autenticación y lógica necesaria para conectar el panel web administrativo React/TypeScript con el backend de MindEase.

---

## 1. Configuración de Autenticación y Cabeceras

Todos los endpoints administrativos requieren autenticación mediante JWT. Para consumirlos, la aplicación debe adjuntar el token del administrador en las cabeceras HTTP de cada petición.

*   **URL Base:** `http://localhost:3000` (o la dirección configurada de producción).
*   **Cabecera de Autorización:** `Authorization: Bearer <TOKEN>`
*   **Roles Permitidos:** 
    *   Para la gestión de solicitudes y descarga de archivos: `ADMIN` o `REVISOR`.
    *   Para consultar logs de auditoría: `ADMIN` o `SUPERADMIN`.

---

## 2. Catálogo de Endpoints de Administración

### 2.1 Listar Solicitudes de Verificación
Devuelve un listado de todas las solicitudes de validación de psicólogos.

*   **Ruta:** `GET /api/admin/psychologist-applications`
*   **Query Params (Opcional):**
    *   `status`: Filtra por estado de la solicitud (`PENDING`, `IN_PROGRESS`, `RESOLVED`).
*   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "status": "success",
      "data": {
        "applications": [
          {
            "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
            "psychologistId": "psy_profile_uuid",
            "revisorId": "admin_uuid_or_null",
            "status": "PENDING",
            "createdAt": "2026-08-05T12:00:00.000Z",
            "updatedAt": "2026-08-05T12:00:00.000Z",
            "psychologist": {
              "id": "psy_profile_uuid",
              "licenseNumber": "CED-99887766",
              "status": "PENDIENTE_REVISION",
              "user": {
                "id": "user_uuid",
                "name": "Dr. Juan Pérez",
                "email": "juan.perez@mindease.com",
                "phone": "5551234567"
              },
              "specialties": [
                {
                  "specialty": {
                    "id": "spec_uuid",
                    "name": "Ansiedad"
                  }
                }
              ]
            }
          }
        ]
      }
    }
    ```

---

### 2.2 Obtener Detalle de Expediente (Dossier)
Devuelve toda la información detallada del psicólogo, incluyendo especialidades, documentos adjuntos e historial de revisiones previas.

*   **Ruta:** `GET /api/admin/psychologist-applications/:applicationId`
*   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "status": "success",
      "data": {
        "request": {
          "id": "application_uuid",
          "status": "IN_PROGRESS",
          "revisorId": "admin_uuid",
          "psychologist": {
            "id": "psy_profile_uuid",
            "description": "Semblanza del psicólogo...",
            "academicBackground": "Universidad Nacional...",
            "experience": "8 años de práctica...",
            "consultationPrice": 700.0,
            "location": "Guadalajara, Jal.",
            "licenseNumber": "CED-99887766",
            "status": "EN_REVISION",
            "user": {
              "id": "user_uuid",
              "name": "Dr. Juan Pérez",
              "email": "juan.perez@mindease.com",
              "phone": "5551234567"
            },
            "specialties": [
              { "specialty": { "name": "Ansiedad" } }
            ],
            "documents": [
              {
                "id": "doc_uuid_1",
                "documentType": "ID",
                "originalFilename": "ine_perez.pdf",
                "mimeType": "application/pdf",
                "fileSize": 1048576,
                "status": "PENDING"
              },
              {
                "id": "doc_uuid_2",
                "documentType": "DEGREE",
                "originalFilename": "titulo_perez.png",
                "mimeType": "image/png",
                "fileSize": 2048576,
                "status": "PENDING"
              }
            ],
            "statusHistory": [
              {
                "id": "log_uuid",
                "fromStatus": "PENDIENTE_REVISION",
                "toStatus": "EN_REVISION",
                "comment": "Asignado a revisor administrativo",
                "changedAt": "2026-08-05T12:30:00.000Z",
                "changedBy": {
                  "name": "Admin Revisor",
                  "email": "admin@mindease.com"
                }
              }
            ]
          },
          "reviews": []
        }
      }
    }
    ```

---

### 2.3 Asignarse como Revisor
Asigna al administrador logueado como encargado de auditar y calificar la solicitud. Actualiza el estado del psicólogo a `EN_REVISION`.

*   **Ruta:** `POST /api/admin/psychologist-applications/:applicationId/assign`
*   **Cuerpo (Body):** Vacío.
*   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "status": "success",
      "message": "Revisor asignado con éxito. Estado: EN_REVISION"
    }
    ```

---

### 2.4 Solicitar Corrección de Cambios
Envía observaciones detallando qué documentos o información están incorrectos (ej. fotografía borrosa o cédula ilegible). Cambia el estado del perfil a `REQUIERE_CAMBIOS`.

*   **Ruta:** `POST /api/admin/psychologist-applications/:applicationId/request-changes`
*   **Cuerpo (Body):**
    ```json
    {
      "notes": "Por favor vuelve a subir tu título oficial; la imagen actual está demasiado borrosa."
    }
    ```
*   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "status": "success",
      "message": "Solicitud marcada para corrección. Se han notificado las observaciones."
    }
    ```

---

### 2.5 Rechazar Solicitud Administrativamente
Rechaza la solicitud debido a falsificación, inconsistencias de cédula o incumplimiento. Cambia el estado del perfil a `RECHAZADO`.

*   **Ruta:** `POST /api/admin/psychologist-applications/:applicationId/reject`
*   **Cuerpo (Body):**
    ```json
    {
      "notes": "Motivo del rechazo administrativo por parte del comité de integridad clínica."
    }
    ```
*   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "status": "success",
      "message": "Solicitud rechazada correctamente."
    }
    ```

---

### 2.6 Aprobar Solicitud
Valida e incorpora oficialmente al psicólogo. 
*   Actualiza el estado del perfil a `VERIFICADO`.
*   Cambia automáticamente el rol del usuario a `PSYCHOLOGIST_VERIFIED` (removiendo `PSYCHOLOGIST_APPLICANT`).
*   Permite al psicólogo aparecer en las búsquedas y agendar citas en Flutter.

*   **Ruta:** `POST /api/admin/psychologist-applications/:applicationId/approve`
*   **Cuerpo (Body):** Vacío.
*   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "status": "success",
      "message": "Solicitud aprobada con éxito. El psicólogo ya es un profesional verificado."
    }
    ```

---

### 2.7 Visualizar/Descargar Documento Privado
Descarga de forma segura el archivo cargado por el psicólogo (cédula, título, identificación). El backend verifica permisos del revisor y hace streaming del buffer del archivo con la cabecera MIME correspondiente.

*   **Ruta:** `GET /api/admin/documents/:documentId/download`
*   **Respuesta:** Retorna el archivo binario (`stream`) con la cabecera `Content-Type` correspondiente (ej: `application/pdf` o `image/png`).

*   **Consejo de React:** Para mostrar el documento en pantalla, puedes renderizarlo usando un visor de PDF o una etiqueta `<img>` pasando la URL autenticada o cargando el blob en el estado de React.

---

### 2.8 Historial de Auditoría y Trazabilidad
Muestra la lista de logs de todas las acciones hechas en el sistema por administradores o revisores (trazabilidad y cumplimiento legal).

*   **Ruta:** `GET /api/admin/audit-logs`
*   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "status": "success",
      "data": {
        "logs": [
          {
            "id": "log_uuid",
            "action": "APPROVE_APPLICATION",
            "details": { "applicationId": "app_uuid", "psychologistId": "psy_uuid" },
            "createdAt": "2026-08-05T15:00:00.000Z",
            "user": {
              "name": "Administrator Tester",
              "email": "admin@mindease.com"
            }
          }
        ]
      }
    }
    ```

---

## 3. Ejemplo de Integración en React (TypeScript)

### 3.1 Cliente de Axios Autenticado
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
});

// Adjuntar automáticamente el token en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### 3.2 Servicio de Administración
```typescript
import api from './api';

export interface Application {
  id: string;
  status: string;
  createdAt: string;
  psychologist: {
    licenseNumber: string;
    status: string;
    user: {
      name: string;
      email: string;
      phone: string;
    };
  };
}

export const getPendingApplications = async (): Promise<Application[]> => {
  const response = await api.get('/admin/psychologist-applications?status=PENDING');
  return response.data.data.applications;
};

export const assignReview = async (id: string): Promise<void> => {
  await api.post(`/admin/psychologist-applications/${id}/assign`);
};

export const approveApplication = async (id: string): Promise<void> => {
  await api.post(`/admin/psychologist-applications/${id}/approve`);
};

export const requestCorrections = async (id: string, notes: string): Promise<void> => {
  await api.post(`/admin/psychologist-applications/${id}/request-changes`, { notes });
};

// Descargar archivo privado como blob (PDF o imagen)
export const getPrivateDocumentBlobUrl = async (documentId: string): Promise<string> => {
  const response = await api.get(`/admin/documents/${documentId}/download`, {
    responseType: 'blob',
  });
  return URL.createObjectURL(response.data);
};
```

---

## 4. Estructura de Carpetas Recomendada para MindEase-Admin

Para integrar este flujo en el proyecto React actual, mapea los servicios anteriores a las siguientes carpetas:

*   📂 `src/services/adminService.ts` -> Métodos Axios descritos arriba.
*   📂 `solicitudes_de_psic_logos/` -> Tabla para listar solicitudes pendientes y en revisión.
*   📂 `expediente_del_psic_logo/` -> Vista de detalle/dossier del psicólogo con visor de PDF/imagen embebido y botones de acción (Aprobar, Solicitar Cambios, Rechazar).
*   📂 `dashboard_operativo/` -> Vista general con estadísticas de solicitudes procesadas.
*   📂 `auditor_a_y_trazabilidad/` -> Vista para renderizar la lista de logs de auditoría general.
