import fs from "node:fs/promises";
import {FileBlob,SpreadsheetFile} from "@oai/artifact-tool";
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load("C:/Users/ross/Projects/worldofcommodities/worldofcommodities.xlsx"));
const preview=await wb.render({sheetName:"Location Rankings",range:"A1:G17",scale:1,format:"png"});
await fs.writeFile("C:/Users/ross/Projects/worldofcommodities/research/location_rankings_preview.png",new Uint8Array(await preview.arrayBuffer()));
console.log("Rendered Location Rankings preview for inspection.");
