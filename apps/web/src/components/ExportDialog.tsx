'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ExportOptions, EconomicData } from '@/types'
import ExportManager from '@/lib/export-utils'
import { 
  DownloadIcon, 
  FileTextIcon, 
  FileSpreadsheetIcon,
  FileImageIcon,
  CalendarIcon,
  FilterIcon,
  LoaderIcon,
  XIcon
} from 'lucide-react'

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  data: EconomicData[]
  dashboardElement?: HTMLElement
  chartElements?: HTMLElement[]
}

export function ExportDialog({ 
  isOpen, 
  onClose, 
  data, 
  dashboardElement,
  chartElements = [] 
}: ExportDialogProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'CSV',
    includeCharts: false,
    dateRange: {
      start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 an
      end: new Date().toISOString().split('T')[0]
    },
    selectedData: data
  })
  
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle')

  if (!isOpen) return null

  const handleExport = async () => {
    setIsExporting(true)
    setExportStatus('idle')

    try {
      // Filtrer les données selon les options
      const filteredData = filterDataByOptions(data, exportOptions)
      
      if (filteredData.length === 0) {
        throw new Error('Aucune donnée à exporter avec ces filtres')
      }

      switch (exportOptions.format) {
        case 'CSV':
          await ExportManager.exportToCSV(filteredData, exportOptions)
          break
          
        case 'EXCEL':
          await ExportManager.exportToExcel(filteredData, exportOptions)
          break
          
        case 'PDF':
          await ExportManager.exportToPDF(filteredData, {
            ...exportOptions,
            dashboardElement,
            chartElements: exportOptions.includeCharts ? chartElements : []
          })
          break
      }

      setExportStatus('success')
      
      // Fermer automatiquement après succès
      setTimeout(() => {
        onClose()
        setExportStatus('idle')
      }, 2000)

    } catch (error) {
      console.error('Erreur export:', error)
      setExportStatus('error')
    } finally {
      setIsExporting(false)
    }
  }

  const filteredDataCount = filterDataByOptions(data, exportOptions).length

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <DownloadIcon className="h-5 w-5" />
            Exporter les données
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Format d'export */}
          <div>
            <label className="block text-sm font-medium mb-3">Format d'export</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                className={`p-3 border rounded-lg text-center transition-colors ${
                  exportOptions.format === 'CSV' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setExportOptions(prev => ({ ...prev, format: 'CSV' }))}
              >
                <FileTextIcon className="h-6 w-6 mx-auto mb-1" />
                <div className="text-xs font-medium">CSV</div>
              </button>
              
              <button
                className={`p-3 border rounded-lg text-center transition-colors ${
                  exportOptions.format === 'EXCEL' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setExportOptions(prev => ({ ...prev, format: 'EXCEL' }))}
              >
                <FileSpreadsheetIcon className="h-6 w-6 mx-auto mb-1" />
                <div className="text-xs font-medium">Excel</div>
              </button>
              
              <button
                className={`p-3 border rounded-lg text-center transition-colors ${
                  exportOptions.format === 'PDF' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setExportOptions(prev => ({ ...prev, format: 'PDF' }))}
              >
                <FileImageIcon className="h-6 w-6 mx-auto mb-1" />
                <div className="text-xs font-medium">PDF</div>
              </button>
            </div>
          </div>

          {/* Options PDF */}
          {exportOptions.format === 'PDF' && (
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exportOptions.includeCharts}
                  onChange={(e) => setExportOptions(prev => ({ 
                    ...prev, 
                    includeCharts: e.target.checked 
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Inclure les graphiques</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Les graphiques seront capturés et inclus dans le PDF
              </p>
            </div>
          )}

          {/* Plage de dates */}
          <div>
            <label className="block text-sm font-medium mb-3 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Période d'export
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Du</label>
                <input
                  type="date"
                  value={exportOptions.dateRange.start}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Au</label>
                <input
                  type="date"
                  value={exportOptions.dateRange.end}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Résumé */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <FilterIcon className="h-4 w-4" />
              Résumé de l'export
            </div>
            <div className="text-sm space-y-1">
              <div>Format: <span className="font-medium">{exportOptions.format}</span></div>
              <div>Données: <span className="font-medium">{filteredDataCount}</span> enregistrements</div>
              <div>Période: <span className="font-medium">
                {new Date(exportOptions.dateRange.start).toLocaleDateString('fr-FR')} - {' '}
                {new Date(exportOptions.dateRange.end).toLocaleDateString('fr-FR')}
              </span></div>
              {exportOptions.format === 'PDF' && exportOptions.includeCharts && (
                <div>Graphiques: <span className="font-medium">{chartElements.length}</span> inclus</div>
              )}
            </div>
          </div>

          {/* Status messages */}
          {exportStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-green-800 text-sm font-medium">
                ✅ Export réussi ! Le téléchargement va commencer...
              </div>
            </div>
          )}

          {exportStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-red-800 text-sm font-medium">
                ❌ Erreur lors de l'export. Veuillez réessayer.
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isExporting}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || filteredDataCount === 0}
            loading={isExporting}
            className="flex-1"
          >
            {isExporting ? (
              <>
                <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                Export...
              </>
            ) : (
              <>
                <DownloadIcon className="h-4 w-4 mr-2" />
                Exporter
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}

function filterDataByOptions(data: EconomicData[], options: ExportOptions): EconomicData[] {
  return data.filter(item => {
    // Filtrage par date
    const itemDate = new Date(item.date)
    const startDate = new Date(options.dateRange.start)
    const endDate = new Date(options.dateRange.end)
    
    return itemDate >= startDate && itemDate <= endDate
  })
}