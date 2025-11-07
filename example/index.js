import logo, { toString } from './logo.svg';

// Render as element (in a browser context)
if (typeof document !== 'undefined') {
  const el = logo({ role: 'img', ariaLabel: 'Logo', width: 48, height: 48, class: 'icon', fill: 'rebeccapurple' });
  document.body.appendChild(el);
}

// Render as string
const html = toString({ width: 48, height: 48, class: 'icon', fill: 'rebeccapurple' });
console.log('SVG string:', html.slice(0, 80) + '...');
