import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
const file = "C:/Users/ross/Projects/worldofcommodities/worldofcommodities.xlsx";
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(file));
const sheet = wb.worksheets.getItem("Search Scope");
const table = sheet.tables.items[0];
const values = table.getRange().values;
const headers = values[0];
const ix = Object.fromEntries(headers.map((h,i)=>[h,i]));
const excluded = new Set(["chicago","harbin","providence","xi'an"]);
let changed = 0;
for (let i=1;i<values.length;i++) {
  const row=values[i];
  if (String(row[ix.Dimension]||"").toLowerCase()==="search location" && excluded.has(String(row[ix.Value]||"").trim().toLowerCase())) {
    row[ix.Decision]="Exclude";
    row[ix.Active]=false;
    row[ix.Provisional]=false;
    row[ix["Checked On"]]="2026-11-01";
    row[ix.Notes]="Excluded from search at Ross's instruction; the location has been removed from Location Registry.";
    changed++;
  }
}
sheet.getRange(table.getRange().address).values=values;
await wb.recalculate();
const out=await SpreadsheetFile.exportXlsx(wb);
await out.save(file);
console.log(`Marked ${changed} excluded search-location rules inactive.`);
