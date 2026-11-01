# World of Commodities

A dark map dashboard for a personal commodities career and education tracker. The editable workbook is the source of truth; the dashboard feed is generated locally from it.

## Local setup

1. Keep your private `worldofcommodities.xlsx` in the project root. It is deliberately excluded from Git.
2. Install Python 3.10+.
3. Run `python scripts/serve.py` and open `http://127.0.0.1:8000/app/`.
4. Edit the workbook in Excel, then run `python scripts/export_tracker.py` to refresh the dashboard feed.

The workbook contains Jobs, Masters, Recruiters, Company Registry, University Registry, Office Registry, and Location Registry. Jobs use four separate fields: Business Function, Commodity, Market Geography, and Time Horizon. Location Registry holds city coordinates and editable Job Search / University Search flags; the dashboard has Opportunities, Institutions, and Locations views. Office research rows keep source, check date, confidence, and notes beside each address. The dashboard feed and source registries are local generated/private data and are excluded from Git.

`python scripts/scan_sources.py scan` checks registered URLs for reachability only. A reachable page does not establish that a role or program remains open; review the employer/source page before updating the workbook.

## SharePoint and hosting

The current application reads the local workbook export. SharePoint synchronization and hosted deployment are not configured yet. They require the destination workbook/site and an approved Microsoft Graph authentication path before the app can load shared edits.

## Privacy

Do not commit the workbook, generated dashboard feed, source registry, office research queue/results, or other personal opportunity data. The repository is intended to hold application code and setup documentation only.
