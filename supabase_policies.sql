-- ==============================================================================
-- SCRIPT DE CORRECCIÓN DE PERMISOS (RLS) PARA UNIVERSIDAD APP
-- Ejecuta este script en el Editor SQL de tu panel de Supabase.
-- ==============================================================================

-- 1. Habilitar RLS en la tabla 'investigations' (por si acaso no lo está)
ALTER TABLE investigations ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas antiguas para evitar conflictos
DROP POLICY IF EXISTS "Public items are viewable by everyone" ON investigations;
DROP POLICY IF EXISTS "Users can view own investigations" ON investigations;
DROP POLICY IF EXISTS "Users can insert own investigations" ON investigations;
DROP POLICY IF EXISTS "Users can update own investigations" ON investigations;
DROP POLICY IF EXISTS "Users can delete own investigations" ON investigations;
DROP POLICY IF EXISTS "Admins and Docentes can view all" ON investigations;
DROP POLICY IF EXISTS "Admins and Docentes can update all" ON investigations;

-- 3. Crear Políticas de LECTURA (SELECT)

-- A. Cualquiera puede ver investigaciones aprobadas (Público)
CREATE POLICY "Public items are viewable by everyone" 
ON investigations FOR SELECT 
USING (status = 'aprobado');

-- B. Los usuarios pueden ver sus propias investigaciones (Borrador, En Revisión, etc.)
CREATE POLICY "Users can view own investigations" 
ON investigations FOR SELECT 
USING (auth.uid() = owner_id);

-- C. Admins y Docentes pueden ver TODAS las investigaciones (para revisión)
-- NOTA: Esto asume que el rol está en los metadatos del usuario (auth.users -> raw_user_meta_data->>'role')
-- Si no usas metadatos, necesitarías una subconsulta a la tabla 'profiles'.
-- Usaremos la tabla 'profiles' por seguridad.
CREATE POLICY "Admins and Docentes can view all"
ON investigations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'admin' OR profiles.role = 'docente')
  )
);

-- 4. Crear Políticas de ESCRITURA (INSERT)

-- A. Los usuarios autenticados pueden crear investigaciones
CREATE POLICY "Users can insert own investigations" 
ON investigations FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

-- 5. Crear Políticas de ACTUALIZACIÓN (UPDATE)

-- A. Los usuarios pueden editar sus propias investigaciones (mientras no estén aprobadas, opcionalmente)
-- Aquí permitimos editar siempre si es el dueño
CREATE POLICY "Users can update own investigations" 
ON investigations FOR UPDATE 
USING (auth.uid() = owner_id);

-- B. Admins y Docentes pueden actualizar cualquier investigación (para aprobar/rechazar)
CREATE POLICY "Admins and Docentes can update all"
ON investigations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'admin' OR profiles.role = 'docente')
  )
);

-- 6. Crear Políticas de ELIMINACIÓN (DELETE)

-- A. Los usuarios pueden eliminar sus propias investigaciones
CREATE POLICY "Users can delete own investigations" 
ON investigations FOR DELETE 
USING (auth.uid() = owner_id);

-- ==============================================================================
-- Repetir para la tabla 'comments' si es necesario
-- ==============================================================================

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;
DROP POLICY IF EXISTS "Users can insert comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

-- Ver comentarios: Cualquiera puede verlos (o podrías restringirlo a usuarios autenticados)
CREATE POLICY "Comments are viewable by everyone" 
ON comments FOR SELECT 
USING (true);

-- Crear comentarios: Usuarios autenticados
CREATE POLICY "Users can insert comments" 
ON comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Editar/Borrar comentarios: Dueño del comentario
CREATE POLICY "Users can update own comments" 
ON comments FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" 
ON comments FOR DELETE 
USING (auth.uid() = user_id);
