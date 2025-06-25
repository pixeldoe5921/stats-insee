'use client'

import { useState, ReactNode, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './ThemeToggle'
import { Button } from './Button'
import {
  PanelLeftIcon,
  PanelRightIcon,
  SettingsIcon,
  BellIcon,
  SearchIcon,
  LayoutGridIcon,
  LayoutListIcon,
  FilterIcon,
  ExpandIcon,
  MinimizeIcon
} from 'lucide-react'

interface DashboardLayoutProps {
  children: ReactNode
  sidebar?: ReactNode
  rightPanel?: ReactNode
  className?: string
}

interface LayoutConfig {
  sidebarCollapsed: boolean
  rightPanelOpen: boolean
  isFullscreen: boolean
  gridLayout: boolean
  showFilters: boolean
}

export function DashboardLayout({
  children,
  sidebar,
  rightPanel,
  className
}: DashboardLayoutProps) {
  const [config, setConfig] = useState<LayoutConfig>({
    sidebarCollapsed: false,
    rightPanelOpen: false,
    isFullscreen: false,
    gridLayout: true,
    showFilters: false
  })

  const layoutRef = useRef<HTMLDivElement>(null)

  // Gestion du plein écran
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      layoutRef.current?.requestFullscreen()
      setConfig(prev => ({ ...prev, isFullscreen: true }))
    } else {
      document.exitFullscreen()
      setConfig(prev => ({ ...prev, isFullscreen: false }))
    }
  }

  // Écouter les changements de plein écran
  useEffect(() => {
    const handleFullscreenChange = () => {
      setConfig(prev => ({ 
        ...prev, 
        isFullscreen: !!document.fullscreenElement 
      }))
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Sauvegarde de la configuration dans localStorage
  useEffect(() => {
    localStorage.setItem('dashboard-layout-config', JSON.stringify(config))
  }, [config])

  // Restauration de la configuration
  useEffect(() => {
    const saved = localStorage.getItem('dashboard-layout-config')
    if (saved) {
      try {
        const parsedConfig = JSON.parse(saved)
        setConfig(prev => ({ ...prev, ...parsedConfig, isFullscreen: false }))
      } catch (error) {
        console.error('Erreur de parsing de la configuration:', error)
      }
    }
  }, [])

  const updateConfig = (updates: Partial<LayoutConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  return (
    <div 
      ref={layoutRef}
      className={cn(
        'min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200',
        config.isFullscreen && 'bg-black',
        className
      )}
    >
      {/* Header */}
      <header className={cn(
        'sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm',
        config.isFullscreen && 'hidden'
      )}>
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle */}
            {sidebar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateConfig({ sidebarCollapsed: !config.sidebarCollapsed })}
                className="lg:hidden"
              >
                <PanelLeftIcon className="h-4 w-4" />
              </Button>
            )}

            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">📊</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Dashboard INSEE
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Données économiques en temps réel
                </p>
              </div>
            </div>
          </div>

          {/* Center Section - Search */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des indicateurs..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Layout Controls */}
            <div className="hidden lg:flex items-center gap-1 mr-2">
              <Button
                variant={config.gridLayout ? "default" : "ghost"}
                size="sm"
                onClick={() => updateConfig({ gridLayout: true })}
                aria-label="Vue grille"
              >
                <LayoutGridIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={!config.gridLayout ? "default" : "ghost"}
                size="sm"
                onClick={() => updateConfig({ gridLayout: false })}
                aria-label="Vue liste"
              >
                <LayoutListIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* Action Buttons */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateConfig({ showFilters: !config.showFilters })}
              className={cn(config.showFilters && "bg-gray-100 dark:bg-gray-700")}
            >
              <FilterIcon className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="sm">
              <BellIcon className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
            >
              {config.isFullscreen ? (
                <MinimizeIcon className="h-4 w-4" />
              ) : (
                <ExpandIcon className="h-4 w-4" />
              )}
            </Button>

            <ThemeToggle variant="switcher" size="sm" />

            {/* Right Panel Toggle */}
            {rightPanel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateConfig({ rightPanelOpen: !config.rightPanelOpen })}
              >
                <PanelRightIcon className="h-4 w-4" />
              </Button>
            )}

            {/* Settings */}
            <Button variant="ghost" size="sm">
              <SettingsIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters Bar */}
        {config.showFilters && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filtres:
              </span>
              <select className="text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-1 bg-white dark:bg-gray-700">
                <option>Toutes les sources</option>
                <option>INSEE</option>
                <option>Eurostat</option>
                <option>OECD</option>
              </select>
              <select className="text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-1 bg-white dark:bg-gray-700">
                <option>Toutes les périodes</option>
                <option>Dernière année</option>
                <option>5 dernières années</option>
                <option>Personnalisé</option>
              </select>
              <Button variant="ghost" size="sm">
                Réinitialiser
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* Sidebar */}
        {sidebar && (
          <aside className={cn(
            'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
            config.sidebarCollapsed ? 'w-16' : 'w-64',
            'hidden lg:block'
          )}>
            <div className="h-full overflow-y-auto p-4">
              {sidebar}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className={cn(
          'flex-1 overflow-auto',
          config.gridLayout ? 'p-4 sm:p-6 lg:p-8' : 'p-0'
        )}>
          <div className={cn(
            config.gridLayout && 'max-w-7xl mx-auto'
          )}>
            {children}
          </div>
        </main>

        {/* Right Panel */}
        {rightPanel && config.rightPanelOpen && (
          <aside className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
            <div className="h-full overflow-y-auto p-4">
              {rightPanel}
            </div>
          </aside>
        )}
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebar && !config.sidebarCollapsed && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <aside className="w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Menu</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateConfig({ sidebarCollapsed: true })}
              >
                <PanelLeftIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-full overflow-y-auto p-4">
              {sidebar}
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}

// Composant pour la sidebar
export function DashboardSidebar({ children }: { children: ReactNode }) {
  return (
    <nav className="space-y-2">
      {children}
    </nav>
  )
}

// Composant pour les éléments de la sidebar
export function SidebarItem({
  icon,
  label,
  active = false,
  onClick,
  badge
}: {
  icon: ReactNode
  label: string
  active?: boolean
  onClick?: () => void
  badge?: string | number
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
        active 
          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      )}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {badge && (
        <span className="flex-shrink-0 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
    </button>
  )
}