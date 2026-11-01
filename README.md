# World of Commodities

A dark map dashboard for a personal commodities career and education tracker. The editable workbook is the source of truth; the dashboard feed is generated locally from it.

## Local setup

1. Keep `worldofcommodities.xlsx` in the project root. This repository is public; the workbook and CV are publicly accessible and versioned here.
2. Install Python 3.10+.
3. Run `python scripts/serve.py` and open `http://127.0.0.1:8000/app/`.
4. Edit the workbook in Excel, then run `python scripts/export_tracker.py` to refresh the dashboard feed.

The workbook is the editable system of record. `Company Registry`, `University Registry`, `Recruitment Company Registry`, `Recruiter Registry`, `Office Registry`, `Campus Registry`, `Location Registry`, and `Location Rankings` define entities and search scope. Location Rankings stores one row per owner and city; equal rank values represent tied priorities, and the generated dashboard feed carries those rankings for later search automation. Jobs link to companies and one or more offices/cities; Masters link to universities and campuses; recruiter interactions link people to recruitment companies. In Jobs, Business means the company's category. Commodity, Market Geography, and Time Horizon describe what it trades, where, and over what horizon; Role Function separately records the work performed using controlled values.

Every sheet has an `Owner` field. For registry and scope records, it identifies who maintains the source, mapping or search scope; for opportunities and recruiter interactions, it identifies who is responsible for the application or relationship. `Unassigned` means responsibility still needs to be agreed. The dashboard can filter and sort by Owner wherever values exist.

Scores represent separate questions. Company, university, and recruitment-company reputation scores assess the organization. Role/desk, course/programme, and recruiter scores assess the specific opportunity or person. Candidate fit, role fit, course fit, and recruiter relationship scores remain separate. Role fit rewards direct market decision-making, trading/risk exposure, and relevant analysis; asset optimization and consulting score below trading/spec roles, while operations and middle/back office score lower. Top-fit analyst or trading roles at flagship destinations can score 10 for role fit; broader organization reputation still has its own company score. Each company has separate Glassdoor and Reddit ratings and qualitative notes, plus evidence or search links, checked date, research status, and caveats. When no attributable rating is available, 5/10 is a labelled placeholder, not an evaluated neutral rating. The company reputation synthesis weights Glassdoor 75% and lower-confidence Reddit 25%.

Job Total Score is the simple average of six owner-specific scores: candidate fit, role fit, company reputation, role/desk outlook, location fit, and expected earnings (each 1/6). For roles offered in several cities, it uses the best-ranked offered city. City rank maps linearly from rank 1 = 10 to the lowest ranked job-search city = 6. Expected Earnings Score represents approximate 10-year pay upside, anchored to first-year total compensation where available; where compensation is unavailable, the provisional score uses a role-family proxy and says so in its notes. It is an estimate, not a promise of lifetime earnings. The dashboard exposes high-to-low sorts and strict `Score > X` thresholds, and keeps component scores in the map panel while showing only Total Score in the sidebar.

The Location Registry is the allowed geographic scope. Office Registry and Campus Registry rows must link to a current Location ID; out-of-scope company offices are removed from the registry and cannot be exported as map points. Recruiter people may remain in their people registry, but the dashboard only maps them when their stated city is in scope. Recruitment companies remain in their registry and recruiter records, but only recruiter people are shown in the Institutions view. The map key is collapsed until requested.

`python scripts/scan_sources.py scan` checks registered URLs for reachability only. A reachable page does not establish that a role or program remains open; review the employer/source page before updating the workbook.

## Free sharing

The dashboard is published free on GitHub Pages at [https://rzedward.github.io/world-of-commodities/](https://rzedward.github.io/world-of-commodities/). A GitHub Actions workflow builds `site-dist` from the workbook on each relevant push to `main` and deploys it. The deployed site is public and contains the opportunity, institution, location, and interview-sharpness dashboard feed. `robots.txt` and `noindex` discourage search indexing but do not restrict access.

## Data and privacy

The dashboard reads a generated JSON export from the workbook. The generated local feed is excluded from Git; the Pages workflow rebuilds it for deployment. The CV is stored in `cv/` and included in this public repository for versioned access. Avoid copying credentials, access tokens, or unrelated personal files into the repository.

