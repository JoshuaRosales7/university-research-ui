-- Seed script for investigations table
-- Ejecuta este script en la consola SQL de Supabase

-- Insert sample investigations with status 'aprobado'
INSERT INTO public.investigations (title, abstract, content, owner_id, faculty, status, created_at, updated_at) VALUES
(
  'Implementación de Machine Learning para Predicción de Rendimiento Académico',
  'Este estudio presenta un modelo de machine learning para predecir el rendimiento académico de estudiantes universitarios utilizando variables socioeconómicas y académicas previas. Se implementaron algoritmos de Random Forest y redes neuronales, obteniendo una precisión del 87% en las predicciones.',
  '<p>Contenido completo del documento...</p>',
  '53636f41-7704-4fd0-985f-a4b5810f4255', -- Reemplaza con tu user_id
  'Ingeniería',
  'aprobado',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '30 days'
),
(
  'Análisis de Impacto Ambiental en Ecosistemas Costeros del Pacífico',
  'Investigación sobre los efectos del cambio climático en los ecosistemas costeros de la región del Pacífico. Se analizaron datos de temperatura, salinidad y biodiversidad durante un período de 5 años.',
  '<p>Contenido completo del documento...</p>',
  '53636f41-7704-4fd0-985f-a4b5810f4255',
  'Ciencias',
  'aprobado',
  NOW() - INTERVAL '25 days',
  NOW() - INTERVAL '25 days'
),
(
  'La Influencia del Arte Precolombino en la Arquitectura Contemporánea',
  'Estudio comparativo sobre cómo los elementos del arte precolombino han influenciado el diseño arquitectónico contemporáneo en Latinoamérica, analizando obras de reconocidos arquitectos de la región.',
  '<p>Contenido completo del documento...</p>',
  '53636f41-7704-4fd0-985f-a4b5810f4255',
  'Humanidades',
  'aprobado',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '20 days'
),
(
  'Desarrollo de Aplicación Móvil para Monitoreo de Pacientes con Diabetes',
  'Diseño e implementación de una aplicación móvil que permite el monitoreo continuo de niveles de glucosa en pacientes diabéticos, integrando alertas automáticas y comunicación con profesionales de salud.',
  '<p>Contenido completo del documento...</p>',
  '53636f41-7704-4fd0-985f-a4b5810f4255',
  'Medicina',
  'aprobado',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '15 days'
),
(
  'Optimización de Redes de Distribución mediante Algoritmos Genéticos',
  'Propuesta de un sistema de optimización para redes de distribución logística utilizando algoritmos genéticos, logrando una reducción del 23% en costos operativos.',
  '<p>Contenido completo del documento...</p>',
  '53636f41-7704-4fd0-985f-a4b5810f4255',
  'Ingeniería',
  'aprobado',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '10 days'
),
(
  'Estudios sobre Sostenibilidad en la Industria Textil Centroamericana',
  'Investigación sobre prácticas sostenibles en la producción textil, enfocándose en empresas de Centroamérica. Se analizaron métodos de reducción de residuos y consumo de agua.',
  '<p>Contenido completo del documento...</p>',
  '53636f41-7704-4fd0-985f-a4b5810f4255',
  'Ciencias Económicas y Empresariales',
  'aprobado',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
),
(
  'Sistema de Gestión de Riesgos en Instituciones Bancarias',
  'Análisis de marcos de gestión de riesgos en instituciones financieras, considerando factores operacionales, de crédito y de mercado.',
  '<p>Contenido completo del documento...</p>',
  '53636f41-7704-4fd0-985f-a4b5810f4255',
  'Ciencias Económicas y Empresariales',
  'aprobado',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
),
(
  'Investigación sobre Storytelling en Comunicación Digital',
  'Estudio de cómo las marcas utilizan narrativas en redes sociales para crear conexiones emocionales con sus audiencias.',
  '<p>Contenido completo del documento...</p>',
  '53636f41-7704-4fd0-985f-a4b5810f4255',
  'Comunicación',
  'aprobado',
  NOW() - INTERVAL '1 days',
  NOW() - INTERVAL '1 days'
);

-- Verificar que se insertaron los datos
SELECT COUNT(*) as total_investigations, 
       COUNT(*) FILTER (WHERE status = 'aprobado') as approved_count
FROM public.investigations;
