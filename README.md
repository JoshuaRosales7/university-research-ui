# 🎓 University Research UI - Plataforma de Investigación Académica

University Research UI es una plataforma integral diseñada para la Universidad del Istmo que centraliza la publicación, revisión y descubrimiento de conocimiento académico. Conecta a estudiantes, docentes e investigadores en un entorno digital moderno, rápido y social.

---

## ✨ Funcionalidades Principales

### 1. 🌍 Exploración Dual: Institucional y Global
- **Repositorio Institucional**: Búsqueda ultrarrápida de tesis y artículos producidos en la universidad. Filtros avanzados por Facultad, Carrera, Año y Tipo.
- **Conexión OpenAlex**: Integración directa con **OpenAlex** para buscar entre más de 200 millones de trabajos académicos globales sin salir de la plataforma.
- **Filtros Inteligentes**: La interfaz se adapta automáticamente según la fuente (Local o Global) para ofrecer solo los filtros relevantes.

### 2. ⚡ Rendimiento y Resiliencia
- **Cargas Instantáneas**: Implementación de `supabaseQuery` optimizado con **timeouts inteligentes (8s)** y **reintentos exponenciales**. Si la red parpadea, la app no falla, reintenta.
- **Subidas Robustas**: Sistema de carga de archivos (PDFs) refactorizado para manejar archivos grandes sin cortes (`AbortError`) ni bloqueos del navegador.
- **Cacheo Eficiente**: Uso de SWR con claves compuestas para mantener los datos frescos sin saturar el servidor.

### 3. 👥 Ecosistema Social Académico
- **Perfiles Públicos**: Cada investigador tiene su espacio con biografía, estadísticas de impacto y listado de sus obras.
- **Interacción Real**:
    - **Follow System**: Sigue a investigadores destacados para recibir notificaciones.
    - **Likes y Comentarios**: Discute hallazgos directamente en la página de la investigación.
    - **Estadísticas**: Visualiza cuántas personas siguen tu trabajo.

### 4. 📝 Gestión de Contenido Académico
- **Flujo de Publicación**:
    1.  **Subida**: Formulario paso a paso intuitivo con validación de metadatos.
    2.  **Revisión Docente**: Panel dedicado para que los tutores revisen, corrijan o aprueben trabajos.
    3.  **Publicación**: Asignación automática de **DOIs** (simulado) y publicación inmediata en el repositorio.
- **Detección de Plagio**: Integración simulada con servicios de verificación para asegurar la integridad académica antes de la aprobación.

### 5. 🛡️ Seguridad y Roles
- **Control de Acceso (RBAC)**:
    - **Estudiantes**: Suben trabajos, gestionan su perfil.
    - **Docentes**: Revisan trabajos, moderan comentarios.
    - **Admins**: Gestión total de usuarios y sistema.
- **Privacidad**: Opción de perfiles privados y seguridad a nivel de fila (RLS) en la base de datos para proteger borradores y datos sensibles.

### 6. 🌐 Integraciones y Servicios Académicos
La plataforma está preparada para el ecosistema científico real mediante integraciones estándar:
- **Identidad Académica (ORCID)**: Vinculación de perfiles con ORCID iD para garantizar la correcta atribución de autoría.
- **Identificadores Persistentes (DOI)**: Asignación automática de DOIs (vía DataCite simulation) para asegurar que las investigaciones sean citables permanentemente.
- **Integridad Académica**: Pipeline preparado para verificaciones de similitud con APIs como **Turnitin** o **Unicheck**.
- **SEO Académico**: Metadatos optimizados (Open Graph, JSON-LD) para que las tesis sean indexables por Google Scholar y otros buscadores científicos.

---

## 🛠️ Stack Tecnológico Renovado

La plataforma está construida sobre un stack moderno enfocado en velocidad y escalabilidad (Next.js 14 + Supabase).

| Capa | Tecnología | Uso |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router) | SSR, Routing, Server Components |
| **UI** | Shadcn/UI + Tailwind | Diseño responsivo, Modo Oscuro, Animaciones |
| **Estado** | SWR + Context API | Data Fetching, Auth State, Optimistic UI |
| **Backend** | Supabase | Auth, PostgreSQL, Realtime, Storage |
| **IA/Data** | OpenAlex API | Búsqueda bibliográfica global |

---

## 🚀 Guía de Inicio Rápido

### Requisitos
- Node.js 18+
- Cuenta de Supabase configurada

### Instalación

1.  **Clonar y configurar**
    ```bash
    git clone https://github.com/tu-org/university-research-ui.git
    cd university-research-ui
    cp .env.example .env.local
    ```

2.  **Llenar variables de entorno (`.env.local`)**
    ```env
    NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key_anonima
    ```

3.  **Instalar y Correr**
    ```bash
    npm install
    npm run dev
    ```

4.  **Visitar**: Abre `http://localhost:3000`

---

## 📂 Estructura Clave del Proyecto

```
/app
  /dashboard
    /explore       # Buscador principal (Local + OpenAlex)
    /upload        # Subida de archivos resiliente
    /profile       # Perfil de usuario y estadísticas
    /review        # Panel de moderación docente
/lib
  /hooks.ts        # Hooks SWR optimizados (useSearch, useItem)
  /supabase.ts     # Cliente con lógica de Retry y Timeout
  /external-apis.ts # Integración con OpenAlex
/components
  /research        # Tarjetas de investigación
  /explore         # Lógica de filtros y visualización
```

---

## 🤝 Contribución

Las Pull Requests son bienvenidas. Para cambios mayores, por favor abre un issue primero para discutir lo que te gustaría cambiar.

---

**Versión Actual**: 2.1.0 (Optimized Core)
**Última Actualización**: Febrero 2026
**Licencia**: Privada - Uso Académico
