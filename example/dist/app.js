(() => {
  // example/logo.svg
  var base = { "width": "24", "height": "24", "viewBox": "0 0 24 24", "fill": "none", "xmlns": "http://www.w3.org/2000/svg" };
  var innerContent = '\n  <circle cx="12" cy="12" r="10" fill="#ddd"/>\n  <path d="M6 12h12" stroke="#333" stroke-width="2"/>\n';
  function escapeAttr(v) {
    return String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function attrsToString(obj) {
    const dq = '"';
    return Object.entries(obj).filter(([_, v]) => v !== null && v !== void 0 && v !== false).map(([k, v]) => v === true ? k : k + "=" + dq + escapeAttr(v) + dq).join(" ");
  }
  function toString(attrs = {}) {
    const merged = Object.assign({}, base, attrs);
    const str = attrsToString(merged);
    return "<svg " + str + ">" + innerContent + "</svg>";
  }
  function logo(attrs = {}) {
    if (typeof document === "undefined") throw new Error("toElement requires a DOM environment");
    const svgNS = "http://www.w3.org/2000/svg";
    const el = document.createElementNS(svgNS, "svg");
    const merged = Object.assign({}, base, attrs);
    for (const [k, v] of Object.entries(merged)) {
      if (v === null || v === void 0 || v === false) continue;
      if (k === "xmlns") continue;
      el.setAttribute(k, v === true ? "" : String(v));
    }
    if (innerContent && innerContent.trim()) {
      el.innerHTML = innerContent;
    }
    return el;
  }

  // example/index.js
  if (typeof document !== "undefined") {
    const el = logo({ role: "img", ariaLabel: "Logo", width: 48, height: 48, class: "icon", fill: "rebeccapurple" });
    document.body.appendChild(el);
  }
  var html = toString({ width: 48, height: 48, class: "icon", fill: "rebeccapurple" });
  console.log("SVG string:", html.slice(0, 80) + "...");
})();
