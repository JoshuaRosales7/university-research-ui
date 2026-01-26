-- ============================================
-- Script: Agregar Slug para URLs SEO-Friendly
-- Fecha: 2026-01-26
-- Propósito: Habilitar URLs amigables para indexación académica
-- ============================================

-- 1. Agregar columna slug (única)
ALTER TABLE investigations 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- 2. Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_investigations_slug 
ON investigations(slug);

-- 3. Función para generar slug automáticamente
CREATE OR REPLACE FUNCTION generate_investigation_slug(title TEXT, year TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generar slug base: normalizar, quitar acentos, convertir a minúsculas
  base_slug := lower(
    regexp_replace(
      regexp_replace(
        -- Remover acentos usando unaccent (requiere extensión)
        translate(
          title,
          'áéíóúàèìòùâêîôûäëïöüñÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÄËÏÖÜÑ',
          'aeiouaeiouaeiouaeiounAEIOUAEIOUAEIOUAEIOUN'
        ),
        '[^a-z0-9\s-]', '', 'g'  -- Remover caracteres especiales
      ),
      '\s+', '-', 'g'  -- Reemplazar espacios con guiones
    )
  );
  
  -- Truncar a 100 caracteres y agregar año
  base_slug := substring(base_slug from 1 for 100) || '-' || year;
  
  -- Asegurar unicidad
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM investigations WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::text;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger para generar slug automáticamente al insertar/actualizar
CREATE OR REPLACE FUNCTION set_investigation_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo generar slug si no existe o está vacío
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_investigation_slug(NEW.title, NEW.year);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS trigger_set_investigation_slug ON investigations;

-- Crear trigger
CREATE TRIGGER trigger_set_investigation_slug
BEFORE INSERT OR UPDATE ON investigations
FOR EACH ROW
EXECUTE FUNCTION set_investigation_slug();

-- 5. Generar slugs para investigaciones existentes (migración)
UPDATE investigations
SET slug = generate_investigation_slug(title, year)
WHERE slug IS NULL OR slug = '';

-- 6. Agregar constraint para asegurar que slug no sea nulo
ALTER TABLE investigations 
ALTER COLUMN slug SET NOT NULL;

-- ============================================
-- Verificación
-- ============================================
-- Ejecutar para verificar que todo funcionó:
-- SELECT id, title, slug, year FROM investigations LIMIT 10;

-- ============================================
-- Notas Importantes
-- ============================================
-- 1. Los slugs son PERMANENTES - no cambiarlos después de publicar
-- 2. Si necesitas cambiar un slug manualmente:
--    UPDATE investigations SET slug = 'nuevo-slug' WHERE id = 'uuid';
-- 3. El trigger solo actúa si slug es NULL o vacío
-- 4. Para URLs públicas usar: /research/{slug}
