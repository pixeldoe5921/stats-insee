import { NextRequest, NextResponse } from 'next/server'
import { economicAnalyzer } from '@/lib/openai-client'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, conversation = [] } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Question requise' },
        { status: 400 }
      )
    }

    // Vérifier la clé API OpenAI
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        response: 'Le service IA n\'est pas configuré. Veuillez configurer OPENAI_API_KEY.',
        suggestedQueries: [
          'Voir les données disponibles',
          'Afficher les derniers indicateurs',
          'Exporter les données'
        ]
      })
    }

    const supabase = createServerSupabaseClient()

    // Rechercher des données pertinentes pour la requête
    let relevantData = []
    
    try {
      // Mode démo si pas de Supabase
      if (!supabase) {
        const demoResponse = {
          response: "Mode démo : Cette application analyse les données économiques françaises et européennes. Vous pouvez explorer le PIB, le chômage, l'inflation, etc. En mode production avec Supabase, je peux analyser vos données spécifiques.",
          data: [
            {
              indicator: "PIB France", 
              value: 2850.5, 
              date: "2024-03-31",
              source: "INSEE"
            }
          ]
        }
        
        return NextResponse.json(demoResponse)
      }
      
      // Déterminer les mots-clés pour filtrer les données
      const keywords = extractKeywords(query)
      
      let dbQuery = supabase
        .from('economic_data')
        .select('*')
        .order('date', { ascending: false })
        .limit(20)

      // Filtrer par catégorie si détectée
      if (keywords.category) {
        dbQuery = dbQuery.eq('category', keywords.category)
      }

      // Filtrer par géographie si détectée  
      if (keywords.geography) {
        dbQuery = dbQuery.ilike('geography', `%${keywords.geography}%`)
      }

      // Filtrer par source si détectée
      if (keywords.source) {
        dbQuery = dbQuery.eq('source', keywords.source)
      }

      const { data, error } = await dbQuery

      if (!error && data) {
        relevantData = data
      }

    } catch (dbError) {
      console.error('Erreur base de données:', dbError)
      // Continuer sans données si erreur DB
    }

    // Analyser avec l'IA
    const analysis = await economicAnalyzer.analyzeEconomicData({
      query,
      data: relevantData,
      context: buildContext(conversation),
      language: 'fr'
    })

    // Sauvegarder la conversation (si Supabase disponible)
    if (supabase) {
      try {
        const sessionId = generateSessionId(request)
        
        await supabase.from('ai_conversations').insert({
          session_id: sessionId,
          user_message: query,
          ai_response: analysis.response,
          data_queries: relevantData.length > 0 ? { count: relevantData.length } : null,
          response_time: Date.now() - performance.now()
        })
      } catch (saveError) {
        console.error('Erreur sauvegarde conversation:', saveError)
        // Ne pas faire échouer la requête pour ça
      }
    }

    return NextResponse.json(analysis)

  } catch (error) {
    console.error('Erreur API ai-chat:', error)
    
    return NextResponse.json({
      response: 'Je rencontre une difficulté technique. Pourriez-vous reformuler votre question ?',
      suggestedQueries: [
        'Quelle est l\'évolution du PIB français cette année ?',
        'Comment le taux de chômage a-t-il évolué ces 5 dernières années ?',
        'Quels sont les derniers chiffres de l\'inflation ?'
      ]
    })
  }
}

function extractKeywords(query: string): {
  category?: string
  geography?: string
  source?: string
} {
  const lowercaseQuery = query.toLowerCase()
  const keywords: any = {}

  // Détection de catégorie
  if (lowercaseQuery.includes('pib') || lowercaseQuery.includes('gdp')) {
    keywords.category = 'GDP'
  } else if (lowercaseQuery.includes('chômage') || lowercaseQuery.includes('unemployment')) {
    keywords.category = 'UNEMPLOYMENT'
  } else if (lowercaseQuery.includes('inflation') || lowercaseQuery.includes('prix')) {
    keywords.category = 'INFLATION'
  } else if (lowercaseQuery.includes('production') || lowercaseQuery.includes('industriel')) {
    keywords.category = 'INDUSTRIAL_PRODUCTION'
  } else if (lowercaseQuery.includes('dette') || lowercaseQuery.includes('debt')) {
    keywords.category = 'GOVERNMENT_DEBT'
  } else if (lowercaseQuery.includes('confiance') || lowercaseQuery.includes('confidence')) {
    keywords.category = 'CONSUMER_CONFIDENCE'
  }

  // Détection de géographie
  if (lowercaseQuery.includes('france') || lowercaseQuery.includes('français')) {
    keywords.geography = 'France'
  } else if (lowercaseQuery.includes('europe') || lowercaseQuery.includes('eu') || lowercaseQuery.includes('ue')) {
    keywords.geography = 'UE'
  }

  // Détection de source
  if (lowercaseQuery.includes('insee')) {
    keywords.source = 'INSEE'
  } else if (lowercaseQuery.includes('eurostat')) {
    keywords.source = 'EUROSTAT'
  }

  return keywords
}

function buildContext(conversation: any[]): string {
  if (!conversation.length) return ''
  
  // Prendre les 3 derniers échanges pour le contexte
  const recentMessages = conversation.slice(-6)
  
  return recentMessages
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n')
}

function generateSessionId(request: NextRequest): string {
  // Simple session ID basé sur IP et timestamp
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0] || 'unknown'
  const timestamp = Date.now()
  
  return `${ip}_${timestamp}`.replace(/[^a-zA-Z0-9_]/g, '_')
}