# usage-line

A one-line Claude usage band above the prompt:

```
session 26% (15m) · week 66% (17h) · context 12% · $4.09
```

- **session** / **week** — the rate-limit windows `/usage` shows, with the time until each resets
- **context** — how full the live context window is
- **$** — what this session has cost so far, at API list prices

Each percentage is dim under 30%, yellow 30–70%, red above 70%. A toast fires once when the weekly
window crosses 90%.

The figures come from `$.session.usage()` on `session.measure` — pushed after each turn, no API call
and no tokens.

## Install

```
/plugin install usage-line --marketplace Dbravi/usage-line
```

`y` to add the marketplace, then Enter for the user scope.
