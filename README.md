# 🎫 Sistema de Soporte de Tickets con Clasificación IA (`SupportTicketSystem`)

Plataforma Full-Stack para la gestión inteligente de mesa de ayuda y soporte técnico. El sistema automatiza la clasificación y priorización de incidentes mediante **Inteligencia Artificial**, organiza la atención mediante una **cola de turnos automática (FIFO)**, incorpora un **chat bidireccional** entre clientes y agentes de soporte, e implementa **Control de Acceso Basado en Roles (RBAC)** con autenticación **JWT**.

---

## 📋 Tabla de Contenidos
1. [Resumen Detallado del Programa](#-resumen-detallado-del-programa)
2. [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
3. [Guía de Uso del Sistema (Manual de Usuario)](#-guía-de-uso-del-sistema-manual-de-usuario)
   - [Credenciales Preconfiguradas](#-credenciales-preconfiguradas)
   - [Perfil 1: Usuario Estándar (Cliente)](#-perfil-1-usuario-estándar-cliente)
   - [Perfil 2: Administrador (Soporte Técnico)](#-perfil-2-administrador-soporte-técnico)
   - [Personalización: Modo Claro y Modo Oscuro](#-personalización-modo-claro-y-modo-oscuro)
4. [Cómo Ejecutar el Proyecto en tu Máquina Local](#-cómo-ejecutar-el-proyecto-en-tu-máquina-local)
   - [Opción A: Con Docker Compose (Recomendado)](#-opción-a-con-docker-compose-recomendado)
   - [Opción B: Ejecución Manual (Sin Docker)](#-opción-b-ejecución-manual-sin-docker)
5. [Seguridad y Protección de Datos Críticos (`.gitignore`)](#-seguridad-y-protección-de-datos-críticos-gitignore)

---

## 🧠 Resumen Detallado del Programa

**SupportTicketSystem** fue diseñado para resolver el cuello de botella común en los departamentos de soporte técnico: clasificar manualmente los reportes, saber a quién atender primero y mantener informado al usuario sobre el avance de su solicitud.

### ¿Cómo funciona el flujo del sistema?
1. **Reporte y Clasificación con IA:** Cuando un usuario reporta un incidente (título y descripción), el backend intercepta el mensaje antes de guardarlo y lo procesa con el servicio de IA (`IAIService`), asignándole automáticamente:
   - **Categoría IA:** *Hardware*, *Software*, *Red*, *Accesos*, *General*, etc.
   - **Prioridad:** *Baja*, *Media* o *Alta*.
2. **Asignación Automática de Turno en Cola (`QueuePosition`):** El backend calcula en tiempo real la posición del ticket dentro de la fila global de tickets pendientes (`Abierto` o `En Progreso`) siguiendo un orden estricto de llegada (**FIFO** — *First In, First Out*). Así el usuario sabe exactamente en qué turno será atendido (`#1`, `#2`, `#3`...).
3. **Atención y Chat Interactivo:** Tanto el usuario que reportó el problema como el administrador pueden abrir el ticket y conversar en una ventana estilo **Chat**, donde los mensajes enviados aparecen a la derecha (en azul) y los recibidos a la izquierda (en verde esmeralda), identificando claramente el nombre y rol del remitente.
4. **Resolución y Gestión de Usuarios:** El administrador conoce quién reportó cada falla (nombre y correo electrónico), actualiza el estado del ticket (`Abierto` ➔ `En Progreso` ➔ `Resuelto`), exporta reportes filtrados a **CSV** y administra las cuentas del sistema desde un panel exclusivo.

---

## 🏗️ Arquitectura del Proyecto

El proyecto está dividido en dos aplicaciones desacopladas y contenerizadas:

### 1. Backend (`SupportTicketSystemBack` — .NET 10 + Clean Architecture + CQRS)
- **`SupportTicketSystem.Domain`**: Entidades de negocio (`User`, `Ticket`, `Comment`) y enumeraciones (`TicketPriority`, `TicketStatus`).
- **`SupportTicketSystem.Application`**: Lógica de casos de uso implementada con el patrón **CQRS** y **MediatR**:
  - *Commands*: `CreateTicketCommand`, `UpdateTicketStatusCommand`, `AddCommentCommand`, `RegisterUserCommand` (con validación de correos duplicados).
  - *Queries*: `GetTicketsQuery`, `GetPaginatedTicketsQuery` (con filtrado por rol y cálculo de turno en cola), `GetCommentsByTicketIdQuery`.
- **`SupportTicketSystem.Infrastructure`**:
  - Persistencia con **Entity Framework Core** y **PostgreSQL** (`ApplicationDbContext` y migraciones automáticas).
  - Servicios de IA intercambiables: `MockTicketAnalyzerService` (activo por defecto para pruebas sin costo) y `OpenAITicketAnalyzerService` (`gpt-4o-mini`).
- **`SupportTicketSystem.API`**:
  - Controladores RESTful protegidos con **JWT Bearer** y políticas de roles (`[Authorize(Roles = "Admin")]`).
  - **Data Seeder** automático en `Program.cs` que aplica migraciones e inserta las cuentas iniciales al arrancar.

### 2. Frontend (`SupportTicketSystemFront/support-ticket-client` — React 19 + TypeScript + Vite)
- **Zustand Stores**:
  - `authStore`: Manejo de sesión JWT, ID de usuario y rol persistidos en `localStorage`.
  - `ticketStore`: Paginación, carga de comentarios y actualización de estados.
  - `themeStore`: Sincronización global del tema Claro / Oscuro.
- **React Router DOM v7**: Guardianes de navegación (`ProtectedRoute` para usuarios autenticados y `AdminRoute` para pantallas exclusivas de administración).
- **Tailwind CSS**: Diseño responsivo con soporte nativo para modo oscuro (`darkMode: 'class'`).

---

## 📖 Guía de Uso del Sistema (Manual de Usuario)

### 🔑 Credenciales Preconfiguradas
Al levantar el sistema por primera vez, se crean automáticamente dos cuentas para que puedas probar ambos roles de inmediato:

| Rol | Correo Electrónico | Contraseña | Propósito |
| :--- | :--- | :--- | :--- |
| **Administrador (`Admin`)** | `admin@test.com` | `admin123` | Gestión total de tickets, estados, exportación CSV y administración de usuarios. |
| **Usuario Estándar (`User`)** | `usuario@test.com` | `user123` | Creación de tickets, consulta de turno en fila y seguimiento por chat. |

---

### 👤 Perfil 1: Usuario Estándar (Cliente)
Al iniciar sesión con una cuenta de rol **`User`** (`usuario@test.com`):
1. **Crear un Nuevo Ticket:** En la parte superior del Dashboard verás el formulario **"Crear Nuevo Ticket"**. Ingresa un título y describe tu problema con detalle; al presionar **"Enviar Ticket"**, la IA lo clasificará automáticamente.
2. **Consultar tu Turno y Estado:** En la tabla inferior solo verás **tus propios tickets**.
   - La primera columna (**Turno**) te mostrará tu posición actual en la fila de espera (`#1`, `#2`, etc.). Cuando el administrador resuelva tu ticket, la columna mostrará **`Atendido`**.
3. **Búsqueda y Filtros:** Puedes buscar tus tickets por palabra clave o filtrarlos por estado (`Todos`, `Abiertos`, `En Progreso`, `Resueltos`).
4. **Conversar en el Chat del Ticket:** Haz clic sobre cualquier fila de la tabla para abrir el modal de detalle. Allí podrás escribir respuestas o agregar información adicional. Tus mensajes se verán a la **derecha (azul)** y las respuestas del administrador a la **izquierda (verde)**.
5. **Restricciones de Seguridad:** Un usuario estándar no puede cambiar el estado del ticket, no puede exportar a CSV ni puede entrar a `/users` o `/register`.

---

### 🛡️ Perfil 2: Administrador (Soporte Técnico)
Al iniciar sesión con una cuenta de rol **`Admin`** (`admin@test.com`):
1. **Monitoreo Global:** En las tarjetas superiores (`DashboardStats`) verás el resumen global de tickets **Abiertos**, **En Progreso**, **Resueltos** y **Urgentes Pendientes** (prioridad Alta sin resolver).
2. **Identificación del Solicitante:** En la tabla principal verás **todos los tickets de todos los usuarios**, incluyendo la columna **"Usuario"** con el nombre completo y correo electrónico de quien reportó la falla (dato que también aparece resaltado al abrir el modal del ticket).
3. **Cambiar el Estado del Ticket:** Al hacer clic en un ticket para abrir su ventana de detalle, encontrarás en la parte inferior derecha el selector **`Estado:`** exclusivo para administradores, desde donde puedes cambiar el ticket entre:
   - `Abierto`
   - `En Progreso`
   - `Resuelto` (al marcarlo como resuelto, el ticket sale automáticamente de la cola de turnos pendientes y los demás tickets avanzan un puesto).
4. **Exportar Reportes a CSV:** Con el botón verde **"Exportar CSV"** puedes descargar en cualquier momento un archivo `.csv` con los tickets filtrados en pantalla (incluyendo ID, Nombre de Usuario, Correo, Problema, Categoría IA, Prioridad, Estado y Fecha).
5. **Panel de Administración de Usuarios (`/users`):**
   - Haz clic en el botón azul **"Administrar Usuarios"** en la esquina superior derecha del Dashboard.
   - Verás la tabla con todos los usuarios registrados, su ID, correo electrónico y **cuántos tickets ha creado cada uno**.
   - **Cambiar Rol:** Usa el menú desplegable en la columna *Rol Asignado* para ascender un usuario a `Administrador (Admin)` o cambiarlo a `Usuario (User)` en tiempo real.
   - **Eliminar Usuario:** Elimina cuentas obsoletas (el sistema impide por seguridad que elimines tu propio usuario con sesión activa).
   - **Crear Nuevo Usuario (`+ Crear Nuevo Usuario`):** Abre el formulario de registro donde puedes dar de alta nuevos usuarios eligiendo mediante *radio buttons* si tendrán rol **Usuario** o **Administrador** (con validación automática contra correos duplicados).

---

### 🌓 Personalización: Modo Claro y Modo Oscuro
En **cualquier ventana del sistema** (`Login`, `Dashboard`, `Administración de Usuarios` y `Crear Usuario`) encontrarás el botón de tema (`☀️` / `🌙`) en la esquina superior derecha. Tu preferencia queda guardada automáticamente en el navegador.

---

## 💻 Cómo Ejecutar el Proyecto en tu Máquina Local

### Opción A: Con Docker Compose (Recomendado)
No necesitas instalar .NET ni PostgreSQL ni Node.js en tu máquina, únicamente **Docker Desktop**.

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/Emerson-1111/SupportTicketSystem.git
   cd SupportTicketSystem
   ```
2. **Construye y levanta los contenedores:**
   ```bash
   docker-compose up -d --build
   ```
3. **Accede a la aplicación:**
   - 🌐 **Aplicación Web (Frontend React):** [http://localhost:5173](http://localhost:5173)
   - ⚙️ **Documentación Interactiva API (Swagger):** [http://localhost:5032/swagger](http://localhost:5032/swagger)
   - 🗄️ **Base de Datos PostgreSQL:** `localhost:5432`
4. **Para detener los contenedores:**
   ```bash
   docker-compose down
   ```

---

### Opción B: Ejecución Manual (Sin Docker)
Si prefieres correr cada capa directamente en tu entorno de desarrollo:

#### Requisitos:
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- [PostgreSQL 15+](https://www.postgresql.org/)

#### 1. Configurar y ejecutar el Backend (.NET):
1. Asegúrate de tener PostgreSQL corriendo localmente y ajusta la cadena de conexión `DefaultConnection` en `SupportTicketSystemBack/SupportTicketSystem.API/appsettings.json` si tu usuario/contraseña local de Postgres es distinto.
2. Abre una terminal en la carpeta del API y ejecuta:
   ```bash
   cd SupportTicketSystemBack/SupportTicketSystem.API
   dotnet restore
   dotnet run
   ```
   *(Al iniciar, `Program.cs` aplicará automáticamente las migraciones en PostgreSQL y creará los usuarios semilla).*

#### 2. Configurar y ejecutar el Frontend (React + Vite):
1. Abre otra terminal en la carpeta del cliente React:
   ```bash
   cd SupportTicketSystemFront/support-ticket-client
   npm install
   npm run dev
   ```
2. Abre en tu navegador [http://localhost:5173](http://localhost:5173).

---

### 🤖 (Opcional) Activar Clasificación con OpenAI Real
Por defecto, el sistema utiliza `MockTicketAnalyzerService` en [`Program.cs`](SupportTicketSystemBack/SupportTicketSystem.API/Program.cs) para que cualquier persona pueda clonar y probar el proyecto de inmediato sin necesitar una llave de pago de OpenAI.  
Si deseas conectar la API real de OpenAI (`gpt-4o-mini`):
1. Define tu variable de entorno `OpenAI__ApiKey=sk-...` (sin escribirla en código fuente).
2. En `SupportTicketSystemBack/SupportTicketSystem.API/Program.cs`, comenta la línea de `MockTicketAnalyzerService` y descomenta la línea de `OpenAITicketAnalyzerService`.

---

## 🔒 Seguridad y Protección de Datos Críticos (`.gitignore`)

Se realizó una auditoría completa de los archivos del proyecto antes de su publicación para garantizar que **ningún dato personal de la máquina local ni secretos sensibles** se suban al repositorio público:

- **Rutas locales del equipo e índices de IDE excluidos (`**/.vs/`, `**/.vscode/`, `*.csproj.user`, `*.slnx.sqlite`):** Los archivos internos de Visual Studio almacenaban rutas locales del sistema operativo (`C:\Users\...`) e historiales de sesión; están completamente bloqueados en `.gitignore`.
- **Variables de entorno y secretos (`.env`, `.env.*`, `secrets.json`, `appsettings.*.local.json`, `appsettings.Production.json`):** Protegidos en `.gitignore` para evitar la filtración de API Keys reales (como OpenAI) o credenciales de producción. Se incluye únicamente una plantilla limpia `.env.example`.
- **Artefactos de compilación y dependencias (`**/bin/`, `**/obj/`, `**/node_modules/`, `**/dist/`):** Excluidos para mantener el repositorio limpio y ligero.
