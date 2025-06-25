import { NextRequest, NextResponse } from 'next/server'
import { fetchAllEconomicData } from '@/lib/api-clients'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const source = searchParams.get('source')
    const category = searchParams.get('category')
    const geography = searchParams.get('geography')
    const limit = parseInt(searchParams.get('limit') || '100')
    const page = parseInt(searchParams.get('page') || '1')

    // Mode démo si pas de config Supabase
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const demoData = [
        {
          id: 'gdp-fr-2024-q1',
          indicator: 'PIB France',
          value: 2850.5,
          date: '2024-03-31',
          source: 'INSEE',
          unit: 'Milliards €',
          frequency: 'QUARTERLY',
          geography: 'France',
          category: 'GDP',
          metadata: {},
          created_at: new Date().toISOString()
        },
        {
          id: 'unemployment-fr-2024-05',
          indicator: 'Taux de chômage',
          value: 7.2,
          date: '2024-05-31',
          source: 'INSEE',
          unit: '%',
          frequency: 'MONTHLY',
          geography: 'France',
          category: 'UNEMPLOYMENT',
          metadata: {},
          created_at: new Date().toISOString()
        },
        {
          id: 'inflation-fr-2024-05',
          indicator: 'Inflation',
          value: 2.1,
          date: '2024-05-31',
          source: 'INSEE',
          unit: '%',
          frequency: 'MONTHLY',
          geography: 'France',
          category: 'INFLATION',
          metadata: {},
          created_at: new Date().toISOString()
        }
      ]

      return NextResponse.json({
        success: true,
        data: demoData,
        total: demoData.length,
        page,
        limit
      })
    }

    const supabase = createServerSupabaseClient()
    
    // Si pas de Supabase, on ne devrait pas arriver ici mais par sécurité
    if (!supabase) {
      throw new Error('Configuration manquante')
    }
    
    // Construction de la requête
    let query = supabase
      .from('economic_data')
      .select('*')
      .order('date', { ascending: false })

    // Filtres optionnels
    if (source) {
      query = query.eq('source', source)
    }
    if (category) {
      query = query.eq('category', category)
    }
    if (geography) {
      query = query.ilike('geography', `%${geography}%`)
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Erreur Supabase:', error)
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des données' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      metadata: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Erreur API economic-data:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'refresh') {
      // Récupération des nouvelles données depuis les APIs externes
      const newData = await fetchAllEconomicData()
      
      if (newData.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Aucune donnée récupérée depuis les APIs externes' },
          { status: 400 }
        )
      }

      const supabase = createServerSupabaseClient()
      
      if (!supabase) {
        return NextResponse.json(
          { success: false, error: 'Mode démo : Configuration Supabase manquante' },
          { status: 501 }
        )
      }

      // Insertion ou mise à jour des données
      const { data, error } = await supabase
        .from('economic_data')
        .upsert(
          newData.map(item => ({
            id: item.id,
            indicator: item.indicator,
            value: item.value,
            date: item.date,
            source: item.source,
            unit: item.unit,
            frequency: item.frequency,
            geography: item.geography,
            category: item.category,
            updated_at: new Date().toISOString()
          })),
          { 
            onConflict: 'id',
            ignoreDuplicates: false 
          }
        )

      if (error) {
        console.error('Erreur lors de l\'insertion:', error)
        return NextResponse.json(
          { success: false, error: 'Erreur lors de la sauvegarde' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `${newData.length} données mises à jour`,
        data
      })
    }

    return NextResponse.json(
      { success: false, error: 'Action non reconnue' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Erreur POST economic-data:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}