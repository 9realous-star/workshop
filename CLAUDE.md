# CLAUDE.md

## Project overview

A company workshop event site: a landing page plus Day1/Day2 activity pages built around a Refresh / Review / Reboot theme, an interactive team praise board, and a "next-half planning" tool. Deployed as a static site with a couple of Vercel serverless functions for shared (Redis-backed) state.

## Tech stack

- Vanilla HTML/CSS/JS. No build step, no bundler, no framework, no TypeScript, no tests.
- Hosting + serverless functions: Vercel. `api/*.js` files are auto-detected as serverless functions.
- Dependency: `@upstash/redis` (server-side only, used by the `api/*.js` handlers).
- Deploy flow: this repo is connected to GitHub `9realous-star/workshop` (`main` branch). Push to `main` → Vercel auto-deploys (usually within ~1 minute).

## File map

| File | Purpose |
|---|---|
| `index.html` | Landing page: team-lead message, Refresh/Review/Reboot purpose cards, Day1/Day2 schedule, links to all sub-pages |
| `refresh.html` | Day 1 activity showcase (board games, cooking, rafting, team games), weather Plan A/B, timeline. Static, no API. |
| `review.html` | 2025→2026 goals vs. outcomes retrospective, animated progress bars, Keep/Improve retro. Static, no API. |
| `quiz.html` | Team trivia quiz, 5 hardcoded Q&A, client-side scoring only, no persistence |
| `cheer.html` | "칭찬합시다" praise board: write/view/filter/paginate/delete praise messages. Talks to `/api/praises`, polls every 6s |
| `reboot.html` | "하반기 나침반" planning tool: team-wide themes/promises + per-individual action items. Talks to `/api/reboot` and `/api/reboot-team`, polls every 8s |
| `api/praises.js` | GET/POST/PATCH/DELETE for the praise board |
| `api/reboot.js` | GET/POST for per-individual action-item slots |
| `api/reboot-team.js` | GET/POST for team-wide themes/promises |
| `hyundai.webp`, `kia.webp` | Sponsor/company logos used in page nav headers |
| `atlas.jpg` | Boston Dynamics Atlas banner image (`index.html`, `reboot.html`) |

See [design.md](design.md) for the visual design system.

## API conventions

All three `api/*.js` handlers are CommonJS, default-export an async `(req, res)` function, and connect to Redis with the same env var fallback: `process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL` (and the token equivalent). This is duplicated identically in all three files rather than shared.

| File | Methods | Redis key | Auth | Response shape |
|---|---|---|---|---|
| `api/praises.js` | GET/POST/PATCH/DELETE | `ws_praises_v4` | `ADMIN_PW='0512'` hardcoded, checked via `?pw=` for bulk DELETE | Full updated array on every mutation; `{error}` + 400/403/404/405 on failure |
| `api/reboot.js` | GET/POST | `rb_individuals_v1` | none | Supports single-index update (`{index,name,text}`) or full-array replace |
| `api/reboot-team.js` | GET/POST | `rb_team_v1` | none | Field-whitelisted (`ta,tb,t1,t2,t3`), always returns `{...DEFAULT,...data}` |

Redis keys are versioned (`_v4`, `_v1`) — this reflects past schema resets; bumping the suffix wipes stored data for that resource.

## Known issues / gotchas

- **CSS is fully duplicated, not shared** — every HTML page has its own near-identical `<style>` block (nav bar, background gradient, font import, card styles, etc. all copy-pasted). Changing the shared look means editing every file individually.
- **Member roster duplicated** — `cheer.html` (`MBS`, rich metadata) and `reboot.html` (`MBS`, plain name list) each hardcode the team roster independently. Keep them in sync manually when membership changes.
- **Hardcoded secret** — `ADMIN_PW = '0512'` lives in both `api/praises.js` and client-side in `cheer.html`. This is a real but weak secret exposed in source; fine for a low-stakes internal event tool, but don't treat it as real auth.
- **`esc()` HTML-escaping helper** is reimplemented separately in `cheer.html` and `reboot.html` rather than shared.

## Workflow

- **Layout-only preview**: VSCode "Live Preview" extension on any `.html` file. Sufficient for checking design/layout, but `/api/*` calls will fail (no server).
- **Full preview (with working API calls)**: run `vercel dev` locally to exercise the Redis-backed endpoints.
- **Ship a change**: edit → `git add -A` → `git commit -m "..."` → `git push` → Vercel auto-deploys `main`.
