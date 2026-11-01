import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const workbookPath = new URL("../worldofcommodities.xlsx", import.meta.url).pathname.replace(/^\/(\w:)/, "$1");
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
const runExtraHeaders = [
  "Locations Covered", "Masters Cities Covered", "Companies Covered", "Source Families",
  "New Roles", "Updated Roles", "Expired Roles", "New Masters", "Updated Masters",
  "Companies Added", "Offices Added", "Recruiter Leads", "Unsolicited Routes",
  "Deadline Flags", "Elapsed Minutes", "Search Tool Calls", "Codex Usage",
  "Coverage Gaps", "Cadence Changes", "Results Summary",
];
const coverageHeaders = [
  "Run ID", "Checked On", "Search Family", "Source / Platform", "Market / Location Scope",
  "Company Category / Rank Band", "Query Pack / Search Terms", "Language", "Cadence Used",
  "Items Reviewed", "Relevant Leads", "New Roles", "Updated Records", "Registry Candidates",
  "Duplicates", "Rejected", "Elapsed Minutes", "Yield / Evidence Notes",
  "Cadence Recommendation", "Next Review On", "Source URLs",
];

const runSheet = workbook.worksheets.getItem("Search Runs");
const runTable = runSheet.tables.items[0];
if (!runTable) throw new Error("Search Runs needs its existing Excel table.");
const runRange = runTable.getRange().address;
const runValues = runSheet.getRange(runRange).values;
const runHeaders = runValues[0].map((value) => String(value || "").trim());
for (const header of runExtraHeaders) if (!runHeaders.includes(header)) runHeaders.push(header);
const existingRows = runValues.slice(1).map((row) => runHeaders.map((_, index) => row[index] ?? null));
const colName = (number) => {
  let n = number, out = "";
  while (n > 0) { const rem = (n - 1) % 26; out = String.fromCharCode(65 + rem) + out; n = Math.floor((n - 1) / 26); }
  return out;
};
runSheet.getRange(`A1:${colName(runHeaders.length)}${existingRows.length + 1}`).values = [runHeaders, ...existingRows];
runTable.resize(`A1:${colName(runHeaders.length)}${existingRows.length + 1}`);
runSheet.getRange("A:A").format.columnWidth = 34;
runSheet.getRange("B:F").format.columnWidth = 22;
runSheet.getRange("G:G").format.columnWidth = 46;
runSheet.getRange("L:M").format.columnWidth = 42;
runSheet.getRange("N:AG").format.columnWidth = 28;
runSheet.getRange("AE:AG").format.columnWidth = 42;
runSheet.getRange("AB2:AB1000").format.numberFormat = "0.0";
runSheet.getRange("AC2:AC1000").format.numberFormat = "0";

let coverageSheet;
try {
  coverageSheet = workbook.worksheets.getItem("Search Coverage Log");
} catch {
  coverageSheet = workbook.worksheets.add("Search Coverage Log");
  coverageSheet.showGridLines = false;
}
if (!coverageSheet.tables.items.length) {
  coverageSheet.getRange("A1:U2").values = [coverageHeaders, Array(coverageHeaders.length).fill(null)];
  const table = coverageSheet.tables.add("A1:U2", true, "SearchCoverageLedger");
  table.style = "TableStyleMedium2";
  coverageSheet.freezePanes.freezeRows(1);
  const widths = [34, 14, 38, 32, 34, 34, 55, 18, 22, 14, 14, 14, 14, 16, 14, 14, 14, 60, 32, 16, 60];
  widths.forEach((width, index) => { coverageSheet.getRange(`${colName(index + 1)}:${colName(index + 1)}`).format.columnWidth = width; });
} else {
  const existing = coverageSheet.tables.items[0].getRange().values[0].map((value) => String(value || "").trim());
  if (existing.join("|") !== coverageHeaders.join("|")) throw new Error("Existing Search Coverage Log has a different layout; migrate it explicitly.");
}

workbook.recalculate();
const exported = await SpreadsheetFile.exportXlsx(workbook);
const tempPath = `${workbookPath}.next`;
await exported.save(tempPath);
await fs.copyFile(tempPath, workbookPath);
await fs.unlink(tempPath);
console.log(JSON.stringify({ search_run_fields: runHeaders.length, coverage_fields: coverageHeaders.length, rows_preserved: existingRows.length }));
