# Secrets History Cleanup Checklist

This checklist is for repositories that were made public and previously contained sensitive values in tracked files.

## 1) Immediate containment

- Rotate all leaked credentials in their providers.
- Update Vercel environment variables with the new values.
- Confirm old credentials are revoked/invalidated.
- Keep `.env.local` untracked and local-only.

## 2) Secrets to rotate for this project

- `RESEND_API_KEY`
- `HUBSPOT_ACCESS_TOKEN`
- `HUBSPOT_CLIENT_SECRET`
- `STRIPE_WEBHOOK_SECRET`
- `DATABASE_URL`
- `META_PIXEL_ACCESS_TOKEN`

## 3) Verify repository state before rewrite

- `.env.local` must not be tracked (`git ls-files .env.local` should return nothing).
- Docs/examples must use placeholders only (no token-like prefixes).
- Team is notified that history will be rewritten.

## 4) Rewrite history (recommended: git-filter-repo)

Use a mirror clone to avoid damaging your working copy.

```bash
git clone --mirror git@github.com:alexanderovie/integrity2025.git integrity2025-mirror.git
cd integrity2025-mirror.git

# Remove tracked .env.local from all history
git filter-repo --path .env.local --invert-paths --force

# Optionally replace known token strings using a replacement file
# (one line per replacement: old==>new)
# git filter-repo --replace-text ../replacements.txt --force
```

Force-push rewritten history:

```bash
git push --force --mirror origin
```

## 5) Alternative: BFG Repo-Cleaner

```bash
git clone --mirror git@github.com:alexanderovie/integrity2025.git
java -jar bfg.jar --delete-files .env.local integrity2025.git
cd integrity2025.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force --all
git push --force --tags
```

## 6) Post-cleanup verification

- Run GitHub secret scanning alerts again.
- Re-run a local secret scan against git history.
- Validate production app health (checkout, webhook, email, CRM).
- Reconnect any local clones (`git fetch --all --prune`) and reset branches as needed.

## 7) Ongoing policy

- Source of truth for secrets: **Vercel env vars**.
- Local development: `vercel env pull .env.local`.
- GitHub Actions: only non-sensitive CI config, secrets only if workflow requires them.
- Never store secrets in docs, examples, or tracked env files.
