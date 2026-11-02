# World of Commodities

World of Commodities is a personal research and execution tracker for energy and commodities careers, education, recruiters, and search scope. The Excel workbook is the editable system of record. The dashboard is a generated view of that workbook.

## Project data and privacy

This GitHub repository and its GitHub Pages dashboard are public. The workbook and CV in this repository are publicly accessible and versioned. The deployed website contains a generated dashboard feed; it does not contain the workbook or CV as separate files. Public access is not restricted by `noindex` or `robots.txt`.

## Run the dashboard locally

1. Install Python 3.10 or later.
2. Keep `worldofcommodities.xlsx` in the repository root.
3. Run `python scripts/serve.py` and open `http://127.0.0.1:8000/app/`.
4. Edit the workbook in Excel. The local server regenerates the dashboard feed from the workbook when it is requested.

To regenerate the feed directly, run `python scripts/export_tracker.py`. To build the static Pages package, run `python scripts/build_site.py`; this writes to ignored `site-dist/`. GitHub Actions runs that build and deploys it when the workbook, app, or deployment scripts change on `main`.

## Workbook structure

Registries define the entities and scope that opportunities link to:

- **Scope and geography:** Location Registry, Location Rankings, Office Registry, Campus Registry.
- **Organizations and people:** Company Registry, University Registry, Recruitment Company Registry, Recruiter Registry.
- **Opportunities and execution:** Jobs, Masters, Application Routes (official speculative applications), Recruiters (interactions), Expired Roles, Research Inbox, Search Runs, Search Coverage Log, Activity Log.
- **Model inputs:** Company Rankings, Score Model, and the controlled taxonomy sheets.

Each sheet has an Owner. For registry and search-scope records this is the person responsible for maintaining them; for opportunities and interactions it is the person responsible for the application or relationship. Job records link to registered offices and locations. Multi-city vacancies are represented as one role-city row per eligible registered city. Masters records link to university and campus records; campus coordinates are stored in Campus Registry. The Location Registry is the geographic boundary: do not add or export offices/campuses outside an owner's active search scope. Chicago, Harbin, Providence, and Xi'an were explicitly excluded from Ross's scope; associated institutions should not be retained as in-scope records.

Office and campus coordinates are address/campus-level only when the source supports that precision. Otherwise the office row uses its registered city anchor and is labelled `City-level fallback`. The map may apply a small screen-space offset to coincident points for visibility; it does not alter stored coordinates. The November 3, 2026 office audit leaves 1,009 in-scope office rows: 265 address-level points, 126 building-level points, and 618 city-level fallbacks. It removed 62 office entries outside the Location Registry, four exact duplicate rows, and added separately listed Goldman Sachs offices in Hong Kong, London, and Singapore. All 19 campus rows and 29 city-scope rows remain. See the [office-location audit](research/office-location-audit-2026-11.md) for method, decisions, and limits.

For jobs, **Business** is the employer category. **Commodity**, **Market Geography**, and **Time Horizon** describe the traded product, market region, and trading/analysis horizon. **Role Function** describes the work performed. Do not put a graduate rotation, seniority, or contract duration in the market time-horizon field.

## Scores and ranking

The current owner-approved job total is a weighted average: location 25%, role fit 25%, candidate fit 15%, expected earnings 15%, desk outlook 15%, and company reputation 5%. Component scores use a 0–10 scale. The owner-ranked location score maps linearly from 10 at rank 1 to 6 at the lowest active rank; its total-score impact is capped at one point. Multi-city opportunities have separate role-city rows and are scored for each city.

Candidate fit means fit between Ross's experience and the role requirements. Role fit means how attractive the actual work is to Ross. Company reputation is distinct from role/desk outlook. Estimates need a stated basis and confidence; uncertain or incomplete totals are provisional. Do not fill missing evidence with an unlabelled neutral score. The detailed definitions, calibration examples, source standards, and daily search rules are in [Scoring and search methodology](research/score-and-search-methodology.md). Company and power/gas discovery evidence is recorded in the [research playbook](research/REPEATABLE_SEARCH_METHODS.md), with the current rating-calibration notes in [score estimation method](research/score_estimation_method_2026-11-01.md).

