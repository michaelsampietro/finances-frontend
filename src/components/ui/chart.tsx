import * as React from 'react'
import * as RechartsPrimitive from 'recharts'

import { cn } from '@/lib/utils'

// Chart container component
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    config: Record<string, { label?: string; color?: string }>
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children']
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`

  return (
    <div
      data-chart={chartId}
      ref={ref}
      className={cn(
        'flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke="#ccc"]]:stroke-border/40 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border',
        className
      )}
      {...props}
    >
      <ChartStyle id={chartId} config={config} />
      <RechartsPrimitive.ResponsiveContainer>
        {children}
      </RechartsPrimitive.ResponsiveContainer>
    </div>
  )
})
ChartContainer.displayName = 'Chart'

const ChartStyle = ({ id, config }: { id: string; config: Record<string, { label?: string; color?: string }> }) => {
  const colorConfig = Object.entries(config).filter(([_, config]) => config.color)

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(config)
          .filter(([_, config]) => config.color)
          .map(([key, item]) => {
            const color = item.color
            return `[data-chart=${id}] .color-${key} { color: ${color}; }`
          })
          .join('\n'),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip
const ChartLegend = RechartsPrimitive.Legend
const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<typeof RechartsPrimitive.Label> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: 'line' | 'dot' | 'dashed'
      nameKey?: string
      labelKey?: string
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = 'dot',
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey: _nameKey,
      labelKey: _labelKey,
    },
    ref
  ) => {
    // Remove unused variables
    void _nameKey
    void _labelKey
    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      if (labelFormatter) {
        return (
          <div className={cn('font-medium', labelClassName)}>
            {labelFormatter(label as any, payload as any)}
          </div>
        )
      }

      if (!labelFormatter && typeof label === 'string') {
        return <div className={cn('font-medium', labelClassName)}>{label}</div>
      }

      if (typeof label === 'number') {
        return <div className={cn('font-medium', labelClassName)}>{label}</div>
      }

      return null
    }, [label, labelFormatter, hideLabel, payload, labelClassName])

    if (!active || !payload?.length) {
      return null
    }

    const nestLabel = payload.length === 1 && indicator !== 'dot'

    return (
      <div
        ref={ref}
        className={cn(
          'grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl',
          className
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className={cn('grid gap-1.5', nestLabel && 'ml-2')}>
          {payload.map((item: any, index: number) => {
            const indicatorColor = color || item.payload?.fill || item.color

            return (
              <div
                key={item.dataKey || index}
                className={cn(
                  'flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground',
                  indicator === 'dot' && 'items-center'
                )}
              >
                {formatter && (item as any)?.value !== undefined && (item as any).name ? (
                  formatter((item as any).value, (item as any).name, item, index, (item as any).payload)
                ) : (
                  <>
                    {!hideIndicator && (
                      <div
                        className={cn(
                          'shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]',
                          {
                            'h-2.5 w-2.5': indicator === 'dot',
                            'w-1': indicator === 'line',
                            'w-0 border-[1.5px] border-dashed bg-transparent':
                              indicator === 'dashed',
                            'my-0.5': nestLabel && indicator === 'dashed',
                          }
                        )}
                        style={
                          {
                            '--color-bg': indicatorColor,
                            '--color-border': indicatorColor,
                          } as React.CSSProperties
                        }
                      />
                    )}
                    <div
                      className={cn(
                        'flex flex-1 justify-between leading-none',
                        nestLabel ? 'items-end' : 'items-center'
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? (
                          <div className={cn('font-medium', labelClassName)}>
                            {labelFormatter
                              ? labelFormatter(label as any, payload as any)
                              : typeof label === 'string'
                              ? label
                              : null}
                          </div>
                        ) : null}
                        <span className="text-muted-foreground">
                          {(item as any).name}
                        </span>
                      </div>
                      {(item as any).value && (
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {typeof (item as any).value === 'number'
                            ? (item as any).value.toLocaleString()
                            : (item as any).value}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = 'ChartTooltipContent'

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    hideIcon?: boolean
    nameKey?: string
    payload?: any[]
    verticalAlign?: 'top' | 'bottom'
  }
>(({ className, hideIcon = false, payload, verticalAlign = 'bottom', nameKey }, ref) => {
  if (!payload || !Array.isArray(payload) || payload.length === 0) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-center gap-4',
        verticalAlign === 'top' ? 'pb-3' : 'pt-3',
        className
      )}
    >
      {payload.map((item: any) => {
        return (
          <div
            key={item.value}
            className={cn(
              'flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground'
            )}
          >
            {!hideIcon && (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            {item.value}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = 'ChartLegendContent'

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
}

