'use client'

import { useState, useMemo } from 'react'
import { Responsive, WidthProvider, Layout } from 'react-grid-layout'
import { Card } from './Card'
import { Button } from './Button'
import { cn } from '@/lib/utils'
import {
  GripVerticalIcon,
  PlusIcon,
  XIcon,
  SettingsIcon,
  CopyIcon,
  MaximizeIcon,
  MinimizeIcon
} from 'lucide-react'

const ResponsiveGridLayout = WidthProvider(Responsive)

export interface DashboardWidget {
  id: string
  type: 'chart' | 'stat' | 'table' | 'text' | 'custom'
  title: string
  component: React.ComponentType<any>
  props?: any
  layout: {
    x: number
    y: number
    w: number
    h: number
    minW?: number
    minH?: number
    maxW?: number
    maxH?: number
  }
  isResizable?: boolean
  isDraggable?: boolean
}

interface DraggableDashboardProps {
  widgets: DashboardWidget[]
  onLayoutChange?: (widgets: DashboardWidget[]) => void
  editable?: boolean
  cols?: { lg: number; md: number; sm: number; xs: number; xxs: number }
  rowHeight?: number
  className?: string
}

export function DraggableDashboard({
  widgets,
  onLayoutChange,
  editable = false,
  cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  rowHeight = 120,
  className
}: DraggableDashboardProps) {
  const [editMode, setEditMode] = useState(editable)
  const [layouts, setLayouts] = useState<{ [key: string]: Layout[] }>({})

  // Convertir les widgets en layouts pour react-grid-layout
  const gridLayouts = useMemo(() => {
    const layoutMap: { [key: string]: Layout[] } = {}
    
    Object.keys(cols).forEach(breakpoint => {
      layoutMap[breakpoint] = widgets.map(widget => ({
        i: widget.id,
        x: widget.layout.x,
        y: widget.layout.y,
        w: widget.layout.w,
        h: widget.layout.h,
        minW: widget.layout.minW,
        minH: widget.layout.minH,
        maxW: widget.layout.maxW,
        maxH: widget.layout.maxH,
        static: !editMode || !widget.isDraggable
      }))
    })
    
    return layoutMap
  }, [widgets, cols, editMode])

  const handleLayoutChange = (layout: Layout[], allLayouts: { [key: string]: Layout[] }) => {
    if (!editMode || !onLayoutChange) return

    setLayouts(allLayouts)

    // Mettre à jour les widgets avec les nouvelles positions
    const updatedWidgets = widgets.map(widget => {
      const layoutItem = layout.find(item => item.i === widget.id)
      if (layoutItem) {
        return {
          ...widget,
          layout: {
            ...widget.layout,
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h
          }
        }
      }
      return widget
    })

    onLayoutChange(updatedWidgets)
  }

  const handleRemoveWidget = (widgetId: string) => {
    if (!onLayoutChange) return
    
    const updatedWidgets = widgets.filter(widget => widget.id !== widgetId)
    onLayoutChange(updatedWidgets)
  }

  const handleDuplicateWidget = (widget: DashboardWidget) => {
    if (!onLayoutChange) return

    const newWidget: DashboardWidget = {
      ...widget,
      id: `${widget.id}-copy-${Date.now()}`,
      title: `${widget.title} (Copie)`,
      layout: {
        ...widget.layout,
        x: (widget.layout.x + widget.layout.w) % 12,
        y: widget.layout.y + Math.floor((widget.layout.x + widget.layout.w) / 12) * widget.layout.h
      }
    }

    onLayoutChange([...widgets, newWidget])
  }

  const renderWidget = (widget: DashboardWidget) => {
    const WidgetComponent = widget.component

    return (
      <div key={widget.id} className="relative group">
        <Card className={cn(
          'h-full overflow-hidden transition-all duration-200',
          editMode && 'ring-2 ring-blue-200 hover:ring-blue-300'
        )}>
          {/* Widget Header */}
          <div className={cn(
            'flex items-center justify-between p-3 border-b bg-gray-50 dark:bg-gray-800',
            editMode && 'cursor-move'
          )}>
            <div className="flex items-center gap-2">
              {editMode && (
                <GripVerticalIcon className="h-4 w-4 text-gray-400" />
              )}
              <h3 className="font-medium text-sm truncate">{widget.title}</h3>
            </div>

            {/* Widget Controls */}
            {editMode && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDuplicateWidget(widget)}
                  className="h-6 w-6 p-0"
                >
                  <CopyIcon className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <SettingsIcon className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveWidget(widget.id)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Widget Content */}
          <div className="p-3 h-[calc(100%-3rem)] overflow-auto">
            <WidgetComponent {...(widget.props || {})} />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Dashboard Controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Dashboard Personnel
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {editMode 
              ? 'Mode édition : déplacez et redimensionnez vos widgets' 
              : `${widgets.length} widgets configurés`
            }
          </p>
        </div>

        <div className="flex items-center gap-2">
          {editMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {/* Ouvrir le catalogue de widgets */}}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Ajouter Widget
            </Button>
          )}

          <Button
            variant={editMode ? "default" : "outline"}
            size="sm"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? (
              <>
                <MinimizeIcon className="h-4 w-4 mr-2" />
                Terminer
              </>
            ) : (
              <>
                <SettingsIcon className="h-4 w-4 mr-2" />
                Éditer
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Grid Layout */}
      <ResponsiveGridLayout
        className="layout"
        layouts={gridLayouts}
        onLayoutChange={handleLayoutChange}
        cols={cols}
        rowHeight={rowHeight}
        isDraggable={editMode}
        isResizable={editMode}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        useCSSTransforms={true}
        preventCollision={false}
        compactType="vertical"
      >
        {widgets.map(renderWidget)}
      </ResponsiveGridLayout>

      {/* Empty State */}
      {widgets.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <SettingsIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Dashboard vide
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Commencez par ajouter quelques widgets pour personnaliser votre dashboard.
            </p>
            <Button onClick={() => setEditMode(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Ajouter des widgets
            </Button>
          </div>
        </div>
      )}

      {/* CSS pour react-grid-layout */}
      <style jsx global>{`
        .react-grid-layout {
          position: relative;
        }
        
        .react-grid-item {
          transition: all 200ms ease;
          transition-property: left, top;
        }
        
        .react-grid-item.cssTransforms {
          transition-property: transform;
        }
        
        .react-grid-item > .react-resizable-handle {
          position: absolute;
          width: 20px;
          height: 20px;
          bottom: 0;
          right: 0;
          background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNiIgaGVpZ2h0PSI2IiB2aWV3Qm94PSIwIDAgNiA2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZG90cyBmaWxsPSIjOTk5IiBjeD0iMSIgY3k9IjEiIHI9IjEiLz4KPHN0cyBmaWxsPSIjOTk5IiBjeD0iMSIgY3k9IjUiIHI9IjEiLz4KPHRzIGZpbGw9IiM5OTkiIGN4PSI1IiBjeT0iMSIgcj0iMSIvPgo8dHMgZmlsbD0iIzk5OSIgY3g9IjUiIGN5PSI1IiByPSIxIi8+Cjwvc3ZnPgo=');
          background-position: bottom right;
          padding: 0 3px 3px 0;
          background-repeat: no-repeat;
          background-origin: content-box;
          box-sizing: border-box;
          cursor: se-resize;
        }
        
        .react-grid-item.react-grid-placeholder {
          background: rgb(59 130 246 / 0.2);
          opacity: 0.2;
          transition-duration: 100ms;
          z-index: 2;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          -o-user-select: none;
          user-select: none;
          border-radius: 8px;
        }
        
        .react-grid-item.react-draggable-dragging {
          transition: none;
          z-index: 3;
        }
        
        .react-grid-item.dropping {
          visibility: hidden;
        }
        
        .react-grid-item.react-grid-placeholder {
          background-color: rgb(59 130 246 / 0.1);
          border: 2px dashed rgb(59 130 246 / 0.5);
        }
      `}</style>
    </div>
  )
}

// Widgets exemples
export const SampleStatWidget = ({ title, value, unit }: any) => (
  <div className="text-center">
    <div className="text-2xl font-bold text-blue-600">{value}</div>
    <div className="text-sm text-gray-600">{unit}</div>
  </div>
)

export const SampleChartWidget = ({ title }: any) => (
  <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-800 rounded">
    <div className="text-center">
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
        📊
      </div>
      <div className="text-sm text-gray-600">Graphique {title}</div>
    </div>
  </div>
)

export const SampleTableWidget = ({ title }: any) => (
  <div className="space-y-2">
    <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-600">
      <div>Indicateur</div>
      <div>Valeur</div>
      <div>Évolution</div>
    </div>
    {[1, 2, 3].map(i => (
      <div key={i} className="grid grid-cols-3 gap-2 text-sm">
        <div>Item {i}</div>
        <div>{(Math.random() * 100).toFixed(1)}</div>
        <div className="text-green-600">+2.3%</div>
      </div>
    ))}
  </div>
)