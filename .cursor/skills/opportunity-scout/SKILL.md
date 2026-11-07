---
name: opportunity-scout
description: Run fast, high-coverage opportunity searches and optional deep verification for World of Commodities; maintain jobs, masters, company and recruiter research in the workbook and dashboard.
---

# Opportunity Scout

Default to **Fast Coverage**. The purpose is to surface roles Ross could plausibly end up in, quickly, so he can inspect the leads. Do not turn each weekly search into a census or delay showing a lead until every field is researched. Use **Complete Search** only when Ross asks for an exhaustive baseline or deeper audit.

## Source of truth and scope

1. The workbook is the editable source of truth. Never edit generated `data/opportunities.json` directly.
2. Read `research/DAILY_SEARCH_PROMPT.md`, current run brief/scope, and only the relevant scoring or domain reference. Use current owner-specific registries and rankings; do not rely on copied city lists.
3. Jobs: search every active Job Search city. University programmes: search University Registry rows with both `Search Active` and `University Search` enabled. A university city alone does not mean Ross is willing to attend a school there.
4. Keep jobs/campuses inside registered geography. Do not infer an application city from a corporate office or campus from a university city. Multi-city vacancies get one job-city row per valid registered application city.
5. Ross has basic Mandarin, below working proficiency, and no Japanese or Korean proficiency. Search in relevant native languages, translate results, and apply employer language requirements literally.

## Fast Coverage (default)

### Discovery

1. Search broad title and role-family queries in **every** active Job Search city, including employers missing from Company Registry. This city-first sweep is the main coverage guarantee.
2. Search for power/gas analysis, trading, forecasting, modelling, quantitative research/trading, market fundamentals, asset/portfolio optimization, energy research, and adjacent commodity/quantitative roles. Use title synonyms; do not limit to exact titles or known employers.
3. Search Hong Kong and Singapore first, then cities by owner rank. Search all cities using regional batches when possible. Use English plus Chinese/Japanese/Korean terms for relevant cities.
4. Check current listings for every active ranked employer as a targeted second layer. Rank only determines order and batching, never eligibility for a check. Record an explicit outcome for each employer. Do not inspect every company-office pair. A global careers inventory covers the employer once; a role is assigned to a city only when the listing supports it.
5. Use web search results, employer ATS/career pages, LinkedIn, recruiter listings, and aggregators for discovery. Batch queries, keep source lists compact, and use parallel regional work when available. Search results are leads, not verified application status.

### Show leads promptly

1. Add a real, specific vacancy to Jobs as a lead when a credible source identifies the employer, role, and relevant city. Put a clear `Lead — ...` state/source type in `Confidence`, preserve the discovery URL in `Link` and the date in `Date Found`, and use `Next Action` for the quick verification needed. This exports as needing review. Do not hide plausible vacancies in Research Inbox if that means Ross cannot see them in the opportunities view.
2. Use Research Inbox for ambiguous employer identity, a vague hiring rumor, market-participation evidence without a vacancy, or a result that cannot yet be matched to a real requisition.
3. Record the fast minimum: title, employer, registered city if stated, source URL and source type, date found, deadline if visible, stated experience/language gates, and a brief fit label/next action. Keep notes short. Do not block inclusion on compensation, desk outlook, review research, or complete requirements extraction.
4. Deduplicate by requisition ID/canonical URL/employer-title-city. One multi-city vacancy becomes one row per explicitly eligible registered city; do not multiply it across every mapped office.
5. Keep Hong Kong and Singapore discoveries at the top of the report, then other discoveries by location rank and company rank. Label source confidence and distinguish `Lead` from `Verified` clearly.

### Fast scoring and omitted work

- Use existing company/review values when already present; do not re-research them on every sweep.
- Give quick role-fit and candidate-fit estimates from the actual title and visible requirements using `research/score-and-search-methodology.md`. A fast estimate is allowed if clearly labelled with a short basis; it is not a hiring probability.
- Try to give a bounded first-year compensation estimate for each specific role. First use a relevant market benchmark, a close role/city comparator, or the workbook's recent comparable roles. If no direct figure is immediately available, use a clearly labelled broad market estimate with a range and low confidence; do not spend time chasing precision. Leave it blank only when even a broad estimate would be misleading. State currency, annual basis, brief basis and confidence.
- Do not research Glassdoor or Reddit in Fast Coverage. Leave new review fields blank; retain prior values without refreshing them.
- Do not research desk outlook in Fast Coverage. Leave it blank for new rows; do not invent a neutral score. Retain existing sourced values without rechecking.
- Do not force a Total Score when required components are missing. Keep the opportunity visible as a lead and label its ranking incomplete/provisional. Never fill a missing component with an unlabelled placeholder just to sort it.
- Do not spend time on detailed office addresses, exhaustive benefits, full salary breakdowns, company history, or long score notes unless needed to determine relevance, city, eligibility, or whether to apply.

