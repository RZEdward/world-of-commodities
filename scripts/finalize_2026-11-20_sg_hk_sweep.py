import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
run_dir = root / "research" / "search_runs" / "sr-ross-2026-11-20-001-02918d"
scope = json.loads((run_dir / "scope.json").read_text(encoding="utf-8"))
data = json.loads((run_dir / "employer-outcomes.json").read_text(encoding="utf-8"))
ranked = scope["company_rankings"]
assert len(ranked) == 438

lead_sources = {
    "co:gunvor": ("https://www.gunvorgroup.com/careers/", "Centalion/Gunvor trader/analyst openings already tracked; checked current targeted vacancy inventory."),
    "co:drw": ("https://www.drw.com/work-at-drw/listings/commodities-macro-analyst-3331696", "Two current London commodity analyst/quant vacancies; refreshed requirements and fit gaps."),
    "co:imc-trading": ("https://www.imc.com/ap/careers/jobs/5018650101", "Current Commodities Analyst Sydney plus China-focused analyst; Mandarin and 3+ years gates noted."),
    "co:squarepoint-capital": ("https://www.squarepoint-capital.com/open-opportunities?gh_jid=7335465&id=7335465", "Junior Commodities Fundamental Analyst listing names Singapore, London and Geneva; three location rows added."),
    "co:point72": ("https://careers.point72.com/CSJobDetail?jobCode=CSS-0013351&jobName=quant-researcher-power-dispatch-modeling&locale=English&location=New+York+%7C+Stamford&retURL=%2FCSCareerSearch", "Power dispatch quant opening found; senior requirements and US work-right barrier make it a stretch."),
    "co:shell-trading": ("https://shell.wd3.myworkdayjobs.com/en-US/shellcareers/job/London-York-Road/Power-Market-Analyst_R202611", "Three current London power/gas roles found; two analysis roles added, structurer retained as low-fit lead."),
    "co:exxonmobil-global-trading": ("https://jobs.exxonmobil.com/go/Trading/9512600/", "Current trading analytics roles found; Singapore Quantitative Analyst Lead V&S LNG added as a senior stretch."),
    "co:rwe-supply-trading": ("https://jobs.rwe.com/RWE/job/London-%28Senior%29-Quantitative-Risk-Analyst-City-EC2R-8HP/1454355333/", "Current London quantitative energy risk opening; added and labeled lower role-fit/support function."),
    "co:northpool": ("https://www.northpool.nl/vacancies/junior-spot-trader-id-vancouver", "Junior Vancouver intraday spot role found; Canadian right-to-work condition flagged."),
    "co:ls-power": ("https://careers-lspower.icims.com/jobs/1582/analyst-associate%2C-energy-marketing-%26-trading/job?in_iframe=1", "Current NYC energy marketing/trading Analyst/Associate role found; US work-right constraint flagged."),
    "co:alinta-energy": ("https://careers.alintaenergy.com.au/jobs/energy-spot-trader-sydney-nsw-australia-2dc68198-315b-4663-b228-935852921d2d", "Current Sydney spot trader role found; closing date and Australian work-right requirement noted."),
    "co:gent-commodity": ("https://gentcommodity.com/careers/", "Official Singapore trader opening refreshed; exact desk/product is unspecified and needs confirmation."),
    "co:koch": ("https://uk.linkedin.com/jobs/view/european-gas-analyst-strategist-at-koch-4423225482", "Specific live LinkedIn lead found for London; official ATS requisition not independently confirmed."),
}

unavailable_ids = {
    "co:jump-trading", "co:zams-asset-management", "co:prizm-capital", "co:cmt-capital-markets-trading",
}
outcome_by_id = {x["company_id"]: x for x in data["outcomes"]}
for company in ranked[:122]:
    cid = company["company_id"]
    row = outcome_by_id[cid]
    row["source_checked"] = "Employer careers/ATS inventory where available; public vacancy search fallback"
    row["vacancy_urls"] = []
    if cid in lead_sources:
        url, note = lead_sources[cid]
        row["outcome"] = "relevant_vacancy_found"
        row["source_checked"] = url
        row["vacancy_urls"] = [url]
        row["notes"] = note
    elif cid in unavailable_ids:
        row["outcome"] = "source_unavailable"
        row["notes"] = "Could not establish a complete, current employer vacancy inventory from accessible sources in this pass; no definitive no-vacancy conclusion. Recheck on next sweep."
    else:
        row["outcome"] = "no_relevant_vacancy_found"
        row["notes"] = "No qualifying current vacancy surfaced in this bounded employer-inventory screen. This is not proof that no vacancy exists; city-led discovery and the next weekly run remain safety nets."

