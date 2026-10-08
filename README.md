# AI QA Tester

AI QA Tester is a URL-based black-box QA prototype for small teams without a dedicated QA function. It combines a deterministic evidence scan with a **one-shot AI test planner + Playwright executor**: the AI observes the initial page once, plans up to three safe exploratory tests, Playwright executes the plan in Chromium, and a final AI review turns the observed evidence into prioritized bugs and improvements.

## Why this approach

Three approaches were considered:

1. **Static URL scanner** — fast and predictable, but cannot test behaviour after clicks or form input.
2. **Repository/source-code analysis** — can inspect internal logic, but cannot prove that a suspected code issue appears in the running product.
3. **AI-planned browser testing** — AI chooses the tests from the live product state, then Playwright executes them like a user without requiring handwritten test cases.

The prototype selects **AI-planned browser testing**, while keeping the deterministic scanner as a second evidence source. The planner is intentionally called once per run instead of after every browser action, which keeps token use, latency and demo failure risk much lower while preserving the key requirement that AI decides what to test.

## Architecture

```text
URL
 ├─ Deterministic scanner
 │   ├─ pages / status / timings
 │   ├─ links
 │   ├─ forms / labels / image alt
 │   └─ selected headers
 │
 └─ Browser testing
     ├─ observe initial Chromium page
     ├─ AI CALL #1: plan up to 3 safe tests
     ├─ reload target before each test
     ├─ Playwright executes all planned actions
     └─ capture before/after state + runtime signals

                ↓
       AI CALL #2: final QA review
                ↓
      Bugs + Improvements report
```

## What the prototype does

- Accepts an HTTP(S) URL.
- Fetches the target plus up to 4 discovered internal pages.
- Checks up to 30 discovered links.
- Launches Chromium with Playwright.
- Extracts visible interactive controls and gives them temporary element IDs.
- Calls AI once to create up to three self-contained exploratory tests instead of running handwritten test cases.
- Reloads the target before each planned test so tests do not depend on previous test state.
- Supports safe `fill`, `click`, `select` and checkbox actions.
- Records each test goal, expected outcome, full action sequence, before/after state, visible validation/alerts, console errors, page errors and failed requests.
- Combines browser evidence with deterministic evidence in the final AI review.
- Shows whether each finding is verified by a deterministic check, browser-observed, or inferred from scan evidence.
- Shows severity, confidence, evidence, impact, suggested fix and reproduction steps.
- Lets the user dismiss false positives and export the report as Markdown.

## Safety / false-positive controls

Browser exploration is deliberately constrained:

- Page text is treated as untrusted data; the AI is instructed not to follow instructions embedded in a tested webpage.
- The planner can only reference element IDs from the observed initial page.
- Destructive/transactional controls such as delete, purchase, payment and publishing actions are blocked.
- Cross-origin navigation is blocked after the initial page has loaded.
- Private/local network targets are blocked by default to reduce SSRF risk.
- Non-GET browser requests are blocked by default. If this safety policy affects a step, the final reviewer is explicitly told not to report the resulting behaviour as an app bug.
- Browser exploration is capped at three planned tests so the live demo stays predictable.

## Requirements

- Node.js 20+
- npm
- An OpenAI API key
- Chromium installed through Playwright

## Install

```sh
npm install
npx playwright install chromium
cp .env.example .env
```

Set your API key in `.env`:

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-6-luna
```

Then run:

```sh
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:3000`).

## Best setup for the live presentation

To visibly show the panel that the AI is driving a real browser, use headed Chromium with a small delay between actions:

```env
AI_QA_BROWSER_HEADLESS=false
AI_QA_BROWSER_SLOWMO_MS=500
AI_QA_BROWSER_MAX_TESTS=3
```

Then restart `npm run dev`. When you press **Run test**, a Chromium window opens and the AI-planned tests are visible on screen. The AI plans once; Playwright then executes the plan without another planner request after each action.

### Optional local demo target

This repository includes `public/qa-demo-target.html`, a tiny intentionally flawed app for a predictable demo. Local/private URLs are blocked by default, so for this target only set:

```env
AI_QA_ALLOW_PRIVATE_TARGETS=true
```

Restart the dev server, then test:

```text
http://localhost:3000/qa-demo-target.html
```

Only enable `AI_QA_ALLOW_PRIVATE_TARGETS=true` when testing a local app you control. Keep it `false` when testing arbitrary websites.

## Optional write actions

By default the browser executor blocks POST/PUT/PATCH/DELETE requests **only while an AI-planned user action is being executed**. Background/bootstrap requests are allowed so modern apps that use POST-based GraphQL or data loading can render normally:

```env
AI_QA_BROWSER_ALLOW_WRITES=false
```

That is the safer setting for arbitrary targets. The executor also uses a fresh browser context with synthetic values and blocks destructive/transactional clicks. If you are testing a staging/demo app you own and intentionally want AI actions to submit real forms, you can set it to `true` and restart the server.

If the final AI synthesis fails (for example because of a transient API/rate-limit error), the app now keeps the deterministic findings and browser trace and returns a degraded report instead of throwing away the completed test run.

## Environment variables

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-6-luna
AI_QA_BROWSER_HEADLESS=true
AI_QA_BROWSER_MAX_TESTS=3
AI_QA_BROWSER_SLOWMO_MS=0
AI_QA_BROWSER_ALLOW_WRITES=false
AI_QA_ALLOW_PRIVATE_TARGETS=false
# AI_QA_BROWSER_EXECUTABLE_PATH=/path/to/chromium
```

## Scripts

```sh
npm run dev              # start the development server
npm run build            # create a production build
npm run preview          # preview the production build
npm run lint             # run ESLint
npm test                 # run tests
npm run browser:install  # install Playwright Chromium
```

## Current scope / limitations

- The AI sees a compact DOM/accessibility-style snapshot rather than full visual understanding from screenshots.
- Exploration is intentionally limited to up to three AI-planned tests, not an unlimited autonomous agent loop.
- Authentication that requires real credentials, CAPTCHAs, payments and destructive flows are out of scope.
- Browser observations can still be ambiguous, so the report keeps confidence labels and exposes the exact trace used as evidence.
- Accessibility/security checks are lightweight QA signals, not formal audits or penetration tests.

## Token usage

The browser planner is called **once per run**, not once per action. Inline/base64 image URLs are removed, the planner receives only a compact initial snapshot, and final synthesis receives summarized state changes instead of full page dumps. Both AI calls use `maxRetries: 0` so a rate-limit response is not immediately retried and charged against the same TPM window. Token usage for each successful AI call is logged in the server console as `[AI QA][tokens] ...`.

`AI_QA_BROWSER_MAX_TESTS=3` is the recommended and enforced maximum. The old `AI_QA_BROWSER_MAX_STEPS` variable is still accepted as a compatibility fallback, but new setups should use `AI_QA_BROWSER_MAX_TESTS`.
