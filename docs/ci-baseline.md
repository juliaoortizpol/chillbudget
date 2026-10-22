# CI onboarding baseline

Observed at acd84a20b33e18acce1a86ea91f5f6ea64fc7afe on 2026-10-22 with Node 24.19.0
and npm 11.9.0, after npm ci.

| Check | Result |
| --- | --- |
| Dependency installation | Passed |
| Lint | Failed: 48 errors, 4 warnings |
| Type check | Passed |
| Production build | Passed; bundle-size warning |
| Automated frontend tests | Not configured |

The CI workflow deliberately retains failing lint checks. This baseline is a
snapshot, not a lint exemption. Resolve errors in a dedicated change before
treating the required gate as operational. Do not mass-disable lint rules,
add continue-on-error or downgrade errors to obtain a passing gate.
Independent review and integrated/UI QA were not performed for this onboarding
change. These docs/workflows do not change application runtime behavior.
