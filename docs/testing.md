# Verification and CI

## Reproducible setup
Initial CI baseline: Node 24, npm, npm ci using the committed package-lock.json.
Install from the repository root. Dependency installation failure is a failed
check, not a successful test. Review lockfile changes deliberately.

## Commands
- Lint: npm run lint
- Types: npx --no-install tsc -b
- Production bundle: npm run build

Build already invokes TypeScript, but a separate type job makes failures visible.
No automated frontend test suite is configured. test-api.cjs is a manual script,
not a configured test runner or proof of UI coverage. Add a dedicated ticket for
component/browser testing and a deterministic synthetic-data environment.

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
Use docs/qa-reporting.md. For integrated testing, record both repositories' exact
commits, isolated environment and synthetic data. Unit/build checks do not replace
independent review, browser QA, authorization checks or financial correctness tests.