## Research workflow and scripts

The recurring search is a human-led research task supported by scripts. The saved [daily and on-demand prompt](research/DAILY_SEARCH_PROMPT.md) defines role and masters research, selective company inclusion, native-language discovery, cadence, evidence rules, scoring references, and closeout. A requested weekly job sweep covers all registered job cities, all ranked employers, mapped in-scope company-city pairs, and existing open roles; an interrupted sweep remains incomplete and resumes later. Office/recruiter research runs weekly and university discovery monthly. Daily completion means only that day's lighter discovery batches are covered. The research playbook and scoring methodology remain the evidence and scoring references.

At each closeout, use logged yield, time, duplicates, and missed-lead evidence to improve the prompt and repeatable methods. Date and explain reusable changes in the prompt change log; do not reduce a family's cadence after one quiet run. Unsearched families remain explicit coverage gaps.

The first attempt on 2026-11-01 was **incomplete**: it covered the 977 mapped company-city pairs and 14 cities but initially skipped 142 of 430 active ranked employers because they had no mapped city office. The resumed sweep on 2026-11-02 checked all 142 individually, reconciled all 430 employer outcomes, added 39 distinct vacancy-city rows, recorded two evergreen application routes separately, refreshed the existing role set, and moved one confirmed closed role to `Expired Roles`. See the [incomplete first-run record](research/runs/2026-11-01-weekly-job-sweep/run-summary.json) and the [completed resumed sweep](research/runs/2026-11-02-weekly-job-sweep/).

The completed sweep means each required company/city/role batch received an explicit outcome; it does not mean every listing page was readable. Inaccessible or ambiguous listings remain identified as such in the regional triage files and must be retried or checked through alternate sources on the next run. The workbook is the current opportunity set; the run archive preserves the evidence and scope limitations.

- `python scripts/prepare_daily_search.py --owner Ross --mode daily` reads the workbook's live search cities, city rankings, Company Rankings, mapped company-city pairs, open jobs, Masters rows, and past Search Coverage Log entries. It creates a dated scope snapshot and run brief under ignored `research/search_runs/`. Use `--mode weekly-jobs` for all job cities, ranked employers and open-role refresh; `--mode on-demand` for all due research families; or `--mode baseline` for the initial all-family coverage log.
- `python scripts/scan_sources.py scan` checks the reachability of URLs already in the local source registry. It does not discover companies or jobs, verify that a posting is still open, or interpret page content. `--kind job|masters|recruiter|office` narrows the check.
- `python scripts/scan_sources.py add ...` records a URL as a source lead for later review; it does not create or update a workbook row.
- `node scripts/close_search_run.mjs --payload path/to/run-summary.json` appends a completed run summary and per-source-family coverage rows to the workbook's Search Runs and Search Coverage Log sheets. The exact payload fields and cadence rules are defined in the saved prompt.
- `python scripts/export_tracker.py` turns workbook rows into the dashboard feed and applies the workbook-configured score model and registered scope.
- `python scripts/build_site.py` exports the feed and packages the static website for GitHub Pages. It is a publishing build, not a research sweep.

Search Runs stores one summary per completed run. Search Coverage Log stores one row per source-family × market/query batch, including terms/language, cadence, reviewed items, yield, elapsed time, next review and source links. This makes it possible to adjust repeat frequency from evidence without recording every result twice. Scripts prepare the scope and record the log; they do not perform the unstructured web research. A participant or auction record can identify a company to investigate, but does not by itself prove a local office, an open role, or an active trading desk.

## Published dashboard

The public dashboard is at [https://rzedward.github.io/world-of-commodities/app/](https://rzedward.github.io/world-of-commodities/app/). It supports opportunities, institutions/offices/campuses, locations, owners, search, filters, sorting, map/sidebar selection, status, source links, and interview-sharpness summaries. It only displays the generated feed; update the workbook and rebuild/deploy to change published data.

