import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
const path = "C:/Users/ross/Projects/worldofcommodities/worldofcommodities.xlsx";
const w = await SpreadsheetFile.importXlsx(await FileBlob.load(path));
const runId = "sr:ross:2026-11-20:001:02918d";
const runSheet = w.worksheets.getItem("Search Runs");
const runValues = runSheet.getUsedRange().values;
const rh = runValues[0].map(x => String(x ?? "").trim());
const ri = Object.fromEntries(rh.map((x,i)=>[x,i]));
const rowIndex = runValues.findIndex((row,i)=>i>0 && String(row[ri["Search Run ID"]]??"")===runId);
if (rowIndex < 1) throw new Error(`Missing run ${runId}`);
const set = (sheet,row,headers,field,value) => {
  const col = headers.indexOf(field);
  if (col < 0) throw new Error(`Missing column: ${field}`);
  let n=col+1, name=""; while(n){const r=(n-1)%26;name=String.fromCharCode(65+r)+name;n=Math.floor((n-1)/26);}
  sheet.getRange(`${name}${row+1}`).values=[[value]];
};
set(runSheet,rowIndex,rh,"Updated Roles",4);
set(runSheet,rowIndex,rh,"Results Summary","22 new role-city records; 4 existing roles refreshed; 2 false Hong Kong location rows excluded; 3 new companies; no new offices. SEFE Singapore LNG Graduate closes 2026-12-16. This was the requested Singapore/Hong Kong plus Tier 1 (1–122) slice, not the full 14-city / 438-company sweep.");
set(runSheet,rowIndex,rh,"Notes","122/122 Tier 1 employer outcomes recorded, including four source-unavailable outcomes. Added 22 role-city rows. Refreshed two DRW roles, one IMC role, and the Gent Commodity role; excluded the false-HK Exxon and IMC rows. No application statuses changed.");

const sheet = w.worksheets.getItem("Search Coverage Log");
const values = sheet.getUsedRange().values;
const h = values[0].map(x => String(x ?? "").trim());
const ix = Object.fromEntries(h.map((x,i)=>[x,i]));
const rows = [];
for (let i=1;i<values.length;i++) {
  const row=values[i]; if(String(row[ix["Run ID"]]??"")!==runId) continue;
  rows.push({row:i, search:String(row[ix["Search Family"]]??""), scope:String(row[ix["Market / Location Scope"]]??""), band:String(row[ix["Company Category / Rank Band"]]??"")});
}
const newRolesByRank={23:2,16:1,49:3,13:1,70:1,122:1,102:1,56:1,95:1};
const updatedByRank={15:2,16:1,92:1};
for(const entry of rows){
  if(entry.search==="Broad registered-city vacancy discovery"){
    const n=entry.scope==="Singapore"?8:entry.scope==="Hong Kong"?2:0;
    set(sheet,entry.row,h,"Relevant Leads",n); set(sheet,entry.row,h,"New Roles",n);
  } else {
    const rank=Number(entry.band.match(/^Rank (\d+)/)?.[1]);
    set(sheet,entry.row,h,"New Roles",newRolesByRank[rank]??0);
    set(sheet,entry.row,h,"Updated Records",updatedByRank[rank]??0);
  }
}
w.recalculate();
const out=await SpreadsheetFile.exportXlsx(w); const temp=`${path}.next`; await out.save(temp);
const fs=await import("node:fs/promises"); await fs.copyFile(temp,path); await fs.unlink(temp);
console.log(JSON.stringify({runId,runRow:rowIndex+1,coverageRows:rows.length,updatedRoles:4,newRoleRows:22}));