data["outcomes"] = list(outcome_by_id.values())
(run_dir / "employer-outcomes.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

coverage = []
for city, terms, count, urls, notes in [
    ("Singapore", "city-led English search for energy/power/gas/commodities, quant, analyst, trader and market fundamentals titles; then employer and job-board searches", None,
     "https://careers.sefe.eu/job/Graduate-LNG-%28mfd%29/1568-en_GB; https://www.squarepoint-capital.com/open-opportunities?gh_jid=7335465&id=7335465; https://jobs.exxonmobil.com/ExxonMobil/job/Singapore-Quantitative-Analyst-Lead%2C-V%26S-LNG-98633/1411113600/; https://sg.indeed.com/viewjob?jk=78122388666b568e; https://gentcommodity.com/careers/",
     "City-led sweep surfaced SEFE LNG Graduate (deadline 2026-12-16), Squarepoint commodities fundamental analyst, JERA LNG/crude, PRISM LNG analyst/originator, Exxon V&S LNG lead, Phillips 66 heavies research and Gent trader. Some are aggregator-sourced; requirement gates are stated in each row."),
    ("Hong Kong", "city-led English search for energy/power/gas/commodities, market research, quant, analyst and strategy titles", None,
     "https://careers.societegenerale.com/en/job-offers/equity-research-associate-asia-energy-bernstein-hong-kong-260007C3-en; https://hk.linkedin.com/jobs/view/assistant-manager-tariff-strategy-development-at-clp-4492293327; https://www.jingan.hk/services-7",
     "Jingan commodities research role was already tracked; added CLP tariff strategy and Bernstein/Société Générale Asia Energy research. Bernstein requests fluent Mandarin and English; CLP role asks for several years of experience. False-location aggregator rows for IMC and Exxon were removed from HK map scope."),
]:
    coverage.append({
        "checked_on": "2026-11-20", "search_family": "Broad registered-city vacancy discovery",
        "source_platform": "Employer career pages/ATS; LinkedIn; public job boards and aggregators as leads",
        "market_location_scope": city, "company_category_rank_band": "All employers; city-led discovery outside ranked registry included",
        "query_pack_search_terms": terms,
        "language": "English", "cadence_used": "On-demand focused sweep",
        "items_reviewed": None, "relevant_leads": 8 if city == "Singapore" else 2,
        "new_roles": 8 if city == "Singapore" else 2, "updated_records": 0,
        "registry_candidates": 0, "duplicates": None, "rejected": None, "elapsed_minutes": None,
        "yield_evidence_notes": notes, "cadence_recommendation": "Weekly for jobs",
        "next_review_on": "2026-11-27", "source_urls": urls,
    })

for c in ranked[:122]:
    cid = c["company_id"]
    row = outcome_by_id[cid]
    new_roles_by_company = {
        "co:squarepoint-capital": 2, "co:imc-trading": 1, "co:shell-trading": 3,
        "co:point72": 1, "co:northpool": 1, "co:alinta-energy": 1,
        "co:ls-power": 1, "co:rwe-supply-trading": 1, "co:koch": 1,
    }
    updated_by_company = {"co:drw": 2, "co:imc-trading": 1, "co:gent-commodity": 1}
    coverage.append({
        "checked_on": "2026-11-20", "search_family": "Ranked employer global vacancy inventory",
        "source_platform": row["source_checked"], "market_location_scope": "All 14 registered Job Search cities; global employer inventory reconciled to registered scope",
        "company_category_rank_band": f"Rank {c['rank']} — {c['priority_tier']}",
        "query_pack_search_terms": f"Employer active jobs/careers inventory; energy, power, gas, commodities, quant, trading and market-analysis roles; rank {c['rank']} {c['company']}",
        "language": "English; local-language terms used selectively where applicable", "cadence_used": "On-demand Tier 1 sweep",
        "items_reviewed": 1, "relevant_leads": 1 if row["outcome"] == "relevant_vacancy_found" else 0,
        "new_roles": new_roles_by_company.get(cid, 0), "updated_records": updated_by_company.get(cid, 0), "registry_candidates": 0, "duplicates": 0, "rejected": None,
        "elapsed_minutes": None, "yield_evidence_notes": row["notes"],
        "cadence_recommendation": "Weekly for jobs", "next_review_on": "2026-11-27",
        "source_urls": "; ".join(row["vacancy_urls"]),
    })

payload = {
  "summary": {
    "run_id": "sr:ross:2026-11-20:001:02918d", "owner": "Ross",
    "started_on": "2026-11-20T21:36:00+04:00", "completed_on": "2026-11-20T22:06:00+04:00",
    "scope_version": "02918d2fdad2", "run_type": "On-demand Singapore/Hong Kong + Tier 1 global employer sweep",
    "run_status": "Complete for requested slice — Singapore and Hong Kong city discovery plus Tier 1 ranks 1–122; broader 14-city discovery and ranks 123–438 deferred.",
    "sources_checked": "Employer career pages and ATS inventories; LinkedIn; public job boards and aggregators used as labeled leads; official sources prioritized for validation.",
    "candidates_found": 22, "promoted": 22, "duplicates": None, "rejected": None,
    "notes": "This was the requested focused slice, not the full 14-city / 438-company Fast Coverage run. All 122 Tier 1 employers received an explicit inventory outcome; four source-access gaps are marked unavailable rather than treated as no vacancy. 22 new role-city records were added, including lower-fit/senior/stretch listings so the user can triage them; four existing in-scope rows were refreshed (two DRW, one IMC, one Gent) and two false Hong Kong location rows were excluded. Official-source gaps and role-specific gates are detailed in the dated research report. No application/interview statuses were changed.",
    "locations_covered": "Singapore; Hong Kong city-led discovery. Global vacancies screened across the 122 Tier 1 employer inventories.",
    "masters_cities_covered": "Not in scope",
    "companies_covered": "122/122 Tier 1 ranked employers (ranks 1–36 Core priorities and 37–122 Power & Gas specialists) received an explicit outcome; ranks 123–438 not searched.",
    "source_families": "Official employer careers/ATS; LinkedIn; public job boards and aggregators as leads; global ranked-employer inventory checks; Singapore/Hong Kong city-led vacancy discovery.",
    "new_roles": 22, "updated_roles": 4, "expired_roles": 0, "new_masters": 0, "updated_masters": 0,
    "companies_added": 3, "offices_added": 0, "recruiter_leads": 0, "unsolicited_routes": 0,
    "deadline_flags": 1, "elapsed_minutes": 30, "search_tool_calls": None, "codex_usage": "not surfaced",
    "coverage_gaps": "No broad title-led searches in the other 12 registered cities; ranked employers beyond rank 122 not checked; four Tier 1 inventories could not be fully confirmed; masters/university sweep not in scope. A number of new leads are secondary-source postings and are labeled in the Jobs sheet.",
    "cadence_changes": "None; next full weekly job sweep should restore all-city discovery and ranks 1–438.",
    "results_summary": "22 new role-city records; 1 existing role refreshed; 2 false HK location records excluded; 3 new company entities; 0 new office addresses. Most actionable immediate lead: SEFE Graduate LNG Singapore, deadline 2026-12-16. Strong analyst matches outside SG/HK include Shell Power Market Analyst London and Shell Power Fundamentals Forecasting London."
  },
  "coverage": coverage
}
(run_dir / "run-summary.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"outcomes_written": 122, "source_unavailable": len(unavailable_ids), "relevant_company_inventories": len(lead_sources), "coverage_rows": len(coverage), "new_roles": 22}))
