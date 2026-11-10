# Verification and CI

## Reproducible setup
Initial CI baseline: Node 24, npm, npm ci using the committed package-lock.json.
Install from the repository root. Dependency installation failure is a failed
check, not a successful test. Review lockfile changes deliberately.

## Commands
- Lint: npm run lint
- Types: npx --no-install tsc -b
- Unit/component tests: npm test
- Production bundle: npm run build

Build already invokes TypeScript, but a separate type job makes failures visible.
Vitest runs the configured unit/component tests in jsdom, including budget
matching rules, the loan calculator and retirement planning. test-api.cjs is a
manual script, not a configured test runner or proof of integrated UI coverage.
Browser/API verification still needs a deterministic synthetic-data environment.
CI runs lint, types, unit/component tests (npm test), and build. All four
must pass for frontend-required to succeed.

## Required checks rollout
.github/workflows/ci.yml runs on every PR, push to master and manual dispatch.
Its frontend-required job fails if any matrix check fails or is cancelled.
No continue-on-error, silent missing-script success or path-based workflow skips.
Runtime tests needing credentials/data stay outside this initial gate.

After the workflow is merged and has reported checks on master:
1. Resolve baseline failures; do not suppress them in the workflow.
2. In GitHub branch protection/rulesets for master, require pull requests and
   the exact check name frontend-required from GitHub Actions.
3. Require resolved review conversations; prevent force pushes/deletion and
   avoid agent bypass permissions.
4. Keep Julio's approval/merge decision as the final workflow step.
   A sole PR author cannot approve their own PR as a GitHub required reviewer;
   choose an eligible independent reviewer before requiring approval counts.
5. Verify enforcement using a deliberately failing test PR before relying on it.

Workflow files alone do NOT enable branch protection. Protection configuration
is a separate admin step and is not claimed as active by this PR.

## QA
FE2 coverage behavior and downstream integration boundaries are documented in
[budget coverage](budget-coverage.md). Controlled tests cover active-only selection,
extended API spending, open/exclusive/legacy purchase boundaries, saved-zone date
display, timezone creation, explicit activation, duplicate prevention, retained
failure input, loading/error/retry, metadata round trips and historical labels.
`budget/refresh.test.tsx` uses the real BudgetProvider, budget hooks and overview/
transaction components with controlled synthetic requests. Deferred revalidation
checks DOM/input retention, saved keyword retention after GET failure, explicit GET
retry without duplicate PATCH, and category request failure/recovery after planned
end. Hook coverage also checks stale GET ordering and loaded-category retention.
Deferred provider regressions cover both update and create feedback through a
failed retry followed by successful recovery, retaining confirmation without stale
failure advice or another PATCH/POST.
These are controlled component checks, not real HTTP/Mongo or browser evidence.

FE4 expense assignment adds explicit opt-in merchant learning through the atomic
BE9 PATCH contract. Component tests cover opt-out, clear, edited consent, overlap
feedback, keyword validation, pending duplicate prevention and failure/opt-out retry.
They use controlled synthetic objects, not HTTP or MongoDB.
The page-level `assignment-retry.test.tsx` uses the real transaction hook and
responsive table/card editors with controlled requests. It checks that pending
and rejected saves preserve the selected item, consent and edited keyword,
prevent duplicate submission and retry the same payload only on user action.
These checks do not establish browser layout or persisted API behavior.
After checkpointing,
verify desktop/mobile assignment, equivalent rule reuse/promotion, reload, synthetic
import matching/idempotency and unchanged historical assignments against
brainbudget_qa_synthetic. Capture normal, validation, overlap, pending, failure/retry
and opt-out states in the portable captioned QA report. No live mail is required.

Use docs/qa-reporting.md. For integrated testing, record both repositories' exact
commits, isolated environment and synthetic data. Unit/build checks do not replace
independent review, browser QA, authorization checks or financial correctness tests.
