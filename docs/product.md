# Product context

ChillBudget is the Finances web frontend; BrainBudget is its NestJS API.
The npm package is currently named flowbudget; this does not identify a separate app.

## Current implementation
src/App.tsx defines login at /, Google callback at /auth/callback, and dashboard,
/budget, /transactions, /accounts and /planning under the shared layout and BudgetProvider.
Planning includes /planning/loan-calculator and /planning/retirement-planner.
Feature hooks contain API requests for authentication, budgets, transactions,
accounts, institutions and Gmail connection behavior.
The repository also contains mock data and display-only components. Route or
component existence does not prove complete integration or authorization.

## Requirements
Use Trello for approved acceptance criteria and designs. Verify the actual flow
before documenting it as working. For cross-repository changes record both PRs
and tested commits. Financial values and date filtering must agree with the API;
do not silently implement new currency or rounding semantics in the UI.
Responsive and state screenshots accompany UI QA; see qa-reporting.md.
