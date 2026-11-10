# Budget coverage (FE2)

The overview selects only `status=active`. It retains API spending and never
expires, replaces or initializes a budget on calendar changes. Creation and draft
activation are explicit actions. Closed records show read-only coverage summaries,
not immutable financial reports. Closing and rollover remain FE5 work.

Version 1 uses inclusive start and an optional exclusive actual cutoff. Planned
end (`plannedEndDate`, with `endDate` as a compatibility alias) is a reminder,
never an assignment boundary. Closure confirmation (`closedAt`) is separate.
Coverage summaries use concise saved-zone dates and show the timezone once per
budget. The native “Exact coverage dates” disclosure preserves local time (including
milliseconds and offset), exact ISO instants, exclusive cutoff and separate closure
confirmation. A closed cutoff at exactly local midnight shows coverage through the
preceding local day; arbitrary cutoffs retain their actual local time. This display
does not change any API boundary. Active summaries explain manual closure and the
optional planning target; drafts show planning context without an invented cutoff.
Missing legacy zones are identified as unavailable, never inferred. Legacy assignment
eligibility retains the exact inclusive saved end instant.

New budgets send the validated browser IANA timezone with explicit ISO instants.
The form uses browser-local date/time, rejects nonexistent local times, and has
an optional planned target. Updates/activation do not replace saved timezones.
Backend ownership, one-active, overlap and migration errors remain authoritative;
failed actions retain form input and require explicit retry. Pending actions are
locked against duplicate submission. A saved action followed by refresh failure
asks for reload rather than resubmitting the mutation.

Transaction category metadata includes all returned budgets for historical labels
and filters. New assignments require an active parent, compatible type and purchase
coverage. Saved unavailable categories remain visible; remembered-match controls,
rule serialization and manual metadata are unchanged.

Verification uses controlled synthetic unit/component data. Real desktop/mobile
HTTP/Mongo behavior against merged BE3 `43454f73fd64b2057d6079908d797398f1d1ae55`,
database `brainbudget_qa_synthetic`, captioned screenshots, exact-head CI and fresh
independent review/QA remain trusted downstream gates. No live Gmail is used.
