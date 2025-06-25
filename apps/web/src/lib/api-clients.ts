import axios from 'axios'
import { EconomicData, INSEEDataset, INSEEObservation, EurostatDataset } from '@/types'

// Configuration des clients API
const INSEE_BASE_URL = 'https://api.insee.fr/series/BDM/V1'
const EUROSTAT_BASE_URL = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data'

// Client INSEE
class INSEEClient {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.INSEE_API_KEY || ''
  }

  async getGDPData(): Promise<EconomicData[]> {
    // Mock data pour demo
    return [
      {
        id: 'insee-gdp-2024-q1',
        indicator: 'PIB',
        value: 650000,
        date: '2024-Q1',
        source: 'INSEE' as const,
        unit: 'Millions €',
        frequency: 'QUARTERLY' as const,
        geography: 'France',
        category: 'GDP' as const
      }
    ]
  }

  async getUnemploymentData(): Promise<EconomicData[]> {
    // Mock data pour demo
    return [
      {
        id: 'insee-unemployment-2024-q1',
        indicator: 'Taux de chômage',
        value: 7.5,
        date: '2024-Q1',
        source: 'INSEE' as const,
        unit: '%',
        frequency: 'QUARTERLY' as const,
        geography: 'France',
        category: 'UNEMPLOYMENT' as const
      }
    ]
  }

  async getInflationData(): Promise<EconomicData[]> {
    // Mock data pour demo
    return [
      {
        id: 'insee-inflation-2024-03',
        indicator: 'Inflation (IPC)',
        value: 2.1,
        date: '2024-03',
        source: 'INSEE' as const,
        unit: '%',
        frequency: 'MONTHLY' as const,
        geography: 'France',
        category: 'INFLATION' as const
      }
    ]
  }
}

// Client Eurostat
class EurostatClient {
  async getEUGDPData(): Promise<EconomicData[]> {
    // Mock data pour demo
    return [
      {
        id: 'eurostat-gdp-2024-q1',
        indicator: 'PIB UE',
        value: 4200000,
        date: '2024-Q1',
        source: 'EUROSTAT' as const,
        unit: 'Millions €',
        frequency: 'QUARTERLY' as const,
        geography: 'UE27',
        category: 'GDP' as const
      }
    ]
  }

  async getEUUnemploymentData(): Promise<EconomicData[]> {
    // Mock data pour demo
    return [
      {
        id: 'eurostat-unemployment-2024-03',
        indicator: 'Taux de chômage UE',
        value: 6.2,
        date: '2024-03',
        source: 'EUROSTAT' as const,
        unit: '%',
        frequency: 'MONTHLY' as const,
        geography: 'UE27',
        category: 'UNEMPLOYMENT' as const
      }
    ]
  }
}

// Export des instances
export const inseeClient = new INSEEClient()
export const eurostatClient = new EurostatClient()

// Fonction utilitaire pour récupérer toutes les données
export async function fetchAllEconomicData(): Promise<EconomicData[]> {
  try {
    const [
      gdpFrance,
      unemploymentFrance,
      inflationFrance,
      gdpEU,
      unemploymentEU
    ] = await Promise.all([
      inseeClient.getGDPData(),
      inseeClient.getUnemploymentData(),
      inseeClient.getInflationData(),
      eurostatClient.getEUGDPData(),
      eurostatClient.getEUUnemploymentData()
    ])

    return [
      ...gdpFrance,
      ...unemploymentFrance,
      ...inflationFrance,
      ...gdpEU,
      ...unemploymentEU
    ]
  } catch (error) {
    console.error('Erreur lors de la récupération des données économiques:', error)
    return []
  }
}