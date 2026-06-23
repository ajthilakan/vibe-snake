# CLAUDE.md — vibe30 app

House rules for any agent working in a repo spun from `vibe-starter`. These are the defaults; the human owner (Ajith) can override per app.

## The repo is PUBLIC
- **Never commit secrets** — API tokens, keys, passwords. They live in GitHub/Cloudflare settings panels, never in the repo or a committed `.env`. The `.gitignore` excludes `.env*`; CI runs a gitleaks scan as a backstop. If a secret ever lands in history, tell Ajith to revoke it immediately.

## Branch + merge discipline
- **Push branches and open PRs. Do NOT merge to `main` yourself** unless Ajith has explicitly turned on agent-merge for this repo.
- When agent-merge IS enabled, merge only when CI is green, code review is clean, and browser tests pass — e.g. `gh pr merge --squash --auto` (so GitHub holds the merge until required checks pass). Never weaken or skip a check to make it pass.
- Tier A (disposable) apps may work directly on `main` — Ajith will say if so.

## Build + deploy
- `npm run build` produces `dist/`. Build before any deploy.
- Deploy via the method this app was set up with: **git-connect** (push/merge triggers the Cloudflare build) or **wrangler direct-upload** (`npx wrangler pages deploy ./dist --project-name=<this-repo>`).
- Don't change the deploy method without asking — converting direct-upload → git-connect requires recreating the Pages project.

## Quality
- Keep it simple; this is a small disposable-friendly app, not a framework. Match the existing code style.
- CI (`.github/workflows/ci.yml`) must stay green: typecheck + build + secret-scan.
