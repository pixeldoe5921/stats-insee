import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    const startTime = Date.now()
    
    // Test de connexion Supabase
    const supabase = createServerSupabaseClient()
    
    const checks = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: { status: 'unknown', responseTime: 0 },
        api: { status: 'healthy', responseTime: 0 },
        memory: { usage: 0, limit: 0 },
        uptime: process.uptime()
      }
    }

    // Test base de données (simplifié pour démo)
    try {
      const dbStart = Date.now()
      
      // Si pas de config Supabase, on simule un test réussi
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        checks.checks.database.status = 'demo'
        checks.checks.database.responseTime = 10
      } else {
        const { data, error } = await supabase!
          .from('economic_data')
          .select('count')
          .limit(1)
          .single()

        if (error && error.code !== 'PGRST116') {
          checks.checks.database.status = 'error'
          checks.status = 'degraded'
        } else {
          checks.checks.database.status = 'healthy'
        }
        
        checks.checks.database.responseTime = Date.now() - dbStart
      }
    } catch (dbError) {
      checks.checks.database.status = 'demo'
      checks.status = 'demo'
    }

    // Métriques mémoire (Node.js)
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage()
      checks.checks.memory.usage = Math.round(memUsage.heapUsed / 1024 / 1024) // MB
      checks.checks.memory.limit = Math.round(memUsage.heapTotal / 1024 / 1024) // MB
    }

    // Temps de réponse API
    checks.checks.api.responseTime = Date.now() - startTime

    const statusCode = checks.status === 'healthy' ? 200 : 
                      checks.status === 'degraded' ? 200 : 503

    return NextResponse.json(checks, { status: statusCode })

  } catch (error) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Erreur système',
      checks: {
        database: { status: 'error' },
        api: { status: 'error' }
      }
    }, { status: 503 })
  }
}