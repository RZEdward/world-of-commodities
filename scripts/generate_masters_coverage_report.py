from collections import defaultdict
from datetime import date
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
FEED = ROOT / "data" / "opportunities.json"
OUT = ROOT / "research" / "university-coverage-2026-11-07.md"

data = json.loads(FEED.read_text(encoding="utf-8"))
universities = sorted(data.get("universities", []), key=lambda x: x.get("title", ""))
programmes = [x for x in data.get("opportunities", []) if x.get("kind") == "masters"]
by_uni = defaultdict(list)
for p in programmes:
    by_uni[p.get("organization") or p.get("university") or "University not set"].append(p)

def text(value):
    if value is None or str(value).strip() == "":
        return "Not confirmed"
    return str(value).replace("|", "\\|").replace("\n", " ").strip()

lines = [
    "# University programme inventory — 2026-11-07",
    "",
    "## Scope and what this inventory means",
    "",
    f"This inventory is built directly from the dashboard feed on {date.today().isoformat()}. It covers **only the active University Registry**; the job Location Registry does not add or exclude universities. The feed has **{len(universities)} registered universities** and **{len(programmes)} programme records** across **{len(by_uni)} universities**.",
    "",
    "The subject sweep covers energy and commodities; energy systems and transition; quantitative finance; applied and computational mathematics; statistics; data science, AI and machine learning; robotics and control; and atmospheric, climate and environmental science. We include named master’s programmes and explicitly bounded master’s tracks. We do not count doctoral-only research areas as master’s programmes.",
    "",
    "University of Geneva and The Hong Kong Polytechnic University have been removed because Ross confirms they were never in his university list. City St George’s remains excluded under his earlier instruction. No universities were added from job cities. University of Geneva, HK Polytechnic, and City St George’s do not appear in the active programme feed.",
    "",
    "**Status caution:** ‘New’, ‘Researching’, ‘On Hold’, and ‘Ready to Apply’ are tracker states, not a guarantee that 2027 admission is open. The deadline column reproduces the current tracked value; entries marked to verify or not confirmed require another official admissions check before action. A programme listed below may have an official programme page while its Fall 2027 intake, English delivery, deadline, fees, or individual eligibility remains unconfirmed. Course-fit and programme-quality scores are not inferred from listing inclusion.",
    "",
    "## Programme inventory by registered university",
    "",
]

for u in universities:
    name = u.get("title") or u.get("university") or "University not named"
    entries = sorted(by_uni.get(name, []), key=lambda x: x.get("title", ""))
    lines += [f"### {name} ({len(entries)} tracked programme{'s' if len(entries) != 1 else ''})", ""]
    if not entries:
        lines += ["No suitable named master’s programme is currently tracked. This is a review gap / no-confirmed-match outcome, not evidence that the university offers no relevant postgraduate study.", ""]
        continue
    lines += ["| Programme | Campus / city | Intake | Deadline | Tracker status | Official source |", "|---|---|---|---|---|---|"]
    for p in entries:
        link = text(p.get("link") or p.get("source_url"))
        if link.startswith("https://") or link.startswith("http://"):
            source = f"[programme / source]({link})"
        else:
            source = link
        location = p.get("campus") or p.get("location") or "Campus not confirmed"
        if p.get("campus") and p.get("location"):
            location += f" · {p['location']}"
        lines.append("| " + " | ".join(map(text, [p.get("title"), location, p.get("intake"), p.get("deadline"), p.get("status"), source])) + " |")
    lines.append("")

lines += [
    "## Coverage quality and next checks",
    "",
    "The inventory now contains multiple distinct candidates at universities whose catalogues support them (for example ETH Zurich, Oxford, MIT, HKUST, HKU, NTU, Peking, Cornell and Zhejiang). It is intentionally not padded to an arbitrary number per university: a school with one programme may have only one relevant master’s route verified, and a zero means the current pass did not find a defensible named master’s option.",
    "",
    "The next monthly admissions refresh should prioritize: (1) confirming Fall 2027 availability and deadlines for every Researching row; (2) checking English-language delivery and international eligibility for China and Korea; (3) resolving supervisor-dependent/research-master access (notably MIT EAPS); and (4) reviewing costs and prerequisite fit against Ross’s transcript. Do not convert unknown details into guessed deadlines or 5/10 placeholder scores.",
    "",
    "## Registry audit",
    "",
    "This list is generated from `data/opportunities.json`, the same feed consumed by the dashboard. To regenerate it after a workbook update, run `python scripts/build_site.py` and then `python scripts/generate_masters_coverage_report.py`.",
]

OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"Wrote {OUT} with {len(universities)} universities and {len(programmes)} programme records.")
