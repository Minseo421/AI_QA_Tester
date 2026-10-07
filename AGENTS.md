# Project notes

- Scans run as a deterministic crawl (`src/lib/scanner.server.ts`) followed by an AI review (`src/lib/analyze.server.ts`).
- AI findings must cite crawl evidence so that false positives remain traceable.
