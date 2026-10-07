import { test, expect } from 'claude-code/testing'
import type { Engine, RenderSurface, SessionUsage } from 'claude-code'

const PROPS = {
  hasSurvey: false,
  isWorking: false,
  maxRows: 10,
  bodyColumns: 80,
  scroll: { offset: 0, bodyRows: 10, isAtTop: true, isAtBottom: true },
  view: {},
} as const

const mountBand = ($: Engine, surface: RenderSurface) =>
  $.ui.mount({ plugin: 'usage-line', surface, component: 'AbovePrompt', props: PROPS })

test('draws the rate-limit windows, context and cost', async ($, on) => {
  const usage: SessionUsage = {
    startedAt: 0,
    context: { window: 200000, tokens: 170000, percent: 85 },
    rateLimits: [
      { kind: 'five_hour', percentUsed: 23.5, resetsAt: new Date(Date.now() + 3 * 3600_000).toISOString() },
      {
        kind: 'seven_day',
        percentUsed: 41,
        resetsAt: new Date(Date.now() + (2 * 24 + 4) * 3600_000).toISOString(),
      },
      { kind: 'spend_limit', percentUsed: 12 },
    ],
    cost: { usd: 1.2 },
  }
  on('session.usage', () => ({ value: usage }))
  on('clock.now', () => ({ value: Date.now() }))
  on('ui.render', () => null)

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await mountBand($, surface)
    expect((await ui.find({ type: 'Text', text: /session 24% \(3h\)/ }))?.props.color).toBeUndefined()
    expect((await ui.find({ type: 'Text', text: /week 41% \(2d 4h\)/ }))?.props.color).toBe('yellow')
    expect((await ui.find({ type: 'Text', text: /context 85%/ }))?.props.color).toBe('red')
    expect(await ui.find({ type: 'Text', text: /\$1\.20/ })).toBeDefined()
    await ui.unmount()
  }
})

test('draws nothing before the first reading', async ($, on) => {
  on('session.usage', () => ({ value: { startedAt: 0, context: { window: 200000 }, rateLimits: [] } }))
  on('ui.render', ($engine, e) => {
    const { Text } = $engine.ui.resolve(e)

    return h(Text, null, 'engine')
  })

  const ui = await mountBand($, 'terminal')
  expect((await ui.find({ type: 'Text' }))?.text).toBe('engine')
  await ui.unmount()
})
