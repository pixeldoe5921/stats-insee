'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme'
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Récupérer le thème depuis localStorage
    const stored = localStorage.getItem(storageKey) as Theme
    if (stored) {
      setTheme(stored)
    }
  }, [storageKey])

  useEffect(() => {
    const updateResolvedTheme = () => {
      let resolved: 'light' | 'dark'

      if (theme === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches 
          ? 'dark' 
          : 'light'
      } else {
        resolved = theme
      }

      setResolvedTheme(resolved)
      
      // Mettre à jour le document
      document.documentElement.setAttribute('data-theme', resolved)
      
      // Mettre à jour la classe pour Tailwind
      if (resolved === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    updateResolvedTheme()

    // Écouter les changements de préférence système
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        updateResolvedTheme()
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem(storageKey, newTheme)
  }

  const value: ThemeContextType = {
    theme,
    setTheme: updateTheme,
    resolvedTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Hook pour les animations de thème
export function useThemeTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  const startTransition = () => {
    setIsTransitioning(true)
    
    // Ajouter la classe de transition
    document.documentElement.style.setProperty(
      '--theme-transition', 
      'background-color 0.3s ease, color 0.3s ease'
    )
    
    setTimeout(() => {
      setIsTransitioning(false)
      document.documentElement.style.removeProperty('--theme-transition')
    }, 300)
  }
  
  return { isTransitioning, startTransition }
}