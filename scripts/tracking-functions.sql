-- ============================================
-- Script: Funciones para tracking de vistas y descargas
-- Fecha: 2026-01-26
-- Propósito: Incrementar contadores de forma segura
-- ============================================

-- 1. Función para incrementar vistas
CREATE OR REPLACE FUNCTION increment_views(investigation_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE investigations
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = investigation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Función para incrementar descargas
CREATE OR REPLACE FUNCTION increment_downloads(investigation_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE investigations
  SET downloads_count = COALESCE(downloads_count, 0) + 1
  WHERE id = investigation_id;
  
  -- También registrar en la tabla de tracking (si existe)
  INSERT INTO investigation_downloads (investigation_id, downloaded_at)
  VALUES (investigation_id, NOW())
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Otorgar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION increment_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_downloads(UUID) TO authenticated;

-- 4. También permitir a usuarios anónimos (para páginas públicas)
GRANT EXECUTE ON FUNCTION increment_views(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_downloads(UUID) TO anon;

-- ============================================
-- Verificación
-- ============================================
-- Probar las funciones:
-- SELECT increment_views('uuid-de-investigacion');
-- SELECT increment_downloads('uuid-de-investigacion');
