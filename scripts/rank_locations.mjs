import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
const file = "C:/Users/ross/Projects/worldofcommodities/worldofcommodities.xlsx";
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(file));
const excludedCities = new Set(["chicago", "harbin", "providence", "xi'an"]);
const excludedUniversityIds = new Set(["uni:university-of-chicago", "uni:harbin-institute-of-technology"]);
function rewriteFiltered(sheetName, tableRange, columnCount, predicate) {
  const sheet = wb.worksheets.getItem(sheetName);
  const table = sheet.tables.items[0];
  const oldRange = table.getRange().address;
  const values = sheet.getRange(oldRange).values;
  const headers = values[0];
  const kept = values.slice(1).filter((row) => predicate(Object.fromEntries(headers.map((h, i) => [h, row[i]]))));
  const newRows = [headers, ...kept];
  const lastRow = newRows.length;
  sheet.getRangeByIndexes(0, 0, newRows.length, columnCount).values = newRows;
  if (Number(oldRange.match(/:(?:[A-Z]+)(\d+)$/)?.[1] || lastRow) > lastRow) {
    const oldLast = Number(oldRange.match(/:(?:[A-Z]+)(\d+)$/)?.[1] || lastRow);
    sheet.getRangeByIndexes(lastRow, 0, oldLast - lastRow, columnCount).values = Array.from({length:oldLast-lastRow}, () => Array(columnCount).fill(null));
  }
  table.resize(`${tableRange}${lastRow}`);
  return values.length - newRows.length;
}
const removedLocations = rewriteFiltered("Location Registry", "A1:F", 6, (r) => !excludedCities.has(String(r.City || "").trim().toLowerCase()));
const removedUniversities = rewriteFiltered("University Registry", "A1:H", 8, (r) => !excludedUniversityIds.has(String(r["University ID"] || "")));
const removedCampuses = rewriteFiltered("Campus Registry", "A1:M", 13, (r) => !excludedUniversityIds.has(String(r["University ID"] || "")) && !excludedCities.has(String(r.Location || "").split(",")[0].trim().toLowerCase()));
const removedMasters = rewriteFiltered("Masters", "A1:Y", 25, (r) => !excludedUniversityIds.has(String(r["University ID"] || "")) && !excludedCities.has(String(r.Location || "").split(",")[0].trim().toLowerCase()));
const locationSheet = wb.worksheets.getItem("Location Registry");
const locationRows = locationSheet.tables.items[0].getRange().values;
const locationHeaders = locationRows[0];
const li = Object.fromEntries(locationHeaders.map((h,i)=>[h,i]));
const cityById = new Map(locationRows.slice(1).map(r => [String(r[li["Location ID"]]), {
  city:String(r[li.City]), job:!!r[li["Job Search"]], uni:!!r[li["University Search"]]
}]));
const tiers = [
  [1, ["Hong Kong"]],
  [2, ["New York"]],
  [3, ["San Francisco"]],
  [4, ["Singapore"]],
  [5, ["Tokyo", "Seoul"]],
  [6, ["Shanghai"]],
  [7, ["Hangzhou"]],
  [8, ["Berkeley", "Palo Alto", "Beijing"]],
  [9, ["Boston"]],
  [10, ["Cambridge, MA"]],
  [11, ["Cambridge, UK", "Vancouver", "Sydney", "London", "Zurich"]],
  [12, ["Geneva"]],
  [13, ["Oxford", "New Haven", "Princeton", "Shenzhen"]],
  [14, ["Hanover"]],
  [15, ["Hefei"]],
  [16, ["Ithaca"]],
  [17, ["Nanjing"]],
  [18, ["Pasadena"]],
  [19, ["Philadelphia"]],
];
const rankByCity = new Map();
for (const [rank, cities] of tiers) for (const city of cities) rankByCity.set(city.toLowerCase(), rank);
const orderByCity = new Map(tiers.flatMap(([, cities]) => cities).map((city, index) => [city.toLowerCase(), index]));
const rows = [...cityById.entries()].map(([locationId, loc]) => {
  const rank = rankByCity.get(loc.city.toLowerCase());
  if (!rank) throw new Error(`No rank provided for in-scope location: ${loc.city}`);
  const scope = loc.job && loc.uni ? "Jobs & Masters" : loc.job ? "Jobs" : loc.uni ? "Masters" : "Not in search scope";
  const rankingId = `rank:ross:${locationId.replace(/^loc:/, "")}`;
  return [rankingId, "Ross", rank, loc.city, locationId, scope];
}).sort((a,b)=>a[2]-b[2]||orderByCity.get(a[3].toLowerCase())-orderByCity.get(b[3].toLowerCase()));
if (rows.length !== 29) throw new Error(`Expected 29 active ranked locations; found ${rows.length}`);
let rankingSheet;
try { rankingSheet = wb.worksheets.getItem("Location Rankings"); } catch { rankingSheet = wb.worksheets.add("Location Rankings"); }
for (const table of rankingSheet.tables.items) table.delete();
const headers = ["Ranking ID", "Owner", "Rank", "City", "Location ID", "Search Scope"];
const all = [headers, ...rows];
rankingSheet.getRange("A1:G60").values = Array.from({length:60},(_,i)=>Array.from({length:7},(_,j)=>all[i]?.[j] ?? null));
const rankTable = rankingSheet.tables.add(`A1:F${all.length}`, true, "LocationRankingsTable");
rankTable.style = "TableStyleMedium2";
rankingSheet.showGridLines = false;
rankingSheet.freezePanes.freezeRows(1);
rankingSheet.getRange("B2:B500").dataValidation = {rule:{type:"list",values:["Ross","Michael"]}};
rankingSheet.getRange("C2:C500").format.numberFormat = "0";
rankingSheet.getRange("A:A").format.columnWidth = 28;
rankingSheet.getRange("B:B").format.columnWidth = 14;
rankingSheet.getRange("C:C").format.columnWidth = 10;
rankingSheet.getRange("D:D").format.columnWidth = 22;
rankingSheet.getRange("E:E").format.columnWidth = 20;
rankingSheet.getRange("F:F").format.columnWidth = 20;
rankingSheet.getRange(`A1:F${all.length}`).format.wrapText = true;
rankingSheet.getRange(`A2:F${all.length}`).format.verticalAlignment = "center";
rankingSheet.getRange(`A2:F${all.length}`).format.rowHeight = 30;
try { rankingSheet.index = 5; } catch {}
await wb.recalculate();
const output = await SpreadsheetFile.exportXlsx(wb);
await output.save(file);
console.log(JSON.stringify({removedLocations,removedUniversities,removedCampuses,removedMasters,rankedLocations:rows.length,top:rows.slice(0,8).map(r=>`${r[2]}. ${r[3]}`)}));
