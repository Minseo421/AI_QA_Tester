# AI QA Tester

AI QA Tester is a URL-based black-box QA prototype for small teams without a dedicated QA function. It combines a deterministic evidence scan with an **AI-driven Playwright browser agent**: the AI observes the current page, chooses a safe exploratory test, Playwright executes it in Chromium, and the app turns the observed evidence into prioritized bugs and improvements.

## Why this approach

Three approaches were considered:

1. **Static URL scanner** — fast and predictable, but cannot test behaviour after clicks or form input.
2. **Repository/source-code analysis** — can inspect internal logic, but cannot prove that a suspected code issue appears in the running product.
3. **AI browser agent** — observes the live product, chooses tests dynamically, executes them like a user, and does not require handwritten test cases.

The prototype selects **AI browser testing**, while keeping the deterministic scanner as a second evidence source. That gives the demo both interactive behaviour and hard checks such as HTTP status, broken links and accessibility signals.

## Architecture

```text
URL
 ├─ Deterministic scanner
 │   ├─ pages / status / timings
 │   ├─ links
 │   ├─ forms / labels / image alt
 │   └─ selected headers
 │
 └─ AI browser agent
     ├─ observe current Chromium page
     ├─ AI chooses ONE safe next QA action
     ├─ Playwright executes it
     ├─ capture before/after state + runtime signals
     └─ repeat up to 5 actions

                ↓
        Final AI QA review
                ↓
      Bugs + Improvements report
```

## What the prototype does

- Accepts an HTTP(S) URL.
- Fetches the target plus up to 4 discovered internal pages.
- Checks up to 30 discovered links.
- Launches Chromium with Playwright.
- Extracts visible interactive controls and gives them temporary element IDs.
- Asks AI to choose the next exploratory QA action instead of running a handwritten test case.
- Supports safe `fill`, `click`, `select` and checkbox actions.
- Records the action goal, expected outcome, actual before/after state, visible validation/alerts, console errors, page errors and failed requests.
- Combines browser evidence with deterministic evidence in the final AI review.
- Shows whether each finding is verified by a deterministic check, browser-observed, or inferred from scan evidence.
- Shows severity, confidence, evidence, impact, suggested fix and reproduction steps.
- Lets the user dismiss false positives and export the report as Markdown.

## Safety / false-positive controls

Browser exploration is deliberately constrained:

- Page text is treated as untrusted data; the AI is instructed not to follow instructions embedded in a tested webpage.
- The AI can only act on element IDs from the current observed page.
- Destructive/transactional controls such as delete, purchase, payment and publishing actions are blocked.
- Cross-origin navigation is blocked after the initial page has loaded.
- Private/local network targets are blocked by default to reduce SSRF risk.
- Non-GET browser requests are blocked by default. If this safety policy affects a step, the final reviewer is explicitly told not to report the resulting behaviour as an app bug.
- Browser exploration is capped at a small number of actions so the live demo stays predictable.

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
AI_QA_BROWSER_MAX_STEPS=5
```

Then restart `npm run dev`. When you press **Run test**, a Chromium window opens and the AI-selected actions are visible on screen.

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

By default the browser agent blocks POST/PUT/PATCH/DELETE requests:

```env
AI_QA_BROWSER_ALLOW_WRITES=false
```

That is the safer setting for arbitrary targets. If you are testing a staging/demo app you own and intentionally want the browser to submit real forms, you can set it to `true` and restart the server.

## Environment variables

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-6-luna
AI_QA_BROWSER_HEADLESS=true
AI_QA_BROWSER_MAX_STEPS=5
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
- Exploration is intentionally limited to a few safe actions, not an unlimited autonomous crawl.
- Authentication that requires real credentials, CAPTCHAs, payments and destructive flows are out of scope.
- Browser observations can still be ambiguous, so the report keeps confidence labels and exposes the exact trace used as evidence.
- Accessibility/security checks are lightweight QA signals, not formal audits or penetration tests.
