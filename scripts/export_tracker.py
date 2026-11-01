"""Export the opportunity sheets in worldofcommodities.xlsx to the map feed."""
from __future__ import annotations

from datetime import date, datetime, timezone
from pathlib import Path
import json
import re
import zipfile
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BOOK = ROOT / "worldofcommodities.xlsx"
OUTPUT = ROOT / "data" / "opportunities.json"
ROLE_RESULTS = ROOT / "data" / "sources" / "role-search-results.json"
NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main", "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships"}

# Coordinates are for the supported target cities/campuses. City centers make
# approximate map pins; source opportunity location text remains in each popup.
PLACES = {
    "singapore": (1.3521, 103.8198), "hong kong": (22.3193, 114.1694), "tokyo": (35.6762, 139.6503),
    "osaka": (34.6937, 135.5023), "shanghai": (31.2304, 121.4737), "hangzhou": (30.2741, 120.1551),
    "beijing": (39.9042, 116.4074), "sydney": (-33.8688, 151.2093), "seoul": (37.5665, 126.9780),
    "london": (51.5072, -0.1276), "geneva": (46.2044, 6.1432), "zurich": (47.3769, 8.5417), "zürich": (47.3769, 8.5417),
    "new york": (40.7128, -74.0060), "nyc": (40.7128, -74.0060), "san francisco": (37.7749, -122.4194), "sf": (37.7749, -122.4194),
    "vancouver": (49.2827, -123.1207), "copenhagen": (55.6761, 12.5683), "oslo": (59.9139, 10.7522),
    "boston": (42.3601, -71.0589), "cambridge, massachusetts": (42.3736, -71.1097), "newcastle": (54.9783, -1.6178), "princeton": (40.3573, -74.6672),
    "new haven": (41.3083, -72.9279), "oxford": (51.7520, -1.2577), "cambridge": (52.2053, 0.1218),
    "shenzhen": (22.5431, 114.0579), "palo alto": (37.4419, -122.1430), "stanford": (37.4275, -122.1697),
}

def text_cell(cell: ET.Element, shared: list[str]) -> str:
    typ = cell.attrib.get("t")
    if typ == "inlineStr":
        return "".join(t.text or "" for t in cell.findall(".//m:t", NS))
    value = cell.find("m:v", NS)
    if value is None:
        return ""
    if typ == "s":
        return shared[int(value.text)]
    return value.text or ""

def col_index(cell_ref: str) -> int:
    letters = re.match(r"[A-Z]+", cell_ref).group(0)
    n = 0
    for char in letters:
        n = n * 26 + ord(char) - 64
    return n - 1

def read_sheets() -> dict[str, list[dict[str, str]]]:
    with zipfile.ZipFile(BOOK) as book:
        shared: list[str] = []
        if "xl/sharedStrings.xml" in book.namelist():
            root = ET.fromstring(book.read("xl/sharedStrings.xml"))
            shared = ["".join(t.text or "" for t in si.findall(".//m:t", NS)) for si in root.findall("m:si", NS)]
        wb = ET.fromstring(book.read("xl/workbook.xml"))
        rels = ET.fromstring(book.read("xl/_rels/workbook.xml.rels"))
        targets = {rel.attrib["Id"]: rel.attrib["Target"].lstrip("/") for rel in rels}
        result = {}
        for sheet in wb.find("m:sheets", NS):
            name = sheet.attrib["name"]
            target = targets[sheet.attrib[f"{{{NS['r']}}}id"]]
            target = target if target.startswith("xl/") else f"xl/{target}"
            root = ET.fromstring(book.read(target))
            rows = root.findall(".//m:sheetData/m:row", NS)
            if not rows:
                result[name] = []
                continue
            header_cells = {col_index(c.attrib["r"]): text_cell(c, shared).strip() for c in rows[0].findall("m:c", NS)}
            headers = [header_cells.get(i, "") for i in range(max(header_cells, default=-1) + 1)]
            records = []
            for row in rows[1:]:
                values = {col_index(c.attrib["r"]): text_cell(c, shared).strip() for c in row.findall("m:c", NS)}
                record = {header: values.get(i, "") for i, header in enumerate(headers) if header}
                if any(record.values()):
                    records.append(record)
            result[name] = records
        return result

