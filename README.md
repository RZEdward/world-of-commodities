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
- **Opportunities and execution:** Jobs, Masters, Recruiters (interactions), Expired Roles, Research Inbox, Search Runs, Activity Log.
- **Model inputs:** Company Rankings, Score Model, and the controlled taxonomy sheets.

Each sheet has an Owner. For registry and search-scope records this is the person responsible for maintaining them; for opportunities and interactions it is the person responsible for the application or relationship. Job records link to registered offices and locations. Multi-city vacancies are represented as one role-city row per eligible registered city. Masters records link to university and campus records; campus coordinates are stored in Campus Registry. The Location Registry is the geographic boundary: do not add or export offices/campuses outside an owner's active search scope. Chicago, Harbin, Providence, and Xi'an were explicitly excluded from Ross's scope; associated institutions should not be retained as in-scope records.

For jobs, **Business** is the employer category. **Commodity**, **Market Geography**, and **Time Horizon** describe the traded product, market region, and trading/analysis horizon. **Role Function** describes the work performed. Do not put a graduate rotation, seniority, or contract duration in the market time-horizon field.

## Scores and ranking

The current owner-approved job total is a weighted average: location 25%, role fit 25%, candidate fit 15%, expected earnings 15%, desk outlook 15%, and company reputation 5%. Component scores use a 0–10 scale. The owner-ranked location score maps linearly from 10 at rank 1 to 6 at the lowest active rank; its total-score impact is capped at one point. Multi-city opportunities have separate role-city rows and are scored for each city.

Candidate fit means fit between Ross's experience and the role requirements. Role fit means how attractive the actual work is to Ross. Company reputation is distinct from role/desk outlook. Estimates need a stated basis and confidence; uncertain or incomplete totals are provisional. Do not fill missing evidence with an unlabelled neutral score. The detailed definitions, calibration examples, source standards, and daily search rules are in [Scoring and search methodology](research/score-and-search-methodology.md). Company and power/gas discovery evidence is recorded in the [research playbook](research/REPEATABLE_SEARCH_METHODS.md), with the current rating-calibration notes in [score estimation method](research/score_estimation_method_2026-11-01.md).

## Research workflow and scripts

The recurring search is a human-led research task supported by scripts. Web research, source interpretation, discovery, cross-checking, company/office decisions, and reasoned scoring are not automated by the current scripts. Follow the workbook's current registries, owner rankings, and the two research documents above as the scope and decision rules.

- `python scripts/scan_sources.py scan` checks the reachability of URLs already in the local source registry. It does not discover companies or jobs, verify that a posting is still open, or interpret page content. `--kind job|masters|recruiter|office` narrows the check.
- `python scripts/scan_sources.py add ...` records a URL as a source lead for later review; it does not create or update a workbook row.
- `python scripts/export_tracker.py` turns workbook rows into the dashboard feed and applies the workbook-configured score model and registered scope.
- `python scripts/build_site.py` exports the feed and packages the static website for GitHub Pages. It is a publishing build, not a research sweep.

During a search, record source URL, check date, the exact evidence/claim, confidence, and limitations. Preserve source links when updating rows. A participant or auction record can identify a company to investigate, but does not by itself prove a local office, an open role, or an active trading desk. See the research playbook for official market, balancing, capacity, and support-auction sources and their limitations.

## Published dashboard

The public dashboard is at [https://rzedward.github.io/world-of-commodities/app/](https://rzedward.github.io/world-of-commodities/app/). It supports opportunities, institutions/offices/campuses, locations, owners, search, filters, sorting, map/sidebar selection, status, source links, and interview-sharpness summaries. It only displays the generated feed; update the workbook and rebuild/deploy to change published data.
