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

---

## 2026-07-18 — Unit tests: Vitest, added test stage to CI

**Decided:** Add Vitest as the test runner. Test only `lib/posts.ts` (`getAllPosts`, `getPostBySlug`) and `app/actions/contact.ts` (`submitContact`) — 15 test cases total, 8 + 7. Added `npm run test` (`vitest run`) and a "Unit tests" step to `.github/workflows/ci.yml`, between lint and build.

**Options considered:**
- Vitest (chosen) — faster (esbuild-based), minimal config, listed first in Next.js's own bundled testing docs (`node_modules/next/dist/docs/01-app/02-guides/testing/`) for this Next version
- Jest — also documented and Next-native since v12 (`next/jest` preset), but slower startup/transform; rejected only on speed, not correctness
- Both are free/open-source, satisfying the hobby-project budget rule either way

**Scope constraint (from Next's own docs, checked per `AGENTS.md`'s instruction to verify against bundled docs):** async Server Components aren't supported by either Vitest or Jest for unit testing — Next recommends E2E instead. This ruled out unit-testing `app/blog/page.tsx` and `app/blog/[slug]/page.tsx` directly (both are/use async Server Components). Only plain functions were unit-tested; environment is `node` (no jsdom/`@testing-library/react` installed since no component rendering is being tested yet).

**Mocking approach:**
- `lib/posts.test.ts`: mocks `fs.readdirSync`/`fs.readFileSync` with in-memory fixture markdown strings; real `gray-matter` parses them. Avoids coupling tests to the real files in `content/blog`, which can change independently.
- `app/actions/contact.test.ts`: mocks `@/lib/supabase` (`createServerClient`) and `resend` (`Resend`) entirely, so no real network calls or env vars (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`) are needed in CI. One test (`still returns success when the Resend email fails`) documents existing behavior — a failed email send doesn't fail the action, only Supabase failures do — this was an observation, not a requested behavior change.

**Config note:** initially added `vite-tsconfig-paths` per Next's docs, but Vitest 4 supports `resolve.tsconfigPaths: true` natively, so the extra devDependency was removed in favor of the built-in option.

---

## 2026-07-18 — Integration test: lib/posts.integration.test.ts

**Decided:** Add one integration test file that exercises `getAllPosts`/`getPostBySlug` against the real `content/blog` directory (no `fs` mocking), as a complement to the mocked unit tests in `lib/posts.test.ts`. 7 cases: non-empty result, required fields present, valid dates, correct sort order, unique slugs, every slug resolves via `getPostBySlug`, frontmatter stripped from content.

**Why:** The mocked unit tests validate the parsing/sorting *logic* in isolation but can't catch a real content file with malformed frontmatter (e.g. a missing required field, unparseable date, or duplicate slug) — that only shows up when the code runs against the actual files a content author would edit. No new npm script or CI step needed; Vitest's default glob picks up any `*.test.ts`, so it runs as part of the existing `npm run test` / CI "Unit tests" step.

---

## 2026-07-18 — Happy path test: app/page.integration.test.ts

**Decided:** Add one happy-path integration test covering the home page's content parsing. `app/page.tsx` reads and parses `content/home-page/about.md` inline via `fs` + `gray-matter` (same pattern as `lib/posts.ts`, just not extracted to a lib function) and had zero test coverage. New file mirrors that exact read, asserting the real file parses with the frontmatter fields the page renders (`name`, `title`) present and non-empty `content`.

**Options considered:**
- Test the raw content parsing directly (chosen) — no new tooling, consistent with the existing `lib/posts.integration.test.ts` style
- Render `<HomePage />` via `@testing-library/react` — would give true component-level coverage, but `app/page.tsx` isn't `async`, so it's technically renderable per Next's docs, though it requires adding `jsdom` + `@testing-library/react`/`@testing-library/dom` as new devDependencies and switching part of the test environment; deferred since it wasn't requested and duplicates what the content-parsing test already covers
- Extract the read/parse logic into a `lib/about.ts` helper first — rejected as an unrequested refactor of working code

---

## 2026-07-18 — Build verification stage: dedicated typecheck step in CI

**Decided:** Add a `typecheck` npm script (`tsc --noEmit`) and a "Typecheck" step in `ci.yml`, placed after Lint and before Unit tests/Build.

**Options considered:**
- Dedicated typecheck step (chosen) — `next build` already type-checks as part of compiling, so this is a fast, isolated stage that fails on type errors before spending time on the full build/bundle step. Also formalizes the `npx tsc --noEmit` check that had been run manually by hand throughout this session but was never wired into a script or CI.
- Rely on the existing Build step alone — rejected; while `next build` does catch type errors, a separate fast-failing typecheck step gives clearer signal (which stage failed) and fails faster on pure type errors without waiting on bundling.

**Why:** Requested explicitly as a "build verification stage that compiles the project" — clarified with the user that this meant a standalone TypeScript compilation check distinct from the existing full `next build` step, not a replacement for it.

---

## 2026-07-18 — Deploy stage: Vercel, gated on master pushes only

**Decided:** Add a `deploy` job to `ci.yml` that `needs: build` (only runs after lint/typecheck/tests/build all pass) and is gated with `if: github.event_name == 'push' && github.ref == 'refs/heads/master'` — fires only on pushes to `master` (this repo's actual default/main branch — confirmed with the user it should target `master`, not rename to `main`), never on PR runs. Uses Vercel's own CLI (`vercel pull` → `vercel build --prod` → `vercel deploy --prebuilt --prod`), authenticated via a `VERCEL_TOKEN` secret, with `VERCEL_ORG_ID`/`VERCEL_PROJECT_ID` as env vars.

**Options considered:**
- Vercel (chosen) — first-class Next.js App Router/Server Actions/Image Optimization support, needed since this app uses Server Actions (contact form) and isn't statically exportable. Free hobby tier covers a personal site.
- Netlify — also free-tier viable with a Next.js runtime adapter, more config for this framework specifically; not chosen only because Vercel is purpose-built for Next.js
- Cloudflare Pages — free, but needs the `@cloudflare/next-on-pages` adapter with feature caveats around Node APIs/Server Actions; rejected due to compatibility risk with the contact form's Server Action
- GitHub Pages / static export — rejected outright; this app needs a Node runtime (Server Actions, `fs` reads at request time), not achievable with a static export

**Deploy method — GitHub Actions job vs Vercel's native Git integration:**
- Actions-gated deploy job (chosen) — deployment only happens if our own lint/typecheck/test/build steps pass first, a real quality gate
- Vercel's dashboard Git integration (auto-deploy on push, no YAML) — simpler to set up but deploys independently of this repo's CI checks; rejected since the ask was specifically for a CI-triggered deploy step

**Security note:** used Vercel's official CLI directly in the workflow rather than a third-party community Action (e.g. `amondnet/vercel-action`), to avoid handing `VERCEL_TOKEN` to unaudited third-party code.

**Outstanding (user must do manually — requires their Vercel account access):** create a Vercel project for this repo and add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` as GitHub repo secrets. The `deploy` job will exist but fail until these are set.
