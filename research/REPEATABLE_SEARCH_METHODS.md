# Power and gas company discovery methods

Last reviewed: 2026-11-07. This is a research playbook and evidence log, not an automated daily search specification. Search scope must be read from the current workbook's Location Registry and owner-specific Location Rankings at the start of each run; do not rely on a city count or a copied static city list in this document. City flags determine whether a city is in the current job or university scope; they do not prove that any company trades there.

## Fast Coverage (default weekly job search)

1. Run `python scripts/prepare_daily_search.py --owner Ross --mode weekly-jobs`. Read the current workbook-derived scope. The `company_location_pairs` list is mapping context; it is not a list of separate searches.
2. Search every active Job Search city using compact role-family/title query packs, including employers missing from Company Registry. Run Hong Kong and Singapore first, then follow location rank. Search English and relevant native-language terms in China, Japan and Korea.
3. Check every active ranked employer's global vacancy inventory once as the targeted company layer. Process the list in ordinal-rank batches; rank controls order, not inclusion. Do not inspect every office pair. A city/title pass is the safety net for employers absent from the ranking.
4. Surface specific credible vacancy listings promptly as `Lead`/`Needs_review` rows with source URL/type and found date. Verify the highest-value and uncertain leads first. Do not require a company-office match when the vacancy itself states a registered eligible city; do not infer city eligibility from an office alone.
5. Check 7-day and 30-day deadlines, status-change signals, recently changed pages, and user-managed application activity. Preserve the previous status for items not rechecked. Do not mark an item expired only because a link is broken or a search result disappears.
6. Skip review research, desk-outlook research, long compensation studies, office-address audits, recruiter network mapping, and market-participant dataset expansion during Fast Coverage. Those are separate optional/cadenced work.
7. Keep regional batches disjoint when parallel researchers are available. Return compact source-backed leads and city/query coverage; researchers do not edit the workbook. Coordinator deduplicates, sets visible confidence, updates the workbook and refreshes the dashboard.
8. Complete `employer-outcomes.json` with one explicit outcome per active ranked company, including source, result and any vacancy URL; do not let a company fall out because it has no mapped office. Report actual time by discovery, verification, workbook/dashboard stages; count cities searched, employer outcomes, leads triaged, urgent deadlines checked and role rows refreshed/deferred.

## Complete Search (explicitly requested)

Complete Fast Coverage first. The ranked employer inventory outcome ledger is already required in Fast Coverage. For Complete Search, deepen source verification, reconcile vacancies to stated registered cities, refresh every in-scope active role, and perform the additional verification families specified in the request. A mapped office-city pair never multiplies the vacancy-page check.

## Evidence standard

1. Use official market, regulator, exchange, system-operator, auction and company sources to discover candidates.
2. A participant register establishes a defined status such as registration, eligibility, membership, licence or balancing-market participation. It does not by itself establish ongoing proprietary trading, the products traded, local hiring, or an office.
3. Before adding an employer, verify the company group and actual power or gas trading/portfolio activity from its own website, reports, product disclosures, market awards or other primary evidence. Distinguish traders from utilities, generators, brokers, exchanges, network operators, consultants and software vendors.
4. Resolve legal entities to their parent/group and preserve legal-entity evidence in Research Notes. Avoid duplicate companies for subsidiaries unless they are independently relevant employers.
5. Add each confirmed physical office as its own Office Registry row. Use an official location/contact page or a reliable company filing. Do not infer an office from a market-participant mailing address, job location, customer market or subsidiary registration. Map labels should show city/country only; keep street addresses in source material if needed.
6. Keep source URL, access date, evidence type, confidence and limitations. Use “not verified” when a field cannot be supported; estimates must be labelled as estimates.

## Power discovery channels

