import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { ExportOptions } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body: ExportOptions = await request.json()
    const { format, includeCharts, dateRange, selectedData } = body

    // Validation des paramètres requis
    if (!dateRange?.start || !dateRange?.end) {
      return NextResponse.json(
        { success: false, error: 'Date range is required' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()
    
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Mode démo : Export désactivé. Configurez Supabase pour activer cette fonctionnalité.' },
        { status: 501 }
      )
    }

    // Récupération des données à exporter
    let query = supabase
      .from('economic_data')
      .select('*')
      .gte('date', dateRange.start)
      .lte('date', dateRange.end)
      .order('date', { ascending: true })

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des données' },
        { status: 500 }
      )
    }

    const exportData = data || []

    switch (format) {
      case 'csv': {
        const csvContent = generateCSV(exportData)
        
        return new NextResponse(csvContent, {
          status: 200,
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="donnees-economiques-${new Date().toISOString().split('T')[0]}.csv"`
          }
        })
      }

      case 'json': {
        // Pour l'instant, retourner les données JSON
        // L'export PDF sera géré côté client avec jsPDF
        return NextResponse.json({
          success: true,
          data: exportData,
          format: 'PDF',
          includeCharts
        })
      }

      case 'xlsx': {
        // Pour l'instant, utiliser le format CSV
        // L'export Excel pourra être ajouté avec une bibliothèque comme xlsx
        const csvContent = generateCSV(exportData)
        
        return new NextResponse(csvContent, {
          status: 200,
          headers: {
            'Content-Type': 'application/vnd.ms-excel',
            'Content-Disposition': `attachment; filename="donnees-economiques-${new Date().toISOString().split('T')[0]}.xls"`
          }
        })
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Format d\'export non supporté' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Erreur export:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

function generateCSV(data: any[]): string {
  if (data.length === 0) {
    return 'Aucune donnée à exporter'
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
    'Créé le',
    'Mis à jour le'
  ]

  // Conversion des données
  const rows = data.map(item => [
    item.id,
    item.indicator,
    item.value,
    item.date,
    item.source,
    item.unit,
    item.frequency,
    item.geography,
    item.category,
    item.created_at,
    item.updated_at
  ])

  // Assemblage du CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      row.map(cell => 
        typeof cell === 'string' && cell.includes(',') 
          ? `"${cell.replace(/"/g, '""')}"` 
          : cell
      ).join(',')
    )
  ].join('\n')

  return csvContent
}