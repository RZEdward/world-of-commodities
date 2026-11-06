import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
const path = "C:/Users/ross/Projects/worldofcommodities/worldofcommodities.xlsx";
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(path));
const ws = wb.worksheets.getItem("Company Rankings");
const table = ws.tables.items[0];
const data = ws.getUsedRange().values;
const headers = data[0].map((v) => String(v ?? "").trim());
const rows = data.slice(1).filter((r) => r.some((v) => v !== null && v !== ""));
if (rows.some((r) => String(r[headers.indexOf("Company ID")] ?? "") === "co:enfinium")) {
  console.log("enfinium ranking already present");
} else {
  const nextRank = Math.max(...rows.map((r) => Number(r[headers.indexOf("Rank")]) || 0)) + 1;
  const record = {
    "Ranking ID": "rank:ross:enfinium", Owner: "Ross", Rank: nextRank,
    "Priority Tier": "Tier 3  -  Energy companies, banks and market operators",
    "Company ID": "co:enfinium", Company: "enfinium", Category: "Utility / Power Producer",
    "Search Focus": "UK power-market analysis, waste-to-energy commercialization, PPAs/CfDs, settlements and asset optimization",
    Rationale: "UK waste-to-energy producer with a current London energy-analysis vacancy covering energy-market analysis, trading/settlements, PPAs, CfDs and generation commercialization. Added at the bottom pending evidence of repeat hiring, pay progression and office details.",
    Confidence: "Medium", "Evidence Basis": "Official current employer vacancy and company activity description",
    "Source URL(s)": "https://recruitment.enfinium.co.uk/vacancies/315/energy-analyst.html; https://enfinium.co.uk/careers/",
    "Last Reviewed": "2026-11-07",
  };
  const row = headers.map((h) => record[h] ?? null);
  const endCol = "M";
  ws.getRange(`A1:${endCol}${rows.length + 2}`).values = [headers, ...rows, row];
  table.resize(`A1:${endCol}${rows.length + 2}`);
  wb.recalculate();
  await (await SpreadsheetFile.exportXlsx(wb)).save(path);
  console.log(JSON.stringify({ company: "enfinium", rank: nextRank, ranking_id: record["Ranking ID"] }));
}
