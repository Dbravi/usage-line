# usage-line

One line of Claude usage above the prompt, in every session:

```
session 26% (15m) · week 66% (17h) · context 12% · $4.09
```

- **session** and **week** — the rate-limit windows `/usage` shows, each with the time left until it
  resets. A percentage alone doesn't tell you much: 66% on day 2 of the week is a problem, on day 6
  it's nothing.
- **context** — how full the live context window is, the number `/context` shows.
- **$** — what this session has cost so far at API list prices, the number `/cost` shows. On a
  subscription it's informational, not billed.
- Each percentage is dim under 30%, yellow from 30 to 70, red above 70.
- A toast fires once when the weekly window crosses 90%, and re-arms if it drops back below.

## Install

In your terminal:

```
claude plugin marketplace add Dbravi/usage-line
claude plugin install usage-line@usage-line
```

It is active in the next session you start.

Update to the latest version:

```
claude plugin marketplace update usage-line
```

then `/reload-plugins`, or start a new session.

## Good to know

- **It costs nothing to show.** The figures come from `$.session.usage()` with no breakdown: no API
  call, no tokens. The line is drawn in the terminal, not injected into the prompt, so it adds
  nothing to your context either.
- **It updates when the session is measured** — after each turn, and when a rate-limit window moves a
  whole point. The reset countdown goes stale while you sit idle and catches up on the next turn.
- **Rate-limit windows need a subscription.** Off one, the engine reports none and the line falls back
  to context and cost alone. Before the first response of a session there is nothing to show and the
  line stays empty.
- **The band's right edge.** The line sits flush right in the width the band gets; the engine's `[-]`
  collapse mark lives in the cells outside it and can't be moved.

## Development

```
claude plugin validate .
claude plugin test .
```