### Fast coverage and status checks

- Search every active Job Search city and record each city's query-pack outcome.
- Check every active ranked employer inventory and any official feed/source already available. Chunk the rank list for reviewable work, but do not rotate or omit lower-ranked companies. Keep broad city/title searches as the safety net for employers that are not yet ranked. Don't claim an employer was checked without an outcome recorded for it.
- Prioritize existing tracked roles with deadlines within 7 days, then 30 days; application/interview activity; status-change signals; and recently changed source pages. Do not manually reread every unchanged role every week.
- For roles not revisited, preserve prior status and note that this run did not reverify them. Do not mark closed/expired from a broken link or search-result disappearance alone. Move past-deadline roles only after checking whether the live posting still accepts applications.
- Search for newly discovered postings even when their original posted date is older.

## Complete Search (optional, explicit request)

Use this when Ross requests an exhaustive baseline, comprehensive audit, or deeper research—not as the default weekly run.

1. Complete the Fast Coverage pass first so useful leads surface immediately.
2. Then inspect the full active ranked employer list in rank order. Check each employer's global career/ATS inventory once and capture the actual cities named by each vacancy. Do not repeat one employer search for every office pair.
3. Reconcile all open role rows, confirm live status, deadlines, location/eligibility and requirements with primary sources, and research bounded compensation estimates.
4. Research desk outlook and company reputation only for relevant employers/roles, using current, attributable evidence. Glassdoor/Reddit reviews and score calibration are a distinct research cost; they may be deferred to the reviews cadence unless Ross explicitly asks for them in this complete pass.
5. Do full office-by-office address verification, company-universe expansion from official market/auction sources, recruiter/network mapping, or monthly university-programme discovery only when those batches are included in the requested scope. Never silently add those families to a job-only sweep.
6. Keep row-level outcomes and source/access gaps. Office-city pairs are a registry/mapping metric, not a count of separate vacancy searches.

## University programmes

Search monthly/admissions-cycle, plus immediate checks for deadlines within 30 days. Iterate active University Registry rows; do not search every University Search city as if Ross were willing to attend any institution there. Include energy/power/gas, commodities/commodity trading, math/computational science, applied AI, quantitative finance, statistics, atmospheric science, robotics, machine learning, computer vision, data mining, autonomous systems and control. Fast mode captures course, university, registered campus/city, intake/deadline and source. Complete mode verifies language, eligibility, duration, tuition, estimated living costs, total cost, funding and application steps from official sources.

## Efficient execution and time logging

1. Use `research/DAILY_SEARCH_PROMPT.md` as the run prompt and `research/SEARCH_SWEEP_OPTIMIZATION.md` for the proposed pipeline and future automation.
2. Avoid loading the whole workbook or full historical ledgers into the model. Use the generated scope snapshot and only the rows needed for the current batch. Summarize results in compact structured batches; save evidence URLs and checkpoints to the run folder.
3. Parallelize disjoint city regions when agents are available. Each researcher returns candidates and city/query coverage, never edits the workbook. The coordinator deduplicates and updates the workbook.
4. At closeout, report city packs completed, new/changed leads triaged, urgent deadlines checked, tracked roles refreshed, deferred work, elapsed minutes by stage, and dashboard refresh result. Measure elapsed time; do not invent an ETA or imply full coverage from search-result counts.
5. Update the workbook, then run `python scripts/export_tracker.py` and `python scripts/build_site.py` (or refresh the local dashboard). State clearly if publication/deployment did not run.

## Further references

- `research/DAILY_SEARCH_PROMPT.md` — copy-ready run prompt, scope rules, search families, logs and closeout.
- `research/SEARCH_SWEEP_OPTIMIZATION.md` — fast/deep coverage model, time-saving opportunities and proposed automation.
- `research/score-and-search-methodology.md` — owner-approved score definitions and weights.
- `research/REPEATABLE_SEARCH_METHODS.md` — power/gas market, company, office and review source methods.
