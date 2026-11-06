import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const workbookPath = "C:/Users/ross/Projects/worldofcommodities/worldofcommodities.xlsx";
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
const sheet = workbook.worksheets.getItem("Masters");
const table = sheet.tables.items[0];
if (!table) throw new Error("Masters sheet must retain its existing table.");

const existing = sheet.getUsedRange().values;
const headers = existing[0].map((v) => String(v ?? "").trim());
const idColumn = headers.indexOf("Opportunity ID");
const newId = "opp:masters:hkust-future-energy-power-system-dual-2027";
if (existing.slice(1).some((row) => String(row[idColumn] ?? "") === newId)) {
  throw new Error(`Programme already exists: ${newId}`);
}

const record = {
  "University": "The Hong Kong University of Science and Technology",
  "Campus": "Clear Water Bay Campus",
  "Location": "Hong Kong",
  "Course": "Dual Master’s Degree Programme in Future Energy and Power System Smart Operation and Management (HKUST MPhil + Strathclyde MSc)",
  "Duration": "Up to 3 years, part-time",
  "Tuition/year (USD)": "About USD 14,500/year equivalent (HKD 113,000 at approx. HKD 7.8/USD; 2026–27 rate, subject to annual revision)",
  "Living Costs/year (USD)": "Not budgeted for part-time study. If relocating, HKUST’s 2025/26 estimate is HKD 11,600–25,100/month (~USD 17,800–38,600/year).",
  "Total Cost (USD)": "About USD 43,500 tuition over 3 years at the 2026–27 rate, plus student/miscellaneous fees; living and travel excluded.",
  "Owner": "Ross",
  "Status": "On Hold",
  "Link": "https://dualmsc-seng.hkust.edu.hk/admission-requirement",
  "Intake": "2027 intake not confirmed",
  "Deadline": "Not stated by programme",
  "Fit": "Medium",
  "Confidence": "High — official programme, admissions, curriculum and tuition pages checked 2026-11-06; 2027 intake and deadline not stated.",
  "Requirements": "Part-time dual-degree route for applicants with a first- or second-class bachelor’s degree in relevant engineering or physical sciences, including physics, mathematics and computer science; other subjects may be considered case by case. HKUST, Strathclyde and CLP review applications jointly; shortlisted candidates are interviewed. All HKUST and Strathclyde courses are taught in English. Graduates receive an HKUST MPhil (chosen from eligible engineering disciplines) and a Strathclyde MSc. Curriculum includes power-system operation/control, renewable integration, big-data analytics/AI, risk and uncertainty, and an industry-based thesis with professional supervision.",
  "Next Action": "Ask the programme office whether a 2027 intake is planned, the application deadline, how a Physics degree is assessed, whether study can be completed while Dubai-based, and the full fee/attendance schedule. Keep On Hold until the intake and application dates are confirmed.",
  "Coordinates": "22.336807, 114.264055",
  "Opportunity ID": newId,
  "University ID": "uni:the-hong-kong-university-of-science-and-technology",
  "Campus ID": "camp:hkust-clear-water-bay",
  "Course Fit Score /10": 7.5,
  "Course Fit Notes": "7.5/10. Strong technical adjacency to power markets through system operation, renewable integration, analytics and risk; less direct than a commodity-trading, energy-market economics or commercial trading degree. Part-time structure may suit continued employment but may constrain relocating to Hong Kong.",
  "Course / Programme Score /10": 8,
  "Course / Programme Notes": "8/10 programme assessment: applied dual-award curriculum with HKUST, Strathclyde and CLP involvement, power engineering, AI/data analytics and an industry thesis. Score reflects programme design and subject depth; the 2027 intake and actual delivery schedule remain unconfirmed."
};

if (headers.length !== 25) throw new Error(`Unexpected Masters schema: ${headers.length} columns`);
const row = headers.map((header) => record[header] ?? null);
const nextRowNumber = existing.length + 1;
sheet.getRange(`A${nextRowNumber}:Y${nextRowNumber}`).values = [row];
table.resize(`A1:Y${nextRowNumber}`);
workbook.recalculate();
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(workbookPath);
console.log(JSON.stringify({ added: newId, row: nextRowNumber, verified: true }));