| Region / city coverage | Primary discovery sources | What they establish / caveat |
|---|---|---|
| EU/EEA; London, Geneva, Zurich and other covered hubs | [ACER European Register](https://www.acer-remit.eu/portal/european-register?tab=0), [ENTSO-E EIC codes](https://www.entsoe.eu/data/energy-identification-codes-eic/), [JAO](https://www.jao-sa.com/) | REMIT registration, identity codes and cross-border capacity auction access/participation. Verify energy trading, specific products and offices separately. JAO access/registration alone is not evidence of executed trades. |
| UK | [Elexon party participation guide](https://bscdocs.elexon.co.uk/bsc-module/simple-guides/section-a-parties-and-participation), [Ofgem gas licensees](https://www.ofgem.gov.uk/data/list-all-gas-licensees-including-suppliers), [Xoserve UK Link](https://umbraco.xoserve.com/products-services/data-products/uk-link-system/) | Trading Party/energy-account roles, licensed gas supply/shipping, registered UK gas organisations. Separate licence status from demonstrated trading activity. |
| Singapore | [EMC market players](https://www.home.emcsg.com/about-the-market/Market-Players), [EMA industry licences](https://www.ema.gov.sg/regulations-licences/licences/industry-licences) | Wholesale market traders, retailers and licence categories. Retail or licence status alone is not proof of a trading desk. |
| Australia | [AEMO NEM participation](https://www.aemo.com.au/energy-systems/electricity/national-electricity-market-nem/participate-in-the-market), [AEMO gas participants](https://www.aemo.com.au/energy-systems/gas/gas-market-participants) | Registered electricity and gas market roles, including market-specific gas participants. Identify the participant type and market. |
| United States | [ISO-NE directory](https://www.iso-ne.com/participate/participant-asset-listings/directory), [CAISO certified scheduling coordinators](https://www.caiso.com/library/certified-scheduling-coordinators), [PJM member list](https://www.pjm.com/about-pjm/member-services/member-list) | Market directory/SC/member status. Membership is not equivalent to active trading; filter by role and validate actual energy activity and target-city office. |
| Japan | [EPRX balancing market members](https://www.eprx.or.jp/memberinfo/memberinfo.html), [JEPX membership](https://www.jepx.jp/electricpower/membership/), [METI retailer list](https://www.enecho.meti.go.jp/category/electricity_and_gas/electric/summary/retailers_list/) | Balancing-market membership, wholesale exchange membership and retail registration. These have different meanings; retain the exact status. |
| South Korea | [KPX member status](https://kpx.or.kr/menu.es?mid=a20104050000), [KPX market-participant notices](https://www.kpx.or.kr/board.es?bid=0075&list_no=&mid=a10109010100&tag=), [KPX EPSIS trading and settlement data](https://epsis.kpx.or.kr/epsisnew/selectEkmaBddBgcChart.do?menuId=040402) | KPX records include generators, direct purchasers, self-generators and other participant classes in a centrally organized market. This is a market-structure and company-discovery lead, not proof of a private commercial trading desk. For gas, review [KOGAS import/transport and terminal information](https://www.kogas.or.kr/site/eng/1030602000000) and Korean official material on direct LNG imports, terminal/storage access and supply arrangements. Establish each employer's actual trading, optimization, import or portfolio activity separately. |
| Mainland China | Provincial/municipal electricity exchange and trading-center market-access rosters, scheme/auction notices and official award results; e.g. [Beijing 2026 electricity market scheme](https://www.beijing.gov.cn/cs/gncs/zcwj/202603/t20260327_4568006.html) | Search each city/province in the local language, using market-access lists, medium/long-term and spot-market participants, green power, renewable and capacity/ancillary-service awards. Many are local, periodically published or login-gated; record coverage gaps rather than implying a single complete national list. |
| Hong Kong | [Hong Kong Government energy overview](https://www.eeb.gov.hk/en/energy/energy.html), [financial monitoring](https://www.eeb.gov.hk/en/energy/financial_monitoring.html) | A highly concentrated/regulatory structure. Distinguish the two power companies, gas suppliers, LPG suppliers and energy-service firms from open wholesale-market traders. |

## Gas discovery channels

- Start with ACER/ENTSO-E identity and REMIT records for European gas participants, then validate roles against national shipper/supplier registers and transmission-system operator capacity allocation results.
- For cross-border capacity, inspect auction and booking results from JAO and relevant national platforms (including PRISMA where applicable). A capacity booking is evidence of access/use for that product and period, not automatically proof of a local office or a permanent trading desk.
- Check LNG terminal and storage open-season/auction results, regasification and storage capacity awards, and public shipper/shipper-code lists. Record whether the award is current, historical, binding, or only prequalified.
- For Australia, use AEMO’s separate gas-market participant lists (STTM, DWGM, GSH/BB and other current market structures) and record the precise market role.
- For the UK, use Ofgem licences and Xoserve registered organisations as discovery and role evidence; distinguish shippers/suppliers from traders and verify activity independently.
- Where data is confidential or access-controlled, note the gap and use public official awards, company filings, market announcements and product pages. Never turn an absent public result into a claim of non-participation.

## Auctions and operational evidence

Track capacity auctions, balancing-service procurement and awards, CfD/FiT/renewable support auctions, ancillary services, flexibility and storage tenders. Capture auction/program, product, period, award date, awarded entity/legal name, counterparty/consortium if stated, and source. These can reveal active developers, utilities, optimizers and market participants beyond conventional trading houses. Classify the evidence precisely: an award may indicate asset development or support-scheme participation rather than commodity trading.

## Candidate and office workflow

1. Freeze a dated source snapshot or save the official source URL and query/export parameters.
2. Extract entity names, market, city/office field (if explicitly present), participation role, effective dates and identifiers.
3. Normalize legal names and aliases; deduplicate to parent group while retaining entity names/IDs in research notes.
4. Verify company activity and company category from primary sources. Add a candidate only when evidence fits the tracker’s company scope; otherwise keep it in a discovery queue with a reason.
5. Verify each city office individually. Store office and city coordinates, official source, date and confidence. Never copy one company’s address to every office or infer an office from a registry record.
6. Compare against Company Registry and Office Registry to avoid duplicates. Revisit stale records and distinguish active, historical, pending and unknown status.
7. Search opportunities separately and link each job to registered office IDs; do not treat a company’s market participation as an open vacancy.

## Search-yield learning — 2026-11-07

- A broad city/title pass found relevant listings that a company-registry-only sweep could miss. Keep those two layers separate: city discovery first, then employer/ATS coverage with explicit per-company outcomes.
- Search asset operators as well as pure traders. Energy-from-waste and flexible-generation roles can be relevant when the posting covers energy-market analysis, trading/settlements, PPAs/CfDs, dispatch or portfolio commercialization. Add the company only when its asset scale and role make a credible career path; initially rank it below direct trading/market employers and leave office research explicitly pending until verified.
- Check the employer's full current-vacancies index as well as the individual requisition. For an expired role, verify the stated deadline and whether the official application route remains live; a search index listing alone does not override a passed deadline.
- For prop firms, query both analyst/research and direct trader titles for commodity desks. Treat an explicit language gate literally: basic Mandarin does not satisfy a requirement for fluent/professional Chinese.
- Keep secondary-only or stale leads in the research log with the blocker (official requisition missing, old page, unclear hiring status, or no material trading relevance); do not turn a lead into a ranked company or active role without enough evidence.
- This city-led batch covered Hong Kong, New York, San Francisco, Singapore, Seoul, Tokyo, Shanghai, Beijing, Boston, London, Sydney, Vancouver, Zurich and Geneva. It did not complete the individual 432-company, 982 office-city pair or 169 existing-role refresh ledger. Detailed findings are saved at `research/search_runs/sr-ross-2026-11-07-001-77d7b1/city-led-discovery.md`.

For China, Japan and South Korea, pair English searches with native-language searches (Simplified Chinese, Japanese and Korean). Translate search terms and source claims into English, keep the original URL, and note the language used. Use locally published regulator, exchange, operator and company sources where available. Do not infer candidate language ability from the country or source language.

## Review and research notes

- Glassdoor: search canonical company and documented aliases; prefer current overall aggregate rating and sample count, then review themes dated within the prior two years. Note the checked date, review count, recency and conflicting themes.
- Reddit: score only when a company-specific employee/workplace discussion is identifiable. Exclude candidate interview threads, market gossip and unverified allegations from employee-review scores. If no attributable recent material exists, record “no usable evidence found” and use the tracker’s neutral placeholder consistently, clearly marked as a placeholder.
- Separate company reputation from role/desk quality. A good employer-wide score is not evidence that a particular desk is profitable or a strong fit.
- Distinguish verified evidence from estimates and state the method and source beside the field.

## Interview Sharpness measures

There is no meaningful single score across Zetamac, LeetCode, GRE and GMAT. Log each attempt with owner, platform, assessment/test, attempt type (Practice test, Official, or Not applicable), timestamp, raw score, score metric, completion percentage, time taken in minutes, mode/topic, notes and session URL. Use Practice test for a timed or structured practice exam, Official for an administered/official result, and Not applicable for work such as a Zetamac run or LeetCode exercise where that distinction does not fit. Leave inapplicable measures blank rather than entering zero. Use a score metric that fixes the unit and conditions (for example correct answers in 60 seconds, LeetCode contest rating, accepted problems, GRE Verbal scaled score, or GMAT total score); record GRE/GMAT sections separately when useful. Completion and elapsed time are separate measures, not substitutes for the raw score. Log them only when the assessment provides a meaningful denominator and comparable timing. Compare best scores and last-10 means only within the same owner/platform/assessment/attempt type/score metric. Show latest completion and time separately; a faster attempt is not automatically better without comparable task difficulty and completion. Do not derive a cross-platform composite until the user defines one.

## Coverage snapshot: 2026-11-01

- The official-source pass is under way and is not yet an exhaustive verified company/office census. Read current scope from the workbook; the registry may change after exclusions and owner ranking updates.
- ACER’s downloaded public XML snapshot is stored as `acer_market_participants_2026-11-01.zip`; the city-filtered extraction is `acer_target_city_participants_2026-11-01.csv`. It contains 184 records across London (151), Geneva (18), Zürich (9) and Zurich (6). These are participant records, not 184 unique employers; entity-to-parent deduplication and activity/office validation are required.
- Official sources reviewed include ACER, ENTSO-E, JAO, EPRX, Singapore EMC/EMA, AEMO, ISO-NE, CAISO, PJM, UK Elexon/Ofgem/Xoserve, Japan JEPX/METI, Hong Kong Government and Beijing’s market scheme. Coverage by source and city needs to be expanded and reconciled against each relevant system’s latest data.
- The next research pass should follow the owner-specific Company Rankings and Location Rankings in the workbook. Do not substitute a hand-picked city list for the current ranked scope.

## Source snapshots and provenance

- ACER raw export: `acer_market_participants_2026-11-01.zip`; extracted city records: `acer_target_city_participants_2026-11-01.csv`.
- ACER normalized-name gap queue: `acer_entity_match_queue_2026-11-01.csv`. The unmatched rows require manual parent/group, actual trading, and distinct office checks; they are not automatically new company records.
- LinkedIn network discovery notes: `linkedin_discovery_2026-11-01.md`. The previous scan saw 934 of 941 connection headlines, plus followed pages/people. Seven connection rows were not exposed in that rendered scan; do not label the sweep exhaustive until revisited.
- Record future snapshots as `research/<source>_<YYYY-MM-DD>.<ext>` and add a short row here with source, scope, date, counts, limitations and output file.

## Graduate programme search pack

Monthly/admissions-cycle programme discovery covers energy, power, gas, climate and renewables; mathematics and computational mathematics; applied AI, quantitative finance, statistics and atmospheric science; robotics/robotics engineering, machine learning, computer vision, data mining, embodied AI, autonomous systems and control systems. Search the active `University Registry` entries and their official course/admissions, scholarship, and research/supervisor pages. University Search cities are geographic validation only; they do not automatically make every university in a city an in-scope target. For mainland China use native terms such as 具身智能、机器人、机器人工程、机器视觉、计算机视觉、机器学习、数据挖掘、人工智能、自动化、控制工程. For Japan: ロボティクス、ロボット工学、機械学習、コンピュータビジョン、画像認識、データマイニング. For South Korea: 로보틱스、로봇공학、기계학습、컴퓨터비전、데이터마이닝、제어공학. Verify degree type, actual course content, campus city, language, eligibility, entry route, current deadline, fees, and international-student availability. Keep closed domestic exam cycles as On Hold research leads, not open applications.
