import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const workbookPath = "C:/Users/ross/Projects/worldofcommodities/worldofcommodities.xlsx";
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
const jobs = workbook.worksheets.getItem("Jobs");
const companies = workbook.worksheets.getItem("Company Registry");
const jobValues = jobs.getUsedRange().values;
const jobHeaders = jobValues[0];
const companyValues = companies.getUsedRange().values;
const companyHeaders = companyValues[0];
const col = (headers, name) => headers.indexOf(name);
const companyRepById = new Map(companyValues.slice(1).map(row => [
  row[col(companyHeaders, "Company ID")],
  Number(row[col(companyHeaders, "Company Reputation Score /10")])
]));

const revisions = new Map([
  ["opp:c8273066c90d", {
    candidate: 2.5,
    notes: "2.5/10. Power-market analysis and energy experience transfer only partially. The employer requires Japanese fluency, 3–5 years in trading/banking and existing Japan energy relationships; Ross has no Japanese and lacks the stated Japan origination network. Basic Mandarin is not a substitute. This measures profile-to-requirements fit, not hiring probability.",
    next: "Major eligibility gaps: Japanese fluency, 3–5 years of relevant trading/banking experience and existing Japan energy relationships. Ross has basic Mandarin only, not Japanese. Treat as a very low-probability stretch unless ENGIE confirms flexibility. Official posting rechecked 2026-11-06.",
    requirements: "Bachelor’s degree in Economics; 3–5 years’ trading/banking experience; existing relationships with Japanese energy/power players; commodity derivatives/client origination experience; conversant in English and Japanese. Based in either Tokyo or Singapore. Official posting checked 2026-11-06."
  }],
  ["opp:c8273066c90d-loc-tokyo", {
    candidate: 2.5,
    notes: "2.5/10. Power-market analysis and energy experience transfer only partially. The employer requires Japanese fluency, 3–5 years in trading/banking and existing Japan energy relationships; Ross has no Japanese and lacks the stated Japan origination network. Basic Mandarin is not a substitute. This measures profile-to-requirements fit, not hiring probability.",
    next: "Major eligibility gaps: Japanese fluency, 3–5 years of relevant trading/banking experience and existing Japan energy relationships. Ross has basic Mandarin only, not Japanese. Treat as a very low-probability stretch unless ENGIE confirms flexibility. Official posting rechecked 2026-11-06.",
    requirements: "Bachelor’s degree in Economics; 3–5 years’ trading/banking experience; existing relationships with Japanese energy/power players; commodity derivatives/client origination experience; conversant in English and Japanese. Based in either Tokyo or Singapore. Official posting checked 2026-11-06."
  }],
  ["opp:d4d8d163552e", {
    candidate: 1.5,
    notes: "1.5/10. European power forecasting and analytical-tool experience transfer, but this role requires at least five years in Japan power trading or scheduling, EPRX ancillary-service bidding, detailed Japanese physical-market knowledge and native Japanese or JLPT N1. Ross has no Japanese and no stated Japan trading, scheduling or EPRX experience. These are major eligibility gaps, not hiring probability.",
    next: "Very low fit against explicit gates: 5+ years in Japan power trading/scheduling, EPRX bidding experience and native Japanese/JLPT N1. Ross has none of these. Keep only as a reference for future Japan-market requirements. Official posting rechecked 2026-11-06.",
    requirements: "At least 5 years’ experience in Japan power trading or scheduling; experience bidding into the EPRX Ancillary Service Market; in-depth Japanese physical power lifecycle and market knowledge; analytical-tool/Python experience; native-level Japanese or JLPT N1; advanced English (TOEIC 750 minimum); relevant bachelor’s degree. Official listing checked 2026-11-06."
  }],
  ["opp:sr-ross-20261105-tepco-ep19-tokyo", {
    candidate: 2.5,
    notes: "2.5/10. Power and fuel hedging are relevant, but Japanese-language CV and motivation documents are required and the role involves Japan-specific counterparties and market context. Ross has no Japanese. Basic Mandarin does not satisfy a Japanese-language requirement; this is a material practical barrier, not a hiring-probability estimate.",
    next: "Before applying, confirm whether TEPCO accepts translated application documents and whether Japanese fluency is required for day-to-day counterparty work. The current official ATS lists Req. 26-EP-19; its job detail is Japanese-language. Source checked 2026-11-06.",
    requirements: "Execute power and fuel derivative hedges, analyze energy markets and engage counterparties. Official TEPCO ATS lists member-class Req. 26-EP-19. The application guidance requires a Japanese-language CV and motivation statement; confirm spoken-language expectations and eligibility. Current listing checked 2026-11-06."
  }],
  ["opp:sr-ross-20261106-cosmo-eco-power-tokyo", {
    candidate: 6.5,
    notes: "6.5/10. Strong match to power-market analysis, forecasting, profit attribution and trading-tool development. The employer does not state a Japanese-proficiency threshold, so Japanese fluency is not assumed as a formal gate. However, the posting and application route are Japanese-language; Ross has no Japanese, creating a material practical uncertainty to resolve. This is not a hiring-probability estimate.",
    next: "Strong technical fit. Before investing in the application, ask whether the trading team can work in English and whether Japanese is required for internal/external coordination. Employer lists basic programming as required and power-market knowledge as preferred; no Japanese threshold is stated. Official listing checked 2026-11-06.",
    requirements: "Plan power-trading strategy; forecast profits and analyze actual results; build trading workflows with internal teams/partners; develop power-trading applications and related AI, including generation forecasting. Basic programming is required; power-business knowledge, data analysis and software requirements work are preferred. The employer does not state a Japanese proficiency threshold. Official listing checked 2026-11-06."
  }],
  ["opp:89e99e2299d1", {
    candidate: 1.5,
    notes: "1.5/10. The role centers on physical metals logistics and shipment operations, outside Ross’s core experience, and explicitly requires business-level Korean for daily supplier/customer contact. Ross has no Korean; power-market analysis is only a limited transferable skill. This is profile-to-requirements fit, not hiring probability.",
    next: "Korean is a stated mandatory requirement for daily interaction with Korean-speaking counterparties; Ross does not speak Korean. Metal/logistics experience is also preferred. The official Workday listing showed Apply when rechecked 2026-11-06, but the language gate makes this a very low-fit role.",
    requirements: "Physical metal shipment execution from trade through completion, including logistics, contract administration, settlement and risk mitigation. Focus on Korean-speaking counterparties. The employer requires business-level spoken and written Korean for daily interactions and English for internal communication; 3–5 years in metals/logistics is preferred. Official Workday listing checked 2026-11-06."
  }]
]);

