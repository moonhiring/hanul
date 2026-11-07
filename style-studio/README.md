# Style Studio

**Drop-in theme & style editor for any web app — one file, zero dependencies.**
테마·폰트·질감·모서리·간격·그림자·모션까지 한 패널에서 편집하고, 결과를 CSS 변수로 `:root`에 주입하는 커스텀 엘리먼트입니다. React든 Vue든 순수 HTML이든 `<script>` 한 줄로 붙습니다.

```
style-studio/
├── style-studio.js   ← the whole editor (custom element, no build step)
├── index.html        ← live demo — open it and press the "스타일" button
└── README.md         ← this file
```

---

## Quick start (3 lines)

```html
<script src="./style-studio.js" defer></script>
...
<style-studio></style-studio>
```

That renders a floating **스타일** launcher (bottom-right) opening a slide-over panel.
For a settings page instead of a floating launcher:

```html
<style-studio inline></style-studio>
```

Your app consumes the design tokens the editor writes to `:root`:

```css
body {
  background-color: var(--ss-bg);
  background-image: var(--ss-tex-soften), var(--ss-tex-extra), var(--ss-tex-fiber), var(--ss-tex-grain);
  color: var(--ss-fg);
  font-family: var(--ss-font-body);
}
.card {
  background: var(--ss-card);
  border: 1px solid var(--ss-border);
  border-radius: var(--ss-radius);
  box-shadow: var(--ss-shadow-lg);
}
h1 { font-family: var(--ss-font-head); font-weight: var(--ss-head-weight); }
.btn-primary { background: var(--ss-accent); border-radius: var(--ss-radius); }
```

---

## Token contract (`--ss-*` on `:root`)

| Token | Contents | Driven by |
|---|---|---|
| `--ss-bg`, `--ss-card`, `--ss-fg`, `--ss-muted`, `--ss-border` | Surface palette (auto light/dark) | Theme + Color mode |
| `--ss-accent` | Action color | Theme, overridden by Accent |
| `--ss-font-head`, `--ss-font-body` | `font-family` stacks (webfonts auto-loaded) | Typography |
| `--ss-head-weight` | 600–900 | Typography |
| `--ss-type-scale` | 0.9–1.15 (root `font-size` is set too) | Typography |
| `--ss-radius` | 4–28px | Corners |
| `--ss-space` | 0.8–1.35 section spacing multiplier | Spacing |
| `--ss-shadow-sm`, `--ss-shadow-lg` | flat / soft / deep | Shadows |
| `--ss-tex-grain`, `--ss-tex-fiber`, `--ss-tex-extra`, `--ss-tex-soften` | Texture layers (use as `background-image`) | Texture + Intensity |
| `--ss-motion` | `1` or `0` | Reduce motion |

## Attribute contract (on `<html>`)

| Attribute | Values | Use |
|---|---|---|
| `data-theme` | theme id | theme-specific overrides |
| `data-mode` | `light` / `dark` | dark-mode CSS |
| `data-texture`, `data-tex-level` | ids | texture overrides |
| `data-motion` | `full` / `reduced` | `html[data-motion="reduced"] * { animation: none }` |
| `data-contrast` | `normal` / `high` | stronger borders/text |

## Events

```js
document.addEventListener("style-studio:publish", (e) => {
  // e.detail = full config — POST to your API to persist per user/workspace
  fetch("/api/theme", { method: "PUT", body: JSON.stringify(e.detail) });
});
// also: "style-studio:change" (every live edit), "style-studio:draft"
```

**Draft vs Publish** — every edit applies live (preview). *Save draft* persists to
`localStorage["style-studio:draft"]`; *Publish* persists to
`["style-studio:published"]` and is the hook for server sync. *Reset* returns to the
last published state. On load, published wins over draft.

## Config JSON

*Copy config JSON* in the panel footer exports the full state — share presets across
apps or seed defaults:

```js
// server-side or bootstrap: apply a shared preset before first paint
localStorage.setItem("style-studio:published",
  JSON.stringify({ config: { theme: "hanji", mode: "light", /* ... */ }, at: new Date().toISOString() }));
```

---

## Registries — what ships

- **8 themes**, each a light/dark pair: Hanji(한지), Witty, Midnight, Nordic, Botanical, Solar, Ocean, Rose Clay
- **7 accent overrides** that adapt to light/dark automatically
- **23 fonts** (Latin 6 + 한글 17: 고딕·명조·손글씨·디스플레이), loaded on demand from Google Fonts/CDN
- **12 textures** — Korean paper & craft (한지, 수묵 화선지, 백자, 청자, 삼베, 창호지, 쪽빛, 운용지) and printmaking (에칭, 동판 세선, 목판, 양피지). In dark mode only a subtle light grain survives
- Corners ×4 · Spacing ×3 · Shadows ×3 · Texture intensity ×4
- Reduce motion · Increase contrast

## Extending

Every control renders from a plain array at the top of `style-studio.js`:

```js
THEMES.push({
  id: "brand", name: "Our Brand", desc: "…",
  light: { bg: "…", card: "…", fg: "…", muted: "…", border: "…", accent: "…" },
  dark:  { /* same keys */ },
});
// TEXTURES: { id, name, en, paper, layers: { grain, fiber, extra }, darkGrain }
// FONT_GROUPS: { label, fonts: [{ id, name, family, url }] }
```

Textures are pure CSS (SVG `feTurbulence` noise + layered gradients) — no image
assets, no network cost, Retina-clean at any scale.

## Notes

- Panel UI is isolated in shadow DOM; it cannot leak styles into your app, and your
  app cannot break the panel. Tokens pierce the boundary by design (custom properties).
- SSR: render with default tokens in CSS (as the demo does) — the element hydrates
  and applies saved state on `connectedCallback`.
- Frameworks: React 19 needs no wrapper for custom elements; for older React/Vue/Angular
  just render the tag — it is plain HTML.
- License: use freely inside our products; keep the header comment.
