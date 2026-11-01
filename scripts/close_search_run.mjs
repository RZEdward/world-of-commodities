import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const workbookPath = new URL("../worldofcommodities.xlsx", import.meta.url).pathname.replace(/^\/(\w:)/, "$1");
const payloadArg = process.argv.indexOf("--payload");
if (payloadArg < 0 || !process.argv[payloadArg + 1]) {
  throw new Error("Usage: node scripts/close_search_run.mjs --payload path/to/run-summary.json");
}
const payloadPath = process.argv[payloadArg + 1];
const payload = JSON.parse(await fs.readFile(payloadPath, "utf8"));
const summary = payload.summary || {};
const coverage = payload.coverage || [];
if (!summary.run_id || !summary.owner || !summary.started_on || !summary.completed_on) {
  throw new Error("Payload summary requires run_id, owner, started_on, and completed_on.");
}
if (!Array.isArray(coverage)) throw new Error("Payload coverage must be an array.");

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
const runSheet = workbook.worksheets.getItem("Search Runs");
const runTable = runSheet.tables.items[0];
if (!runTable) throw new Error("Search Runs needs its existing Excel table.");

const runExtraHeaders = [
  "Locations Covered", "Masters Cities Covered", "Companies Covered", "Source Families",
  "New Roles", "Updated Roles", "Expired Roles", "New Masters", "Updated Masters",
  "Companies Added", "Offices Added", "Recruiter Leads", "Unsolicited Routes",
  "Deadline Flags", "Elapsed Minutes", "Search Tool Calls", "Codex Usage",
  "Coverage Gaps", "Cadence Changes", "Results Summary",
];
const currentRunRange = runTable.getRange().address;
const runRows = runSheet.getRange(currentRunRange).values;
let runHeaders = runRows[0].map((value) => String(value || "").trim());
for (const header of runExtraHeaders) if (!runHeaders.includes(header)) runHeaders.push(header);
const priorRuns = runRows.slice(1).filter((row) => row.some((value) => value !== null && value !== ""));
if (priorRuns.some((row) => String(row[runHeaders.indexOf("Search Run ID")] || "") === summary.run_id)) {
  throw new Error(`Search run already logged: ${summary.run_id}`);
}

const runMap = {
  "Search Run ID": summary.run_id,
  "Started On": summary.started_on,
  "Completed On": summary.completed_on,
  "Scope Version": summary.scope_version,
  "Run Type": summary.run_type,
  "Run Status": summary.run_status,
  "Sources Checked": summary.sources_checked,
  "Candidates Found": summary.candidates_found,
  Promoted: summary.promoted,
  Duplicates: summary.duplicates,
  Rejected: summary.rejected,
  Notes: summary.notes,
  Owner: summary.owner,
  "Locations Covered": summary.locations_covered,
  "Masters Cities Covered": summary.masters_cities_covered,
  "Companies Covered": summary.companies_covered,
  "Source Families": summary.source_families,
  "New Roles": summary.new_roles,
  "Updated Roles": summary.updated_roles,
  "Expired Roles": summary.expired_roles,
  "New Masters": summary.new_masters,
  "Updated Masters": summary.updated_masters,
  "Companies Added": summary.companies_added,
  "Offices Added": summary.offices_added,
  "Recruiter Leads": summary.recruiter_leads,
  "Unsolicited Routes": summary.unsolicited_routes,
  "Deadline Flags": summary.deadline_flags,
  "Elapsed Minutes": summary.elapsed_minutes,
  "Search Tool Calls": summary.search_tool_calls,
  "Codex Usage": summary.codex_usage || "not surfaced",
  "Coverage Gaps": summary.coverage_gaps,
  "Cadence Changes": summary.cadence_changes,
  "Results Summary": summary.results_summary,
};

