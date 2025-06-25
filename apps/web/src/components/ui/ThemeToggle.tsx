'use client'

import { useTheme, useThemeTransition } from './ThemeProvider'
import { Button } from './Button'
import { 
  SunIcon, 
  MoonIcon, 
  Monitor 
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown' | 'switcher'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ThemeToggle({ 
  variant = 'button', 
  size = 'md',
  className 
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { startTransition } = useThemeTransition()

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    startTransition()
    setTheme(newTheme)
  }

  if (variant === 'button') {
    return (
      <Button
        variant="ghost"
        size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'icon'}
        onClick={() => handleThemeChange(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className={cn('transition-transform hover:scale-110', className)}
        aria-label={`Basculer vers le thème ${resolvedTheme === 'dark' ? 'clair' : 'sombre'}`}
      >
        {resolvedTheme === 'dark' ? (
          <SunIcon className="h-4 w-4" />
        ) : (
          <MoonIcon className="h-4 w-4" />
        )}
      </Button>
    )
  }

  if (variant === 'switcher') {
    return (
      <div className={cn('flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1', className)}>
        <button
          onClick={() => handleThemeChange('light')}
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-md transition-all',
            theme === 'light' 
              ? 'bg-white shadow-sm text-gray-900' 
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
          )}
          aria-label="Thème clair"
        >
          <SunIcon className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => handleThemeChange('system')}
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-md transition-all',
            theme === 'system' 
              ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100' 
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
          )}
          aria-label="Thème système"
        >
          <Monitor className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => handleThemeChange('dark')}
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-md transition-all',
            theme === 'dark' 
              ? 'bg-gray-700 shadow-sm text-gray-100' 
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
          )}
          aria-label="Thème sombre"
        >
          <MoonIcon className="h-4 w-4" />
        </button>
      </div>
    )
  }

  if (variant === 'dropdown') {
    return (
      <div className={cn('relative', className)}>
        <select
          value={theme}
          onChange={(e) => handleThemeChange(e.target.value as any)}
          className="appearance-none bg-transparent border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="light">🌞 Clair</option>
          <option value="dark">🌙 Sombre</option>
          <option value="system">💻 Système</option>
        </select>
      </div>
    )
  }

  return null
}

// Composant pour afficher l'état du thème
export function ThemeStatus() {
  const { theme, resolvedTheme } = useTheme()
  
  const getThemeLabel = () => {
    switch (theme) {
      case 'light': return '🌞 Clair'
      case 'dark': return '🌙 Sombre'
      case 'system': return `💻 Système (${resolvedTheme === 'dark' ? 'sombre' : 'clair'})`
      default: return 'Inconnu'
    }
  }

  return (
    <div className="text-xs text-gray-500 dark:text-gray-400">
      Thème: {getThemeLabel()}
    </div>
  )
}

// Hook pour détecter les préférences utilisateur
export function useThemePreferences() {
  const { resolvedTheme } = useTheme()
  
  const isDark = resolvedTheme === 'dark'
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false
  const prefersHighContrast = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-contrast: high)').matches
    : false

  return {
    isDark,
    prefersReducedMotion,
    prefersHighContrast,
    // Couleurs adaptées au thème
    colors: {
      primary: isDark ? '#60a5fa' : '#2563eb',
      secondary: isDark ? '#9ca3af' : '#6b7280',
      background: isDark ? '#111827' : '#ffffff',
      foreground: isDark ? '#f9fafb' : '#111827',
      muted: isDark ? '#374151' : '#f3f4f6',
      border: isDark ? '#4b5563' : '#e5e7eb'
    }
  }
}