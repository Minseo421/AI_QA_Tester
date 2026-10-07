# AI QA Tester

AI QA Tester scans a website, collects deterministic QA evidence, and uses an AI review step to turn that evidence into prioritized findings.

## Requirements

- Node.js 20+
- npm
- An OpenAI API key

## Local development

```sh
npm install
cp .env.example .env
npm run dev
```

Then open the local URL printed by Vite (normally `http://localhost:3000`).

## Environment variables

Create a `.env` file from `.env.example` and set:

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-6-astra
```

`OPENAI_MODEL` is optional; it defaults to `gpt-6-astra`.

## Scripts

```sh
npm run dev       # start the development server
npm run build     # create a production build
npm run preview   # preview the production build
npm run lint      # run ESLint
npm test          # run tests
```
