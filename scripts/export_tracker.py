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
    raw = record.get("Coordinates", "") if kind in ("job", "office") else record.get("Location", "") if kind == "recruiter" else ""
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
                    name = part.strip() if kind == "recruiter" else record.get("Office", "") if kind == "office" else record.get("Location", "")
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

def main() -> None:
    sheets = read_sheets()
    entries = []
    for kind, sheet_name in (("job", "Jobs"), ("masters", "Masters"), ("recruiter", "Recruiters")):
        for row in sheets.get(sheet_name, []):
            payload = {key(k): v for k, v in row.items() if v}
            if kind == "job":
                title, org, source = payload.get("role", ""), payload.get("company", ""), payload.get("link", "")
                payload["source_url"] = source
                if not any(payload.get(name) for name in ("business_function", "commodity", "market_geography", "time_horizon")):
                    payload.update(taxonomy_for(row))
                payload.pop("function_market", None)
            elif kind == "masters":
                title, org, source = payload.get("course", ""), payload.get("university", ""), payload.get("link", "")
                payload["source_url"] = source
            else:
                title, org, source = payload.get("name", ""), payload.get("company", ""), ""
            places = locations_for(row, kind)
            payload.update({"id": f"{kind}:{re.sub(r'[^a-z0-9]+','-',(org+'-'+title).lower()).strip('-')}", "kind": kind,
                "title": title, "organization": org, "owner": payload.get("owner", ""), "locations": places})
            if len(places) == 1:
                payload.update({"latitude": places[0]["latitude"], "longitude": places[0]["longitude"]})
            if kind == "job":
                confidence = payload.get("confidence", "").lower()
                payload["verification"] = "verified" if confidence.startswith("high") else "needs_review"
            else:
                payload["verification"] = "verified" if payload.get("confidence", "").lower().startswith("high") else "needs_review"
            entries.append(payload)
    if ROLE_RESULTS.exists():
        role_data = json.loads(ROLE_RESULTS.read_text(encoding="utf-8"))
        existing_roles = {(item.get("kind"), item.get("organization", "").casefold(), item.get("title", "").casefold(), item.get("source_url", "").casefold()) for item in entries}
        for row in role_data.get("roles", []):
            item = dict(row)
            item["locations"] = locations_for(row, "job")
            if len(item["locations"]) == 1:
                item["latitude"] = item["locations"][0]["latitude"]
                item["longitude"] = item["locations"][0]["longitude"]
            item.update({"kind": "job", "title": item["role"], "organization": item["company"],
                         "source_url": item.get("link", ""), "verification": item.get("source_check", "needs_review")})
            identity = (item["kind"], item["organization"].casefold(), item["title"].casefold(), item["source_url"].casefold())
            if identity not in existing_roles:
                entries.append(item)
    categories = {row.get("Company", "").casefold(): row.get("Category", "") for row in sheets.get("Company Registry", [])}
    offices = []
    for row in sheets.get("Office Registry", []):
        company = row.get("Company", "").strip()
        if not company:
            continue
        office = row.get("Office", "").strip()
        coords = row.get("Coordinates", "").strip()
        places = locations_for(row, "office")
        category = categories.get(company.casefold(), "Uncategorized")
        slug = re.sub(r"[^a-z0-9]+", "-", f"{company}-{office}-{coords}".lower()).strip("-")
        item = {key(k): v for k, v in row.items() if v}
        item.update({"id": f"office:{slug}", "kind": "company", "title": company, "organization": category,
                     "company": company, "category": category, "office": office,
                     "location": office or "No verified target-city office", "locations": places})
        offices.append(item)
    # Same opportunity tracked by multiple owners becomes one marker and one card.
    combined = {}
    for item in entries:
        identity = (item["kind"], item["organization"].casefold(), item["title"].casefold(), item.get("source_url", "").casefold())
        if identity not in combined:
            combined[identity] = item
            continue
        prior = combined[identity]
        owners = list(dict.fromkeys(filter(None, [*prior.get("owner", "").split(", "), *item.get("owner", "").split(", ")])))
        prior["owner"] = ", ".join(owners)
        prior["locations"] = list({(p["latitude"], p["longitude"]): p for p in [*prior["locations"], *item["locations"]]}.values())
    locations = []
    for row in sheets.get("Location Registry", []):
        city = row.get("City", "").strip()
        if not city:
            continue
        locations.append({
            "city": city,
            "coordinates": row.get("Coordinates", "").strip(),
            "job_search": row.get("Job Search", "").strip().lower() in ("true", "1", "yes"),
            "university_search": row.get("University Search", "").strip().lower() in ("true", "1", "yes"),
        })
    data = {"brand": "World of Commodities", "updated_at": date.today().isoformat(), "source_workbook": BOOK.name,
            "opportunities": list(combined.values()), "offices": offices, "locations": locations}
    OUTPUT.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    mapped = sum(len(x["locations"]) for x in data["opportunities"])
    office_points = sum(len(x["locations"]) for x in offices)
    print(f"Exported {len(data['opportunities'])} opportunity records ({mapped} locations), {len(offices)} office records ({office_points} mapped offices), and {len(locations)} search-scope cities to {OUTPUT.relative_to(ROOT)}")

if __name__ == "__main__":
    main()
