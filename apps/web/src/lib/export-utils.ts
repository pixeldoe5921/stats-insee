import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { EconomicData, ExportOptions } from '@/types'
import { formatNumber, formatDate, downloadFile } from '@/lib/utils'

export class ExportManager {
  
  /**
   * Exporte les données au format CSV
   */
  static async exportToCSV(data: EconomicData[], options: Partial<ExportOptions> = {}): Promise<void> {
    if (data.length === 0) {
      throw new Error('Aucune donnée à exporter')
    }

    // En-têtes CSV
    const headers = [
      'ID',
      'Indicateur', 
      'Valeur',
      'Date',
      'Source',
      'Unité',
      'Fréquence',
      'Géographie',
      'Catégorie',
      'Date de création',
      'Dernière mise à jour'
    ]

    // Conversion des données
    const csvRows = data.map(item => [
      item.id,
      `"${item.indicator.replace(/"/g, '""')}"`, // Échapper les guillemets
      item.value,
      item.date,
      item.source,
      `"${item.unit.replace(/"/g, '""')}"`,
      item.frequency,
      `"${item.geography.replace(/"/g, '""')}"`,
      item.category,
      new Date().toISOString().split('T')[0], // Date création
      new Date().toISOString().split('T')[0]  // Date MAJ
    ])

    // Assemblage final
    const csvContent = [
      '# Dashboard Économique INSEE - Export CSV',
      `# Généré le ${new Date().toLocaleString('fr-FR')}`,
      `# Nombre d'enregistrements: ${data.length}`,
      '', // Ligne vide
      headers.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n')

    // Téléchargement
    const filename = `donnees-economiques-${new Date().toISOString().split('T')[0]}.csv`
    downloadFile(csvContent, filename, 'text/csv;charset=utf-8;')
  }

  /**
   * Exporte les données au format Excel (utilise CSV avec headers spéciaux)
   */
  static async exportToExcel(data: EconomicData[], options: Partial<ExportOptions> = {}): Promise<void> {
    if (data.length === 0) {
      throw new Error('Aucune donnée à exporter')
    }

    // Structure Excel avec multiple sheets (simulé en CSV)
    const csvContent = this.generateExcelCompatibleCSV(data)
    
    const filename = `donnees-economiques-${new Date().toISOString().split('T')[0]}.xlsx`
    downloadFile(csvContent, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  }

  /**
   * Exporte au format PDF avec graphiques
   */
  static async exportToPDF(
    data: EconomicData[], 
    options: Partial<ExportOptions> & { 
      dashboardElement?: HTMLElement,
      chartElements?: HTMLElement[]
    } = {}
  ): Promise<void> {
    
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    let yPosition = 20

    // En-tête du document
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Dashboard Économique INSEE', pageWidth / 2, yPosition, { align: 'center' })
    
    yPosition += 10
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Rapport généré le ${new Date().toLocaleString('fr-FR')}`, pageWidth / 2, yPosition, { align: 'center' })
    
    yPosition += 15

    // Résumé des données
    const summary = this.generateDataSummary(data)
    
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Résumé des données', 20, yPosition)
    yPosition += 10

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    
    summary.forEach(line => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage()
        yPosition = 20
      }
      pdf.text(line, 20, yPosition)
      yPosition += 6
    })

    yPosition += 10

    // Graphiques (si disponibles)
    if (options.includeCharts && options.chartElements) {
      for (const chartElement of options.chartElements) {
        if (yPosition > pageHeight - 100) {
          pdf.addPage()
          yPosition = 20
        }

        try {
          const canvas = await html2canvas(chartElement, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false
          })

          const imgData = canvas.toDataURL('image/png')
          const imgWidth = pageWidth - 40
          const imgHeight = (canvas.height * imgWidth) / canvas.width

          pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight)
          yPosition += imgHeight + 10

        } catch (error) {
          console.error('Erreur capture graphique:', error)
          pdf.text('Erreur lors de la capture du graphique', 20, yPosition)
          yPosition += 10
        }
      }
    }

    // Tableau des données (page séparée)
    pdf.addPage()
    yPosition = 20
    
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Données détaillées', 20, yPosition)
    yPosition += 15

    // En-têtes de tableau
    const headers = ['Indicateur', 'Valeur', 'Date', 'Source', 'Géographie']
    const colWidths = [60, 25, 25, 25, 35]
    let xPosition = 20

    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'bold')
    
    headers.forEach((header, index) => {
      pdf.text(header, xPosition, yPosition)
      xPosition += colWidths[index]
    })
    
    yPosition += 8

    // Ligne de séparation
    pdf.line(20, yPosition - 2, pageWidth - 20, yPosition - 2)

    // Données (limiter à 50 lignes pour éviter un PDF trop lourd)
    const limitedData = data.slice(0, 50)
    
    pdf.setFont('helvetica', 'normal')
    
    limitedData.forEach(item => {
      if (yPosition > pageHeight - 20) {
        pdf.addPage()
        yPosition = 20
      }

      xPosition = 20
      const values = [
        item.indicator.substring(0, 25), // Tronquer si trop long
        formatNumber(item.value),
        item.date,
        item.source,
        item.geography.substring(0, 15)
      ]

      values.forEach((value, index) => {
        pdf.text(value.toString(), xPosition, yPosition)
        xPosition += colWidths[index]
      })
      
      yPosition += 6
    })

    if (data.length > 50) {
      yPosition += 10
      pdf.setFont('helvetica', 'italic')
      pdf.text(`... et ${data.length - 50} autres enregistrements`, 20, yPosition)
    }

    // Pied de page
    const totalPages = pdf.internal.pages.length - 1
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.text(
        `Page ${i} sur ${totalPages} - Dashboard Économique INSEE`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )
    }

    // Téléchargement
    const filename = `rapport-economique-${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(filename)
  }

  /**
   * Export via API backend
   */
  static async exportViaAPI(options: ExportOptions): Promise<void> {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
      })

      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.status}`)
      }

      if (options.format === 'PDF') {
        // Pour PDF, récupérer les données et générer côté client
        const data = await response.json()
        if (data.success && data.data) {
          await this.exportToPDF(data.data, options)
        }
      } else {
        // Pour CSV/Excel, télécharger directement
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        
        const extension = options.format.toLowerCase()
        link.download = `donnees-economiques-${new Date().toISOString().split('T')[0]}.${extension}`
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }

    } catch (error) {
      console.error('Erreur export API:', error)
      throw new Error('Impossible de réaliser l\'export')
    }
  }

  /**
   * Génère un résumé des données pour le PDF
   */
  private static generateDataSummary(data: EconomicData[]): string[] {
    const summary = []
    
    // Statistiques générales
    summary.push(`Nombre total d'enregistrements: ${data.length}`)
    
    // Par source
    const bySources = data.reduce((acc, item) => {
      acc[item.source] = (acc[item.source] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    summary.push('')
    summary.push('Répartition par source:')
    Object.entries(bySources).forEach(([source, count]) => {
      summary.push(`  • ${source}: ${count} enregistrements`)
    })

    // Par catégorie
    const byCategories = data.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    summary.push('')
    summary.push('Répartition par catégorie:')
    Object.entries(byCategories).forEach(([category, count]) => {
      summary.push(`  • ${category}: ${count} enregistrements`)
    })

    // Période couverte
    const dates = data.map(item => item.date).filter(Boolean).sort()
    if (dates.length > 0) {
      summary.push('')
      summary.push(`Période couverte: ${dates[0]} à ${dates[dates.length - 1]}`)
    }

    // Dernière mise à jour
    summary.push('')
    summary.push(`Rapport généré le: ${new Date().toLocaleString('fr-FR')}`)

    return summary
  }

  /**
   * Génère un CSV compatible Excel avec métadonnées
   */
  private static generateExcelCompatibleCSV(data: EconomicData[]): string {
    const lines = []
    
    // Métadonnées Excel
    lines.push('sep=,') // Délimiteur pour Excel
    lines.push('')
    lines.push(`Dashboard Économique INSEE,Export du ${new Date().toLocaleString('fr-FR')}`)
    lines.push('')
    
    // En-têtes principaux
    lines.push('ID,Indicateur,Valeur,Date,Source,Unité,Fréquence,Géographie,Catégorie')
    
    // Données
    data.forEach(item => {
      lines.push([
        item.id,
        `"${item.indicator.replace(/"/g, '""')}"`,
        item.value,
        item.date,
        item.source,
        `"${item.unit.replace(/"/g, '""')}"`,
        item.frequency,
        `"${item.geography.replace(/"/g, '""')}"`,
        item.category
      ].join(','))
    })

    return lines.join('\n')
  }
}

// Export par défaut
export default ExportManager