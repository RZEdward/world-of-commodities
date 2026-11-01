# Daily and on-demand search instructions

Prompt version: 2026-11-01.3

Use this as the operating prompt for a World of Commodities research run. Read the live workbook and the linked methodology first. The workbook controls names, IDs, owners, rankings and geographic scope; this file controls search behavior. Do not substitute a copied list for the current registry.

## Copy-ready run prompt

> Run a World of Commodities **[daily / on-demand / baseline]** search for **[Owner]** as of **[date, Asia/Dubai]**. Use the workbook-generated run brief from `python scripts/prepare_daily_search.py --owner [Owner] --mode [daily|on-demand|baseline]` as the current scope snapshot. Search the web and available LinkedIn surfaces as a researcher. Scripts prepare scope, validate and log work; they do not replace unstructured research.
>
> ### A. Follow the current scope and priority
>
> 1. Read the current owner-specific Location Registry and Location Rankings. Use every city with Job Search enabled for job discovery and every city with University Search enabled for programme discovery. Never store a job office or campus outside the relevant registry scope. Do not reactivate excluded cities without owner direction.
> 2. Report newly discovered Hong Kong and Singapore roles first, even when their original posting date is older. Then report other new roles in location-rank order and company-priority order.
> 3. Search every registered job city for roles by title and role family, including employers absent from Company Registry. This broad city sweep is the safety net against registry omissions. Use the registered company list as an additional targeted search layer, not as the boundary of job discovery.
> 4. Search all roles that could reasonably fit Ross’s profile, including power/gas analysis, forecasting, modelling, trading, quantitative research, quant trading, portfolio/asset optimization, market fundamentals, energy research, and adjacent commodities or quantitative roles. Do not restrict the run to the current company registry or to exact title matches. Do not omit low-fit roles solely because of fit; score and label them.
> 5. In China, Japan and South Korea, search in English and the relevant native language: Simplified Chinese for mainland China, Japanese for Japan, and Korean for South Korea. Translate queries and source material as needed. Ross is learning Mandarin and does not read Japanese or Korean, so explain material non-English findings in English and preserve the original source link and translated search terms. Do not assume language fluency for any job requirement; record the employer’s stated requirement.
>
> ### B. Search efficiently without losing coverage
>
> 1. Run a broad location-led query pack for every Job Search city, using title families and synonyms rather than one narrow search. Search city + role family + hiring/careers terms, and search native-language equivalents for China, Japan and South Korea. Capture the query pack and results in Search Coverage Log. Use search date/recency limits where available, but do not miss a still-open older listing first discovered today.
> 2. Do a deeper Hong Kong and Singapore pass on every run: broad title searches, employer careers/ATS pages, LinkedIn jobs and company/recruiter posts, and relevant specialist recruiters. This is the first section of the report.
> 3. Search Company Rankings in rank order. Check the owner’s Tier 1A/1B owner priorities, major commodity houses, and relevant power/quant trading firms each run. Rotate lower-ranked company career pages and market categories according to Search Coverage Log and `Next Review On`; maintain broad city searches every run so the rotation does not become a blind spot. For a company without a credible relevant desk, do not spend time searching every office.
> 4. Refresh live open roles on each run, prioritizing postings with deadlines within 30 days, recent source changes, or user-managed application activity. The URL scanner can flag reachable/unreachable pages but cannot tell whether the role remains open. Open and interpret the employer/recruiter page before changing status.
> 5. Search official market-participation and operating data for registry discovery on a rotating or event-driven cadence, not as a repeated daily ritual. Use the applicable regulator, exchange, system operator, balancing mechanism, transmission/storage/LNG capacity auction, and FiT/CfD/renewables/ancillary-service sources. Record what the source proves and does not prove. Recheck a source when it publishes new data or the log says it is due.
> 6. Search unsolicited application routes for high-priority employers on a weekly or event-driven cadence. Include a route only if an official employer page explicitly accepts general, speculative or talent-pool applications. Store verified routes in the workbook’s `Application Routes` sheet, separate from vacancies, with Company ID, route type, disciplines, eligible locations, URL, materials, retention/deadline terms, checked date, status and next review. Check InCommodities’ trader and quant routes and similar routes at ranked employers; do not assume a link remains live.
> 7. Search and refresh relevant masters programmes on a monthly/admissions-cycle cadence, and immediately recheck programmes with a deadline within 30 days. Include energy, power, gas, climate/renewables, mathematics, applied/computational mathematics, applied AI, quantitative finance, statistics, atmospheric science, and closely relevant computational or physical-science programmes. Search only universities/campuses in the current University Search scope. Use official university/programme/admissions/scholarship pages for course facts, eligibility, tuition, living costs, intake and deadlines. Search terms should include local-language equivalents for mainland China, Japan and South Korea.
> 8. Review recruiter-company and recruiter-person discovery, LinkedIn connections/following, office-by-office mapping, and Glassdoor/Reddit research on a rotating cadence rather than redoing each daily. Prioritize high-ranked companies and cities, active job leads and the outstanding office queue. Log batch size and yield. Use the existing review-calibration method; do not infer a score from an unrelated discussion.
>
> ### C. Keep company scope selective
>
> Add a new company to Company Registry only when evidence suggests it is an employer Ross should realistically track: a credible power/gas/commodities trading, market-making, investment, or decision-support desk; a material market role; and a plausible career/compensation path. A major energy desk at a diversified firm can qualify. A small consultancy with only loose energy adjacency and weak apparent compensation does not qualify just because it publishes energy content.
>
> Evidence can include official market/operator data, a company’s own trading/careers/product statements, a credible employee/company LinkedIn post, or reliable industry reporting. A lead can be provisional; record exact evidence and confidence. For borderline small firms, use Research Inbox with a reason and do not promote it into the standing registry until the relevance test is met. Do not create duplicate company rows for legal subsidiaries unless they are distinct relevant employers. Add each confirmed target-city office individually and only within the owner’s Location Registry.
>
> ### D. Select and verify roles
>
> Search employer career pages and their linked ATS first; also search LinkedIn Jobs/company posts, credible recruiter/agency listings, and established aggregators. LinkedIn and recruiter listings are credible leads. Aggregator results are discovery/context and should be noted with their link; verify live availability at the employer when possible. Preserve multiple useful source URLs.
>
> Treat a role as new when it is first discovered since the last run, regardless of its posting date. Deduplicate copies of the same requisition. If a role accepts applications in several registered cities, create one role-city row for each city and link it to that city’s registered office(s). Do not infer an application city from a company office alone. If the employer does not state a field, write “Not stated by employer”; estimate only when evidence supports a bounded estimate, with basis and confidence.
>
> For every role, capture title, employer/Company ID, city/Office ID, posting URL, source type, date found, posted date if stated, deadline, owner, user-managed status, requirements, years of experience, role function, company category, commodity, market geography, market/trading time horizon, compensation expectation (USD/year), fit and scoring notes. Do not put contract duration or graduate rotation length in Time Horizon. Preserve existing application/interview statuses unless Ross supplies an update. Move a role to Expired Roles after the deadline unless the live posting explicitly still accepts applications. Flag deadlines within 7 days and 30 days.
>
> ### E. Search and refresh masters programmes
>
> Search for suitable programmes across the subject areas in section B, including scholarships and funded routes where relevant. A programme must have a credible link to Ross’s goals, not merely contain a generic energy elective. Capture official course name, university, campus, registered city, duration, instruction language, eligibility, intake, application deadline, tuition/year, estimated living costs/year, total-cost explanation, funding route, source URL, date checked, owner, and next action. Keep university reputation separate from course/programme quality and course fit. If fees or living costs are not published, provide a dated estimate with source/basis or say why no reliable estimate is possible.
>
> ### F. Score, document, and maintain state
>
> Follow `research/score-and-search-methodology.md` and the Score Model sheet. Job Total Score weights are location 25%, role fit 25%, candidate fit 15%, expected earnings 15%, desk outlook 15%, and company reputation 5%. Candidate fit is Ross’s fit to the requirements; role fit is how desirable the actual work is to Ross. Keep company reputation distinct from the specific desk outlook. Multi-city roles receive separate city scores. Use the CV-based calibration in the methodology; do not reward a role for a broad “energy” label when its actual commodity/work is unfamiliar.
>
> Estimate missing values when there is a defensible basis, state the method, confidence and source, and mark totals provisional when an estimate materially affects them. Do not invent an “average” placeholder. Glassdoor and Reddit are separate, company-wide signals; Reddit must be interpreted relative to company category, reviewer standards, role level, sample quality, date and attribution. Use the dynamic observed-score median for missing-platform calibration described in the score method; never hardcode a conversion factor. The company rank controls search order only, not a score input.
>
> Store source URL, checked date, exact claim, language/query pack, evidence type, confidence, and limitations. Put unverified company/programme/role leads in Research Inbox rather than silently promoting them to verified data. Maintain Search Runs and Search Coverage Log for each completed run.
>
> ### G. Close the run and refresh the dashboard
>
> Close with a concise report in this order: (1) new Hong Kong/Singapore roles, (2) other new roles by location and company rank, (3) role changes, deadlines within 7/30 days and expiries, (4) new masters programmes, (5) companies/offices/recruiter changes, (6) searches not completed and coverage gaps, (7) sources with low or high yield and proposed cadence changes. State elapsed time and number of search queries/tool calls. Record Codex usage only if the product exposes it; otherwise write “not surfaced” rather than guessing.
>
> Append one Search Runs summary row and one Search Coverage Log row per source-family × market/query batch, not one row per search result. Record queries/pages reviewed, relevant leads, promoted rows, duplicates, rejected leads, elapsed minutes, next review date, cadence recommendation, exact search-language/query pack and source links. Do not log a batch as checked if it was not searched; list deferred due batches as coverage gaps so they remain due. After workbook changes, run `python scripts/export_tracker.py`, then `python scripts/build_site.py` or refresh the local dashboard with `python scripts/serve.py`. Confirm that the data export completed and the dashboard feed reflects the run. Do not report the run as closed until the dashboard refresh has succeeded.

