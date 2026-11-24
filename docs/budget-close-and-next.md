# Closing a budget and preparing the next one

Open **Review and close** from the active budget header. Select a calendar day in
the saved timezone, enter a timestamp with an explicit offset, or leave both
fields empty to preview through the current instant. Coverage includes the start
and excludes the preview cutoff. The planned end remains a target.

Review the backend figures and resolve any blockers before confirming. Account
sync and live transaction review can open in another tab while the preview stays
open. Refresh afterward. An unsupported recorded currency remains visible and
keeps the report incomplete. Closing freezes a report, retains transactions and
balances, and excludes the closed interval from automatic matching.
Live transaction rows show the recorded currency or indicate when it is
unavailable. Shown-row spending and maximum amounts require a single known
currency across the visible rows.

**History** reads paginated owned coverage and the saved closing report. Open
included purchase details to see closing-time values and assignment labels.
The live transaction can differ from the saved purchase. Late arrivals and
corrections appear separately, with before and after evidence when available.
Legacy history can have no saved report.

Use **Create from previous** or **Start empty** to prepare a draft independently
of the active budget. The backend copies configuration and rules with fresh item
IDs. Review saved targets and edit matching keywords under the draft item.
If a create response is lost, choose **Retry draft save**. Both creation routes
send an `operationKey` with the original request. A retry uses the same key,
route, and plan, so the server can return the same saved budget and item IDs.
**Prepare a separate draft** keeps the entered values available for editing.
The next save uses a new key and may create another draft. Once a save is
confirmed, **Retry loading budgets** only reloads the list.
**Advanced matching rules** lets you edit an existing keyword, field or
operator while keeping its ID and source. **Save matching rules** updates only
that draft item. If the save succeeds and loading fails, use **Retry loading
budgets** to refresh the saved configuration.

Activation uses the prior confirmed cutoff by default when one exists. A date
without a time means midnight UTC. An ISO timestamp with Z or a numeric offset
chooses an explicit instant. The budget shows the effective start in its saved
timezone. Closing through a calendar day still uses the saved budget timezone.
The backend validates coverage and preserves
the original purchase IDs. After activation, use **Review expenses in the active
budget** to assign eligible existing purchases explicitly.
This link follows the current active budget. Its transaction view uses budget
coverage for dates. To choose a date range, open **View all transactions**.

Developer checks exercise controlled frontend responses, including byte-for-byte
retry bodies on both draft routes, retained inputs, separate operations and
read-only recovery after a confirmed save. Browser checks for narrow layouts,
keyboard focus, dismissal and live synthetic close, report and activation flows
belong to the provisioned integration run. For TC13, drop the successful
response on each draft route and verify that transport and explicit retries
leave exactly one persisted draft per operation.
