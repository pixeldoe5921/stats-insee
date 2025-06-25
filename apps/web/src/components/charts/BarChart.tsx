'use client'

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChartData } from '@/types'
import { formatNumber, formatDate, generateColors } from '@/lib/utils'

interface BarChartProps {
  data: ChartData[]
  title?: string
  height?: number
  showLegend?: boolean
  dataKeys?: string[]
  horizontal?: boolean
}

export function BarChart({ 
  data, 
  title, 
  height = 400, 
  showLegend = true,
  dataKeys = ['value'],
  horizontal = false
}: BarChartProps) {
  const colors = generateColors(dataKeys.length)

  const formatTooltipValue = (value: number) => {
    return formatNumber(value)
  }

  const formatAxisLabel = (tickItem: string) => {
    try {
      return formatDate(tickItem)
    } catch {
      return tickItem
    }
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          layout={horizontal ? 'horizontal' : 'vertical'}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          {horizontal ? (
            <>
              <XAxis type="number" tickFormatter={formatNumber} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="date" tickFormatter={formatAxisLabel} tick={{ fontSize: 12 }} />
            </>
          ) : (
            <>
              <XAxis dataKey="date" tickFormatter={formatAxisLabel} tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={formatNumber} tick={{ fontSize: 12 }} />
            </>
          )}
          <Tooltip 
            formatter={formatTooltipValue}
            labelFormatter={formatAxisLabel}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          {showLegend && <Legend />}
          {dataKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[index]}
              radius={[2, 2, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}