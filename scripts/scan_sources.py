"""Maintain a small source registry and record page reachability on command."""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlsplit
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "data" / "sources" / "registry.json"
RESULTS = ROOT / "data" / "sources" / "scan-results.json"


class TitleParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.in_title = False
        self.parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() == "title":
            self.in_title = True

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "title":
            self.in_title = False

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.parts.append(data)


def read_json(path: Path, default: object) -> object:
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def scan_one(source: dict) -> dict:
    result = {"url": source["url"], "checked_at": datetime.now(timezone.utc).isoformat(), "http_status": None, "page_title": None, "error": None}
    try:
        request = Request(source["url"], headers={"User-Agent": "WorldOfCommoditiesTracker/1.0 (personal research)"})
        with urlopen(request, timeout=15) as response:
            result["http_status"] = response.status
            content_type = response.headers.get("Content-Type", "")
            if "html" in content_type.lower():
                content = response.read(512_000).decode("utf-8", errors="replace")
                parser = TitleParser()
                parser.feed(content)
                result["page_title"] = re.sub(r"\s+", " ", " ".join(parser.parts)).strip() or None
    except HTTPError as exc:
        result["http_status"] = exc.code
        result["error"] = str(exc.reason)
    except (URLError, TimeoutError, OSError, ValueError) as exc:
        result["error"] = str(exc)
    return result


def load_registry() -> list[dict]:
    value = read_json(REGISTRY, [])
    if not isinstance(value, list):
        raise SystemExit(f"Invalid registry format: {REGISTRY}")
    return value


def scan_command(args: argparse.Namespace) -> None:
    sources = load_registry()
    if args.kind:
        sources = [item for item in sources if item.get("kind") == args.kind]
    with ThreadPoolExecutor(max_workers=6) as executor:
        results = list(executor.map(scan_one, sources))
    write_json(RESULTS, {"scanned_at": datetime.now(timezone.utc).isoformat(), "checked": len(results), "results": results})
    for item in results:
        status = item["http_status"] or "ERR"
        title = f" — {item['page_title']}" if item["page_title"] else ""
        error = f" ({item['error']})" if item["error"] else ""
        print(f"{status}  {item['url']}{title}{error}")
    print(f"\nRecorded {len(results)} checks in {RESULTS.relative_to(ROOT)}. Page reachability is not proof an opportunity is open.")


def add_command(args: argparse.Namespace) -> None:
    parsed = urlsplit(args.url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise SystemExit("Source URL must be an absolute http:// or https:// URL.")
    if (args.latitude is None) != (args.longitude is None):
        raise SystemExit("Provide both --latitude and --longitude, or neither.")
    if args.latitude is not None and not (-90 <= args.latitude <= 90 and -180 <= args.longitude <= 180):
        raise SystemExit("Coordinates must be valid decimal degrees (latitude -90..90, longitude -180..180).")
    sources = load_registry()
    if any(item.get("url") == args.url for item in sources):
        raise SystemExit("That URL is already registered.")
    item = {"kind": args.kind, "title": args.title, "organization": args.organization, "location": args.location,
            "url": args.url, "latitude": args.latitude, "longitude": args.longitude,
            "state": "needs_review", "added_at": datetime.now(timezone.utc).isoformat(), "source_date": None}
    sources.append(item)
    write_json(REGISTRY, sources)
    print(f"Added source for review: {args.title}. Review it and add verified details to market_updated.xlsx, then run `python scripts/export_tracker.py`.")


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(errors="replace")
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    scan = sub.add_parser("scan", help="Check all registered URLs, or one kind")
    scan.add_argument("--kind", choices=("job", "masters", "recruiter", "office"))
    scan.set_defaults(func=scan_command)
    add = sub.add_parser("add", help="Register a URL for review")
    add.add_argument("--url", required=True)
    add.add_argument("--kind", required=True, choices=("job", "masters", "recruiter", "office"))
    add.add_argument("--title", required=True)
    add.add_argument("--organization", required=True)
    add.add_argument("--location", required=True)
    add.add_argument("--owner", choices=("Ross", "Michael"))
    add.add_argument("--latitude", type=float)
    add.add_argument("--longitude", type=float)
    add.set_defaults(func=add_command)
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
