# World of Commodities

A dark map dashboard for a personal commodities career and education tracker. The editable workbook is the source of truth; the dashboard feed is generated locally from it.

## Local setup

1. Keep `worldofcommodities.xlsx` in the project root. This repository is currently public. The workbook and CV are publicly accessible and versioned here as the shared source of truth.
2. Install Python 3.10+.
3. Run `python scripts/serve.py` and open `http://127.0.0.1:8000/app/`.
4. Edit the workbook in Excel, then run `python scripts/export_tracker.py` to refresh the dashboard feed.

The workbook is the editable system of record. `Company Registry`, `University Registry`, `Recruitment Company Registry`, `Recruiter Registry`, `Office Registry`, `Campus Registry`, and `Location Registry` define entities and search scope. Jobs link to companies and one or more offices/cities; Masters link to universities and campuses; recruiter interactions link people to recruitment companies. Jobs use four search dimensions: Business (company category), Commodity, Market Geography, and Time Horizon. Role Function separately records the work performed using controlled values.

Every sheet has an `Owner` field. For registry and scope records, it identifies who maintains the source, mapping or search scope; for opportunities and recruiter interactions, it identifies who is responsible for the application or relationship. `Unassigned` means responsibility still needs to be agreed. The dashboard can filter and sort by Owner wherever values exist.

Scores represent separate questions. Company, university, and recruitment-company reputation scores assess the organization. Role/desk, course/programme, and recruiter scores assess the specific opportunity or person. Candidate fit, course fit, and recruiter relationship scores remain separate. Glassdoor and Reddit evidence for companies is recorded by source; when both scores exist, the company reputation synthesis weights Glassdoor 75% and lower-confidence Reddit 25%. Where an evidence-based assessment is not yet available, a visible 5/10 placeholder is used and the notes explicitly say it is pending; it is not an evaluated neutral rating. Notes retain source links, dates, scope and confidence caveats. The dashboard feed and personal opportunity data are generated locally and excluded from Git.

`python scripts/scan_sources.py scan` checks registered URLs for reachability only. A reachable page does not establish that a role or program remains open; review the employer/source page before updating the workbook.

## Free sharing

The dashboard can be hosted as a static site on Cloudflare Pages from this public GitHub repository. Any deployed Pages site is public unless separately protected; the generated dashboard feed contains personal application and recruiter information, so do not share an unprotected URL. Build with `python scripts/build_site.py` and publish `site-dist` as the output directory. The generated deployment folder contains only the dashboard app and its JSON feed; it does not include the workbook or CV. The dashboard feed still contains personal application and recruiter information, so protect the Pages site with Cloudflare Access and allow only the intended email addresses before sharing its URL. A `pages.dev` URL is not private by itself. The build adds `noindex` headers as a courtesy, not as access control.

## Data and privacy

The dashboard reads a generated local JSON export from the workbook. The export and search-source cache are excluded from Git. The CV is stored in `cv/` and included in this public repository for versioned access. Avoid copying credentials, access tokens, or unrelated personal files into the repository.

