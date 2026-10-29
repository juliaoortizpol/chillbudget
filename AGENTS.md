# ChillBudget repository instructions

## Context
This is the React + TypeScript + Vite frontend.
Backend: https://github.com/juliaoortizpol/brainbudget.
Keep feature code under src/features, shared UI/layout under src/components,
and shared request behavior in src/hooks/useFetch.ts.

## Engineering boundaries
Use the existing @/ alias, feature hooks, shared UI components and styling conventions.
Verify backend DTOs and response shapes before changing a request or frontend type.
Distinguish live API behavior from mock/static data; do not report mocked success
as an integrated feature. Include loading, empty and error behavior when relevant.
The current JWT is stored as jwt_token in localStorage; do not expose it in evidence.
VITE_ values are public build configuration, never secrets.

## Verification
Use Node 24 and npm ci (the initial CI baseline).
Run lint: npm run lint
Run types: npx --no-install tsc -b
Run unit/component tests: npm test
Run production build: npm run build
Vitest runs the configured unit/component suite. Do not use --if-present to
conceal missing checks. Follow docs/testing.md for manual/integrated QA and
attach UI evidence; unit/component tests do not replace integrated QA.

## Workflow
The shared workflow/role policy is maintained in the BrainBudget orchestration directory.
See docs/agent-workflow.md to locate the configured sibling checkout and controller.
Use approved ticket scope and isolated branches. Developer, Reviewer and QA need fresh
contexts; never claim another role passed. No merge, deployment, protection changes or
production access during implementation. Do not weaken checks or remove tests for green CI.
Use synthetic data; keep credentials, JWTs, real mail and private finances out of evidence.
