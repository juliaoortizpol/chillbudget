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

**History** reads paginated owned coverage and the saved closing report. Open
included purchase details to see closing-time values and assignment labels.
The live transaction can differ from the saved purchase. Late arrivals and
corrections appear separately, with before and after evidence when available.
Legacy history can have no saved report.

Use **Create from previous** or **Start empty** to prepare a draft independently
of the active budget. The backend copies configuration and rules with fresh item
IDs. Review saved targets before activation. Activation uses the prior confirmed
cutoff by default when one exists. An explicit start can be a date or ISO
timestamp with Z or an offset. The backend validates coverage and preserves
the original purchase IDs. After activation, use **Review expenses in the active
budget** to assign eligible existing purchases explicitly.

Developer checks exercise controlled frontend responses. Browser checks for
narrow layouts, keyboard focus, dismissal and live synthetic close, report and
activation flows belong to the provisioned integration run.
