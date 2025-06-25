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
  category: EconomicCategory
}

export type EconomicCategory = 
  | 'GDP'
  | 'UNEMPLOYMENT'
  | 'INFLATION'
  | 'TRADE'
  | 'INDUSTRIAL_PRODUCTION'
  | 'CONSUMER_CONFIDENCE'
  | 'GOVERNMENT_DEBT'
  | 'INTEREST_RATES'

export interface ChartData {
  date: string
  value: number
  indicator: string
}

export interface DashboardConfig {
  layout: 'grid' | 'list'
  timeRange: '1M' | '3M' | '6M' | '1Y' | '5Y' | 'ALL'
  selectedIndicators: EconomicCategory[]
  selectedCountries: string[]
}

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  metadata?: {
    total: number
    page: number
    limit: number
  }
}

// Types pour les données INSEE
export interface INSEEDataset {
  id: string
  title: string
  description: string
  lastUpdate: string
  frequency: string
  unit: string
  geography: string
}

export interface INSEEObservation {
  period: string
  value: number
  status?: string
}

// Types pour les données Eurostat
export interface EurostatDataset {
  id: string
  title: string
  description: string
  lastUpdate: string
  unit: string
  frequency: string
  geoCode: string
}

export interface FilterOptions {
  dateRange: {
    start: string
    end: string
  }
  countries: string[]
  indicators: EconomicCategory[]
  frequency: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
}

export interface ExportOptions {
  format: 'PDF' | 'CSV' | 'EXCEL'
  includeCharts: boolean
  dateRange: {
    start: string
    end: string
  }
  selectedData: EconomicData[]
}