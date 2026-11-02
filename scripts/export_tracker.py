"""Export the opportunity sheets in worldofcommodities.xlsx to the map feed."""
from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from pathlib import Path
import json
import re
import statistics
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

def sharpness_timestamp(value: str) -> str:
    try:
        serial = float(value)
        if serial > 20000:
            return (datetime(1899, 12, 30) + timedelta(days=serial)).isoformat(timespec="minutes")
    except (TypeError, ValueError, OverflowError):
        pass
    return value

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

def locations_for(record: dict[str, str], kind: str, locations_by_city: dict[str, dict[str, str]] | None = None) -> list[dict]:
    raw = record.get("Coordinates", "") if kind in ("office", "masters") else record.get("Location", "") if kind == "recruiter" else ""
    parsed = []
    if raw:
        for part in re.split(r"\s*[;|]\s*", raw):
            part = part.strip()
            named = re.match(r"([^:]+):\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)", part)
            if named:
                name, lat, lon = named.groups()
                if kind == "recruiter":
                    point = scoped_point_for(name, locations_by_city or {})
                    if point: parsed.append({"name": name.strip(), "latitude": point[0], "longitude": point[1]})
                else:
                    parsed.append({"name": name.strip(), "latitude": float(lat), "longitude": float(lon)})
            else:
                point = scoped_point_for(part, locations_by_city or {}) if kind == "recruiter" else point_for(part)
                if point:
                    name = part.strip() if kind == "recruiter" else record.get("Office", "") if kind == "office" else record.get("Campus", "") if kind == "masters" else record.get("Location", "")
                    parsed.append({"name": name, "latitude": point[0], "longitude": point[1]})
    if not parsed:
        location = record.get("Location", "") if kind in ("job", "recruiter") else record.get("Office", "") if kind == "office" else f"{record.get('Campus','')} {record.get('Location','')}"
        point = scoped_point_for(location, locations_by_city or {}) if kind == "recruiter" else point_for(location)
        if point:
            display_name = record.get("Location", "").strip() if kind == "masters" else location.strip()
            parsed.append({"name": display_name, "latitude": point[0], "longitude": point[1]})
    unique = {}
    for item in parsed:
        unique[(item["latitude"], item["longitude"])] = item
    return list(unique.values())

