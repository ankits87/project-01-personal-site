# Runbook

Operational procedures for the personal site. Stack: Next.js on Vercel, Supabase (contact form storage), Resend (contact form email), GitHub Actions (CI/deploy).

No external monitoring/alerting is set up (no Sentry, no uptime checker) — Vercel's own dashboard is the primary source of truth for logs and deployment status.

---

## "The site is down"

Check in this order:

1. **Is it actually down, or just you?**
   - Load the production URL from another network (phone on cellular data, or https://downforeveryoneorjustme.com).
   - If it loads fine elsewhere, it's local (DNS cache, VPN, ISP) — not a site incident.

2. **Vercel status page** — https://www.vercel-status.com
   - Rules out a platform-wide Vercel outage, which you can't fix, only wait out.

3. **Vercel dashboard → Deployments**
   - Is the latest Production deployment marked `Ready`, or did it fail / get stuck `Building`?
   - If the latest deploy failed or is broken, see **"A deployment failed"** below — the fastest fix is usually rolling back, not debugging live.

4. **Vercel dashboard → Project → Logs (Runtime Logs)**
   - Filter to the last 15–30 min. Look for repeated 500s, crash loops, or a stack trace at startup (e.g. a missing env var throwing on first request).

5. **Environment variables**
   - Settings → Environment Variables — confirm `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` are all still present for Production. A deleted/rotated var is a common self-inflicted outage — `lib/supabase.ts` uses non-null assertions (`!`) on the Supabase vars, so a missing one throws at request time rather than failing gracefully.
   - Note: this only breaks the contact form's data path, not page rendering — if the whole site (home/blog) is down, look elsewhere first (steps 3–4).

6. **Domain / DNS**
   - Settings → Domains — check the domain isn't showing a certificate or DNS misconfiguration warning. Only relevant if you recently touched DNS records or the domain registrar.

7. **If nothing above explains it:** roll back to the last known-good deployment (see below) while you investigate further — restoring service takes priority over root-causing live.

---

## "Error rate is elevated"

There's no error-rate metric/dashboard configured today — "elevated" will surface as user reports, or as a spike of 5xx/red entries in Vercel Runtime Logs. Diagnose:

1. **Vercel dashboard → Logs**, filter by status code (4xx vs 5xx) and by path.
   - Errors concentrated on `/contact` (a Server Action) → almost certainly Supabase or Resend (see causes below).
   - Errors on `/blog` or `/blog/[slug]` → likely a content/parsing issue (see causes below).
   - Errors across all routes → likely an env var or platform-level issue, not app logic.

2. **Correlate with recent changes**
   - `git log --oneline -10` and compare deploy timestamps in the Vercel dashboard against when errors started. Most "elevated error rate" incidents on a low-traffic personal site trace to the most recent deploy.

3. **Reproduce locally**
   - `npm run build && npm run start` with the same env vars as production (copy from Vercel dashboard into `.env.local`) to reproduce without guessing.

### Common causes, by area

- **Contact form (`app/actions/contact.ts`, `lib/supabase.ts`)**
  - Supabase project paused (free tier auto-pauses after inactivity) or `SUPABASE_SERVICE_ROLE_KEY`/URL rotated — Supabase insert fails.
  - Resend API key invalid/rate-limited — note per `Learning.md` (2026-07-18 entry), a failed Resend send does **not** fail the action; only a Supabase failure surfaces as an error to the user. So Resend issues won't show up as elevated error rate, only as "notifications stopped arriving" — check Resend's dashboard separately if that's the complaint.
  - Malformed/missing form input bypassing client-side `required` validation (e.g. direct POST) — check for a spike of 4xx vs a genuine 5xx.

- **Blog pages (`app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `lib/posts.ts`)**
  - Malformed frontmatter in a `content/blog/*.md` file (bad date format, missing required field) added in a recent commit — this is exactly what `lib/posts.integration.test.ts` should catch in CI before merge; if it's live in production, check whether that test run was skipped or the content was added without going through CI.

- **Whole-site 500s**
  - Missing/rotated env var (see "site is down" step 5).
  - A dependency bump in `package.json` that changed behavior — check `git log -- package.json package-lock.json` for recent changes.

4. **If the cause is a bad deploy:** roll back first, root-cause after — see below.

---

## "A deployment failed"

Deploys run via the `deploy` job in `.github/workflows/ci.yml`, gated on `build` (lint → typecheck → unit tests → `next build`) passing, only on pushes to `master`.

### If it failed in GitHub Actions (never went live)

1. Open the failed run: GitHub repo → **Actions** tab → find the red run.
2. Check which step failed:
   - `Lint` / `Typecheck` / `Unit tests` — a real code issue slipped past local checks. Fix it, push a new commit. The previous (good) production deployment is untouched — nothing to roll back, the bad code never deployed.
   - `Build` — same as above; run `npm run build` locally to reproduce.
   - `Deploy to Vercel` — build succeeded but the Vercel CLI step failed. Usually an expired/invalid `VERCEL_TOKEN`, or `VERCEL_ORG_ID`/`VERCEL_PROJECT_ID` mismatch. Check the step's log output for the specific Vercel CLI error. Production is still on the last successful deploy — no rollback needed, just fix the secret and re-run the job (Actions → failed run → "Re-run failed jobs").

### If it deployed but is broken (bad code reached Production)

This is the actual rollback case — the CI gate passed (or the bad deploy predates a check catching it) but the app misbehaves live.

**Fastest — Vercel Instant Rollback (no rebuild, seconds):**
1. Vercel dashboard → project → **Deployments**.
2. Find the last deployment that was known-good (before the bad one).
3. Click its `⋯` menu → **"Instant Rollback"** (or **"Promote to Production"** depending on Vercel's current UI wording).
4. Confirm — traffic switches to that build immediately, no new build runs.

**Equivalent via CLI**, if you have `vercel` installed and are logged in:
```
vercel rollback [deployment-url-or-id] --token=<token>
```
Run `vercel ls` first if you need to find the deployment URL/ID of the last good build.

**Alternative — revert in git (use when the rollback needs to be durable, not just "current traffic"):**
```
git revert <bad-commit-sha>
git push origin master
```
This lets CI build and deploy the reverted code properly, and keeps `master` and Vercel's "latest" in sync (an Instant Rollback alone doesn't change what the *next* push would deploy from — if someone pushes again without reverting, the bad code comes right back). Prefer this once the incident is stable and you have a minute to do it properly; use Instant Rollback first if speed matters more.

**After any rollback:** note it in `Learning.md` (what broke, what the fix/rollback was, root cause if known) so the incident isn't silently lost to `git log` alone.
