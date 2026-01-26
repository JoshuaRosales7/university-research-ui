# Sistema de Roles y Permisos - Repositorio UNIS

## 📋 Roles Disponibles

### 1. **Estudiante** (estudiante)
- Rol por defecto al registrarse
- Enfocado en subir y gestionar sus propias investigaciones

### 2. **Docente** (docente)
- Personal académico con capacidad de revisión
- Puede validar investigaciones de estudiantes

### 3. **Admin** (admin)
- Control total del sistema
- Gestión completa de usuarios e investigaciones

---

## 🔐 Matriz de Permisos

| Funcionalidad | Estudiante | Docente | Admin |
|--------------|-----------|---------|-------|
| **Dashboard Principal** | ✅ | ✅ | ✅ |
| Ver estadísticas propias | ✅ | ✅ | ✅ |
| Ver estadísticas globales | ❌ | ❌ | ✅ |
| **Subir Investigación** | ✅ | ✅ | ✅ |
| **Mis Envíos** | ✅ (solo propios) | ✅ (solo propios) | ✅ (todos) |
| Editar investigación propia | ✅ | ✅ | ✅ |
| Eliminar investigación propia | ✅ | ✅ | ✅ |
| Eliminar cualquier investigación | ❌ | ❌ | ✅ |
| **Explorar Repositorio** | ✅ (solo aprobados) | ✅ (todos) | ✅ (todos) |
| Descargar PDFs | ✅ | ✅ | ✅ |
| Compartir investigaciones | ✅ | ✅ | ✅ |
| **Panel de Revisión** | ❌ | ✅ | ✅ |
| Aprobar investigaciones | ❌ | ✅ | ✅ |
| Rechazar investigaciones | ❌ | ✅ | ✅ |
| **Gestión de Usuarios** | ❌ | ❌ | ✅ (futuro) |

---

## 🎯 Flujo de Trabajo por Rol

### Estudiante
1. Registrarse en el sistema
2. Subir investigación con metadatos completos
3. Esperar revisión (estado: `en_revision`)
4. Recibir notificación de aprobación/rechazo
5. Si aprobado: visible en repositorio público
6. Si rechazado: puede editar y reenviar

### Docente
1. Acceder al Panel de Revisión
2. Ver investigaciones pendientes
3. Revisar documento completo (PDF)
4. Aprobar o rechazar con retroalimentación
5. Gestionar sus propias investigaciones

### Admin
1. Acceso total a todas las funcionalidades
2. Ver estadísticas globales del sistema
3. Gestionar investigaciones de todos los usuarios
4. Eliminar contenido inapropiado
5. Cambiar roles de usuarios (vía SQL)

---

## 🔄 Estados de Investigación

| Estado | Descripción | Visible para |
|--------|-------------|--------------|
| `en_revision` | Pendiente de aprobación | Autor, Docentes, Admin |
| `aprobado` | Aprobado y publicado | Todos (público) |
| `rechazado` | Rechazado, requiere correcciones | Autor, Docentes, Admin |
| `borrador` | No enviado aún | Solo autor |

---

## 🛡️ Implementación de Seguridad

### Row Level Security (RLS) en Supabase

**Tabla `investigations`:**
- ✅ Los usuarios pueden ver sus propias investigaciones
- ✅ Todos pueden ver investigaciones aprobadas
- ✅ Los usuarios pueden insertar sus propias investigaciones
- ✅ Los usuarios pueden actualizar sus propias investigaciones

**Tabla `profiles`:**
- ✅ Todos pueden ver perfiles (públicos)
- ✅ Los usuarios solo pueden editar su propio perfil

**Storage `investigations`:**
- ✅ Usuarios autenticados pueden subir a su carpeta
- ✅ Todos pueden leer archivos (bucket público)
- ✅ Solo el propietario puede eliminar sus archivos

---

## 📝 Cambiar Rol de Usuario

### Opción 1: SQL Editor (Supabase)
```sql
-- Cambiar a Admin
UPDATE profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'usuario@ejemplo.com');

-- Cambiar a Docente
UPDATE profiles 
SET role = 'docente' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'profesor@ejemplo.com');

-- Cambiar a Estudiante
UPDATE profiles 
SET role = 'estudiante' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'estudiante@ejemplo.com');
```

### Opción 2: Table Editor (Supabase)
1. Ir a `Table Editor` → `profiles`
2. Buscar el usuario
3. Editar columna `role`
4. Guardar cambios

---

## 🚀 Próximas Mejoras Sugeridas

1. **Panel de Administración de Usuarios**
   - Interfaz para cambiar roles
   - Ver actividad de usuarios
   - Estadísticas por facultad

2. **Sistema de Notificaciones**
   - Email al aprobar/rechazar
   - Notificaciones en tiempo real

3. **Comentarios y Retroalimentación**
   - Guardar comentarios de revisión
   - Historial de cambios

4. **Métricas Avanzadas**
   - Investigaciones más descargadas
   - Tendencias por carrera
   - Reportes exportables
