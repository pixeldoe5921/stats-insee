'use client'

import { useState, useEffect, useRef } from 'react'
import { EconomicData, DashboardConfig, EconomicCategory } from '@/types'
import { Card, StatCard } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LineChart } from '@/components/charts/LineChart'
import { BarChart } from '@/components/charts/BarChart'
import { ChatBot } from '@/components/ChatBot'
import { ExportDialog } from '@/components/ExportDialog'
import { formatNumber, formatPercentage } from '@/lib/utils'
import { 
  TrendingUpIcon, 
  TrendingDownIcon, 
  UsersIcon, 
  BuildingIcon,
  ActivityIcon,
  DownloadIcon,
  RefreshCwIcon,
  MessageSquareIcon
} from 'lucide-react'

interface DashboardProps {
  initialData?: EconomicData[]
}

export function Dashboard({ initialData = [] }: DashboardProps) {
  const [data, setData] = useState<EconomicData[]>(initialData)
  const [config, setConfig] = useState<DashboardConfig>({
    layout: 'grid',
    timeRange: '1Y',
    selectedIndicators: ['GDP', 'UNEMPLOYMENT', 'INFLATION'],
    selectedCountries: ['France', 'UE27']
  })
  const [loading, setLoading] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showChatBot, setShowChatBot] = useState(false)
  
  // Refs pour l'export PDF
  const dashboardRef = useRef<HTMLDivElement>(null)
  const chartRefs = useRef<(HTMLDivElement | null)[]>([])
  
  const setChartRef = (index: number) => (ref: HTMLDivElement | null) => {
    chartRefs.current[index] = ref
  }

  // Fonction pour filtrer les données selon la configuration
  const getFilteredData = () => {
    return data.filter(item => {
      const isSelectedIndicator = config.selectedIndicators?.includes(item.category) ?? true
      const isSelectedCountry = config.selectedCountries?.some(country => 
        item.geography.includes(country)
      ) ?? true
      
      // Filtrage par période
      const itemDate = new Date(item.date)
      const now = new Date()
      let cutoffDate = new Date()
      
      switch (config.timeRange) {
        case '1M':
          cutoffDate.setMonth(now.getMonth() - 1)
          break
        case '3M':
          cutoffDate.setMonth(now.getMonth() - 3)
          break
        case '6M':
          cutoffDate.setMonth(now.getMonth() - 6)
          break
        case '1Y':
          cutoffDate.setFullYear(now.getFullYear() - 1)
          break
        case '5Y':
          cutoffDate.setFullYear(now.getFullYear() - 5)
          break
        case 'ALL':
          cutoffDate = new Date('1900-01-01')
          break
      }
      
      const isInTimeRange = itemDate >= cutoffDate
      
      return isSelectedIndicator && isSelectedCountry && isInTimeRange
    })
  }

  // Calcul des statistiques principales
  const getMainStats = () => {
    const filteredData = getFilteredData()
    
    const gdpData = filteredData.filter(item => item.category === 'GDP')
    const unemploymentData = filteredData.filter(item => item.category === 'UNEMPLOYMENT')
    const inflationData = filteredData.filter(item => item.category === 'INFLATION')
    
    const latestGDP = gdpData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    const latestUnemployment = unemploymentData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    const latestInflation = inflationData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    
    return {
      gdp: latestGDP,
      unemployment: latestUnemployment,
      inflation: latestInflation
    }
  }

  // Préparation des données pour les graphiques
  const getChartData = (category: EconomicCategory) => {
    return getFilteredData()
      .filter(item => item.category === category)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(item => ({
        name: item.date,
        value: item.value,
        date: item.date,
        category: item.category
      }))
  }

  const handleRefreshData = async () => {
    setLoading(true)
    try {
      // Appel API pour récupérer les nouvelles données
      const response = await fetch('/api/economic-data')
      if (response.ok) {
        const newData = await response.json()
        setData(newData)
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    setShowExportDialog(true)
  }

  const mainStats = getMainStats()

  return (
    <div ref={dashboardRef} className="space-y-6">
      {/* Header avec contrôles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tableau de Bord Économique
          </h1>
          <p className="text-gray-600 mt-1">
            Données INSEE, Eurostat et sources officielles
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefreshData}
            loading={loading}
          >
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowChatBot(true)}
          >
            <MessageSquareIcon className="h-4 w-4 mr-2" />
            Assistant IA
          </Button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="PIB (dernière valeur)"
          value={mainStats.gdp ? formatNumber(mainStats.gdp.value) : 'N/A'}
          unit={mainStats.gdp?.unit}
          icon={<BuildingIcon className="h-8 w-8" />}
        />
        
        <StatCard
          title="Taux de chômage"
          value={mainStats.unemployment ? formatPercentage(mainStats.unemployment.value) : 'N/A'}
          icon={<UsersIcon className="h-8 w-8" />}
        />
        
        <StatCard
          title="Inflation"
          value={mainStats.inflation ? formatNumber(mainStats.inflation.value) : 'N/A'}
          unit={mainStats.inflation?.unit}
          icon={<TrendingUpIcon className="h-8 w-8" />}
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Évolution du PIB" className="p-6">
          <div ref={setChartRef(0)}>
            <LineChart
              data={getChartData('GDP')}
              title="PIB dans le temps"
              height={300}
            />
          </div>
        </Card>
        
        <Card title="Taux de chômage" className="p-6">
          <div ref={setChartRef(1)}>
            <LineChart
              data={getChartData('UNEMPLOYMENT')}
              title="Évolution du chômage"
              height={300}
            />
          </div>
        </Card>
        
        <Card title="Inflation" className="p-6">
          <div ref={setChartRef(2)}>
            <BarChart
              data={getChartData('INFLATION')}
              title="Indice des prix"
              height={300}
            />
          </div>
        </Card>
        
        <Card title="Données comparatives" className="p-6">
          <div ref={setChartRef(3)} className="text-center text-gray-500 py-8">
            <ActivityIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Graphique comparatif en développement</p>
          </div>
        </Card>
      </div>

      {/* Tableau des données récentes */}
      <Card title="Données récentes" className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Indicateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valeur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Géographie
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredData().slice(0, 10).map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.indicator}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(item.value)} {item.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.source}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.geography}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Chat Bot */}
      <ChatBot 
        isMinimized={!showChatBot}
        onToggleMinimize={() => setShowChatBot(!showChatBot)}
      />

      {/* Export Dialog */}
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        data={getFilteredData()}
        dashboardElement={dashboardRef.current || undefined}
        chartElements={chartRefs.current.filter(Boolean) as HTMLElement[]}
      />
    </div>
  )
}