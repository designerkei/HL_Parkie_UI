# @designerkei/parkie-ui

Parkie UI package for RMS products.

It ships the Parkie token CSS, product CSS primitives, JavaScript token helpers,
an Ant Design theme adapter, and small React primitives. The package is the
canonical source for Parkie tokens; the static guide imports this package path.

## Install

```sh
npm install @designerkei/parkie-ui
```

For GitHub Packages consumers, configure the scope registry:

```ini
@designerkei:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

## CSS

Import the complete package CSS once near the application entry:

```ts
import '@designerkei/parkie-ui/styles.css';
```

If the app already imports `tokens.css` separately, `components.css` is available
as the component-only layer.

If RMS still needs the legacy variable names while components migrate, use:

```ts
import '@designerkei/parkie-ui/legacy-rms.css';
```

`legacy-rms.css` includes `styles.css` and maps old RMS custom properties such as
`--Primary_Blue-200` to Parkie tokens. New code should consume `--parkie-*`
tokens directly.

## React

```tsx
import { ParkieButton, ParkieProvider } from '@designerkei/parkie-ui/react';
import '@designerkei/parkie-ui/styles.css';

export function Example() {
  return (
    <ParkieProvider>
      <ParkieButton>Confirm</ParkieButton>
    </ParkieProvider>
  );
}
```

React is exposed from `@designerkei/parkie-ui/react` so token-only consumers do
not load React.

## Ant Design

```tsx
import { ConfigProvider } from 'antd';
import { createParkieAntdTheme } from '@designerkei/parkie-ui/antd';

<ConfigProvider theme={createParkieAntdTheme()} />
```

The adapter is intentionally small: it mirrors the current RMS-facing dark
palette and component defaults, then lets the app pass overrides.
