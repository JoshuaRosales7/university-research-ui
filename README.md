# University Research UI - Repositorio Digital de Investigaciones

Plataforma web profesional para la gestión, exploración y revisión de investigaciones académicas en la Universidad del Istmo.

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Características Principales](#características-principales)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Configuración](#instalación-y-configuración)
- [Funcionamiento de la Aplicación](#funcionamiento-de-la-aplicación)
- [Flujos de Usuario](#flujos-de-usuario)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Base de Datos](#base-de-datos)
- [Autenticación y Autorización](#autenticación-y-autorización)
- [API y Endpoints](#api-y-endpoints)
- [Notas Técnicas](#notas-técnicas)

---

## 📖 Descripción General

University Research UI es una aplicación web que centraliza la gestión de investigaciones académicas de la Universidad del Istmo. Permite a estudiantes, docentes y administradores:

- **Subir investigaciones** con metadatos completos
- **Explorar repositorio** global de investigaciones aprobadas
- **Revisar y aprobar** investigaciones en panel de revisión
- **Comentar y discutir** sobre investigaciones
- **Gestionar submissions** personales
- **Ver perfiles** de usuario y roles

---

## ✨ Características Principales

### Para Estudiantes/Investigadores
- ✅ Subir nuevas investigaciones con formulario multi-paso
- ✅ Gestionar investigaciones propias en panel "Mis Submissions"
- ✅ Ver estado de revisión (Borrador, En Revisión, Aprobado, Rechazado)
- ✅ Comentar en investigaciones del repositorio
- ✅ Explorar investigaciones de otros usuarios
- ✅ Descargar PDFs de investigaciones

### Para Docentes/Revisores
- ✅ Panel de revisión de investigaciones pendientes
- ✅ Aprobar o rechazar investigaciones
- ✅ Ver todas las investigaciones del sistema
- ✅ Gestionar comentarios
- ✅ Acceso a estadísticas

### Para Administradores
- ✅ Control total del sistema
- ✅ Gestión de usuarios y roles
- ✅ Revisión de todas las investigaciones
- ✅ Configuración del sistema
- ✅ Ver estadísticas globales

---

## 🛠 Tecnologías Utilizadas

### Frontend
- **Next.js 15+** - Framework React con SSR/SSG
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilos y responsive design
- **ShadcnUI** - Componentes UI reutilizables
- **SWR** - Data fetching y caching
- **Lucide React** - Iconografía

### Backend/Servicios
- **Supabase** - Backend as a Service (PostgreSQL, Auth, Storage, Realtime)
- **PostgreSQL** - Base de datos relacional
- **Row Level Security (RLS)** - Seguridad a nivel de fila

### Autenticación
- **Supabase Auth** - Gestión de usuarios y sesiones
- **JWT Tokens** - Autenticación stateless

### Hosting/Deployment
- **Vercel** - Hosting del frontend

---

## 📋 Requisitos Previos

1. **Node.js** v18+ y npm/pnpm
2. **Cuenta Supabase** activa con:
   - Proyecto PostgreSQL configurado
   - Storage bucket para investigaciones
   - Auth providers habilitados
3. **Variables de entorno** configuradas:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
   ```

---

## ⚙️ Instalación y Configuración

### 1. Clonar Repositorio
```bash
git clone <repository-url>
cd university-research-ui
```

### 2. Instalar Dependencias
```bash
pnpm install
# o npm install
```

### 3. Configurar Variables de Entorno
```bash
cp .env.example .env.local
```

Editar `.env.local` con credenciales de Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
```

### 4. Crear Tablas en Supabase
Ejecutar scripts SQL en orden:
1. `scripts/create-comments-table.sql` - Crear tabla de comentarios
2. `scripts/seed-investigations.sql` - Insertar datos de prueba (opcional)

### 5. Ejecutar en Desarrollo
```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

---

## 🚀 Funcionamiento de la Aplicación

### Ciclo de Vida de una Investigación

```
CREACIÓN → REVISIÓN → APROBACIÓN/RECHAZO → PUBLICACIÓN
```

#### 1. **Creación (Upload)**
- Usuario navega a `/dashboard/upload`
- Completa formulario de 4 pasos:
  - **Paso 1**: Selecciona facultad y carrera
  - **Paso 2**: Ingresa metadatos (título, abstract, autores, etc.)
  - **Paso 3**: Carga archivo PDF
  - **Paso 4**: Revisa y confirma información
- Al enviar:
  - PDF se sube a Supabase Storage
  - Registro se crea en tabla `investigations` con `status: 'en_revision'`
  - Usuario es redirigido a `/dashboard/my-submissions`

#### 2. **Revisión (Review)**
- Docentes/Admins acceden a `/dashboard/review`
- Ven investigaciones con `status: 'en_revision'`
- Pueden:
  - **Aprobar** → estado cambia a `'aprobado'` (visible en Explore)
  - **Rechazar** → estado cambia a `'rechazado'`

#### 3. **Exploración (Explore)**
- Cualquier usuario accede a `/dashboard/explore`
- Ve solo investigaciones con `status: 'aprobado'`
- Puede:
  - Buscar por título, abstract, keywords
  - Filtrar por facultad
  - Ver detalles completos
  - Descargar PDF
  - Comentar

#### 4. **Publicación**
- Investigación aprobada aparece en repositorio global
- Es accesible para toda la comunidad universitaria
- Permite comentarios y retroalimentación

---

## 👥 Flujos de Usuario

### Flujo 1: Estudiante Sube Investigación
```
Login → Dashboard → Upload 
  → Selecciona Facultad 
  → Ingresa Metadatos 
  → Carga PDF 
  → Confirma 
  → Espera Revisión
```

### Flujo 2: Docente Revisa Investigación
```
Login → Dashboard → Review 
  → Ve "En Revisión" 
  → Selecciona Investigación 
  → Aprueba/Rechaza 
  → Investigación se Publica/Rechaza
```

### Flujo 3: Usuario Explora Repositorio
```
Login → Dashboard → Explore 
  → Busca por Palabras Clave 
  → Filtra por Facultad 
  → Abre Detalles 
  → Lee/Comenta 
  → Descarga PDF
```

### Flujo 4: Usuario Gestiona Submissions
```
Login → Dashboard → Mis Submissions 
  → Ve Investigaciones Propias 
  → Puede Eliminar Borradores 
  → Ve Estado de Cada Una
```

---

## 📁 Estructura del Proyecto

```
university-research-ui/
├── app/                          # App Router de Next.js
│   ├── dashboard/                # Rutas protegidas
│   │   ├── explore/              # Exploración de investigaciones
│   │   ├── review/               # Panel de revisión (admin/docente)
│   │   ├── upload/               # Subir nuevas investigaciones
│   │   ├── my-submissions/       # Investigaciones propias
│   │   ├── research/[id]/        # Detalle de investigación
│   │   ├── profile/              # Perfil de usuario
│   │   └── admin/                # Panel de administración
│   ├── login/                    # Página de login
│   ├── register/                 # Página de registro
│   └── layout.tsx                # Layout principal
│
├── components/                   # Componentes React reutilizables
│   ├── explore/                  # Componentes del explore
│   ├── dashboard/                # Componentes del dashboard
│   ├── research/                 # Tarjetas y detalles de investigación
│   ├── comments-section.tsx      # Sección de comentarios
│   ├── ui/                       # Componentes base (shadcn/ui)
│   └── theme-provider.tsx        # Proveedor de tema
│
├── lib/                          # Utilidades y lógica
│   ├── supabase.ts              # Cliente de Supabase
│   ├── auth-context.tsx         # Contexto de autenticación
│   ├── hooks.ts                 # Hooks personalizados (SWR)
│   ├── types.ts                 # Tipos TypeScript
│   ├── utils.ts                 # Funciones utilitarias
│   └── config.ts                # Configuración
│
├── scripts/                      # Scripts SQL para BD
│   ├── create-comments-table.sql
│   └── seed-investigations.sql
│
├── public/                       # Assets estáticos
├── styles/                       # Estilos globales
├── .env.local                    # Variables de entorno
├── next.config.mjs               # Configuración de Next.js
├── tailwind.config.ts            # Configuración de Tailwind
└── tsconfig.json                 # Configuración de TypeScript
```

---

## 💾 Base de Datos

### Tablas Principales

#### `investigations`
```sql
- id (UUID, PK)
- owner_id (UUID, FK → auth.users)
- title (TEXT)
- abstract (TEXT)
- authors (TEXT[])
- keywords (TEXT[])
- faculty (TEXT)
- career (TEXT)
- year (INTEGER)
- language (TEXT)
- work_type (TEXT)
- file_url (TEXT)
- status ('borrador'|'en_revision'|'aprobado'|'rechazado')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `comments`
```sql
- id (UUID, PK)
- investigation_id (UUID, FK → investigations)
- user_id (UUID, FK → auth.users)
- content (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- deleted_at (TIMESTAMP, soft delete)
- is_edited (BOOLEAN)
```

#### `profiles`
```sql
- id (UUID, PK, FK → auth.users)
- full_name (TEXT)
- first_name (TEXT)
- last_name (TEXT)
- role ('estudiante'|'docente'|'admin')
- avatar_url (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Relaciones
- 1 Usuario → N Investigaciones (ownership)
- 1 Usuario → N Comentarios (authorship)
- 1 Investigación → N Comentarios (comentarios)

---

## 🔐 Autenticación y Autorización

### Flujo de Autenticación
```
1. Usuario ingresa email/password
2. Supabase autentica (JWT)
3. Token almacenado en sessionStorage
4. AuthContext proporciona estado global
5. Rutas protegidas redirigen si no autenticado
```

### Sistema de Roles

| Rol | Permisos |
|-----|----------|
| **Estudiante** | Ver explore, subir investigaciones, ver propias, comentar |
| **Docente** | Todo de estudiante + panel de revisión, aprobar/rechazar |
| **Admin** | Acceso total al sistema, gestión de usuarios |

### Row Level Security (RLS)
- Usuarios solo ven investigaciones que pueden acceder
- Comentarios heredan permisos de investigación
- Archivos en Storage protegidos por RLS

---

## 🔌 API y Endpoints

### REST API (Supabase)

#### GET Investigaciones
```bash
GET /rest/v1/investigations
  ?select=*
  &status=eq.aprobado
  &order=created_at.desc
```

#### POST Investigación
```bash
POST /rest/v1/investigations
{
  "title": "...",
  "abstract": "...",
  "authors": [...],
  "status": "en_revision",
  ...
}
```

#### PATCH Investigación
```bash
PATCH /rest/v1/investigations?id=eq.{id}
{
  "status": "aprobado"
}
```

#### GET Comentarios
```bash
GET /rest/v1/comments
  ?investigation_id=eq.{id}
  &deleted_at=is.null
  &order=created_at.desc
```

#### POST Comentario
```bash
POST /rest/v1/comments
{
  "investigation_id": "...",
  "user_id": "...",
  "content": "..."
}
```

---

## 🎯 Flujo de Datos

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │ Interacción
       ▼
┌─────────────────────────┐
│  Componentes React      │
│ (explore, upload, etc)  │
└──────┬──────────────────┘
       │ useState, useAuth
       ▼
┌─────────────────────────┐
│  Custom Hooks (SWR)     │
│ (useSearch, useComments)│
└──────┬──────────────────┘
       │ Fetch/Mutate
       ▼
┌─────────────────────────┐
│  Supabase Client        │
│ (supabase.from()....)   │
└──────┬──────────────────┘
       │ HTTP REST
       ▼
┌─────────────────────────┐
│  PostgreSQL + RLS       │
│  (Supabase)             │
└─────────────────────────┘
```

---

## 📊 Estados de Investigación

```
┌──────────┐
│ Borrador │  ← Usuario crea
└────┬─────┘
     │
     ▼
┌────────────┐
│ En Revisión│ ← Se envía automáticamente
└────┬───────┘
     │
     ├─────────────────┬──────────────────┐
     ▼                 ▼                  ▼
  ┌────────┐      ┌──────────┐       ┌──────────┐
  │Aprobado│      │Rechazado │   │  Pendiente │
  └────┬───┘      └─────────┘     └────────────┘
       │
       ▼
  [En Explore]  ← Visible para todos
```

---

## 🔄 Caché y Revalidación

### Estrategia SWR
- SWR cache datos en cliente automáticamente
- `mutate()` para revalidar después de cambios
- `revalidateOnFocus: false` para no revalidar al cambiar de pestaña

### Ejemplos
```typescript
// Buscar investigaciones
const { data, isLoading } = useSearch({ query, page, size })

// Revalidar después de enviar
await addComment(...)
mutate() // Refetch comentarios

// En upload
mutate() // Actualiza lista de búsqueda
router.push('/dashboard/my-submissions')
```

---

## 🚨 Notas Técnicas

### Estados en Base de Datos
Los estados guardados en BD son:
- `'borrador'` - Recién creado
- `'en_revision'` - Esperando aprobación
- `'aprobado'` - Publicado en explore
- `'rechazado'` - Denegado

**Importante**: El código busca `'aprobado'` (español), asegurate que los valores en BD coincidan.

### Almacenamiento de Archivos
- PDFs se guardan en Supabase Storage bucket `investigations`
- Rutas: `{user_id}/{timestamp}-{randomId}-{filename}.pdf`
- URLs públicas con acceso anónimo
- Soft delete con `deleted_at` timestamp

### Tabla de Comentarios
- Usa soft delete (`deleted_at`) en lugar de eliminar físicamente
- `is_edited` marca si fue editado
- Referencia a `profiles` para obtener nombre de usuario

### Autenticación Persistente
- JWT token en sessionStorage
- AuthContext verifica en cada página protegida
- Redirección a `/login` si no autenticado
- Cierre de sesión limpia el token

---

## 🐛 Solución de Problemas Comunes

### Error: "Could not find relationship"
**Causa**: Join a tabla `auth.users` desde `public.comments`
**Solución**: Usar solo campos de `comments` en select, obtener usuario desde `profiles`

### Error 404 en tabla `notifications`
**Causa**: Tabla no existe en Supabase
**Solución**: Está manejado con error handling, solo mostrar advertencia en consola

### Investigaciones no aparecen en Explore
**Causa**: Status no es `'aprobado'`
**Solución**: Revisar estado en BD, aprobar en panel de revisión

### Token expirado
**Causa**: Sesión envejeció
**Solución**: Usuario debe hacer login nuevamente

---

## 📈 Métricas y Monitoreo

### Vercel Analytics
- Tracking de pageviews
- Performance metrics
- Errores de cliente

### Supabase Logs
- Queries SQL
- Errores de RLS
- Storage uploads

---

## 🔄 Procedimiento de Deploy

```bash
# 1. Commit cambios
git add .
git commit -m "message"

# 2. Push a main/production
git push origin main

# 3. Vercel auto-deploya
# (webhook desde GitHub)

# 4. Verificar en https://...vercel.app
```

---

## 📞 Soporte

Para reportar bugs o sugerencias, crear un issue en el repositorio con:
- Descripción clara del problema
- Pasos para reproducir
- Navegador y versión
- Logs de consola si es relevante

---

**Última actualización**: 26 de Enero, 2026
**Versión**: 1.0.0
**Licencia**: Propietaria - Universidad del Istmo
