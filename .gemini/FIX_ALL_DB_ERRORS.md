# Guía Definitiva para Corregir Errores de Base de Datos

Has encontrado una serie de bloqueos causados por "Triggers" (procesos automáticos) en tu base de datos que son incompatibles con la configuración actual de tu tabla `notifications`.

## 🚨 Resumen de Errores Encontrados
1.  ❌ `column "link" does not exist` (Faltaba una columna)
2.  ❌ `null value in column "actor_id"` (El sistema no enviaba usuario)
3.  ❌ `violates check constraint "notifications_type_check"` (El tipo de notificación no estaba permitido)

## 🛠️ Solución Maestra (Ejecutar TODO)

Para solucionar todos estos problemas de una vez y limpiar el camino para que puedas trabajar, ejecuta este script completo en tu **SQL Editor** de Supabase:

```sql
-- 1. Asegurar que existe la columna 'link'
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS link TEXT;

-- 2. Permitir que 'actor_id' sea opcional (para notificaciones automáticas del sistema)
ALTER TABLE public.notifications ALTER COLUMN actor_id DROP NOT NULL;

-- 3. Eliminar la restricción de tipos para permitir 'approved', 'rejected', etc.
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
```

### Pasos:
1. Copia el bloque de código SQL de arriba.
2. Ve a tu panel de Supabase -> SQL Editor.
3. Pega y dale a **Run**.

Una vez hecho esto, **vuelve a intentar aprobar la investigación**. Ahora debería pasar sin problemas ya que hemos eliminado todas las barreras que bloqueaban al trigger automático. 🚀
