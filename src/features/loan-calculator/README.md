# Loan calculator

Route: `/planning/loan-calculator`, launched from the Loan Calculator card in Planning.

`utils/loanCalculator.ts` contains the React-free PMT, iterative amortization, scenario comparison and chart-series functions. `useLoanCalculator` owns editable strings, normalization, validation and memoized results. Components only handle presentation and UI interactions. Both scenarios use the same engine; the baseline overrides extra principal to zero.

## Model and assumptions

- The nominal annual percentage input is divided by 100, then by 12, 26 or 52. PMT uses `P * r / (1 - (1 + r)^-n)` with `log1p`/`expm1` for numerical stability; zero interest uses `P / n`.
- Start date means origination, not first installment. The first payment is one period later. Monthly dates are anchored to the original day with month-end clamping; weekly/biweekly periods use 7/14 calendar days.
- Term must produce a whole number of installments. Bounds are 0.01–1e12 for principal, up to 100 years, 0–1000% nominal annual interest, and 0–1e12 for extra payments/charges. Extreme rate/term combinations that cannot amortize within floating-point precision produce validation feedback.
- Extra payments reduce principal; recurring charges do not. Charges apply once per actual installment, including the final installment. There are no origination fees, penalties, variable rates or daily accrual.
- Intermediate values retain full precision. Display uses one DOP formatter. Final principal is capped and tiny residuals are reconciled into the final scheduled payment. Calendar months saved are full months between payoff dates; payments saved is exact for every frequency.
- The top summary and cost breakdown show the current plan without extra payments. Comparison and schedule support the extra-payment scenario. The schedule defaults to eight rows, supports year/scenario filtering, and uses disclosures below the desktop breakpoint.

## Regression and verification

Provided Scotiabank inputs: RD$626,000, 16.95%, 6 years, monthly, May 21, 2026, no extras or charges.

- Payment: **RD$13,908.618742377907** before display rounding.
- Scheduled payments: **72**.
- Total interest: **RD$375,420.54945120926**.
- Total repayment: **RD$1,001,420.5494512093**.
- First payment: **June 21, 2026**; payoff: **May 21, 2032**.

This is checked against the supplied formula and inputs; no workbook file was supplied. Mockup totals are not used as calculation constants.

Run `npm test` for engine, dates, hook and schedule interaction tests; `npm run build` for TypeScript and production build. Stitch HTML and screenshot are retained in `design-references/loan-calculator/`.
