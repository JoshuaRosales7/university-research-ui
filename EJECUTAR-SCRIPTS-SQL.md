# 🚀 EJECUTAR SCRIPTS SQL - GUÍA RÁPIDA

## ⚡ Método Más Rápido (5 minutos)

### **Paso 1: Abrir SQL Editor**

1. Ve a: https://supabase.com/dashboard/project/gtthutbewmiwcyhalxlm/sql/new
2. Asegúrate de estar logueado

---

### **Paso 2: Ejecutar Script de Slugs**

1. **Abre el archivo:** `c:\Webs\Webs\university-research-ui\scripts\add-slug-column.sql`
2. **Selecciona TODO** el contenido (Ctrl+A)
3. **Copia** (Ctrl+C)
4. **Pega** en el SQL Editor de Supabase
5. Click en **RUN** (botón verde abajo a la derecha)
6. Espera a que diga "Success" ✅

---

### **Paso 3: Ejecutar Script de Tracking**

1. En Supabase, click en **+ New query** (arriba a la izquierda)
2. **Abre el archivo:** `c:\Webs\Webs\university-research-ui\scripts\tracking-functions.sql`
3. **Selecciona TODO** el contenido (Ctrl+A)
4. **Copia** (Ctrl+C)
5. **Pega** en el nuevo SQL Editor
6. Click en **RUN**
7. Espera a que diga "Success" ✅

---

### **Paso 4: Verificar**

En el mismo SQL Editor, ejecuta:

```sql
SELECT id, title, slug, year FROM investigations LIMIT 5;
```

Deberías ver que todas las investigaciones tienen un `slug` generado.

---

## ✅ ¡Listo!

Ahora puedes:
- Visitar páginas públicas: `http://localhost:3000/research/[slug]`
- Subir investigaciones sin errores
- Ver el sitemap: `http://localhost:3000/sitemap.xml`

---

## 🐛 Si Aún Tienes Errores

Reinicia el servidor de desarrollo:

```bash
# Ctrl+C para detener
npm run dev
```

---

**Tiempo total:** ~5 minutos ⏱️
