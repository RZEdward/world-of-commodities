# Search sweep optimization proposal

Date: 2026-11-07

## Why the current weekly estimate is too large

The current run brief reports 432 ranked companies, 982 mapped company-city pairs, 14 job-search cities and 169 active role rows. It turns those into three partly overlapping manual tasks: inspect employer career pages, inspect every mapped pair, and revisit every role. An employer's global vacancy inventory can cover several cities in one check; the office-pair count is a coverage reference, not 982 separate searches. A role with no change signal does not need the same full reread as a new or closing role.

The goal should be complete *discovery coverage* with human research concentrated on new, changed, urgent, ambiguous and high-value items. “Complete” must not imply manually opening thousands of pages.

## What consumes the time

This is a structural assessment from the old checklist, not a measured time study. In likely order of cost:

1. **Repeated employer-by-office checks:** the 982 mapped pairs multiplied the same global vacancy inventory across cities. This was the largest avoidable source of work.
2. **Manual refresh of all 169 existing roles:** rereading every unchanged page adds effort without adding much weekly value. Deadlines, user activity and change signals deserve attention first.
3. **Deep verification and full field completion:** validating a lead's actual city, current status, eligibility, pay and requirements can take several source visits. Do this for actionable/ambiguous leads, not every search result.
4. **Desk-outlook and Glassdoor/Reddit research:** these require qualitative interpretation, source attribution and comparison; they are slow and often inconclusive. Leave them out of Fast Coverage.
5. **Scoring, deduplication and workbook integration:** needed, but keep first-pass notes compact and avoid recalculating long narratives for every new lead.

The old 8–12 hour figure was inferred from the over-broad checklist and was not observed on a timed run.

## Proposed weekly pipeline

### 1. Automated source polling

- Maintain a source record for each ranked employer: official careers URL, ATS/vendor, board or API endpoint where available, target-city aliases, last successful poll, and last-seen requisition IDs.
- Poll supported public ATS feeds concurrently, cache responses, and compare requisition IDs and content hashes with the previous snapshot. Use ETag/Last-Modified when available.
- Emit only new, changed, removed, or errored postings for human review. An HTTP 200 or an ATS result is a lead/status signal, not proof that an application is still accepted.
- Run the same change detector over tracked role URLs. Calculate deadline windows locally; manually reopen only changed, near-deadline, expired/unclear, or user-managed application records.
- Record failures distinctly. Unsupported or blocked sources go to a manual fallback queue; do not count a reachability scan as role verification.

### 2. Broad city discovery

- Retain a weekly safety-net search for all 14 Job Search cities so employers missing from the company registry can still surface.
- Use a small, fixed query pack per city (core power/gas/trading titles; broader quant/markets titles; locally relevant terms). Search regional groups together where result quality allows, but preserve a city-level coverage result.
- Search in Simplified Chinese, Japanese, or Korean for relevant cities. Translate and assess language requirements; Ross has basic Mandarin, not working proficiency.
- Deduplicate results against requisition ID, canonical URL, employer, title and location before any full research.

### 3. Human verification, ordered by value

Manually research in this order:

1. Newly discovered Hong Kong and Singapore roles, then other new roles by location and company rank.
2. Changes from ATS polling and city discovery.
3. Deadlines within 7 days, then 30 days; roles with user activity; uncertain open/closed status.
4. High-priority employers and speculative application routes.
5. Unsupported-source fallback checks, ordered by employer rank. Lower-priority unchanged employers should not each receive a bespoke narrative search every week if their official vacancy feed was successfully polled and the city discovery layer covered them.

For a listing found on an employer's global careers page, inspect that requisition once and create one row per valid registered role-city. Do not repeat the same role-page research once per mapped office. Keep office mappings for linking and display; they are not a proxy for a vacancy in that city.

### 4. Every ranked employer in Fast Coverage

- Fast Coverage now includes one global careers/ATS inventory outcome for every active ranked company on each requested run. The list is split into rank-ordered batches of 25 to make progress and failures auditable; batches do not rotate across weeks.
- Do not search 982 mapped company-city pairs. Search an employer inventory once, then attach a vacancy only to its stated, registered application city. Log `relevant vacancy found`, `no relevant vacancy found`, `source unavailable`, or `manual fallback required` for every ranked employer.
- This is a coverage-first policy and raises human research time until ATS polling/delta adapters exist. Continue to omit reviews, desk-outlook analysis and full-field research from Fast Coverage; prioritize new HK/SG roles, actual leads, deadline/status changes, and fallback failures.

### 5. Separate maintenance cadence

- Weekly: city discovery, ATS polling, changes/new roles, deadline triage, top-ranked application routes.
- Monthly/admissions-cycle: programmes at universities in the **University Registry** with University Search enabled, plus deadline-within-30-days checks. University Search cities alone do not define which universities Ross is willing to attend.
- Monthly/event-driven: market participant, balancing, capacity, auction and company-universe expansion.
- Monthly/quarterly or event-driven: new company-universe research, recruiter/network discovery, office-address completion and reviews. Employer inventory checks remain weekly for every ranked company; inaccessible sources receive an explicit outcome and fallback attempt/queue.

## Coverage language and counts

Replace `mapped company-city pairs checked / total` as a mandatory weekly completion gate. Keep the pair count as a registry data-quality metric only. The weekly job coverage ledger should instead reconcile:

- Job Search cities with a completed broad-discovery query pack / total.
- Ranked employers with a successful official inventory poll, a recorded manual fallback, or an explicitly recorded source failure / total.
- New or changed candidate roles triaged / total.
- Active role rows: machine-checked status signal, manually verified where flagged, and untouched because no change/urgency signal / total.
- Human-verified new/changed/urgent role records and unresolved items.

