# Matching keyword editing

AEM-FE7 uses the existing `/transactions?type=expense&limit=100` history hook.
Merchant suggestions prefer usable `normalizedMerchant`, then `rawDescription`,
then `name` from the existing transaction response, normalized with the same BE7
helper used for duplicate validation. Each field falls back when absent, non-string,
normalization-empty, numeric-only or longer than the rule limit after normalization.
Notes and relation codes are never used. Phone/domain/descriptor noise is removed;
equivalent merchant text is deduplicated in history order. Suggestions cover the returned page,
not all historical transactions. Selected equivalent merchant/contains rules are
excluded; advanced rules remain intact. Choosing a suggestion adds a `suggested`
rule, while typed text remains `user` input. Suggestions are optional and history
loading never disables editing, removal, Save or creation. Failed history shows
“Suggestions unavailable” in both editors; successful empty history shows no
suggestions or error. No matching/ranking behavior changes.

AEM-FE6 follows the merged BE7 contract at backend
6a3abf744d9c0cbfd87fb5edb3b32c3723f0c36d. The frontend mirrors server NFKC,
case, descriptor/phone/domain and punctuation normalization for duplicate checks.
Duplicates share field, operator and normalized value regardless of source.
Limits are 100 rules, 128-character nonblank unique IDs and 256-character raw
values. Normalization-empty values are rejected. API validation remains authoritative.

Save and create include pending typed text before validation, including text in
a closed create popover. Invalid batches retain the text and existing rules;
API rejection retains the draft. Enter/comma commit text outside IME composition.
Existing rules keep their IDs, raw values, fields, operators and sources through
remove-and-add editing and serialization. Empty arrays clear; omission preserves.

Cross-item overlap is not inherently an unresolved conflict. Feedback identifies
same-field, equal-normalized rules with equal source preference that can tie.
The server ranks exact normalized equality, then length, then user/learned over
suggested. Transaction-specific cross-field ambiguity is left to the server;
the editor has no transaction context or new reasons API.

Regression tests cover normalization, limits, serialization, immediate submission,
rejected drafts, composition and ranking feedback. They use synthetic data and
mocked callbacks, not a live API. After trusted checkpointing, the host must run
real synthetic API/browser checks using brainbudget_qa_synthetic and capture
captioned desktop/mobile screenshots for normal, empty, validation, API error,
loading, keyboard, IME and immediate Save/create behavior. Local component tests
do not establish AC5 or integrated acceptance.
