# Transaction assignment

Transaction writes use the BE1/BE2 contract pinned for AEM-FE1 at backend
8766d5bf2c82ebf2e0a74ebfd9d33c0791ad1b2a (merged by
45631dc6dd4b5e73f2d6c1e7e9de2e0499b04ae5).

Ordinary creation omits matching metadata and permits an uncategorized transaction.
PATCH omission keeps the assignment; budgetItemId:null explicitly clears it.
The server response supplies the saved transaction and matching status. Assignment
errors appear on the page; failed creation retains form input and shows the API error.
Successful writes refresh transactions with the selected category/date/type filters
and reload budget actuals. Search text remains selected.

Assignment choices use the original transaction timestamp, the budget's inclusive
start/end timestamps and matching item type. Current budget items outside an old
transaction's period are unavailable. These choices are hints: the API validates
ownership, live parent and eligibility and can reject stale choices.

## Verification

Run the frontend checks and verify against the isolated loopback API with
brainbudget_qa_synthetic and demo mode disabled. Exercise creation, assignment,
reassignment, clearing, rejected edits, retained filters, and actuals/status
refresh. Capture desktop and mobile UI evidence from synthetic data.