An ATS poll can establish that an entry is present or absent from that feed at the poll time; it cannot establish desk activity, role fit, true city eligibility, or application acceptance where the page is ambiguous. Preserve source and access limitations.

## Time and token targets

The old 8–12 focused-hour estimate was inferred from the over-broad checklist. A small Fast Coverage timing sample was run on 2026-11-07; see below. It is useful for identifying cost centers, but it is not yet a measured full-run duration.

After the ATS inventory and delta tooling exists, use the next two weekly runs to measure actual elapsed time and results by stage. Initial targets to validate are:

- Scripted polling and deduplication: under 20 minutes of wall-clock time, mostly unattended.
- Human discovery, verification and workbook integration: 1–3 focused hours for a normal week, with more time when many new postings or source failures occur.
- Token use: send the model only changed/new candidates and compact source extracts; batch extraction/classification by region; keep unchanged registry rows out of the prompt. Save full URLs, snippets, hashes and outcomes in the run log so work can resume without rereading context.

These are engineering targets, not claims about current performance. The current repo has a reachability scanner but no ATS adapters, change snapshots or automated role-delta queue; the time savings require implementing those first.

## Fast Coverage sample timing (2026-11-07)

Sample scope: the live brief contained 14 Job Search cities, 433 ranked companies (117 in Tier 1A–1D), 173 active role records, and 35 active universities. The sample searched the Hong Kong/Singapore city pair with four broad query variants, then ran four targeted searches for InCommodities, Jane Street, Trafigura and Danske Commodities. Six candidate source pages were opened in one batch. Scope comparison identified the resulting relevant postings as already tracked, out of registered geography, or an already-expired listing; no new in-scope vacancy row was added. No workbook row was edited.

Measured command/web execution time was about 14 seconds total: scope generation 1.9s; broad city discovery 3.0s; four-employer targeted discovery 3.3s; six-page source review 2.8s; scope deduplication checks 1.4s; and dashboard export/build 1.8s. These are tool/process timings, not the full researcher wall-clock time: model reading, reasoning, interruptions and any workbook editing were not captured by those stopwatch values. Dashboard refresh was directly measured at 0.86s for data export plus 0.93s for static build. Because no new records were added, workbook-edit time was zero in this sample.

The sample confirms that web retrieval and dashboard generation are cheap. Under the former policy, targeted employer checks covered 117 Tier 1 firms plus a rotating cohort of 25. The new policy checks all 438 ranked employers each run, so the former **45–90 minute estimate no longer applies**. Extrapolating the old manual employer-check estimate (20–40 minutes for 117) to 438 implies about 75–150 minutes for company checks alone; with all-city discovery, deadline triage, lead review, and workbook updates, use **roughly 2–4 focused hours** as an initial planning estimate. This is not measured; the first actual full-policy run must record stage times so this estimate can be replaced.

| Stage | Estimated focused time |
| --- | ---: |
| Prepare live scope and urgent-role shortlist | 1–2 min |
| Broad discovery across all 14 cities | 5–10 min |
| Ranked employer inventory checks (433 firms; all ranks) | 75–150 min extrapolated, not measured |
| Verify urgent deadlines/status changes | 5–10 min |
| Deduplicate, triage, estimate and update workbook | 10–20 min |
| Export and rebuild dashboard | 2 sec measured |

The planning estimate assumes compact grouped city-query batches, one global check per ranked employer, deadline/status triage only for urgent or changed roles, short notes and quick estimates, and no review/desk-outlook research. Some companies share ATS platforms and can be checked in batches; other sources will need manual fallback. A result-heavy week or blocked source inventory can take longer. The next full weekly run should capture actual stage minutes to replace these estimates.

The current Fast Coverage target includes all 438 ranked company inventories but not all 982 mapped office-city references or a full manual reread of all 173 active roles. Those remain separate mapping and change-triage metrics.

## Implementation sequence

The recurring polling/build can run in GitHub Actions, independent of Ross's laptop. Use a scheduled workflow plus a manual `workflow_dispatch` button, and retain snapshots/results as artifacts or data commits. Scheduled Actions run from the default branch; GitHub notes that schedules can be delayed under load and that schedules in public repositories are disabled after 60 days without repository activity. Avoid scheduling at the top of an hour.

GitHub Actions can run deterministic scripts and public ATS polling, but it does not perform this researcher's open-ended web search by itself or inherit a signed-in LinkedIn session. Automating the unstructured research stage requires an LLM/API service and credential, with its own billing and data-handling choices; ChatGPT Plus and API usage have separate billing. Keep LinkedIn authenticated review and ambiguous judgment in an interactive Codex run unless a supported, authorized integration is deliberately added.

1. Stop treating the 982 office-city pairs as independent vacancy checks in the prompt and run brief.
2. Add an ATS/source inventory schema and identify ATS endpoints for high-priority employers first; progressively cover the remainder.
3. Add a concurrent poller with persistent snapshots, requisition deduplication, city normalization, and a human-review queue. Start with common public ATS APIs, then add employer-specific adapters only when needed.
4. Add a GitHub Actions workflow that runs polling on a weekly schedule and on manual dispatch, then uploads a concise delta report. Do not add model/API secrets until the user chooses that path.
5. Extend the existing role checker to compare page/feed status and deadline metadata, while keeping ambiguous cases for human review.
6. Change the run brief to report the new coverage measures above and record time/calls by stage.
7. Benchmark two consecutive weekly runs; adjust cadence or query packs only from observed yield. Preserve the 14-city safety net so optimization does not narrow discovery to known companies.

