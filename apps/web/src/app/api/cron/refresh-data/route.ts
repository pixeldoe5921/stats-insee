import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  // Vérifier l'authorization Vercel Cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServerSupabaseClient()
    
    // Données de démonstration pour le test
    const demoData = [
      {
        id: `auto-refresh-${Date.now()}-1`,
        indicator: 'PIB France (Auto-refresh)',
        value: 2800 + Math.random() * 100,
        date: new Date().toISOString().split('T')[0],
        source: 'INSEE',
        unit: 'Milliards €',
        frequency: 'QUARTERLY',
        geography: 'France',
        category: 'GDP',
        metadata: {
          auto_generated: true,
          refresh_timestamp: new Date().toISOString()
        }
      },
      {
        id: `auto-refresh-${Date.now()}-2`,
        indicator: 'Taux de chômage (Auto-refresh)',
        value: 7 + Math.random() * 2,
        date: new Date().toISOString().split('T')[0],
        source: 'INSEE',
        unit: '%',
        frequency: 'MONTHLY',
        geography: 'France',
        category: 'UNEMPLOYMENT',
        metadata: {
          auto_generated: true,
          refresh_timestamp: new Date().toISOString()
        }
      }
    ]

    if (supabase) {
      const { data, error } = await supabase
        .from('economic_data')
        .upsert(demoData, { onConflict: 'id' })

      if (error) {
        throw error
      }
    }

    // Mettre à jour le statut de la source (si Supabase disponible)
    if (supabase) {
        await supabase
          .from('data_sources')
          .upsert({
            name: 'AUTO_REFRESH',
            url: 'internal://cron',
            last_sync: new Date().toISOString(),
            is_active: true
          }, { onConflict: 'name' })
    }

    return NextResponse.json({
      success: true,
      message: `${demoData.length} enregistrements mis à jour`,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur cron refresh:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      },
      { status: 500 }
    )
  }
}