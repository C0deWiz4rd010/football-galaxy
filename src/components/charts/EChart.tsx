import { useEffect, useRef } from 'react'

import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TooltipComponent,
} from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsCoreOption } from 'echarts/core'

import { getChartTheme, type ChartTheme } from './echarts-theme'

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent,
  CanvasRenderer,
])

interface EChartProps {
  /** Builds the chart option from the live design-token theme. */
  getOption: (theme: ChartTheme) => EChartsCoreOption
  height?: number
  className?: string
  ariaLabel: string
}

/**
 * Lightweight, theme-aware ECharts wrapper. Initialises a single chart
 * instance, resizes it with the container, and re-renders whenever the active
 * palette or light/dark mode changes (observed via the `class`/`data-palette`
 * attributes on `<html>`).
 */
export function EChart({ getOption, height = 240, className, ariaLabel }: EChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)
  const getOptionRef = useRef(getOption)

  useEffect(() => {
    getOptionRef.current = getOption
  })

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const chart = echarts.init(element, undefined, { renderer: 'canvas' })
    chartRef.current = chart

    const render = () => chart.setOption(getOptionRef.current(getChartTheme()), true)
    render()

    const resizeObserver = new ResizeObserver(() => chart.resize())
    resizeObserver.observe(element)

    const themeObserver = new MutationObserver(render)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-palette'],
    })

    return () => {
      resizeObserver.disconnect()
      themeObserver.disconnect()
      chart.dispose()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    chartRef.current?.setOption(getOptionRef.current(getChartTheme()), true)
  }, [getOption])

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={ariaLabel}
      className={className}
      style={{ height, width: '100%' }}
    />
  )
}
