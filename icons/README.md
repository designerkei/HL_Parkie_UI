# Parkie icon assets

## Source policy

- `source/`: user-supplied Parkie SVGs preserved as standalone source assets.
- Parkie Original: supplied SVG or an icon already present in the original Parkie UI.
- Parkie Custom: domain icon drawn for parking-robot operations.
- MS Adopted: a universal Fluent/MS reference icon adopted into Parkie and rendered with Parkie tokens.

MS reference assets remain available separately under `ms/`; adopting an icon does not remove or rename the reference source.
The normalized runtime catalog lives in `parkie-icon-data.js`. Supplied SVGs remain unchanged in `source/` so design handoff and implementation can be compared.

## Interaction states

| State | Token |
|---|---|
| Enabled | `--parkie-icon-default` |
| Hover | `--parkie-icon-hover` |
| Pressed / On | `--parkie-icon-pressed` |
| Disabled | `--parkie-icon-disabled` |

Domain states such as battery, connection, motion, mission and safety use semantic colors rather than interaction-state colors.
