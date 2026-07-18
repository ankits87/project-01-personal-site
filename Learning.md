# Learning.md

Decision log for the Personal Site (project-01) project. Append new entries at the bottom.

---

## 2026-07-18 — CI: GitHub Actions workflow, pinned Node 22.x

**Decided:** Add `.github/workflows/ci.yml` running on `push`/`pull_request` to `master`. Single `build` job on `ubuntu-latest`: checkout → setup Node 22.x (with npm cache) → `npm ci` → `npm run lint` → `npm run build`. No test step (no test runner or Playwright config exists in the repo despite `playwright` being a devDependency).

**Options considered:**
- Pinned single Node version (chosen) — one job run, fast and cheap, matches the version this deployed app actually runs on
- Node version matrix (20.x/22.x) — rejected; matrix protects package/library authors from multi-version breakage, but this is a deployed app, not a published package, so extra runs just cost CI minutes without answering a real question
- No CI at all — rejected; a lint/build gate on PRs is close to free and catches broken builds before merge

**Why:** Hobby-project budget favors the cheapest setup that still catches real breakage (build/lint failures). GitHub Actions is free for public repos / has a generous free tier for private ones. Matrix testing deferred unless this repo ever becomes a shared library.

---

## 2026-07-18 — Lint fixes: React Compiler set-state rules + missing Link usage

**Decided:** Fixed 3 pre-existing lint errors surfaced by the new `ci.yml` lint step.

**Findings:** `eslint-config-next`'s `core-web-vitals` config pulls in `eslint-plugin-react-hooks`'s `recommended` preset, which (this Next 16 version) includes the newer React Compiler-oriented rules `set-state-in-effect` and `set-state-in-render` — both `error`. `set-state-in-render` only flags *unconditional* setState calls during render; setState inside an `if` block is allowed (this is the documented "adjusting state during render" pattern from react.dev).

**Fixes:**
- `components/Navbar.tsx`: replaced `useState(false)` + `useEffect(() => setMounted(true), [])` mount-detection with `useSyncExternalStore(emptySubscribe, () => true, () => false)` — the rule's own error message names this as the correct fix for "force update to sync with an external system" (client-only hydration state qualifies).
- `app/contact/page.tsx`: moved `setShowModal(true)` out of the `useEffect` into a conditional check during render (`if (state.status !== prevStatus) { setPrevStatus(...); if (...) setShowModal(true) }`), following the prev-value-in-state pattern from React docs. `formRef.current?.reset()` stayed in the effect since it's a DOM side effect, not a setState call, and isn't flagged.
- `app/page.tsx`: swapped `<a href="/blog">` and `<a href="/contact">` for `next/link`'s `<Link>` (only `/blog` was flagged by `no-html-link-for-pages`, but `/contact` was the identical anti-pattern in the same block — fixed both to avoid leaving a latent copy of the same bug).

**Why:** These aren't cosmetic lint nags — the underlying rules exist because setState-in-effect and setState-in-render can cause extra renders or infinite loops under React Compiler. Worth fixing properly rather than disabling the rule, especially since `AGENTS.md` flags this Next.js version as having breaking changes from what's in training data.
