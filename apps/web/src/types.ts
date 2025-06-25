// Types pour les données économiques
export interface EconomicData {
  id: string
  indicator: string
  value: number
  date: string
  source: 'INSEE' | 'EUROSTAT' | 'OECD'
  unit: string
  frequency: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  geography: string
  category: 'GDP' | 'UNEMPLOYMENT' | 'INFLATION' | 'OTHER'
}

// Types pour les datasets INSEE
export interface INSEEDataset {
  id: string
  title: string
  description: string
  lastUpdate: string
  seriesCount: number
  keywords: string[]
}

export interface INSEEObservation {
  period: string
  value: number
  status?: string
}

// Types pour les datasets Eurostat
export interface EurostatDataset {
  id: string
  title: string
  description: string
  lastUpdate: string
  unit: string
  frequency: string
  geoCode: string
}

// Types pour l'export des données
export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx' | 'CSV' | 'EXCEL' | 'PDF'
  includeCharts?: boolean
  dateRange?: {
    start: string
    end: string
  }
  selectedData?: string[] | any[]
  filters?: {
    source?: string[]
    category?: string[]
  }
  limit?: number
}

// Types pour les graphiques
export interface ChartData {
  name: string
  value: number
  date?: string
  category?: string
  color?: string
}

// Types pour les catégories économiques
export type EconomicCategory = 'GDP' | 'UNEMPLOYMENT' | 'INFLATION' | 'OTHER'

// Types pour la configuration du dashboard
export interface DashboardConfig {
  refreshInterval?: number
  defaultView?: 'overview' | 'detailed'
  enabledCharts?: string[]
  layout?: string | {
    columns: number
    rows: number
  }
  timeRange?: string
  selectedIndicators?: string[]
  selectedCountries?: string[]
}