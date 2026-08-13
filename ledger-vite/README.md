# The Ledger — income & expense tracker

A React + Vite app styled like a physical accounting ledger. Entries persist in the browser's `localStorage`.

## Run locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## Build for production

```bash
npm run build
```

Outputs static files to `dist/`. Preview the build with:

```bash
npm run preview
```

## Deploy

`dist/` is a plain static site — deploy it anywhere that serves static files:

- **Vercel**: `npm i -g vercel` then `vercel` in this folder (auto-detects Vite)
- **Netlify**: drag the `dist/` folder into Netlify's dashboard, or run `netlify deploy`
- **GitHub Pages**: push `dist/` to a `gh-pages` branch, or use the `gh-pages` npm package
- **Any static host** (S3, Cloudflare Pages, Render, etc.): upload the contents of `dist/`

## Notes

- Data is stored per-browser in `localStorage` under the key `ledger-entries` — it won't sync across devices.
- Fonts (Fraunces, IBM Plex Mono, Inter) load from Google Fonts at runtime.
