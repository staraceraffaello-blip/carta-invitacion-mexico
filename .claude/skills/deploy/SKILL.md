# Deploy Skill

1. Run `git status` to review pending changes
2. Stage changes selectively (`git add <files>`) — never `git add -A`. Exclude `.env`, temp files, test PDFs, and anything in `.gitignore`
3. Generate a concise commit message from the diff
4. Commit and push to `main`
5. Deployment is automatic via Vercel's GitHub integration — no CLI needed
6. After ~60 seconds, verify production with `WebFetch` against `https://cartadeinvitacionmexico.com` (or the specific page changed)
7. Report success or failure with the production URL
