"""Create a dated, workbook-driven scope package for a research run.

This script does not search the web or edit the workbook. It freezes current
scope, rankings, existing open records, and due search families for the human-
led research step. Search results are logged with close_search_run.mjs.
"""
from __future__ import annotations

import argparse
from datetime import date, datetime, timedelta
from hashlib import sha256
import json
from pathlib import Path
import re
import sys
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from export_tracker import read_sheets  # noqa: E402

OUT = ROOT / "research" / "search_runs"

CADENCE = {
    "Daily": 1,
    "Weekly": 7,
    "Monthly": 30,
    "Admissions cycle": 30,
    "Quarterly": 90,
    "Event-driven": 30,
}


def truth(value: object) -> bool:
    return value is True or str(value).strip().lower() in {"true", "yes", "1", "y"}


def as_int(value: object, fallback: int = 1_000_000) -> int:
    try:
        return int(float(str(value).replace(",", "").strip()))
    except (TypeError, ValueError):
        return fallback


def normalized(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def active_owner(row: dict[str, str], owner: str) -> bool:
    return normalized(row.get("Owner")).casefold() in {owner.casefold(), ""}


def due_families(rows: list[dict[str, str]], today: date, mode: str, batches: list[dict[str, str]]) -> list[dict[str, str]]:
    latest: dict[tuple[str, str], date] = {}
    for row in rows:
        family = normalized(row.get("Search Family"))
        area = normalized(row.get("Market / Location Scope"))
        if not family:
            continue
        try:
            checked = date.fromisoformat(normalized(row.get("Checked On"))[:10])
        except ValueError:
            continue
        latest[(family.casefold(), area.casefold())] = max(latest.get((family.casefold(), area.casefold()), checked), checked)

    output = []
    weekly_job_families = {
        "all-city role discovery",
        "open role status and deadline refresh",
        "ranked employer careers and ats",
    }
    for batch in batches:
        family, area, cadence = batch["search_family"], batch["market_location_scope"], batch["cadence"]
        days = CADENCE.get(cadence, 7)
        key = (family.casefold(), area.casefold())
        if mode == "weekly-jobs" and family.casefold() not in weekly_job_families:
            output.append({**batch, "due": False, "reason": "outside weekly-jobs sweep; use its separate cadence"})
            continue
        if mode == "on-demand" or mode == "baseline" or mode == "weekly-jobs" or cadence == "Daily":
            output.append({**batch, "due": True, "reason": "requested full scope" if mode != "daily" else "every-run coverage"})
            continue
        prior = latest.get(key)
        if not prior:
            output.append({**batch, "due": True, "reason": "no coverage history for this batch"})
        elif today - prior >= timedelta(days=days):
            output.append({**batch, "due": True, "reason": f"last logged {(today - prior).days} days ago"})
        else:
            output.append({**batch, "due": False, "reason": f"last logged {(today - prior).days} days ago; {cadence.lower()} cadence not due"})
    return output


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--owner", default="Ross")
    parser.add_argument("--mode", choices=("daily", "weekly-jobs", "on-demand", "baseline"), default="daily")
    parser.add_argument("--date", help="Run date YYYY-MM-DD; defaults to Asia/Dubai today")
    args = parser.parse_args()
    today = date.fromisoformat(args.date) if args.date else datetime.now(ZoneInfo("Asia/Dubai")).date()

    sheets = read_sheets()
    locations = [row for row in sheets.get("Location Registry", []) if active_owner(row, args.owner)]
    rankings = [row for row in sheets.get("Location Rankings", []) if normalized(row.get("Owner")).casefold() == args.owner.casefold()]
    rank_by_id = {normalized(row.get("Location ID")): as_int(row.get("Rank")) for row in rankings}
    rank_by_city = {normalized(row.get("City")).casefold(): as_int(row.get("Rank")) for row in rankings}

    job_cities = []
    for row in locations:
        city = normalized(row.get("City"))
        if not city:
            continue
        record = {"city": city, "location_id": normalized(row.get("Location ID")),
                  "rank": rank_by_id.get(normalized(row.get("Location ID")), rank_by_city.get(city.casefold())),
                  "owner": normalized(row.get("Owner")) or args.owner}
        if truth(row.get("Job Search")):
            job_cities.append(record)
    job_cities.sort(key=lambda x: (x["rank"], x["city"].casefold()))

    universities = []
    for row in sheets.get("University Registry", []):
        if not active_owner(row, args.owner) or not truth(row.get("University Search")):
            continue
        if not truth(row.get("Search Active", True)):
            continue
        universities.append({"university_id": normalized(row.get("University ID")),
                             "university": normalized(row.get("University")),
                             "category": normalized(row.get("Category")),
                             "owner": normalized(row.get("Owner")) or args.owner})
    universities.sort(key=lambda x: (x["category"].casefold(), x["university"].casefold()))
    university_ids = {row["university_id"] for row in universities if row["university_id"]}

    registry = {normalized(row.get("Company ID")): row for row in sheets.get("Company Registry", []) if normalized(row.get("Company ID"))}
    companies = []
    for row in sheets.get("Company Rankings", []):
        if normalized(row.get("Owner")).casefold() != args.owner.casefold():
            continue
        company_id = normalized(row.get("Company ID"))
        company = registry.get(company_id, {})
        if not company_id or not truth(company.get("Search Active", True)):
            continue
        companies.append({"rank": as_int(row.get("Rank")), "company_id": company_id,
                          "company": normalized(row.get("Company")) or normalized(company.get("Company")),
                          "priority_tier": normalized(row.get("Priority Tier")),
                          "category": normalized(row.get("Category")) or normalized(company.get("Category")),
                          "search_focus": normalized(row.get("Search Focus")),
                          "office_research_status": normalized(company.get("Office Research Status"))})
    companies.sort(key=lambda x: (x["rank"], x["company"].casefold()))

    job_location_ids = {city["location_id"]: city for city in job_cities if city["location_id"]}
    company_by_id = {company["company_id"]: company for company in companies}
    office_pairs: dict[tuple[str, str], list[dict[str, str]]] = {}
    for office in sheets.get("Office Registry", []):
        company_id = normalized(office.get("Company ID"))
        location_id = normalized(office.get("Location ID"))
        if company_id not in company_by_id or location_id not in job_location_ids:
            continue
        office_pairs.setdefault((company_id, location_id), []).append({
            "office_id": normalized(office.get("Office ID")),
            "office": normalized(office.get("Office")),
            "source_url": normalized(office.get("Source URL")),
            "confidence": normalized(office.get("Confidence")),
        })
    company_location_pairs = []
    for (company_id, location_id), offices in office_pairs.items():
        company = company_by_id[company_id]
        city = job_location_ids[location_id]
        company_location_pairs.append({
            "company_id": company_id, "company": company["company"], "rank": company["rank"],
            "priority_tier": company["priority_tier"], "category": company["category"],
            "location_id": location_id, "city": city["city"], "location_rank": city["rank"],
            "offices": offices,
        })
    company_location_pairs.sort(key=lambda x: (x["rank"], x["location_rank"], x["company"].casefold(), x["city"].casefold()))

    jobs = []
    for row in sheets.get("Jobs", []):
        if normalized(row.get("Scope Status")).casefold() not in {"in scope", ""}:
            continue
        status = normalized(row.get("Status"))
        if status.casefold() in {"expired", "withdrawn", "rejected", "closed"}:
            continue
        jobs.append({"opportunity_id": normalized(row.get("Opportunity ID")), "company": normalized(row.get("Company")),
                     "company_id": normalized(row.get("Company ID")), "role": normalized(row.get("Role")),
                     "location": normalized(row.get("Location")), "status": status,
                     "deadline": normalized(row.get("Deadline")), "link": normalized(row.get("Link"))})

    masters = []
    for row in sheets.get("Masters", []):
        if normalized(row.get("University ID")) not in university_ids:
            continue
        masters.append({"opportunity_id": normalized(row.get("Opportunity ID")), "university": normalized(row.get("University")),
                        "campus": normalized(row.get("Campus")), "location": normalized(row.get("Location")),
                        "course": normalized(row.get("Course")), "intake": normalized(row.get("Intake")),
                        "deadline": normalized(row.get("Deadline")), "link": normalized(row.get("Link"))})

    application_routes = []
    for row in sheets.get("Application Routes", []):
        if normalized(row.get("Owner")).casefold() not in {args.owner.casefold(), ""}:
            continue
        application_routes.append({"route_id": normalized(row.get("Route ID")), "company": normalized(row.get("Company")),
                                   "company_id": normalized(row.get("Company ID")), "route_type": normalized(row.get("Route Type")),
                                   "target_role_families": normalized(row.get("Target Role Families")),
                                   "eligible_locations": normalized(row.get("Eligible Locations")),
                                   "link": normalized(row.get("Link")), "status": normalized(row.get("Status")),
                                   "checked_on": normalized(row.get("Checked On")), "next_review_on": normalized(row.get("Next Review On"))})

    coverage = sheets.get("Search Coverage Log", [])
    pending_offices = [company for company in companies if company["office_research_status"] and "complete" not in company["office_research_status"].casefold()]
    pending_offices = pending_offices[:10]
    batches = []
    for city in job_cities:
        batches.append({"search_family": "All-city role discovery", "market_location_scope": city["city"], "cadence": "Weekly",
                        "query_pack_search_terms": "broad profile-fit role title pack; include unregistered employers", "language": "English + local language where applicable"})
    batches.extend([
        {"search_family": "Open role status and deadline refresh", "market_location_scope": "All open roles", "cadence": "Weekly", "query_pack_search_terms": "live source status; deadline <=7 and <=30 days; preserve user-managed status", "language": "Source language"},
        {"search_family": "Unsolicited application routes", "market_location_scope": "Top-ranked employers", "cadence": "Weekly", "query_pack_search_terms": "official speculative/general application and talent-pool routes", "language": "English + local language where applicable"},
        {"search_family": "Power and gas company/desk discovery", "market_location_scope": "Registered markets", "cadence": "Weekly", "query_pack_search_terms": "company desk activity; credible employer threshold; source-supported", "language": "English + local language"},
        {"search_family": "Official participant and auction data", "market_location_scope": "Relevant registered markets", "cadence": "Monthly", "query_pack_search_terms": "regulator, exchange, balancing, capacity, storage/LNG, FiT/CfD/auction releases", "language": "Official source language"},
        {"search_family": "Office-by-office verification", "market_location_scope": "Highest-ranked pending companies", "cadence": "Weekly", "query_pack_search_terms": "; ".join(c["company"] for c in pending_offices), "language": "English + local language where applicable"},
        {"search_family": "Masters discovery and admissions refresh", "market_location_scope": "; ".join(u["university"] for u in universities), "cadence": "Monthly", "query_pack_search_terms": "energy; commodities; math; applied/computational; AI; quant finance; statistics; atmospheric science; robotics", "language": "English + Chinese/Japanese/Korean where applicable"},
        {"search_family": "Recruiter company/person discovery", "market_location_scope": "; ".join(city["city"] for city in job_cities), "cadence": "Monthly", "query_pack_search_terms": "recruiter agencies and people; accessible LinkedIn connections/following; role evidence", "language": "English + local language where applicable"},
        {"search_family": "Employer reviews: Glassdoor and Reddit", "market_location_scope": "Top-ranked employers", "cadence": "Quarterly", "query_pack_search_terms": "recent attributable reviews; category/reviewer-standard context; do not infer desk outlook", "language": "English"},
    ])
    # Every ranked employer gets an outcome in every Fast Coverage run. Chunking
    # makes the work reviewable without turning each office-city pair into a
    # separate vacancy search. Rank sets order and batching only; they never
    # determine whether a company is searched.
    cohort_size = 25
    cohort_count = (len(companies) + cohort_size - 1) // cohort_size
    for batch_index in range(cohort_count):
        cohort = companies[batch_index * cohort_size:(batch_index + 1) * cohort_size]
        if not cohort:
            continue
        first_rank, last_rank = cohort[0]["rank"], cohort[-1]["rank"]
        batches.append({"search_family": "Ranked employer careers and ATS",
                        "market_location_scope": f"Ranks {first_rank}–{last_rank} ({batch_index + 1}/{cohort_count})",
                        "cadence": "Weekly", "query_pack_search_terms": "; ".join(c["company"] for c in cohort),
                        "language": "English + local language where applicable"})
    due = due_families(coverage, today, args.mode, batches)
    scope_signature = {
        "owner": args.owner,
        "job_cities": [(r["location_id"], r["rank"]) for r in job_cities],
        "university_registry": [(r["university_id"], r["category"]) for r in universities],
        "company_ranks": [(r["company_id"], r["rank"], r["priority_tier"]) for r in companies],
        "company_location_pairs": [(r["company_id"], r["location_id"]) for r in company_location_pairs],
        "prompt_version": "2026-11-07.3",
    }
    scope_version = sha256(json.dumps(scope_signature, sort_keys=True).encode()).hexdigest()[:12]
    used_ids = {normalized(row.get("Search Run ID")) for row in sheets.get("Search Runs", [])}
    ordinal = 1
    while True:
        run_id = f"sr:{args.owner.casefold()}:{today.isoformat()}:{ordinal:03d}:{scope_version[:6]}"
        out_dir = OUT / run_id.replace(":", "-")
        if run_id not in used_ids and not out_dir.exists():
            break
        ordinal += 1
    out_dir.mkdir(parents=True, exist_ok=True)
    payload = {
        "run_id": run_id, "run_date": today.isoformat(), "owner": args.owner, "mode": args.mode,
        "scope_version": scope_version, "prompt_version": "2026-11-07.3",
        "generated_at": datetime.now(ZoneInfo("Asia/Dubai")).isoformat(timespec="minutes"),
        "job_cities": job_cities,
        "university_registry": universities, "company_rankings": companies,
        "company_location_pairs": company_location_pairs,
        "open_roles_snapshot": jobs, "masters_snapshot": masters, "application_routes_snapshot": application_routes, "coverage_due": due,
        "counts": {"job_search_cities": len(job_cities), "university_registry_entries": len(universities),
                   "ranked_companies": len(companies), "companies_with_mapped_job_offices": len({r["company_id"] for r in company_location_pairs}),
                   "mapped_company_city_pairs": len(company_location_pairs), "open_roles": len(jobs), "masters_records": len(masters),
                   "application_routes": len(application_routes),
                   "coverage_batches_logged": len(coverage)},
    }
    (out_dir / "scope.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    outcomes = {
        "run_id": run_id,
        "run_date": today.isoformat(),
        "owner": args.owner,
        "outcomes": [
            {"rank": company["rank"], "company_id": company["company_id"], "company": company["company"],
             "source_checked": "", "outcome": "not_started", "vacancy_urls": [], "notes": ""}
            for company in companies
        ],
    }
    (out_dir / "employer-outcomes.json").write_text(json.dumps(outcomes, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    due_text = "\n".join(f"- {r['search_family']} · {r['market_location_scope']} — {r['cadence']}; {r['reason']}" for r in due if r["due"])
    city_text = ", ".join(f"{r['rank']}. {r['city']}" for r in job_cities)
    top_companies = "\n".join(f"{r['rank']}. {r['company']} ({r['priority_tier']})" for r in companies[:40])
    brief = f"""# Prepared research run: {run_id}

As of {today.isoformat()} · Owner: {args.owner} · Mode: {args.mode} · Prompt version: 2026-11-07.3 · Scope version: {scope_version}

Read `research/DAILY_SEARCH_PROMPT.md`, `research/score-and-search-methodology.md`, and `research/REPEATABLE_SEARCH_METHODS.md` before searching.

## Live scope from workbook

Job Search cities ({len(job_cities)}), ranked: {city_text}

Universities in active University Registry search scope ({len(universities)}): {", ".join(u["university"] for u in universities)}. Course locations come from their Campus Registry entries; do not infer target universities from cities.

Tracked, active ranked companies: {len(companies)}. Companies with an office mapped to a registered Job Search city: {len({r['company_id'] for r in company_location_pairs})}; mapped company-city pairs: {len(company_location_pairs)} (mapping reference only; not separate searches). Fast Coverage checks all ranked employer inventories once each, in {cohort_count} batches of up to {cohort_size}; rank controls order only. First 40 company priorities:\n{top_companies}

Active role records in scope: {len(jobs)}; Fast Coverage prioritizes deadline and change signals rather than manually rereading every unchanged row. Masters records to maintain: {len(masters)}. Existing application routes: {len(application_routes)}.

## Search batches due this run

{due_text or '- No separate cadence batch is due; complete all every-run batches.'}

## Closeout

Complete `employer-outcomes.json` with one explicit result per ranked employer. Prepare `run-summary.json` with run metadata, source families checked, records found/added/updated/expired, duplicates/rejections, total elapsed time, elapsed minutes by stage (discovery, verification, workbook updates, dashboard refresh), search tool-call count, any visible Codex usage, and coverage gaps. Use approximate stage minutes if exact timing is unavailable and label them approximate; never imply precision. Prepare `coverage-rows.json` as an array with one record per source-family × market/query batch actually searched. Then run `node scripts/close_search_run.mjs --payload <path-to-run-summary.json>` to append both logs to the workbook. See the prompt file for the exact log fields and final dashboard refresh commands.
"""
    (out_dir / "run-brief.md").write_text(brief, encoding="utf-8")
    print(f"Prepared {run_id}")
    print(f"Scope: {len(job_cities)} job cities, {len(universities)} universities, {len(companies)} ranked companies in {cohort_count} inventory batches, {len(company_location_pairs)} mapped company-city references, {len(jobs)} open roles")
    print(f"Due search families: {sum(1 for row in due if row['due'])}/{len(due)}")
    print(f"Brief: {out_dir / 'run-brief.md'}")
    print(f"Scope JSON: {out_dir / 'scope.json'}")
    print(f"Employer outcomes: {out_dir / 'employer-outcomes.json'}")


if __name__ == "__main__":
    main()