def scoped_point_for(value: str, locations_by_city: dict[str, dict[str, str]]) -> tuple[float, float] | None:
    """Resolve people only to cities explicitly present in Location Registry."""
    low = str(value or "").casefold()
    aliases = {"cambridge, ma": ("cambridge, ma", "cambridge, massachusetts", "cambridge ma"),
               "cambridge, uk": ("cambridge, uk", "cambridge uk"),
               "hong kong": ("hong kong", "kowloon"), "new york": ("new york", "nyc", "manhattan"),
               "san francisco": ("san francisco", "sf"), "zurich": ("zurich", "zürich")}
    for city, row in locations_by_city.items():
        names = aliases.get(city, (city,))
        if any(re.search(rf"(?<![a-z]){re.escape(name)}(?![a-z])", low) for name in names):
            return point_for(row.get("Coordinates", ""))
    return None

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
    job_search_location_ids = {r.get("Location ID", "") for r in sheets.get("Location Registry", []) if r.get("Location ID") and truth(r.get("Job Search"))}
    company_rows = sheets.get("Company Registry", [])
    application_routes_by_company = {}
    for route in sheets.get("Application Routes", []):
        if str(route.get("Status", "")).strip().casefold() != "active":
            continue
        company_id = str(route.get("Company ID", "")).strip()
        if company_id and route.get("Source URL"):
            application_routes_by_company.setdefault(company_id, []).append({
                "name": route.get("Route Type", "Application route"),
                "target_role_families": route.get("Target Role Families", ""),
                "url": route.get("Source URL", ""),
                "notes": route.get("Notes", ""),
            })
    company_rankings = {
        (str(r.get("Owner", "")).strip().casefold(), str(r.get("Company ID", "")).strip()): r
        for r in sheets.get("Company Rankings", [])
        if r.get("Owner") and r.get("Company ID")
    }
    # Calculate the missing-Reddit scale factor from paired observed scores on
    # each export. Imputed, indirect, and unverified Reddit scores never train it.
    observed_ratios = []
    category_observed_ratios = {}
    for row in company_rows:
        if row.get("Glassdoor Score Basis") != "Observed" or row.get("Reddit Score Basis") != "Observed":
            continue
        try:
            glassdoor = float(row.get("Glassdoor Score /10", ""))
            reddit = float(row.get("Reddit Score /10", ""))
        except (TypeError, ValueError):
            continue
        if 0 < glassdoor <= 10 and 0 <= reddit <= 10:
            observed_ratios.append(reddit / glassdoor)
    score_model = {str(r.get("Metric", "")).strip(): r.get("Value", "") for r in sheets.get("Score Model", [])}
    try:
        category_ratio_minimum = int(float(score_model.get("Minimum paired scores for category ratio", 5)))
        global_ratio_minimum = int(float(score_model.get("Minimum paired scores for global ratio", 2)))
        neutral_reddit_score = float(score_model.get("Neutral Reddit estimate when no pair exists", 6))
        reputation_category_minimum = int(float(score_model.get("Minimum observed reputation scores for category median", 5)))
        reputation_global_minimum = int(float(score_model.get("Minimum observed reputation scores for global median", 2)))
    except (TypeError, ValueError):
        category_ratio_minimum, global_ratio_minimum, neutral_reddit_score = 5, 2, 6.0
        reputation_category_minimum, reputation_global_minimum = 5, 2
    for row in company_rows:
        if row.get("Glassdoor Score Basis") != "Observed" or row.get("Reddit Score Basis") != "Observed":
            continue
        try:
            glassdoor = float(row.get("Glassdoor Score /10", ""))
            reddit = float(row.get("Reddit Score /10", ""))
        except (TypeError, ValueError):
            continue
        if 0 < glassdoor <= 10 and 0 <= reddit <= 10:
            category_observed_ratios.setdefault(row.get("Category", ""), []).append(reddit / glassdoor)
    reddit_glassdoor_ratio = statistics.median(observed_ratios) if len(observed_ratios) >= global_ratio_minimum else None
    category_reddit_glassdoor_ratios = {category: statistics.median(ratios) for category, ratios in category_observed_ratios.items() if len(ratios) >= category_ratio_minimum}
    try:
        glassdoor_weight = float(score_model.get("Glassdoor weight", 0.75))
        reddit_weight = float(score_model.get("Reddit weight", 0.25))
    except (TypeError, ValueError):
        glassdoor_weight, reddit_weight = 0.75, 0.25
    if glassdoor_weight < 0 or reddit_weight < 0 or glassdoor_weight + reddit_weight <= 0:
        glassdoor_weight, reddit_weight = 0.75, 0.25
    weight_total = glassdoor_weight + reddit_weight
    glassdoor_weight /= weight_total
    reddit_weight /= weight_total
    # For newly tracked companies with no company-specific review score, use a
    # live category median of scores grounded in observed Glassdoor evidence;
    # fall back to the live global median when that category sample is small.
    # This avoids inventing a fixed neutral/company score and lets new roles
    # receive a provisional total while their own review research is pending.
    reputation_by_category: dict[str, list[float]] = {}
    reputation_observed: list[float] = []
    for source_row in company_rows:
        if source_row.get("Glassdoor Score Basis") != "Observed":
            continue
        try:
            reputation = float(source_row.get("Company Reputation Score /10", ""))
        except (TypeError, ValueError):
            continue
        if not 0 <= reputation <= 10:
            continue
        reputation_observed.append(reputation)
        reputation_by_category.setdefault(str(source_row.get("Category", "")), []).append(reputation)
    global_reputation_median = (
        statistics.median(reputation_observed)
        if len(reputation_observed) >= reputation_global_minimum else None
    )
    category_reputation_medians = {
        category: statistics.median(values)
        for category, values in reputation_by_category.items()
        if len(values) >= reputation_category_minimum
    }
    job_weight_names = {
        "candidate_fit": "Candidate fit", "role_fit": "Role fit", "desk_outlook": "Desk outlook",
        "expected_earnings": "Expected earnings", "company_reputation": "Company reputation", "location": "Location",
    }
    job_total_weights = {}
    for key_name, label in job_weight_names.items():
        try:
            job_total_weights[key_name] = float(score_model[f"Job weight: {label}"])
        except (KeyError, TypeError, ValueError):
            job_total_weights = {}
            break
    if job_total_weights and (any(value < 0 for value in job_total_weights.values()) or abs(sum(job_total_weights.values()) - 1.0) > 0.001):
        job_total_weights = {}

    companies = {}
    for source_row in company_rows:
        company_id = source_row.get("Company ID", "")
        if not company_id:
            continue
        row = dict(source_row)
        try:
            glassdoor = float(row.get("Glassdoor Score /10", ""))
        except (TypeError, ValueError):
            glassdoor = None
        try:
            reddit = float(row.get("Reddit Score /10", ""))
        except (TypeError, ValueError):
            reddit = None
        category = row.get("Category", "")
        ranking = company_rankings.get((str(row.get("Owner", "Ross")).strip().casefold(), company_id)) or company_rankings.get(("ross", company_id), {})
        row["Company Priority Rank"] = ranking.get("Rank", "")
        row["Company Priority Tier"] = ranking.get("Priority Tier", "")
        row["Company Search Focus"] = ranking.get("Search Focus", "")
        row["Company Priority Rationale"] = ranking.get("Rationale", "")
        company_ratio = category_reddit_glassdoor_ratios.get(category, reddit_glassdoor_ratio)
        category_n = len(category_observed_ratios.get(category, []))
        if row.get("Glassdoor Score Basis") == "Observed" and row.get("Reddit Score Basis") == "Estimated" and glassdoor is not None:
            if company_ratio is None:
                reddit = round(min(10.0, max(0.0, neutral_reddit_score)), 1)
                method = f"neutral Reddit estimate {neutral_reddit_score:g}/10; fewer than {global_ratio_minimum} observed pairs are available for a live platform ratio"
            else:
                reddit = round(min(10.0, max(0.0, glassdoor * company_ratio)), 1)
                if category in category_reddit_glassdoor_ratios:
                    method = f"live {category} median ratio from {category_n} observed pairs"
                else:
                    method = f"live global median ratio from {len(observed_ratios)} observed pairs; {category_n} in category, below the {category_ratio_minimum}-pair threshold"
            row["Reddit Score /10"] = reddit
            row["Reddit Notes"] = (f"Estimated from observed Glassdoor score using the {method}. Only paired observed scores train the ratio; estimated, indirect, unverified, and older-than-five-years evidence is excluded. "
                                   "Company-category norms and reviewer context matter; this is a provisional cross-platform estimate, not a desk-specific assessment.")
        if glassdoor is not None and reddit is not None and row.get("Glassdoor Score Basis") == "Observed" and row.get("Reddit Score Basis") in ("Observed", "Estimated"):
            row["Company Reputation Score /10"] = round(glassdoor * glassdoor_weight + reddit * reddit_weight, 1)
        if row.get("Company Reputation Score /10") in (None, ""):
            reputation_median = category_reputation_medians.get(category, global_reputation_median)
            if reputation_median is not None:
                category_count = len(reputation_by_category.get(category, []))
                if category in category_reputation_medians:
                    method = f"live {category} median from {category_count} companies with observed Glassdoor evidence"
                else:
                    method = f"live global median from {len(reputation_observed)} companies with observed Glassdoor evidence; {category_count} in category, below the {reputation_category_minimum}-company threshold"
                row["Company Reputation Score /10"] = round(reputation_median, 1)
                row["Company Reputation Notes"] = (
                    f"Estimated from the {method}. This is a provisional category/global peer estimate, "
                    "not company-specific review evidence; it is recalculated from real observed scores on each export."
                )
        companies[company_id] = row
    categories = {r.get("Company", "").casefold(): r.get("Category", "") for r in sheets.get("Company Registry", [])}
    recruitment_companies = {r.get("Recruitment Company ID", ""): r for r in sheets.get("Recruitment Company Registry", []) if r.get("Recruitment Company ID")}
    recruiter_people = {r.get("Recruiter ID", ""): r for r in sheets.get("Recruiter Registry", []) if r.get("Recruiter ID")}
    universities_by_id = {r.get("University ID", ""): r for r in sheets.get("University Registry", []) if r.get("University ID")}
    office_rows = [r for r in sheets.get("Office Registry", []) if r.get("Office ID") and r.get("Company ID") and r.get("Location ID") in locations_by_id]
    office_by_id = {r["Office ID"]: r for r in office_rows}
    office_by_company = {}
    for row in office_rows:
        office_by_company.setdefault(row["Company ID"], []).append(row)
    job_links = {}
    for link in sheets.get("Job Location Links", []):
        if link.get("Location ID") not in locations_by_id or link.get("Location ID") not in job_search_location_ids:
            continue
        if link.get("Office ID") and link.get("Office ID") not in office_by_id:
            continue
        job_links.setdefault(link.get("Opportunity ID", ""), []).append(link)
    campus_by_id = {r.get("Campus ID", ""): r for r in sheets.get("Campus Registry", []) if r.get("Campus ID") and r.get("Location ID") in locations_by_id}
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
                precision = office.get("Coordinate Precision", "")
            else:
                point = point_for(loc.get("Coordinates", "")) if loc else None
                label = link.get("City", "")
                precision = "City-centre fallback (Location Registry; office not linked)"
            if label and label not in labels: labels.append(label)
            city = link.get("City", "")
            if city and city not in city_labels: city_labels.append(city)
            if point: places.append({"name": label or city, "latitude": point[0], "longitude": point[1], "precision": precision})
        places = list({(p["latitude"], p["longitude"]): p for p in places}.values())
        title, org = row.get("Role", ""), row.get("Company", "")
        company = companies.get(row.get("Company ID", ""), {})
        payload.update({"id": row.get("Opportunity ID", ""), "company_id": row.get("Company ID", ""), "kind": "job", "title": title, "organization": org, "business": row.get("Business", categories.get(org.casefold(), "")), "role_function": row.get("Role Function", ""),
            "company_reputation_score_10": company.get("Company Reputation Score /10", ""), "company_reputation_notes": company.get("Company Reputation Notes", ""),
            "application_routes": application_routes_by_company.get(row.get("Company ID", ""), []),
            "source_url": row.get("Link", ""), "location": "; ".join(city_labels), "office": "; ".join(labels), "locations": places,
            "category": categories.get(org.casefold(), ""), "verification": "verified" if str(row.get("Source check") or row.get("Confidence") or "").strip().lower().startswith(("verified", "high")) else "needs_review"})
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
                point = point_for(campus.get("Coordinates", "")) if campus else None
                precision = campus.get("Coordinate Precision", "") if campus else ""
                place_name = campus.get("Location", row.get("Location", "")) if campus else row.get("Location", "")
                if not point:
                    point = point_for(row.get("Coordinates", ""))
                    precision = "Course-sheet coordinates; campus-level precision not confirmed" if point else ""
                places = [{"name": place_name, "latitude": point[0], "longitude": point[1], "precision": precision}] if point else []
                payload.update({"university_id": row.get("University ID", ""), "campus_id": row.get("Campus ID", ""), "campus": row.get("Campus", ""), "location": row.get("Location", ""),
                    "university_reputation_score_10": university.get("University Reputation Score /10", ""), "university_reputation_notes": university.get("University Reputation Notes", "")})
            else:
                places = locations_for(row, "recruiter", locations_by_city)
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
        places = [{"name": row.get("Office", ""), "latitude": point[0], "longitude": point[1], "precision": row.get("Coordinate Precision", "")}] if point else []
        office = row.get("Office", "")
        offices.append({**{key(k): v for k, v in row.items() if v not in (None, "")}, "id": row["Office ID"], "kind": "company",
            "title": company.get("Company", row.get("Company", "")), "organization": categories.get(company.get("Company", "").casefold(), "Uncategorized"),
            "company_id": row["Company ID"], "company": company.get("Company", row.get("Company", "")),
            "company_priority_rank": company.get("Company Priority Rank", ""), "company_priority_tier": company.get("Company Priority Tier", ""),
            "company_search_focus": company.get("Company Search Focus", ""), "company_priority_rationale": company.get("Company Priority Rationale", ""),
            "owner": row.get("Owner", "") or company.get("Owner", ""),
            "category": categories.get(company.get("Company", "").casefold(), "Uncategorized"), "office": office,
            "glassdoor_score_10": company.get("Glassdoor Score /10", ""), "glassdoor_notes": company.get("Glassdoor Notes", ""),
            "glassdoor_sources_search": company.get("Glassdoor Evidence / Search URL(s)", ""),
            "reddit_score_10": company.get("Reddit Score /10", ""), "reddit_notes": company.get("Reddit Notes", ""),
            "reddit_sources_search": company.get("Reddit Evidence / Search URL(s)", ""), "reviews_checked_on": company.get("Reviews Checked On", ""), "review_research_status": company.get("Review Research Status", "Not researched"),
            "company_reputation_score_10": company.get("Company Reputation Score /10", ""), "company_reputation_notes": company.get("Company Reputation Notes", ""),
            "application_routes": application_routes_by_company.get(row.get("Company ID", ""), []),
            "location": office, "locations": places})
    mapped_company_ids = set(office_by_company)
    unmapped_companies = []
    for company_id, row in companies.items():
        if company_id in mapped_company_ids: continue
        unmapped_companies.append({"id": company_id, "kind": "company", "title": row.get("Company", ""), "organization": row.get("Category", "Uncategorized"),
            "company": row.get("Company", ""), "company_id": company_id, "category": row.get("Category", "Uncategorized"), "office_research_status": row.get("Office Research Status", "Not started"),
            "company_priority_rank": row.get("Company Priority Rank", ""), "company_priority_tier": row.get("Company Priority Tier", ""),
            "company_search_focus": row.get("Company Search Focus", ""), "company_priority_rationale": row.get("Company Priority Rationale", ""),
            "owner": row.get("Owner", ""),
            "location": "Office research pending", "locations": [],
            "glassdoor_score_10": row.get("Glassdoor Score /10", ""), "glassdoor_notes": row.get("Glassdoor Notes", ""),
            "glassdoor_sources_search": row.get("Glassdoor Evidence / Search URL(s)", ""),
            "reddit_score_10": row.get("Reddit Score /10", ""), "reddit_notes": row.get("Reddit Notes", ""),
            "reddit_sources_search": row.get("Reddit Evidence / Search URL(s)", ""),
            "company_reputation_score_10": row.get("Company Reputation Score /10", ""), "company_reputation_notes": row.get("Company Reputation Notes", ""),
            "reviews_checked_on": row.get("Reviews Checked On", ""), "review_research_status": row.get("Review Research Status", "Not researched")})
    universities = []
    uni_rows = sheets.get("University Registry", [])
    for uni in uni_rows:
        campuses = [c for c in campus_by_id.values() if c.get("University ID") == uni.get("University ID")]
        places = []
        for campus in campuses:
            point = point_for(campus.get("Coordinates", ""))
            if point: places.append({"name": campus.get("Campus", "") or campus.get("Location", ""), "latitude": point[0], "longitude": point[1], "precision": campus.get("Coordinate Precision", "")})
        members = [r.get("Opportunity ID") for r in sheets.get("Masters", []) if r.get("University ID") == uni.get("University ID") and r.get("Opportunity ID")]
        universities.append({"id": uni.get("University ID", ""), "kind": "university", "title": uni.get("University", ""), "organization": uni.get("Category", "University"),
            "category": uni.get("Category", "University"), "university": uni.get("University", ""), "memberIds": members, "locations": places,
            "owner": uni.get("Owner", ""),
            "university_reputation_score_10": uni.get("University Reputation Score /10", ""), "university_reputation_notes": uni.get("University Reputation Notes", ""),
            "location": "; ".join(dict.fromkeys(p["name"] for p in places)) or "No mapped campus"})
    recruiter_registry = []
    for row in sheets.get("Recruiter Registry", []):
        raw_location = row.get("Location", "").strip()
        # Do not turn a recruiting firm's office into a person's location.
        uncertain = re.search(r"not (?:stated|verified|publicly|confirmed)|firm (?:office|base)|individual location|exact city not|city not reliably", raw_location, re.I)
        point = scoped_point_for(raw_location, locations_by_city) if raw_location and not uncertain else None
        places = [{"name": raw_location, "latitude": point[0], "longitude": point[1]}] if point else []
        recruiter_registry.append({**{key(k): v for k, v in row.items() if v not in (None, "")},
            "id": row.get("Recruiter ID", ""), "kind": "recruiter_person", "title": row.get("Name", ""),
            "organization": row.get("Recruitment Company", "Recruiter"), "category": row.get("Specialization", "Recruiter"),
            "location": raw_location if point else ("Location not verified" if raw_location else "Location not listed"),
            "locations": places, "source_url": row.get("Source URL", ""), "owner": row.get("Owner", "")})
    recruitment_company_registry = []
    for row in sheets.get("Recruitment Company Registry", []):
        recruitment_company_registry.append({**{key(k): v for k, v in row.items() if v not in (None, "")},
            "id": row.get("Recruitment Company ID", ""), "kind": "recruitment_company", "title": row.get("Recruitment Company", ""),
            "organization": row.get("Recruitment Type", "Recruitment company"), "category": row.get("Markets / Specialization", "Recruitment"),
            "location": row.get("Coverage / Geography", ""), "locations": [], "source_url": row.get("Source URL", ""), "owner": row.get("Owner", "")})
    locations = [{"location_id": r.get("Location ID", ""), "city": r.get("City", ""), "coordinates": r.get("Coordinates", ""), "owner": r.get("Owner", ""),
        "job_search": truth(r.get("Job Search")), "university_search": truth(r.get("University Search"))} for r in sheets.get("Location Registry", []) if r.get("City")]
    location_rankings = [{"ranking_id": r.get("Ranking ID", ""), "owner": r.get("Owner", ""), "rank": r.get("Rank", ""),
        "city": r.get("City", ""), "location_id": r.get("Location ID", ""), "search_scope": r.get("Search Scope", "")}
        for r in sheets.get("Location Rankings", []) if r.get("Owner") and r.get("City") and r.get("Rank") not in (None, "")]
    company_rankings_payload = [{"ranking_id": r.get("Ranking ID", ""), "owner": r.get("Owner", ""), "rank": r.get("Rank", ""),
        "company_id": r.get("Company ID", ""), "company": r.get("Company", ""), "category": r.get("Category", ""),
        "priority_tier": r.get("Priority Tier", ""), "search_focus": r.get("Search Focus", ""),
        "rationale": r.get("Rationale", ""), "confidence": r.get("Confidence", ""),
        "evidence_basis": r.get("Evidence Basis", ""), "source_urls": r.get("Source URL(s)", ""),
        "last_reviewed": r.get("Last Reviewed", "")}
        for r in sheets.get("Company Rankings", []) if r.get("Owner") and r.get("Company ID") and r.get("Rank") not in (None, "")]
    data = {"brand": "World of Commodities", "updated_at": (datetime.now(timezone.utc) + timedelta(hours=4)).date().isoformat(), "source_workbook": BOOK.name,
        "opportunities": entries, "offices": offices, "unmapped_companies": unmapped_companies, "universities": universities, "locations": locations,
        "location_rankings": location_rankings, "company_rankings": company_rankings_payload,
        "score_model": {"reddit_glassdoor_ratio": round(reddit_glassdoor_ratio, 4) if reddit_glassdoor_ratio is not None else None,
            "ratio_method": "category median after the paired-sample threshold; otherwise live global median", "observed_pair_count": len(observed_ratios),
            "category_ratio_pair_threshold": category_ratio_minimum, "global_ratio_pair_threshold": global_ratio_minimum,
            "category_pair_counts": {category: len(ratios) for category, ratios in category_observed_ratios.items()},
            "glassdoor_weight": round(glassdoor_weight, 4), "reddit_weight": round(reddit_weight, 4),
            "job_total_weights": job_total_weights,
            "location_floor": 6, "location_ceiling": 10,
            "location_max_total_contribution_swing": round(4 * job_total_weights.get("location", 0), 2) if job_total_weights else None,
            "role_fit_smoothing_cap": 0.6,
            "multi_city_rule": "one role-city row per registered job-search city"},
        "inbox": sheets.get("Research Inbox", []), "search_runs": sheets.get("Search Runs", []), "activities": sheets.get("Activity Log", []),
        "scope": sheets.get("Search Scope", []), "taxonomy": sheets.get("Taxonomy Registry", []),
        "office_research_queue": sheets.get("Office Research Queue", []),
        "recruitment_companies": recruitment_company_registry,
        "recruiter_people": recruiter_registry,
        "sharpness_attempts": [{"owner":r.get("Owner", ""), "platform":r.get("Platform", ""), "assessment":r.get("Assessment", ""),
            "attempt_type":r.get("Attempt Type", ""), "attempt_timestamp":sharpness_timestamp(r.get("Attempt Timestamp", "")), "score":r.get("Score", ""),
            "score_metric":r.get("Score Metric", ""), "completion_pct":r.get("Completion %", ""), "time_taken_minutes":r.get("Time Taken (minutes)", ""),
            "mode_topic":r.get("Mode / Topic", ""), "notes":r.get("Notes", ""), "session_url":r.get("Session URL", "")}
            for r in sheets.get("Interview Sharpness", []) if r.get("Owner") and r.get("Platform") and r.get("Attempt Timestamp")
            and any(r.get(field) not in (None, "") for field in ("Score", "Completion %", "Time Taken (minutes)"))]}
    def round_scores(value):
        if isinstance(value, dict):
            return {k: (round(v, 1) if k.endswith("_score_10") and isinstance(v, (int, float)) and not isinstance(v, bool) else round_scores(v)) for k, v in value.items()}
        if isinstance(value, list):
            return [round_scores(item) for item in value]
        return value
    data = round_scores(data)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    mapped = sum(len(x["locations"]) for x in data["opportunities"])
    office_points = sum(len(x["locations"]) for x in offices)
    print(f"Exported {len(entries)} opportunity records ({mapped} locations), {len(offices)} office records ({office_points} mapped offices), {len(unmapped_companies)} companies pending office research, {len(universities)} universities, {len(recruiter_registry)} recruiter people ({sum(bool(x['locations']) for x in recruiter_registry)} mapped), {len(recruitment_company_registry)} recruitment companies, and {len(locations)} search-scope cities to {OUTPUT.relative_to(ROOT)}")

if __name__ == "__main__":
    main()