const scoreWeights = {
  "Candidate Fit Score /10": 0.15,
  "Role Fit Score /10": 0.25,
  "Role / Desk Outlook Score /10": 0.15,
  "Expected Earnings Score /10": 0.15,
  "Company Reputation Score /10": 0.05,
  "Location Fit Score /10": 0.25,
};
const changed = [];
for (let rowIndex = 1; rowIndex < jobValues.length; rowIndex++) {
  const row = jobValues[rowIndex];
  const id = row[col(jobHeaders, "Opportunity ID")];
  const update = revisions.get(id);
  if (!update) continue;
  const rowNumber = rowIndex + 1;
  const write = (field, value) => jobs.getRange(`${columnLetter(col(jobHeaders, field))}${rowNumber}`).values = [[value]];
  write("Candidate Fit Score /10", update.candidate);
  write("Candidate Fit Notes", update.notes);
  write("Requirements", update.requirements);
  write("Next Action", update.next);
  let total = 0;
  for (const [field, weight] of Object.entries(scoreWeights)) {
    const value = field === "Company Reputation Score /10"
      ? companyRepById.get(row[col(jobHeaders, "Company ID")])
      : field === "Candidate Fit Score /10"
        ? update.candidate
        : Number(row[col(jobHeaders, field)]);
    if (!Number.isFinite(value)) throw new Error(`Missing score ${field} for ${id}`);
    total += value * weight;
  }
  const rounded = Math.round((total + Number.EPSILON) * 10) / 10;
  write("Total Score /10", rounded);
  changed.push({ id, role: row[col(jobHeaders, "Role")], candidate: update.candidate, total: rounded });
}
if (changed.length !== revisions.size) throw new Error(`Updated ${changed.length} of ${revisions.size} targeted roles`);
workbook.recalculate();
const verify = await workbook.inspect({
  kind: "table",
  range: `Jobs!A1:AL${jobValues.length}`,
  include: "values",
  tableMaxRows: jobValues.length,
  tableMaxCols: 38,
});
const out = await SpreadsheetFile.exportXlsx(workbook);
await out.save(workbookPath);
console.log(JSON.stringify({ changed, verified: true }));

function columnLetter(index) {
  let n = index + 1;
  let out = "";
  while (n > 0) {
    const remainder = (n - 1) % 26;
    out = String.fromCharCode(65 + remainder) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}
