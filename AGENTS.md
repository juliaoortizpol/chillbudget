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
Run production build: npm run build
There is no configured automated frontend test suite. Do not invent a passing
test command or use --if-present to conceal that gap. Follow docs/testing.md
for manual/integrated QA and attach UI evidence.

## Workflow
Read docs/product.md, docs/architecture.md and docs/testing.md before changing behavior.
Use the Trello ticket's acceptance criteria and execution mode; do not invent scope.
Work on a ticket branch and open a PR to master. Link related changes in the other
repository. Keep documentation current when behavior, API contracts or setup change.
Use .github/pull_request_template.md and docs/qa-reporting.md for handoffs.
Developer, Reviewer and QA use separate sessions; do not fill in another role's
verdict or treat a developer summary as independent verification.
Blocking defects return the original ticket to development. Minor defects need
linked follow-up tickets and may pass QA. Julio approves; Done requires merge.
Never merge, deploy, alter protection, or bypass failing checks as part of implementation.
Report exact commands and failures; do not disable rules or delete tests to obtain green CI.
Use synthetic data. Do not log or commit credentials, JWTs, Google tokens or real mail.
