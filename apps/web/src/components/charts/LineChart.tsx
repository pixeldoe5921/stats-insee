'use client'

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChartData } from '@/types'
import { formatNumber, formatDate, generateColors } from '@/lib/utils'

interface LineChartProps {
  data: ChartData[]
  title?: string
  height?: number
  showLegend?: boolean
  dataKeys?: string[]
}

export function LineChart({ 
  data, 
  title, 
  height = 400, 
  showLegend = true,
  dataKeys = ['value']
}: LineChartProps) {
  const colors = generateColors(dataKeys.length)

  const formatTooltipValue = (value: number) => {
    return formatNumber(value)
  }

  const formatXAxisLabel = (tickItem: string) => {
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
        <RechartsLineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxisLabel}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={formatNumber}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={formatTooltipValue}
            labelFormatter={formatXAxisLabel}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          {showLegend && <Legend />}
          {dataKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index]}
              strokeWidth={2}
              dot={{ fill: colors[index], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: colors[index], strokeWidth: 2 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}