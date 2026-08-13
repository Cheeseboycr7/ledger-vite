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

## Deploy to Vercel

This project includes a `vercel.json` with the build settings pre-filled, so deployment is zero-config.

**Option A — CLI:**

```bash
npm i -g vercel
vercel login
vercel        # deploys a preview
vercel --prod # promotes to production
```

**Option B — Dashboard:**

1. Push this folder to a GitHub repo.
2. In Vercel: **Add New → Project** → import the repo.
3. Vercel reads `vercel.json` automatically (build command `npm run build`, output `dist`). Click **Deploy**.
4. Every push to the repo redeploys automatically.

## Deploy elsewhere

`dist/` is a plain static site and works on any static host:

- **Netlify**: drag the `dist/` folder into Netlify's dashboard, or run `netlify deploy`
- **GitHub Pages**: push `dist/` to a `gh-pages` branch, or use the `gh-pages` npm package
- **Any static host** (S3, Cloudflare Pages, Render, etc.): upload the contents of `dist/`

## Notes

- Data is stored per-browser in `localStorage` under the key `ledger-entries` — it won't sync across devices.
- Fonts (Fraunces, IBM Plex Mono, Inter) load from Google Fonts at runtime.
