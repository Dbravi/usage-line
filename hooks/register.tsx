import type { Register } from 'claude-code'

const LABELS: Record<string, string> = {
  five_hour: 'session',
  seven_day: 'week',
}

const resetsIn = (resetsAt: string | undefined, now: number) => {
  if (resetsAt === undefined) {
    return null
  }

  const minutes = Math.round((Date.parse(resetsAt) - now) / 60000)

  if (minutes <= 0) {
    return null
  }

  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)

  return days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h` : `${minutes}m`
}

const colorOf = (percent?: number) =>
  percent === undefined ? undefined : percent > 70 ? 'red' : percent >= 30 ? 'yellow' : undefined

export const register: Register = on => {
  let isWarned = false

  on('session.measure', ($, e, next) => {
    const week = e.rateLimits.find(w => w.kind === 'seven_day')

    if (week !== undefined && week.percentUsed >= 90 && !isWarned) {
      $.ui.toast(`Weekly usage at ${Math.round(week.percentUsed)}%`)
      isWarned = true
    }

    if (week !== undefined && week.percentUsed < 90) {
      isWarned = false
    }

    $.ui.invalidate('ui.render')

    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) {
      return next(e)
    }

    const [usage, now] = await Promise.all([$.session.usage(), $.clock.now()])
    const parts: { text: string; percent?: number }[] = [
      ...usage.rateLimits
        .filter(w => LABELS[w.kind] !== undefined)
        .map(w => {
          const resets = resetsIn(w.resetsAt, now)

          return {
            text: `${LABELS[w.kind]} ${Math.round(w.percentUsed)}%${resets === null ? '' : ` (${resets})`}`,
            percent: w.percentUsed,
          }
        }),
      ...(usage.context.percent === undefined
        ? []
        : [{ text: `context ${usage.context.percent}%`, percent: usage.context.percent }]),
      ...(usage.cost === undefined ? [] : [{ text: `$${usage.cost.usd.toFixed(2)}` }]),
    ]

    if (parts.length === 0) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box width={e.props.bodyColumns} justifyContent="flex-end">
        {parts.map((part, index) => {
          const color = colorOf(part.percent)

          return (
            <Text key={part.text} dimColor={color === undefined} color={color}>
              {index === 0 ? '' : ' · '}
              {part.text}
            </Text>
          )
        })}
      </Box>
    )
  })
}
