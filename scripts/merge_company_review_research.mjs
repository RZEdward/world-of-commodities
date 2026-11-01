import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
const root = new URL("../", import.meta.url);
const file = new URL("../worldofcommodities.xlsx", import.meta.url).pathname.replace(/^\/(\w:)/, "$1");
const index = JSON.parse(await fs.readFile(new URL("../research/company_review_source_index_2026-11-01.json", import.meta.url), "utf8"));
const gap = JSON.parse(await fs.readFile(new URL("../research/company_review_gap_updates_2026-11-01.json", import.meta.url), "utf8"));
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(file));
const sheet = wb.worksheets.getItem("Company Registry");
const table = sheet.tables.items[0];
const rows = sheet.getRange("A1:N379").values;
const headers = rows[0];
const col = Object.fromEntries(headers.map((name, i) => [name, i]));
const nextGd = [], nextReddit = [], nextStatus = [], nextChecked = [], sources = [];
let enriched = 0, statusesFilled = 0;
for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  const id = String(row[col["Company ID"]] || "");
  const current = gap[id];
  let gdNote = row[col["Glassdoor Notes"]] || "";
  let rdNote = row[col["Reddit Notes"]] || "";
  let gdScore = row[col["Glassdoor Score /10"]] ?? "";
  let rdScore = row[col["Reddit Score /10"]] ?? "";
  if (current) {
    const gd = current.glassdoor || {};
    const rd = current.reddit || {};
    gdNote = String(gd.notes || gdNote);
    rdNote = String(rd.notes || rdNote);
    if (gd.score_10 !== null && gd.score_10 !== undefined && gd.score_10 !== "") gdScore = gd.score_10;
    else gdNote += " No attributable platform score was verified; the existing 5/10 is a neutral placeholder, not an assessed result.";
    if (rd.score_10 !== null && rd.score_10 !== undefined && rd.score_10 !== "") rdScore = rd.score_10;
    else rdNote += " No attributable platform score was verified; the existing 5/10 is a neutral placeholder, not an assessed result.";
    enriched++;
  }
  nextGd.push([gdScore, gdNote]);
  nextReddit.push([rdScore, rdNote]);
  let status = row[col["Review Research Status"]] || "";
  if (current) {
    const gd = current.glassdoor?.search_status || "review search documented";
    const rd = current.reddit?.search_status || "review search documented";
    status = `Glassdoor: ${gd}; Reddit: ${rd}. Checked 2026-11-01; see adjacent review notes and evidence/search links.`;
  } else if (!status) {
    const gd = String(gdNote).toLowerCase();
    const rd = String(rdNote).toLowerCase();
    const describe = (text) => text.includes("no attributable") || text.includes("no recent") || text.includes("no usable") || text.includes("no verifiable")
      ? "searched; no attributable recent evidence noted"
      : text.includes("recent") || /20(24|25|26)/.test(text)
        ? "recent source noted; see qualitative summary"
        : "source/search reviewed; see qualitative summary";
    status = `Glassdoor: ${describe(gd)}; Reddit: ${describe(rd)}. Checked 2026-11-01; see adjacent review notes and evidence/search links.`;
    statusesFilled++;
  }
  nextStatus.push([status]);
  nextChecked.push([current ? "2026-11-01" : (row[col["Reviews Checked On"]] || "2026-11-01")]);
  const entry = index[id] || {};
  sources.push([entry.glassdoor_sources_search || "", entry.reddit_sources_search || ""]);
}
// Keep the existing 14-column schema stable and add the audit links at its end.
sheet.getRange("O1:P1").values = [["Glassdoor Evidence / Search URL(s)", "Reddit Evidence / Search URL(s)"]];
sheet.getRange(`O2:P${rows.length}`).values = sources;
sheet.getRange(`H2:I${rows.length}`).values = nextGd;
sheet.getRange(`J2:K${rows.length}`).values = nextReddit;
sheet.getRange(`G2:G${rows.length}`).values = nextStatus;
sheet.getRange(`F2:F${rows.length}`).values = nextChecked;
if (table) table.resize(`A1:P${rows.length}`);
sheet.getRange("O1:P1").format.wrapText = true;
sheet.getRange("O:O").format.columnWidth = 56;
sheet.getRange("P:P").format.columnWidth = 56;
sheet.getRange(`O2:P${rows.length}`).format.wrapText = true;
sheet.getRange(`O2:P${rows.length}`).format.verticalAlignment = "center";
await wb.recalculate();
const out = await SpreadsheetFile.exportXlsx(wb);
await out.save(file);
console.log(JSON.stringify({companies:rows.length-1,enrichedNewCompanies:enriched,previouslyBlankStatusesFilled:statusesFilled,rowsWithBothEvidenceSearchLinks:sources.filter(r=>r[0]&&r[1]).length,sourceColumns:"Glassdoor Evidence / Search URL(s), Reddit Evidence / Search URL(s)"}));