const coverageHeaders = [
  "Run ID", "Checked On", "Search Family", "Source / Platform", "Market / Location Scope",
  "Company Category / Rank Band", "Query Pack / Search Terms", "Language", "Cadence Used",
  "Items Reviewed", "Relevant Leads", "New Roles", "Updated Records", "Registry Candidates",
  "Duplicates", "Rejected", "Elapsed Minutes", "Yield / Evidence Notes",
  "Cadence Recommendation", "Next Review On", "Source URLs",
];
let coverageSheet;
try {
  coverageSheet = workbook.worksheets.getItem("Search Coverage Log");
} catch {
  coverageSheet = workbook.worksheets.add("Search Coverage Log");
  coverageSheet.showGridLines = false;
}
let coverageTable = coverageSheet.tables.items[0];
if (!coverageTable) {
  const seed = [coverageHeaders, Array(coverageHeaders.length).fill(null)];
  coverageSheet.getRange(`A1:U2`).values = seed;
  coverageTable = coverageSheet.tables.add("A1:U2", true, "SearchCoverageLedger");
  coverageTable.style = "TableStyleMedium2";
  coverageSheet.freezePanes.freezeRows(1);
}
const oldCoverageRange = coverageTable.getRange().address;
const oldCoverageValues = coverageSheet.getRange(oldCoverageRange).values;
const existingCoverageHeaders = oldCoverageValues[0].map((value) => String(value || "").trim());
if (existingCoverageHeaders.join("|") !== coverageHeaders.join("|")) {
  throw new Error("Search Coverage Log header mismatch. Preserve the existing layout and migrate it explicitly.");
}

const coverageRecords = oldCoverageValues.slice(1).filter((row) => row.some((value) => value !== null && value !== ""));
const indexedRunId = coverageHeaders.indexOf("Run ID");
if (coverageRecords.some((row) => String(row[indexedRunId] || "") === summary.run_id)) {
  throw new Error(`Coverage rows for this run already exist: ${summary.run_id}`);
}
const coverageMapKeys = [
  "run_id", "checked_on", "search_family", "source_platform", "market_location_scope",
  "company_category_rank_band", "query_pack_search_terms", "language", "cadence_used",
  "items_reviewed", "relevant_leads", "new_roles", "updated_records", "registry_candidates",
  "duplicates", "rejected", "elapsed_minutes", "yield_evidence_notes",
  "cadence_recommendation", "next_review_on", "source_urls",
];
const coverageRows = coverage.map((entry) => coverageMapKeys.map((key, index) =>
  key === "run_id" ? summary.run_id : key === "checked_on" ? (entry.checked_on || summary.completed_on.slice(0, 10)) : (entry[key] ?? null)));

const colName = (number) => {
  let n = number, out = "";
  while (n > 0) { const rem = (n - 1) % 26; out = String.fromCharCode(65 + rem) + out; n = Math.floor((n - 1) / 26); }
  return out;
};
const runMatrix = [runHeaders, ...priorRuns.map((row) => runHeaders.map((_, i) => row[i] ?? null)), runHeaders.map((header) => runMap[header] ?? null)];
runSheet.getRange(`A1:${colName(runHeaders.length)}${runMatrix.length}`).values = runMatrix;
runTable.resize(`A1:${colName(runHeaders.length)}${runMatrix.length}`);
runSheet.getRange("A:A").format.columnWidth = 34;
runSheet.getRange("B:F").format.columnWidth = 22;
runSheet.getRange("G:G").format.columnWidth = 46;
runSheet.getRange("L:M").format.columnWidth = 42;
runSheet.getRange("N:AG").format.columnWidth = 28;
runSheet.getRange("AE:AG").format.columnWidth = 42;
runSheet.getRange(`AB2:AB${runMatrix.length}`).format.numberFormat = "0.0";
runSheet.getRange(`AC2:AC${runMatrix.length}`).format.numberFormat = "0";

if (coverageRows.length) {
  const coverageLastRow = coverageRecords.length + coverageRows.length + 1;
  const coverageMatrix = [coverageHeaders, ...coverageRecords.map((row) => coverageHeaders.map((_, i) => row[i] ?? null)), ...coverageRows];
  coverageSheet.getRange(`A1:U${coverageLastRow}`).values = coverageMatrix;
  coverageTable.resize(`A1:U${coverageLastRow}`);
  const widths = [34, 14, 38, 32, 34, 34, 55, 18, 22, 14, 14, 14, 14, 16, 14, 14, 14, 60, 32, 16, 60];
  widths.forEach((width, index) => { coverageSheet.getRange(`${colName(index + 1)}:${colName(index + 1)}`).format.columnWidth = width; });
  coverageSheet.getRange(`Q2:Q${coverageLastRow}`).format.numberFormat = "0.0";
}

workbook.recalculate();
const output = await SpreadsheetFile.exportXlsx(workbook);
const tempPath = `${workbookPath}.next`;
await output.save(tempPath);
await fs.copyFile(tempPath, workbookPath);
await fs.unlink(tempPath);
console.log(JSON.stringify({ run_id: summary.run_id, search_runs: priorRuns.length + 1, coverage_rows_added: coverageRows.length, workbook: workbookPath }));