## Search cadence and learning rule

These are starting cadences; Search Coverage Log records evidence for adjusting them:

- **Every run:** broad title-led search of all registered job cities; deeper Hong Kong/Singapore scan; refresh active roles and 7/30-day deadline checks; top-priority employers.
- **Weekly rotation:** lower-ranked employer career/ATS batches, unsolicited application routes, recruiter/company LinkedIn discovery, and batches of the office-research queue.
- **Monthly or admissions-cycle:** masters discovery/refresh, lower-priority company-category coverage, and official market-participation datasets whose records update periodically.
- **Event-driven:** new auction/market notices, regulator releases, official company expansion or desk news, and a posting or status signal.
- **Quarterly or when new evidence appears:** Glassdoor/Reddit company reputation review. Do not spend daily effort searching for unchanged reviews.

Do not downgrade a useful search family after one quiet run. Consider reducing frequency only after at least three comparable, logged runs show low yield, and retain a periodic check or event trigger. Increase frequency after meaningful yield, a change in source publication schedule, or a user request. Keep a separate on-demand full pass available.

## Evidence and discovery references

- [Scoring and search methodology](score-and-search-methodology.md) defines score meanings, weights, city ranking, candidate fit and search-state rules.
- [Power and gas research playbook](REPEATABLE_SEARCH_METHODS.md) documents market-participation, auction, company, office and review evidence sources and their limitations.
- [Score-estimation method](score_estimation_method_2026-11-01.md) defines the current review-score interpretation and dynamic missing-score calibration.
- For South Korea, use the [KPX member status](https://kpx.or.kr/menu.es?mid=a20104050000), [KPX electricity-market participant notices](https://www.kpx.or.kr/board.es?bid=0075&list_no=&mid=a10109010100&tag=), and [KPX EPSIS trading/settlement data](https://epsis.kpx.or.kr/epsisnew/selectEkmaBgcChart.do?menuId=040402) as market-structure and participant leads. These records include generators and other member types; they do not establish a commercial trading desk, an open market, or a Seoul office. For gas, check KOGAS and relevant official import, storage/terminal, and supply material; Korea's gas contracting and LNG activity must be evidenced at the company level before labeling a firm as a trader.

## Search Coverage Log fields

Each row represents a repeatable source-family and market/query batch. Use the same family and scope labels between runs so yield is comparable. Efficient query packs may combine cities or source platforms, but record actual coverage; do not mark an unsearched city or family as checked.

`Run ID`; `Checked On`; `Search Family`; `Source / Platform`; `Market / Location Scope`; `Company Category / Rank Band`; `Query Pack / Search Terms`; `Language`; `Cadence Used`; `Items Reviewed`; `Relevant Leads`; `New Roles`; `Updated Records`; `Registry Candidates`; `Duplicates`; `Rejected`; `Elapsed Minutes`; `Yield / Evidence Notes`; `Cadence Recommendation`; `Next Review On`; `Source URLs`.

Run-level elapsed time and usage visibility live in Search Runs. Search Coverage Log records enough detail to decide whether a source family should be daily, weekly, monthly, event-driven, or paused. Keep the search query/result batch aggregated; do not turn the log into a copy of every result.

## Learning loop and prompt maintenance

At the close of every run, review Search Runs and Search Coverage Log against actual source yield, time cost, duplicate rate, and the reason useful leads were found or missed. Feed repeatable lessons into the next run: improve query wording and native-language synonyms, reorder sources, add a reliable source family, clarify evidence checks, or adjust cadence. Update this prompt and any affected playbook/script when the change is reusable; put the date, version, reason, and affected section in the change log below. Keep the owner-approved scope, scoring weights, inclusion threshold, and application-status rules intact unless Ross changes them. A single quiet run is not enough to reduce coverage: use the existing three-comparable-runs rule. Leave unsearched batches explicitly marked as gaps; never imply complete coverage. At each run's closeout, refresh the dashboard feed and static build, and record whether that succeeded.

### Prompt change log

- 2026-11-01 · v1.3 · Added a per-run learning loop with dated prompt changes and a three-comparable-runs minimum before reducing cadence. Added the `Application Routes` registry to the weekly search and closeout workflow.



