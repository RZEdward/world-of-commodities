from pathlib import Path
import json, shutil, subprocess, sys

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "site-dist"

subprocess.run([sys.executable, str(ROOT / "scripts" / "export_tracker.py")], cwd=ROOT, check=True)
if DIST.exists():
    shutil.rmtree(DIST)
shutil.copytree(ROOT / "app", DIST / "app", ignore=shutil.ignore_patterns("*.map"))
data_dir = DIST / "data"
data_dir.mkdir(parents=True)
shutil.copy2(ROOT / "data" / "opportunities.json", data_dir / "opportunities.json")
(DIST / "index.html").write_text('<!doctype html><meta http-equiv="refresh" content="0;url=/app/"><title>World of Commodities</title><a href="/app/">Open dashboard</a>\n', encoding="utf-8")
(DIST / "robots.txt").write_text("User-agent: *\nDisallow: /\n", encoding="utf-8")
(DIST / "_headers").write_text("/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: DENY\n  X-Robots-Tag: noindex, nofollow, noarchive\n\n/data/*\n  Cache-Control: no-store\n", encoding="utf-8")
print(f"Built static site: {DIST}")
print("Output contains app assets + dashboard feed only; no workbook or CV.")
