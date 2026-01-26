# Guía de Sitemap - UNIS Repository

## 📍 URL del Sitemap
Tu sitemap se genera automáticamente en:
**https://unisrepo.netlify.app/sitemap.xml**

## ✅ Mejoras Implementadas

### 1. **Páginas Incluidas**
- ✅ Página principal (priority: 1.0)
- ✅ Login (priority: 0.3)
- ✅ Register (priority: 0.3)
- ✅ **Todas las investigaciones aprobadas** (priority: 0.8)

### 2. **Características Nuevas**
- ✅ **Revalidación cada hora**: El sitemap se regenera automáticamente
- ✅ **Manejo de errores**: Si Supabase falla, retorna páginas estáticas
- ✅ **Filtrado de slugs**: Solo incluye investigaciones con slug válido
- ✅ **Límite de seguridad**: Máximo 1000 investigaciones
- ✅ **Logging**: Muestra cuántas páginas se generaron

### 3. **Prioridades Optimizadas**
```
1.0 - Página principal (máxima prioridad)
0.8 - Investigaciones individuales (contenido principal)
0.3 - Login/Register (páginas de utilidad, no contenido)
```

### 4. **Frecuencias de Cambio**
```
daily   - Página principal (se actualiza con nuevas investigaciones)
weekly  - Investigaciones (pueden recibir actualizaciones)
monthly - Login/Register (raramente cambian)
```

## 🔍 Verificación del Sitemap

### Opción 1: Navegador
Visita directamente:
```
https://unisrepo.netlify.app/sitemap.xml
```

### Opción 2: Google Search Console
1. Ve a [Google Search Console](https://search.google.com/search-console)
2. Agrega tu sitio si no lo has hecho
3. Ve a "Sitemaps" en el menú lateral
4. Ingresa: `sitemap.xml`
5. Click en "Enviar"

### Opción 3: Validador Online
Usa herramientas como:
- https://www.xml-sitemaps.com/validate-xml-sitemap.html
- https://technicalseo.com/tools/sitemap-validator/

## 📊 Estructura del Sitemap Generado

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Página principal -->
  <url>
    <loc>https://unisrepo.netlify.app</loc>
    <lastmod>2026-01-26T21:19:08.316Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Páginas de autenticación -->
  <url>
    <loc>https://unisrepo.netlify.app/login</loc>
    <lastmod>2026-01-26T21:19:08.316Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <!-- Investigaciones dinámicas -->
  <url>
    <loc>https://unisrepo.netlify.app/research/machine-learning-2024</loc>
    <lastmod>2026-01-20T15:30:00.000Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- ... más investigaciones ... -->
</urlset>
```

## 🚀 Próximos Pasos para SEO

### 1. Robots.txt
Verifica que tu `robots.txt` apunte al sitemap:
```txt
User-agent: *
Allow: /

Sitemap: https://unisrepo.netlify.app/sitemap.xml
```

### 2. Google Search Console
- Envía el sitemap a Google
- Monitorea el estado de indexación
- Revisa errores de rastreo

### 3. Metadata en Páginas
Asegúrate de que cada investigación tenga:
- `<title>` único y descriptivo
- `<meta name="description">` relevante
- Open Graph tags para redes sociales
- Canonical URLs

### 4. Structured Data (Schema.org)
Considera agregar JSON-LD para investigaciones:
```json
{
  "@context": "https://schema.org",
  "@type": "ScholarlyArticle",
  "headline": "Título de la investigación",
  "author": {...},
  "datePublished": "2024-01-15",
  "abstract": "Resumen..."
}
```

## 🔧 Troubleshooting

### Problema: El sitemap no se actualiza
**Solución**: El sitemap se revalida cada hora. Para forzar actualización:
1. Redeploy en Netlify
2. O espera hasta 1 hora

### Problema: Investigaciones no aparecen
**Verificar**:
- ✅ Status = 'aprobado'
- ✅ Tienen slug válido (no null)
- ✅ Están en la base de datos

### Problema: Error 500 en sitemap.xml
**Causa probable**: Error de conexión a Supabase
**Solución**: El código tiene fallback, retornará páginas estáticas

## 📈 Métricas a Monitorear

En Google Search Console:
1. **Páginas indexadas**: Debe crecer con el tiempo
2. **Errores de rastreo**: Debe ser 0
3. **Cobertura**: Todas las URLs del sitemap deben estar "Válidas"
4. **Rendimiento**: CTR y posición promedio

## 🎯 Recomendaciones Adicionales

### Para Mejor SEO:
1. ✅ Genera slugs SEO-friendly (ya lo tienes)
2. ✅ Usa títulos descriptivos en investigaciones
3. ✅ Agrega alt text a imágenes
4. ✅ Implementa breadcrumbs
5. ✅ Optimiza velocidad de carga

### Para Mejor Indexación:
1. Crea un sitemap index si superas 50,000 URLs
2. Divide por categorías (por facultad, año, etc.)
3. Actualiza lastmod cuando edites investigaciones
4. Usa prioridades estratégicamente

## 📝 Notas Importantes

- ⚠️ El sitemap se regenera automáticamente cada hora
- ⚠️ Solo incluye investigaciones con status "aprobado"
- ⚠️ Máximo 1000 investigaciones por sitemap
- ✅ Si hay error de DB, retorna páginas estáticas (graceful degradation)
- ✅ Los logs muestran cuántas páginas se generaron

---
**Última actualización:** 2026-01-26  
**Versión:** 0.0.2  
**URL del sitemap:** https://unisrepo.netlify.app/sitemap.xml
