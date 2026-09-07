# 💻 MindEase Admin Panel

Panel de Control Administrativo, Acreditación Clínica y Auditoría Forense para la plataforma **MindEase**, desarrollado con **React 19**, **TypeScript**, **Vite 8** y **Tailwind CSS**.

---

## 🛠️ Stack Tecnológico

* **Biblioteca UI:** React 19
* **Lenguaje:** TypeScript (v5.6+)
* **Empaquetador y Dev Server:** Vite (v8.2+)
* **Estilos y Diseño:** Tailwind CSS (v3.4+)
* **Cliente HTTP:** Axios (v1.19+)
* **Iconografía:** Google Material Symbols (Outlined & Rounded)

---

## 📋 Requisitos Previos

* **[Node.js](https://nodejs.org/)** (v20.x o superior)
* **npm** (v10 o superior)
* **Backend de MindEase (`MindEase-back`)** ejecutándose en `http://localhost:3000`

---

## 📁 Estructura del Repositorio

```text
MindEase-Admin/
├── public/                  # Favicons y activos estáticos públicos
├── src/
│   ├── components/          # Componentes reutilizables (Header, Sidebar, NotificationsPopover, etc.)
│   ├── views/               # Vistas principales del panel administrativo:
│   │   ├── DashboardView.tsx       # KPIs en tiempo real, Bento cards, top especialidades
│   │   ├── RequestsView.tsx        # Solicitudes de acreditación clínica de psicólogos
│   │   ├── DossierView.tsx         # Expediente clínico completo, visor de PDFs y validación por documento
│   │   ├── UserManagementView.tsx  # Gestión de usuarios, roles en vivo y suspensión/reactivación
│   │   ├── CatalogsView.tsx        # Catálogo dinámico de especialidades sincronizado con PostgreSQL
│   │   ├── AuditLogsView.tsx       # Logs forenses, exportación CSV y visor de metadatos
│   │   └── ModerationView.tsx      # Gestión de reportes y canales de moderación
│   ├── services/            # Conexión API con Axios (adminService.ts, api.ts)
│   ├── App.tsx              # Enrutador principal de vistas y gestión del estado global
│   ├── index.css            # Configuración de estilos globales y variables Tailwind
│   └── main.tsx             # Punto de entrada de React
├── package.json             # Dependencias y scripts de Vite
├── tailwind.config.js       # Configuración de colores semánticos y tokens de diseño
├── tsconfig.json            # Configuración de TypeScript
└── vite.config.ts           # Configuración de empaquetado y plugins de Vite
```

---

## 🚀 Guía de Instalación y Compilación

### 1. Instalación de Dependencias
Abre una terminal en este directorio (`MindEase-Admin`):
```bash
cd MindEase-Admin
npm install
```

### 2. Ejecutar en Modo Desarrollo (HMR)
Inicia el servidor de desarrollo local con recarga rápida de módulos:
```bash
npm run dev
```
* Abre tu navegador en: **[http://localhost:5173](http://localhost:5173)**

### 3. Compilación para Producción (Build)
Genera el paquete optimizado y minificado para despliegue en producción:
```bash
npm run build
```
* Los archivos compilados y listos para producción se crearán en la carpeta `dist/`.

### 4. Previsualizar la Compilación de Producción
Para probar localmente el bundle generado en `/dist`:
```bash
npm run preview
```

### 5. Análisis de Calidad y Tipado (Linter)
```bash
npm run lint
```

---

## 🧩 Módulos y Funcionalidades Incluidas

| Módulo | Vista | Descripción |
| :--- | :--- | :--- |
| **Dashboard Operativo** | `DashboardView.tsx` | KPIs en vivo desde PostgreSQL (cuentas activas, tasa de aprobación, distribución de estados y gráfico de especialidades demandadas). |
| **Acreditación de Psicólogos** | `RequestsView.tsx` | Bandeja de solicitudes de verificación pendientes, en revisión y resueltas con búsqueda instantánea. |
| **Expediente Clínico (Dossier)** | `DossierView.tsx` | Visualizador seguro de documentos PDF/imágenes, aprobación o rechazo de solicitud y **validación individual por documento con fechas de vigencia**. |
| **Gestión de Usuarios y Roles** | `UserManagementView.tsx` | Modificación de roles (`ADMIN`, `REVISOR`, `USER`, etc.) en caliente y suspensión/reactivación inmediata de cuentas. |
| **Catálogo de Especialidades** | `CatalogsView.tsx` | CRUD dinámico de especialidades conectado a PostgreSQL con recuento de especialistas asignados. |
| **Seguridad y Auditoría** | `AuditLogsView.tsx` | Registro forense de acciones con filtros por severidad, modal de inspección JSON y botón para **descargar reporte CSV de cumplimiento**. |
| **Centro de Notificaciones** | `NotificationsPopover.tsx` | Campana interactiva en el Header con conteo no leído y modal para emitir comunicados globales a todos los usuarios. |

---

## 🔌 Configuración de Conexión con el Backend

Por defecto, el panel administrativo se comunica con la API de MindEase a través de `src/services/api.ts` apuntando a:
```text
http://localhost:3000/api
```
* La autenticación se maneja automáticamente adjuntando el token JWT guardado en `localStorage` (`admin_token`) en las cabeceras `Authorization: Bearer <token>`.
