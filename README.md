# World of Commodities

A dark map dashboard for a personal commodities career and education tracker. The editable workbook is the source of truth; the dashboard feed is generated locally from it.

## Local setup

1. Keep `worldofcommodities.xlsx` in the project root. This repository is private; the workbook and CV are available only to authorized collaborators.
2. Install Python 3.10+.
3. Run `python scripts/serve.py` and open `http://127.0.0.1:8000/app/`.
4. Edit the workbook in Excel, then run `python scripts/export_tracker.py` to refresh the dashboard feed.

The workbook is the editable system of record. `Company Registry`, `University Registry`, `Recruitment Company Registry`, `Recruiter Registry`, `Office Registry`, `Campus Registry`, `Location Registry`, and `Location Rankings` define entities and search scope. Location Rankings stores one row per owner and city; equal rank values represent tied priorities, and the generated dashboard feed carries those rankings for later search automation. Jobs link to companies and one or more offices/cities; Masters link to universities and campuses; recruiter interactions link people to recruitment companies. In Jobs, Business means the company's category. Commodity, Market Geography, and Time Horizon describe what it trades, where, and over what horizon; Role Function separately records the work performed using controlled values.

Every sheet has an `Owner` field. For registry and scope records, it identifies who maintains the source, mapping or search scope; for opportunities and recruiter interactions, it identifies who is responsible for the application or relationship. `Unassigned` means responsibility still needs to be agreed. The dashboard can filter and sort by Owner wherever values exist.

Scores represent separate questions. Company, university, and recruitment-company reputation scores assess the organization. Role/desk, course/programme, and recruiter scores assess the specific opportunity or person. Candidate fit, course fit, and recruiter relationship scores remain separate. Each company has separate Glassdoor and Reddit ratings and qualitative notes, plus evidence or search links, checked date, research status, and caveats. When no attributable rating is available, 5/10 is a labelled placeholder, not an evaluated neutral rating. The company reputation synthesis weights Glassdoor 75% and lower-confidence Reddit 25%. The dashboard feed and personal opportunity data are generated locally and excluded from Git.

`python scripts/scan_sources.py scan` checks registered URLs for reachability only. A reachable page does not establish that a role or program remains open; review the employer/source page before updating the workbook.

## Free sharing

The dashboard can be hosted as a static site on Cloudflare Pages from this private GitHub repository. A deployed Pages site is public unless separately protected; the generated dashboard feed contains personal application and recruiter information, so do not share an unprotected URL. Build with `python scripts/build_site.py` and publish `site-dist` as the output directory. The generated deployment folder contains only the dashboard app and its JSON feed; it does not include the workbook or CV. Protect the Pages site with Cloudflare Access and allow only intended email addresses before sharing its URL. A `pages.dev` URL is not private by itself. The build adds `noindex` headers as a courtesy, not as access control.

## Data and privacy

The dashboard reads a generated local JSON export from the workbook. The export and search-source cache are excluded from Git. The CV is stored in `cv/` and included in this private repository for versioned access. Avoid copying credentials, access tokens, or unrelated personal files into the repository.

