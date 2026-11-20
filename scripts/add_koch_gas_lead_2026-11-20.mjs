import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const workbookPath = "C:/Users/ross/Projects/worldofcommodities/worldofcommodities.xlsx";
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
const jobs = workbook.worksheets.getItem("Jobs");
const jobTable = jobs.tables.items[0];
const jobRows = jobs.getUsedRange().values;
const headers = jobRows[0].map((v) => String(v ?? "").trim());
const ix = Object.fromEntries(headers.map((h, i) => [h, i]));
const id = "opp:sr-ross-20261120-koch-european-gas-analyst-london";
if (jobRows.slice(1).some((row) => String(row[ix["Opportunity ID"]] ?? "") === id)) {
  throw new Error(`Opportunity already exists: ${id}`);
}
const record = Object.fromEntries(headers.map((h) => [h, null]));
Object.assign(record, {
  Company: "Koch", Location: "London", Role: "European Gas Analyst/Strategist",
  Business: "Physical Commodity Trader", "Role Function": "Commodity Fundamentals Research",
  Commodity: "Natural gas; LNG; Power", "Market Geography": "Europe; global LNG links",
  "Time Horizon": "Fundamentals and strategy development; horizon not stated",
  "Experience Requirement (years)": "Previous European gas fundamental/statistical/quantitative analysis required",
  Owner: "Ross", Status: "New", Recruiter: "Direct company application",
  Link: "https://uk.linkedin.com/jobs/view/european-gas-analyst-strategist-at-koch-4423225482",
  Posted: "Listed as recently posted on LinkedIn; exact posting date not verified",
  "Date Found": "2026-11-20", Deadline: "Not stated by source", Fit: "Medium",
  Confidence: "Lead — LinkedIn posting is live and specific, but Koch employer ATS requisition was not confirmed",
  "Next Action": "Strong analyst preference and gas/power fundamentals match. Verify the requisition on Koch's official careers site before applying; direct European gas-analysis experience is a stated requirement and is the main fit gap.",
  Requirements: "Quantitative/statistical European gas market analysis; develop supply-demand stacks; support strategy with traders; Python or Matlab/R/VBA; weather fundamentals and prior European gas fundamental/statistical/quantitative analysis required. The listing says the role links European gas with the wider global LNG complex and supports Koch power and gas research.",
  "Opportunity ID": id, "Company ID": "co:koch", "Scope Status": "In Scope",
  "Office(s) (source text)": "London", "Office(s) (registry links)": "",
  "Candidate Fit Score /10": 5.5,
  "Candidate Fit Notes": "5.5/10. Power fundamentals, weather-sensitive modelling, Python and European gas-balance work transfer well. Direct European gas market analysis is explicitly required; Ross has only recently moved into gas and has not yet built LNG analysis experience.",
  "Role / Desk Outlook Score /10": null, "Role / Desk Outlook Notes": null,
  "Total Compensation Expectation (USD)": "USD 150,000/year estimated gross total cash midpoint",
  "Compensation Estimate Notes": "Directional London quantitative energy analyst estimate; no employer salary disclosed, broad estimated range USD 120,000–180,000/year, bonus uncertain. Confirm with recruiter.",
  "Role Fit Score /10": 8.5,
  "Role Fit Notes": "8.5/10. Fundamental gas analysis, quantitative modelling and trader-facing strategy work align closely with Ross's preferred analyst path; London is a fallback versus Hong Kong/Singapore.",
  "Expected Earnings Score /10": 6.0,
  "Expected Earnings Notes": "Provisional 10-year earnings-potential estimate using USD 150,000 first-year total cash and illustrative progression; no company-specific bonus or desk P&L evidence found.",
  "Location Fit Score /10": 6.4, "Total Score /10": null,
  "Total Score Status": "Provisional",
});
const rowNo = jobRows.length + 1;
jobs.getRange(`A${rowNo}:AL${rowNo}`).values = [headers.map((h) => record[h] ?? null)];
jobTable.resize(`A1:AL${rowNo}`);

const links = workbook.worksheets.getItem("Job Location Links");
const linkTable = links.tables.items[0];
const linkRows = links.getUsedRange().values;
const linkHeaders = linkRows[0].map((v) => String(v ?? "").trim());
const li = Object.fromEntries(linkHeaders.map((h, i) => [h, i]));
if (!linkRows.slice(1).some((row) => String(row[li["Opportunity ID"]] ?? "") === id)) {
  const link = Object.fromEntries(linkHeaders.map((h) => [h, null]));
  Object.assign(link, {
    "Opportunity ID": id, "Office ID": null, "Location ID": "loc:london", Company: "Koch",
    Office: "London", City: "London", Relation: "role_location", "Source location text": "London",
    Confidence: "LinkedIn listing names London; official requisition not verified",
    Notes: "Registered city fallback only; no street office inferred.", Owner: "Ross",
  });
  const next = linkRows.length + 1;
  links.getRange(`A${next}:L${next}`).values = [linkHeaders.map((h) => link[h] ?? null)];
  linkTable.resize(`A1:L${next}`);
}
workbook.recalculate();
const out = await SpreadsheetFile.exportXlsx(workbook);
const temp = `${workbookPath}.next`;
await out.save(temp);
const fs = await import("node:fs/promises");
await fs.copyFile(temp, workbookPath);
await fs.unlink(temp);
console.log(JSON.stringify({ added: id, company: "Koch", city: "London", row: rowNo }));
