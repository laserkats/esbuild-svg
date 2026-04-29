<img src="https://raw.githubusercontent.com/laserkats/esbuild-svg/master/docs/logo.svg" width="300" alt="ESBUILD-SVG">


Import an `.svg` file and get back a function that returns an SVGElement built with `createElementNS`, with attributes merged. Defaults from the original `<svg>` tag are preserved and can be overridden.

What you write:

- `import logo from './logo.svg'`
- `const el = logo({ width: 48, height: 48, class: 'icon', fill: 'red' })`
- `import { toString } from './logo.svg'`
- `const html = toString({ ariaHidden: true })`

What you get:

- A function that returns an SVG element with attributes merged: original `<svg>` attributes are combined with the supplied ones (`attrs` wins). Passing `null`, `undefined`, or `false` removes an attribute. Passing `true` emits a boolean attribute. A helper `toString` returns the string markup if needed.

Install

Use it as a local plugin or publish it. Example local usage:

```js
// build.js
import esbuild from 'esbuild';
import svgFunctionPlugin from './src/svgFunctionPlugin.js';

await esbuild.build({
  entryPoints: ['example/index.js'],
  bundle: true,
  outfile: 'dist/app.js',
  plugins: [svgFunctionPlugin()],
});
```

Runtime usage:

```js
import logo, { toString } from './logo.svg';

// As element
const el = logo({ focusable: true, title: 'Hello' });
document.body.appendChild(el);

// As string
const html = toString({ width: 32, height: 32, fill: '#f00', role: 'img' });
document.getElementById('target').innerHTML = html;

// Remove an original attribute
const elNoSize = logo({ width: null, height: false });
```

Notes

- Only the first `<svg ...>` opening tag is parsed; inner content is preserved exactly and appended back to the created element.
- Attribute merge: passed-in attributes override defaults; values are HTML-escaped for the string export. `true` emits a boolean attribute; `null`/`undefined`/`false` removes it.
- DOM creation: default export uses `document.createElementNS('http://www.w3.org/2000/svg', 'svg')`, applies attributes via `setAttribute`, then parses and appends the original inner content using `DOMParser('image/svg+xml')`.
- Exports:
  - `default`: `(attrs) => SVGElement`
  - `toString`: `(attrs) => string`
- Function name: the default-exported function is named after the file (e.g., `logo.svg` exports `export default function logo(...) {}`), aiding stack traces and tooling. You still import it as any name you choose.
- No JSX/runtime is required; works in plain JS.
