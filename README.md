# Hithadhoo Uthuru Elections Dashboard

A clean Vercel-ready static dashboard using Apache ECharts.

This version avoids the npm install failure by using no npm dependencies. Vercel skips dependency installation and builds a static `dist` folder.

## Deploy fresh

1. Delete the old files in your repo.
2. Upload or commit these files.
3. In Vercel, redeploy.

## Local run

```bash
npm install
npm run dev
```

## Vercel build

```bash
npm run build:verified
```

## Optional Playwright label test

This is optional and not run on Vercel by default.

```bash
npm i -D @playwright/test
npx playwright install chromium
npm run dev
npm run test:labels
```

## Logo

Replace this file with the official logo when you have it:

```text
src-static/assets/cog-logo.svg
```
