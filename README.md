# World of Commodities

A dark map dashboard for a personal commodities career and education tracker. The editable workbook is the source of truth; the dashboard feed is generated locally from it.

## Local setup

1. Keep `worldofcommodities.xlsx` in the project root. This repository is private; the workbook is versioned here as the shared source of truth.
2. Install Python 3.10+.
3. Run `python scripts/serve.py` and open `http://127.0.0.1:8000/app/`.
4. Edit the workbook in Excel, then run `python scripts/export_tracker.py` to refresh the dashboard feed.

The workbook is the editable system of record. `Company Registry`, `University Registry`, `Office Registry`, `Campus Registry`, and `Location Registry` define entities and search scope. Jobs link to companies and to one or more offices/cities through `Job Location Links`; Masters link to universities and campuses. Unverified office leads stay in `Office Research Queue`. New findings are reviewed in `Research Inbox` and grouped by `Search Runs`; `Activity Log` records follow-up. `Taxonomy Registry` and `Search Scope` hold controlled values and search rules. Jobs use four function dimensions: Business Function, Commodity, Market Geography, and Time Horizon. The dashboard feed and personal opportunity data are generated locally and excluded from Git.

`python scripts/scan_sources.py scan` checks registered URLs for reachability only. A reachable page does not establish that a role or program remains open; review the employer/source page before updating the workbook.

## Data and privacy

The dashboard reads a generated local JSON export from the workbook. The export, search sources, and CV are excluded from Git. The CV is kept in the local `cv/` folder. Avoid copying credentials, access tokens, or unrelated personal files into the repository.

