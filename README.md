# Gavel or Gamble

A static, no-build web app that weighs a settlement offer against going to trial using expected value, discounting and a risk adjustment. Decision support only, not legal advice.

## Run locally
    npx serve .        # or: python3 -m http.server 8000

## Deploy (pick one, all free)
- **Netlify:** drag this folder onto app.netlify.com/drop, or connect the repo (`netlify.toml` is included).
- **Vercel:** `npx vercel --prod` in this folder.
- **GitHub Pages:** push to a repo's `main` branch, then Settings > Pages > Source: GitHub Actions. The workflow is included.
- **Any host:** upload the files as-is. No server code or build step.

## Features
Shareable scenario links (state lives in the URL hash, nothing is sent to a server), print summary, installable PWA with offline support.

## Tuning the model (app.js)
`STAGES` sets remaining-cost fraction and years to resolution per case stage. The 6% discount rate is in `calc()`. Risk levels are the `data-v` values in index.html.
