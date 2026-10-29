# Finances roles and controller

Shared setup is maintained once in the BrainBudget repository's orchestration/ directory.
On this machine the backend folder is named `brainbudget-contracts`, next to `chillbudget`.
Actual paths are configured in the ignored parent `.finances-host.local.json`; do not rename
or hard-code source folders in role instructions.

Open the sibling `brainbudget-contracts/orchestration/README.md` for operation and
`WORKFLOW.md` for the authoritative rules. Published source:
[BrainBudget orchestration](https://github.com/juliaoortizpol/brainbudget/tree/master/orchestration).
For an unmerged setup use the linked backend setup PR/local checkout; merge the backend
setup before relying on the master links. This frontend change only adds references and
updates shared reporting fields; it does not add a second controller or duplicate role config.

Start with the controller's doctor command, then Julio's approved ticket and scope hash.
Status, structured role results and captioned screenshots stay under the configured state_root.
Developer, Reviewer and QA launch with fresh context. Review/QA source is read-only outside
writable scratch; host/credential/test environment restrictions still require validation.
No feature ticket starts during setup. Only Julio approves; Done means all relevant PRs merged.

Frontend quality: React/TypeScript/Vite feature hooks and shared UI; Vitest is included in CI.
Verify backend DTO compatibility and matching-rule keyword/value serialization without losing
field/operator/source; exercise loading, empty and failure states. Loan and retirement engines
remain separate from presentation and require independent financial examples when changed.
