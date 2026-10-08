# AI QA Tester

AI QA Tester is a URL-based black-box QA prototype for small software teams that do not have a dedicated QA function.

Give it a running web app URL and it will:

1. scan the app for objective issues,
2. use AI to decide which user flows are worth testing,
3. execute those tests in a real Chromium browser with Playwright, and
4. return a prioritized report of bugs and improvements.

**No handwritten test scripts are required.**

## Motivation

Small teams often ship quickly, but testing is easy to skip when time is tight. Manual click-through testing is slow, traditional automated tests take time to write and maintain, and many edge cases or UX issues are only discovered after users encounter them.

This prototype explores a lightweight alternative: let AI decide what is worth testing, let Playwright perform those actions in a real browser, and combine the observed behaviour with deterministic checks to produce an actionable QA report.

## How it works

```text
URL
 │
 ├─ Deterministic scan
 │   ├─ pages / status / timings
 │   ├─ links
 │   ├─ forms / labels / image alt
 │   └─ selected headers
 │
 └─ AI-planned browser testing
     ├─ observe the initial Chromium page
     ├─ AI plans up to 3 safe exploratory tests
     ├─ Playwright executes each test in a real browser
     └─ capture before/after state + runtime signals

                 ↓
          Final AI review
                 ↓
       Bugs + Improvements report
```

The AI planner is called once per run rather than after every browser action. This keeps the prototype faster, cheaper and more reliable while preserving the key idea: **AI decides what to test.**

## Why this approach

Three approaches were considered:

1. **Static URL scanner** — fast and predictable, but cannot test behaviour after clicks or form input.
2. **Repository/source-code analysis** — can inspect internal logic, but cannot prove that a suspected issue appears in the running product.
3. **AI-planned browser testing** — chooses tests from the live product state and executes them like a user without requiring handwritten test cases.

This prototype uses **AI-planned browser testing** as the main approach, with a deterministic scanner running alongside it as a second evidence source.

That gives two useful kinds of evidence:

- **Deterministic evidence** for objective issues such as broken links, missing labels and missing image alt attributes.
- **Browser-observed evidence** for behaviour that only appears after user interaction.

## Key features

- Accepts any HTTP(S) URL.
- Scans the target plus a small number of discovered internal pages.
- Checks discovered links and common accessibility signals.
- Uses AI to generate up to three self-contained exploratory browser tests.
- Executes tests with Playwright in Chromium.
- Supports safe `fill`, `click`, `select` and checkbox actions.
- Captures validation messages, URL changes, console errors, page errors and failed requests.
- Produces bugs **and** improvements, not just one or the other.
- Shows severity, confidence, evidence, impact, suggested fix and reproduction steps.
- Distinguishes deterministic findings, browser-observed findings and AI-inferred findings.
- Lets the user dismiss false positives and export the report as Markdown.

## Quick start

### Requirements

- Node.js 20+
- npm
- An OpenAI API key
- Chromium installed through Playwright

### Install

```sh
npm install
npx playwright install chromium
cp .env.example .env
```

Add your API key to `.env`:

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-6-luna
```

Start the app:

```sh
npm run dev
```

Open the local URL printed by the dev server, normally:

```text
http://localhost:3000
```

## Demo mode

For a live presentation, it is useful to show the browser actions visibly:

```env
AI_QA_BROWSER_HEADLESS=false
AI_QA_BROWSER_SLOWMO_MS=500
AI_QA_BROWSER_MAX_TESTS=3
```

Restart the dev server after changing `.env`.

### Included demo target

The repository includes a small intentionally flawed app for predictable testing:

```text
http://localhost:3000/qa-demo-target.html
```

Because local/private targets are blocked by default, enable them only for a local app you control:

```env
AI_QA_ALLOW_PRIVATE_TARGETS=true
```

Keep this setting `false` when testing arbitrary external websites.

## Safety and false-positive controls

Browser exploration is intentionally constrained so that the tester remains safe and explainable:

- Tested page content is treated as untrusted data.
- The AI can only reference elements observed on the page.
- Destructive or transactional controls such as delete, purchase, payment and publishing actions are blocked.
- Cross-origin navigation is blocked after the initial page loads.
- Private/local network targets are blocked by default to reduce SSRF risk.
- Write requests triggered by AI actions are blocked by default.
- Safety-blocked behaviour is not reported as an application bug.
- Exploration is capped at three planned tests per run.

For a staging or demo app you own, write actions can be enabled explicitly:

```env
AI_QA_BROWSER_ALLOW_WRITES=true
```

## Report design

The report is designed to be useful to a developer rather than just expose raw logs.

Each finding can include:

- type: bug or improvement,
- severity,
- confidence,
- evidence,
- why it matters,
- suggested fix,
- reproduction steps,
- whether the finding was verified by a deterministic check, observed in the browser, or inferred by AI.

If the final AI review is unavailable, the app preserves completed deterministic findings and browser traces instead of discarding the run.

## Configuration

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-6-luna

AI_QA_BROWSER_HEADLESS=true
AI_QA_BROWSER_MAX_TESTS=3
AI_QA_BROWSER_SLOWMO_MS=0
AI_QA_BROWSER_ALLOW_WRITES=false
AI_QA_ALLOW_PRIVATE_TARGETS=false

# Optional when using a custom Chromium installation
# AI_QA_BROWSER_EXECUTABLE_PATH=/path/to/chromium
```

## Scope and limitations

This is a prototype, not a replacement for a full QA or security program.

- The AI receives a compact DOM/accessibility-style snapshot rather than full visual understanding from screenshots.
- Exploration is intentionally limited to a small number of planned tests rather than an unlimited autonomous agent loop.
- Authentication requiring real credentials, CAPTCHAs, payments and destructive flows are out of scope.
- Browser observations can be ambiguous, so findings include confidence and the evidence used to support them.
- Accessibility and security checks are lightweight QA signals, not formal audits or penetration tests.

## Token efficiency

The prototype is designed to keep AI usage predictable:

- one AI call plans the browser tests,
- Playwright executes the actions without additional planner calls,
- one final AI call reviews the collected evidence.

This keeps the normal run to **two AI calls** while still allowing AI to decide what to test.

## Scripts

```sh
npm run dev              # start the development server
npm run build            # create a production build
npm run preview          # preview the production build
npm run lint             # run ESLint
npm test                 # run tests
npm run browser:install  # install Playwright Chromium
```