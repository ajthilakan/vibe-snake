# vibe-starter

Template repo for my [vibe30](https://ajthilakan.com/posts/quick-update-retooling/#thread-2--vibe-30-or-60-challenge) apps. Vite + vanilla TypeScript, with CI (build + secret-scan) and house rules already wired. Spin a new app from it instead of scaffolding from scratch.

## Use this template

```bash
gh repo create vibe-SLUG --template ajthilakan/vibe-starter --public --clone
cd vibe-SLUG
npm install
npm run dev
```

(Or click **"Use this template"** on GitHub.)

## What's inside

- **Vite + vanilla TS** scaffold — fast, static, deploys clean to Cloudflare Pages.
- **`.github/workflows/ci.yml`** — `npm ci` → `npm run build` (typecheck + build) → tests-if-present, plus a **gitleaks** secret scan. Runs on pushes to `main` and on PRs.
- **`.gitignore`** — ignores `node_modules`, `dist`, `.env*` (never commit secrets — the repo is public).
- **`CLAUDE.md`** — house rules for agent runs in this repo.

## Deploy (Cloudflare Pages)

- **Keeper / want per-PR previews → git-connect from the start** (CF dashboard → connect this repo). A git-connected project can also be wrangler-deployed; a direct-upload project cannot be converted to git-connected later.
- **Pure throwaway → direct upload:** `npm run build && npx wrangler pages deploy ./dist --project-name=vibe-SLUG`.

See `Setup - vibe30 app pipeline` in the vault for the full per-tier workflow.

---

<!-- Each app spun from this template should replace the section below. -->

## Vibe app NN — APPNAME

- One-line description.
- Link to live app (if available)
- Part of my [vibe30 challenge](https://ajthilakan.com/posts/quick-update-retooling/#thread-2--vibe-30-or-60-challenge).
