import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  description?: string
}

export function Card({ children, className, title, description }: CardProps) {
  return (
    <div className={cn(
      "rounded-lg border border-gray-200 bg-white p-6 shadow-sm",
      className
    )}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  unit?: string
  change?: number
  changeLabel?: string
  icon?: ReactNode
  className?: string
}

export function StatCard({ 
  title, 
  value, 
  unit, 
  change, 
  changeLabel, 
  icon, 
  className 
}: StatCardProps) {
  const changeColor = change && change > 0 ? 'text-green-600' : 'text-red-600'
  const changeIcon = change && change > 0 ? '↗' : '↘'

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline mt-2">
            <p className="text-2xl font-semibold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
            </p>
            {unit && (
              <p className="ml-2 text-sm text-gray-600">{unit}</p>
            )}
          </div>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              <span className={cn("text-sm font-medium", changeColor)}>
                {changeIcon} {Math.abs(change)}%
              </span>
              {changeLabel && (
                <span className="text-sm text-gray-600 ml-1">
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 text-gray-400">
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}