import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: Date
}

export interface AnalysisRequest {
  query: string
  data?: any[]
  context?: string
  language?: 'fr' | 'en'
}

export interface AnalysisResponse {
  response: string
  suggestedQueries?: string[]
  dataInsights?: string[]
  chartSuggestions?: {
    type: 'line' | 'bar' | 'pie'
    data: any[]
    title: string
  }[]
  sqlQuery?: string
}

class EconomicAnalyzer {
  private systemPrompt = `Tu es un expert économiste spécialisé dans l'analyse des données françaises et européennes.
Tu as accès aux données de l'INSEE, Eurostat et autres sources officielles.

Tes compétences :
- Analyse des indicateurs économiques (PIB, chômage, inflation, etc.)
- Interprétation des tendances et cycles économiques  
- Corrélations entre différents indicateurs
- Prévisions à court terme basées sur les données historiques
- Recommandations de politique économique

Format de réponse :
1. Réponse claire et pédagogique en français
2. Données chiffrées précises quand disponibles
3. Suggestions de visualisations pertinentes
4. Questions de suivi intéressantes

Garde un ton professionnel mais accessible, adapté à un public non-expert.`

  async analyzeEconomicData(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      if (!openai) {
        throw new Error('OpenAI client not configured')
      }

      const messages: ChatMessage[] = [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: this.buildUserPrompt(request) }
      ]

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: messages,
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      })

      const responseContent = completion.choices[0]?.message?.content
      if (!responseContent) {
        throw new Error('Réponse vide de OpenAI')
      }

      const parsedResponse = JSON.parse(responseContent)
      
      return {
        response: parsedResponse.response || 'Désolé, je n\'ai pas pu analyser cette requête.',
        suggestedQueries: parsedResponse.suggestedQueries || [],
        dataInsights: parsedResponse.dataInsights || [],
        chartSuggestions: parsedResponse.chartSuggestions || [],
        sqlQuery: parsedResponse.sqlQuery
      }

    } catch (error) {
      console.error('Erreur analyse IA:', error)
      
      return {
        response: 'Je rencontre une difficulté technique. Pourriez-vous reformuler votre question ?',
        suggestedQueries: [
          'Quelle est l\'évolution du PIB français cette année ?',
          'Comment le taux de chômage a-t-il évolué ces 5 dernières années ?',
          'Quels sont les derniers chiffres de l\'inflation ?'
        ]
      }
    }
  }

  private buildUserPrompt(request: AnalysisRequest): string {
    let prompt = `Requête utilisateur: "${request.query}"\n\n`

    if (request.data && request.data.length > 0) {
      prompt += `Données disponibles:\n`
      prompt += JSON.stringify(request.data.slice(0, 10), null, 2) // Limiter pour éviter les tokens
      prompt += `\n(${request.data.length} enregistrements au total)\n\n`
    }

    if (request.context) {
      prompt += `Contexte: ${request.context}\n\n`
    }

    prompt += `Réponds au format JSON avec cette structure:
{
  "response": "Réponse détaillée en français",
  "dataInsights": ["Insight 1", "Insight 2", "..."],
  "suggestedQueries": ["Question 1", "Question 2", "..."],
  "chartSuggestions": [
    {
      "type": "line|bar|pie",
      "title": "Titre du graphique",
      "description": "Description du graphique recommandé"
    }
  ],
  "sqlQuery": "SELECT ... (si applicable)"
}`

    return prompt
  }
}

export const economicAnalyzer = new EconomicAnalyzer()
export { OpenAI }