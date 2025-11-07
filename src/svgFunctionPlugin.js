// esbuild plugin: import .svg and get a function that returns an SVGElement
// default export: (attrs) => SVGElement (created via createElementNS)
// named export: toString(attrs) => string SVG markup

import { promises as fs } from 'node:fs';
import path from 'node:path';

function toValidIdentifier(name) {
  // Replace invalid characters with underscores, ensure it doesn't start with a digit
  let id = name.replace(/[^A-Za-z0-9_$]/g, '_');
  if (/^[0-9]/.test(id) || id.length === 0) id = '_' + id;
  // Avoid reserved empty or all underscores fallback
  if (!/^[A-Za-z_$]/.test(id)) id = 'svgIcon';
  return id;
}

export default function svgFunctionPlugin(options = {}) {
  const { filter = /\.svg$/i } = options;

  return {
    name: 'svg-function-plugin',
    setup(build) {
      build.onLoad({ filter }, async (args) => {
        const source = await fs.readFile(args.path, 'utf8');
        const base = path.basename(args.path, path.extname(args.path));
        const fnName = toValidIdentifier(base) || 'svgIcon';

        // Extract the first <svg ...> opening tag
        const openTagMatch = source.match(/<svg\b[^>]*>/i);
        if (!openTagMatch) {
          // Not a valid svg, still try to parse as XML and return root
          const safe = JSON.stringify(source);
          const contents = `
            const svgTpl = ${safe};
            export default function ${fnName}(){
              if (typeof document === 'undefined') throw new Error('svg() requires a DOM environment');
              const parser = new DOMParser();
              const doc = parser.parseFromString(svgTpl, 'image/svg+xml');
              return doc.documentElement;
            }
            export function toString(){ return svgTpl }
          `;
          return { contents, loader: 'js' };
        }

        const openTag = openTagMatch[0];
        // Parse attributes from opening tag
        const attrStringMatch = openTag.match(/<svg\b([^>]*)>/i);
        const attrString = attrStringMatch ? attrStringMatch[1] : '';

        const baseAttrs = {};
        // Attribute parser: supports quoted (" / ') and unquoted values; boolean attributes become true
        const attrRe = /([A-Za-z_][\w:.-]*)(?:\s*=\s*(\"([^\"]*)\"|'([^']*)'|([^\s\"'>]+)))?/g;
        let m;
        while ((m = attrRe.exec(attrString))) {
          const key = m[1];
          const val = m[3] ?? m[4] ?? m[5];
          baseAttrs[key] = (typeof val === 'undefined') ? true : val;
        }

        // Extract inner content between <svg ...> and </svg>
        const startIndex = (openTagMatch.index ?? 0) + openTag.length;
        const lower = source.toLowerCase();
        const closeStart = lower.lastIndexOf('</svg');
        const inner = closeStart >= 0 ? source.slice(startIndex, closeStart) : source.slice(startIndex);

        // Serialize baseAttrs object literal as stable JS
        const basePairs = Object.entries(baseAttrs)
          .map(([k, v]) => {
            const val = (v === true) ? true : String(v);
            return JSON.stringify(k) + ':' + (val === true ? 'true' : JSON.stringify(val));
          })
          .join(',');

        const contents = `
          const base = {${basePairs}};
          const innerContent = ${JSON.stringify(inner)};
          function escapeAttr(v){
            return String(v)
              .replace(/&/g,'&amp;')
              .replace(/\"/g,'&quot;')
              .replace(/'/g,'&#39;')
              .replace(/</g,'&lt;')
              .replace(/>/g,'&gt;')
          }
          function attrsToString(obj){
            const dq = '"';
            return Object.entries(obj)
              .filter(([_,v]) => v !== null && v !== undefined && v !== false)
              .map(([k,v]) => v === true ? k : (k+'='+dq+escapeAttr(v)+dq))
              .join(' ');
          }
          export function toString(attrs={}){
            const merged = Object.assign({}, base, attrs);
            const str = attrsToString(merged);
            return '<svg ' + str + '>' + innerContent + '</svg>';
          }
          export default function ${fnName}(attrs={}){
            if (typeof document === 'undefined') throw new Error('toElement requires a DOM environment');
            const svgNS = 'http://www.w3.org/2000/svg';
            const el = document.createElementNS(svgNS, 'svg');
            const merged = Object.assign({}, base, attrs);
            for (const [k,v] of Object.entries(merged)){
              if (v === null || v === undefined || v === false) continue;
              if (k === 'xmlns') continue; // namespace is implied by createElementNS
              el.setAttribute(k, v === true ? '' : String(v));
            }
            if (innerContent && innerContent.trim()){
              el.innerHTML = innerContent
            }
            return el;
          }
        `;

        return { contents, loader: 'js' };
      });
    },
  };
}
