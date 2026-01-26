// scripts/run-migrations.js
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno')
  console.error('Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration(filePath, name) {
  console.log(`\n📝 Ejecutando: ${name}...`)
  
  try {
    const sql = fs.readFileSync(path.join(__dirname, filePath), 'utf8')
    
    // Ejecutar el SQL usando rpc
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      // Si no existe la función exec_sql, intentar ejecutar directamente
      console.log('⚠️  Función exec_sql no disponible, ejecuta manualmente en Supabase Dashboard')
      console.log(`\n📋 Copia y pega este SQL en: https://supabase.com/dashboard/project/${supabaseUrl.split('//')[1].split('.')[0]}/sql/new\n`)
      console.log('─'.repeat(80))
      console.log(sql)
      console.log('─'.repeat(80))
      return false
    }
    
    console.log(`✅ ${name} ejecutado correctamente`)
    return true
  } catch (err) {
    console.error(`❌ Error en ${name}:`, err.message)
    return false
  }
}

async function main() {
  console.log('🚀 Iniciando migraciones...\n')
  
  const migrations = [
    { file: 'add-slug-column.sql', name: 'Agregar columna slug' },
    { file: 'tracking-functions.sql', name: 'Funciones de tracking' }
  ]
  
  for (const migration of migrations) {
    await runMigration(migration.file, migration.name)
  }
  
  console.log('\n✨ Proceso completado\n')
  console.log('📌 Si viste advertencias arriba, ejecuta los scripts manualmente en Supabase Dashboard')
}

main()