def key(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", name.strip().lower()).strip("_")

def point_for(value: str) -> tuple[float, float] | None:
    value = value.strip()
    match = re.fullmatch(r"\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*", value)
    if match:
        lat, lon = map(float, match.groups())
        if -90 <= lat <= 90 and -180 <= lon <= 180:
            return lat, lon
    low = value.lower()
    for city, coords in PLACES.items():
        if re.search(rf"(?<![a-z]){re.escape(city)}(?![a-z])", low):
            return coords
    return None

def taxonomy_for(record: dict[str, str]) -> dict[str, str]:
    """Normalize legacy Function / Market into the agreed four-part taxonomy."""
    legacy = record.get("Function / Market", "")
    role = record.get("Role", "").lower()
    parts = re.split(r"\s+-\s+", legacy, maxsplit=1)
    head = parts[0].strip() if parts else ""
    tail = parts[1].strip() if len(parts) > 1 else ""
    descriptor = f"{head} {tail} {role}".lower()

    if "trading operations" in legacy.lower() or "trade support" in role or "operations analyst" in role or "assistant" in role:
        function = "Trading Operations"
    elif "quantitative research" in role or "quant researcher" in role:
        function = "Quantitative Research"
    elif "consult" in role:
        function = "Consulting"
    elif "strategist" in role:
        function = "Trading Strategy"
    elif "sales trader" in role or "origination" in role:
        function = "Origination & Sales Trading"
    elif "trading analyst" in role:
        function = "Trading Analytics"
    elif "trader" in role:
        function = "Trading"
    elif "analyst" in role:
        function = "Market Analysis & Research"
    else:
        function = head

    if "agricultural" in descriptor or "grains" in descriptor or "oilseeds" in descriptor:
        commodity = "Agricultural commodities"
    elif "gas" in descriptor and "cross-commodity" in descriptor:
        commodity = "Gas and cross-commodity"
    elif "commodity futures" in descriptor:
        commodity = "Commodity futures"
    elif "lng" in descriptor:
        commodity = "LNG"
    elif "power" in descriptor:
        commodity = "Power"
    elif "oil" in descriptor and "carbon" in descriptor:
        commodity = "Oil and carbon"
    elif "oil" in descriptor:
        commodity = "Oil"
    elif "carbon" in descriptor:
        commodity = "Carbon"
    elif "energy" in descriptor and "commodit" in descriptor:
        commodity = "Energy and commodities"
    elif "energy" in descriptor:
        commodity = "Energy"
    elif "commodit" in descriptor:
        commodity = "Commodities"
    elif "gas" in descriptor:
        commodity = "Gas"
    else:
        commodity = ""

    geo_candidates = ["Asia-Pacific" if x.lower() in ("apac", "asia") else x
                      for x in re.findall(r"APAC|Asia|Japan|UK|US|China|Hong Kong|Singapore|Global|Sydney", tail, re.I)]
    geography = "United States" if "US" in geo_candidates else " / ".join(dict.fromkeys(geo_candidates))
    horizon = "Short to medium term" if re.search(r"short\s*/\s*medium|short to medium", descriptor) else "Short term" if "short term" in descriptor else ""
    return {"business_function": function, "commodity": commodity,
            "market_geography": geography, "time_horizon": horizon}

def locations_for(record: dict[str, str], kind: str) -> list[dict]:
    raw = record.get("Coordinates", "") if kind in ("office", "masters") else record.get("Location", "") if kind == "recruiter" else ""
    parsed = []
    if raw:
        for part in re.split(r"\s*[;|]\s*", raw):
            part = part.strip()
            named = re.match(r"([^:]+):\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)", part)
            if named:
                name, lat, lon = named.groups()
                parsed.append({"name": name.strip(), "latitude": float(lat), "longitude": float(lon)})
            else:
                point = point_for(part)
                if point:
                    name = part.strip() if kind == "recruiter" else record.get("Office", "") if kind == "office" else record.get("Campus", "") if kind == "masters" else record.get("Location", "")
                    parsed.append({"name": name, "latitude": point[0], "longitude": point[1]})
    if not parsed:
        location = record.get("Location", "") if kind in ("job", "recruiter") else record.get("Office", "") if kind == "office" else f"{record.get('Campus','')} {record.get('Location','')}"
        point = point_for(location)
        if point:
            display_name = record.get("Location", "").strip() if kind == "masters" else location.strip()
            parsed.append({"name": display_name, "latitude": point[0], "longitude": point[1]})
    unique = {}
    for item in parsed:
        unique[(item["latitude"], item["longitude"])] = item
    return list(unique.values())

def in_job_search_scope(record: dict[str, str], job_cities: list[str]) -> bool:
    location = str(record.get("Location", "")).casefold()
    return any(re.search(rf"(?<![a-z]){re.escape(city.casefold())}(?![a-z])", location) for city in job_cities)

def scoped_job_location(record: dict[str, str], job_cities: list[str]) -> str:
    """Show only searched cities when a posting lists both in- and out-of-scope offices."""
    location = str(record.get("Location", "")).casefold()
    matches = [city for city in job_cities
               if re.search(rf"(?<![a-z]){re.escape(city.casefold())}(?![a-z])", location)]
    return ", ".join(matches)

def locations_from_office_references(record: dict[str, str], office_lookup: dict[tuple[str, str], dict[str, str]]) -> list[dict]:
    company = str(record.get("Company", "")).strip().casefold()
    refs = [part.strip() for part in str(record.get("Office", "")).split(";") if part.strip()]
    parsed = []
    for reference in refs:
        office = office_lookup.get((company, reference.casefold()))
        if not office:
            continue
        raw = str(office.get("Coordinates", ""))
        match = re.search(r"(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)", raw)
        if match:
            parsed.append({"name": str(office.get("Office", reference)), "latitude": float(match.group(1)), "longitude": float(match.group(2))})
    unique = {}
    for item in parsed:
        unique[(item["latitude"], item["longitude"])] = item
    return list(unique.values())

def main() -> None:
    sheets = read_sheets()
    truth = lambda value: str(value).strip().lower() in ("true", "1", "yes")
    locations_by_id = {r.get("Location ID", ""): r for r in sheets.get("Location Registry", []) if r.get("Location ID")}
    locations_by_city = {r.get("City", "").casefold(): r for r in sheets.get("Location Registry", []) if r.get("City")}
    companies = {r.get("Company ID", ""): r for r in sheets.get("Company Registry", []) if r.get("Company ID")}
    categories = {r.get("Company", "").casefold(): r.get("Category", "") for r in sheets.get("Company Registry", [])}
    recruitment_companies = {r.get("Recruitment Company ID", ""): r for r in sheets.get("Recruitment Company Registry", []) if r.get("Recruitment Company ID")}
    recruiter_people = {r.get("Recruiter ID", ""): r for r in sheets.get("Recruiter Registry", []) if r.get("Recruiter ID")}
    universities_by_id = {r.get("University ID", ""): r for r in sheets.get("University Registry", []) if r.get("University ID")}
    office_rows = [r for r in sheets.get("Office Registry", []) if r.get("Office ID") and r.get("Company ID")]
    office_by_id = {r["Office ID"]: r for r in office_rows}
    office_by_company = {}
    for row in office_rows:
        office_by_company.setdefault(row["Company ID"], []).append(row)
    job_links = {}
    for link in sheets.get("Job Location Links", []):
        job_links.setdefault(link.get("Opportunity ID", ""), []).append(link)
    campus_by_id = {r.get("Campus ID", ""): r for r in sheets.get("Campus Registry", []) if r.get("Campus ID")}
    entries = []
    for row in sheets.get("Jobs", []):
        if row.get("Scope Status") != "In Scope":
            continue
        payload = {key(k): v for k, v in row.items() if v not in (None, "")}
        places, labels, city_labels = [], [], []
        for link in job_links.get(row.get("Opportunity ID", ""), []):
            office = office_by_id.get(link.get("Office ID", ""))
            loc = locations_by_id.get(link.get("Location ID", ""))
            if office:
                point = point_for(office.get("Coordinates", ""))
                label = office.get("Office", "")
            else:
                point = point_for(loc.get("Coordinates", "")) if loc else None
                label = link.get("City", "")
            if label and label not in labels: labels.append(label)
            city = link.get("City", "")
            if city and city not in city_labels: city_labels.append(city)
            if point: places.append({"name": label or city, "latitude": point[0], "longitude": point[1]})
        places = list({(p["latitude"], p["longitude"]): p for p in places}.values())
        title, org = row.get("Role", ""), row.get("Company", "")
        company = companies.get(row.get("Company ID", ""), {})
        payload.update({"id": row.get("Opportunity ID", ""), "company_id": row.get("Company ID", ""), "kind": "job", "title": title, "organization": org, "business": row.get("Business", categories.get(org.casefold(), "")), "role_function": row.get("Role Function", ""),
            "company_reputation_score_10": company.get("Company Reputation Score /10", ""), "company_reputation_notes": company.get("Company Reputation Notes", ""),
            "source_url": row.get("Link", ""), "location": "; ".join(city_labels), "office": "; ".join(labels), "locations": places,
            "category": categories.get(org.casefold(), ""), "verification": "verified" if row.get("Source check", "").lower() == "verified" else "needs_review"})
        payload["office_source_text"] = row.get("Office(s) (source text)", "")
        payload["registry_offices"] = row.get("Office(s) (registry links)", "")
        payload.pop("office_s_source_text", None)
        payload.pop("office_s_registry_links", None)
        payload.pop("function_market", None)
        entries.append(payload)
    for kind, sheet_name, title_col, org_col in (("masters", "Masters", "Course", "University"), ("recruiter", "Recruiters", "Name", "Company")):
        for row in sheets.get(sheet_name, []):
            payload = {key(k): v for k, v in row.items() if v not in (None, "")}
            if kind == "masters":
                campus = campus_by_id.get(row.get("Campus ID", ""), {})
                university = universities_by_id.get(row.get("University ID", ""), {})
                point = point_for(campus.get("Coordinates", "") or row.get("Coordinates", ""))
                places = [{"name": campus.get("Location", row.get("Location", "")), "latitude": point[0], "longitude": point[1]}] if point else []
                payload.update({"university_id": row.get("University ID", ""), "campus_id": row.get("Campus ID", ""), "campus": row.get("Campus", ""), "location": row.get("Location", ""),
                    "university_reputation_score_10": university.get("University Reputation Score /10", ""), "university_reputation_notes": university.get("University Reputation Notes", "")})
            else:
                places = locations_for(row, "recruiter")
                recruiter = recruiter_people.get(row.get("Recruiter ID", ""), {})
                recruitment_company = recruitment_companies.get(row.get("Recruitment Company ID", ""), {})
                payload.update({"recruiter_assessment_score_10": recruiter.get("Recruiter Assessment Score /10", ""), "recruiter_assessment_notes": recruiter.get("Recruiter Assessment Notes", ""),
                    "recruitment_company_score_10": recruitment_company.get("Recruitment Company Score /10", ""), "recruitment_company_score_notes": recruitment_company.get("Recruitment Company Score Notes", "")})
            title, org = row.get(title_col, ""), row.get(org_col, "")
            payload.update({"id": row.get("Opportunity ID", row.get("Person ID", "")), "kind": kind, "title": title, "organization": org,
                "source_url": row.get("Link", ""), "locations": places, "verification": "verified" if row.get("Confidence", "").lower().startswith("high") else "needs_review"})
            if len(places) == 1: payload.update({"latitude": places[0]["latitude"], "longitude": places[0]["longitude"]})
            entries.append(payload)
    offices = []
    for row in office_rows:
        company = companies.get(row["Company ID"], {})
        point = point_for(row.get("Coordinates", ""))
        places = [{"name": row.get("Office", ""), "latitude": point[0], "longitude": point[1]}] if point else []
        office = row.get("Office", "")
        offices.append({**{key(k): v for k, v in row.items() if v not in (None, "")}, "id": row["Office ID"], "kind": "company",
            "title": company.get("Company", row.get("Company", "")), "organization": categories.get(company.get("Company", "").casefold(), "Uncategorized"),
            "company_id": row["Company ID"], "company": company.get("Company", row.get("Company", "")),
            "owner": row.get("Owner", "") or company.get("Owner", ""),
            "category": categories.get(company.get("Company", "").casefold(), "Uncategorized"), "office": office,
            "glassdoor_score_10": company.get("Glassdoor Score /10", ""), "glassdoor_notes": company.get("Glassdoor Notes", ""),
            "reddit_score_10": company.get("Reddit Score /10", ""), "reddit_notes": company.get("Reddit Notes", ""), "reviews_checked_on": company.get("Reviews Checked On", ""), "review_research_status": company.get("Review Research Status", "Not researched"),
            "company_reputation_score_10": company.get("Company Reputation Score /10", ""), "company_reputation_notes": company.get("Company Reputation Notes", ""),
            "location": office, "locations": places})
    mapped_company_ids = set(office_by_company)
    unmapped_companies = []
    for company_id, row in companies.items():
        if company_id in mapped_company_ids: continue
        unmapped_companies.append({"id": company_id, "kind": "company", "title": row.get("Company", ""), "organization": row.get("Category", "Uncategorized"),
            "company": row.get("Company", ""), "company_id": company_id, "category": row.get("Category", "Uncategorized"), "office_research_status": row.get("Office Research Status", "Not started"),
            "owner": row.get("Owner", ""),
            "location": "Office research pending", "locations": [],
            "glassdoor_score_10": row.get("Glassdoor Score /10", ""), "glassdoor_notes": row.get("Glassdoor Notes", ""),
            "reddit_score_10": row.get("Reddit Score /10", ""), "reddit_notes": row.get("Reddit Notes", ""),
            "company_reputation_score_10": row.get("Company Reputation Score /10", ""), "company_reputation_notes": row.get("Company Reputation Notes", ""),
            "reviews_checked_on": row.get("Reviews Checked On", ""), "review_research_status": row.get("Review Research Status", "Not researched")})
    universities = []
    uni_rows = sheets.get("University Registry", [])
    for uni in uni_rows:
        campuses = [c for c in campus_by_id.values() if c.get("University ID") == uni.get("University ID")]
        places = []
        for campus in campuses:
            point = point_for(campus.get("Coordinates", ""))
            if point: places.append({"name": campus.get("Campus", "") or campus.get("Location", ""), "latitude": point[0], "longitude": point[1]})
        members = [r.get("Opportunity ID") for r in sheets.get("Masters", []) if r.get("University ID") == uni.get("University ID") and r.get("Opportunity ID")]
        universities.append({"id": uni.get("University ID", ""), "kind": "university", "title": uni.get("University", ""), "organization": uni.get("Category", "University"),
            "category": uni.get("Category", "University"), "university": uni.get("University", ""), "memberIds": members, "locations": places,
            "owner": uni.get("Owner", ""),
            "university_reputation_score_10": uni.get("University Reputation Score /10", ""), "university_reputation_notes": uni.get("University Reputation Notes", ""),
            "location": "; ".join(dict.fromkeys(p["name"] for p in places)) or "No mapped campus"})
    locations = [{"location_id": r.get("Location ID", ""), "city": r.get("City", ""), "coordinates": r.get("Coordinates", ""), "owner": r.get("Owner", ""),
        "job_search": truth(r.get("Job Search")), "university_search": truth(r.get("University Search"))} for r in sheets.get("Location Registry", []) if r.get("City")]
    data = {"brand": "World of Commodities", "updated_at": date.today().isoformat(), "source_workbook": BOOK.name,
        "opportunities": entries, "offices": offices, "unmapped_companies": unmapped_companies, "universities": universities, "locations": locations,
        "inbox": sheets.get("Research Inbox", []), "search_runs": sheets.get("Search Runs", []), "activities": sheets.get("Activity Log", []),
        "scope": sheets.get("Search Scope", []), "taxonomy": sheets.get("Taxonomy Registry", []),
        "office_research_queue": sheets.get("Office Research Queue", []),
        "recruitment_company_registry": sheets.get("Recruitment Company Registry", []),
        "recruiter_registry": sheets.get("Recruiter Registry", [])}
    OUTPUT.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    mapped = sum(len(x["locations"]) for x in data["opportunities"])
    office_points = sum(len(x["locations"]) for x in offices)
    print(f"Exported {len(entries)} opportunity records ({mapped} locations), {len(offices)} office records ({office_points} mapped offices), {len(unmapped_companies)} companies pending office research, {len(universities)} universities, and {len(locations)} search-scope cities to {OUTPUT.relative_to(ROOT)}")

if __name__ == "__main__":
    main()
