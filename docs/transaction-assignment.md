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

AEM-FE3 adds a Needs review toggle in Transactions. It sends
`matchingStatus=needs_review` to the BE8 paginated queue (backend
5457d14c77ad61b69885a0e54555b8e9497c2e3d), composed with the existing filters.
Search still applies to the current page. Filter changes reset pagination.
Successful assignment refreshes the queue and returns to the last available page
when needed. Rejected assignments retain the saved row and show the API error.
Loading, filtered empty results and load/refresh failures have separate states;
failed loads offer a retry rather than displaying an empty queue.

Historical category IDs remain editable and clearable. When the current budget
does not supply a name, the row says Saved category. Legacy assigned rows without
an unambiguous matching status show Linked, without inventing an automatic or
manual assignment source. No historical-name request or rematching is performed.
Real synthetic API desktop/mobile evidence must be captured by the trusted host
after checkpointing; component tests use mocked API responses.

Run the frontend checks and verify against the isolated loopback API with
brainbudget_qa_synthetic and demo mode disabled. Exercise creation, assignment,
reassignment, clearing, rejected edits, retained filters, and actuals/status
refresh. Capture desktop and mobile UI evidence from synthetic data.
