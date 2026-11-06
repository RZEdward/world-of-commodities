import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const workbookPath = "C:/Users/ross/Projects/worldofcommodities/worldofcommodities.xlsx";
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
const jobs = workbook.worksheets.getItem("Jobs");
const table = jobs.tables.items[0];
if (!table) throw new Error("Jobs sheet must retain its existing table.");
const values = jobs.getUsedRange().values;
const headers = values[0].map((v) => String(v ?? "").trim());
const index = Object.fromEntries(headers.map((h, i) => [h, i]));
const cell = (row, name) => row[index[name]];
const write = (rowNumber, name, value) => {
  let n = index[name] + 1;
  let letters = "";
  while (n > 0) { const rem = (n - 1) % 26; letters = String.fromCharCode(65 + rem) + letters; n = Math.floor((n - 1) / 26); }
  jobs.getRange(`${letters}${rowNumber}`).values = [[value]];
};
const existingById = new Map(values.slice(1).map((r, i) => [String(cell(r, "Opportunity ID") ?? ""), { row: r, rowNumber: i + 2 }]));

const lngId = "opp:sweep:09ee490bc1b2";
const lng = existingById.get(lngId);
if (!lng) throw new Error(`Existing Kpler LNG role not found: ${lngId}`);
for (const [field, value] of Object.entries({
  Link: "https://jobs.lever.co/kpler/db490413-d848-4030-988c-1bb90bd84072",
  "Posted": "Not stated by employer",
  "Date Found": "2026-11-01",
  Confidence: "High — exact official Lever listing checked 2026-11-06",
  "Next Action": "The official role requires 4+ years focused on gas/LNG market analysis plus advanced Excel and practical SQL/Python or VBA. Ross has adjacent gas context but no direct LNG work, so retain the calibrated 5/10 candidate fit and confirm whether the experience threshold is flexible before investing in an application.",
  Requirements: "Senior LNG market-data and analysis role covering cargo-level data quality, LNG/gas trade datasets, market events and trade flows; works with product, engineering, news and sales. Requires 4+ years as a market analyst focused on gas or LNG; advanced Excel; practical SQL and Python/VBA; complex dataset analysis and ability to present findings to commercial stakeholders. Official Singapore Lever page checked 2026-11-06.",
})) write(lng.rowNumber, field, value);

const usdPerSgd = 1.1224 / 1.4336; // ECB EUR/USD and EUR/SGD reference rates, 2026-11-05.
const kplerAnnualUsd = Math.round(8000 * 12 * usdPerSgd / 100) * 100;
const kplerTenYear = Math.round(kplerAnnualUsd * ((1.055 ** 10 - 1) / 0.055));
const argusAnnualUsd = Math.round(7126 * 12 * usdPerSgd / 100) * 100;
const argusTenYear = Math.round(argusAnnualUsd * ((1.055 ** 10 - 1) / 0.055));
const records = [
  {
    "Company": "Kpler", "Location": "Singapore", "Role": "Senior Research Analyst, Gasoline",
    "Business": "Analytics / Data Provider", "Role Function": "Market Analysis & Research", "Commodity": "Oil",
    "Market Geography": "Asia-Pacific", "Time Horizon": "Not stated by employer",
    "Experience Requirement (years)": "5+ years in refined-products research/analysis; deep gasoline/light-ends expertise",
    "Owner": "Ross", "Status": "New", "Recruiter": "Direct company application",
    "Link": "https://jobs.lever.co/kpler/7a1352fb-325d-479d-aabb-a44366acad57",
    "Posted": "Not stated by employer", "Date Found": "2026-11-06", "Deadline": "Not stated by employer",
    "Fit": "Low", "Confidence": "High — official Kpler Lever posting checked 2026-11-06; pay estimate is low-confidence third-party peer evidence.",
    "Next Action": "Stretch role: requires at least 5 years of gasoline/refined-products analysis, published directional research, and established market knowledge. Ross has strong power analysis but no gasoline/refined-products background. Apply only if willing to make a deliberate product-domain transition and can evidence publication/client-facing writing skills.",
    "Requirements": "Own Kpler East-of-Suez gasoline/light-ends intelligence; analyze vessel flows, refinery runs, inventories, blending economics and pricing; publish directional market calls; engage commercial clients; collaborate on product coverage. Requires 5+ years in refined-products analysis and deep gasoline/light-ends expertise, quantitative bachelor’s degree, Excel-based market balances and a published research record. Chinese policy familiarity or an Asia contacts network is requested; no Chinese language proficiency requirement is stated. Official listing checked 2026-11-06.",
    "Opportunity ID": "opp:sr-ross-20261106-kpler-gasoline-sg", "Company ID": "co:kpler", "Scope Status": "In Scope",
    "Office(s) (source text)": "Singapore", "Office(s) (registry links)": "off:484375eb6907",
    "Candidate Fit Score /10": 3, "Candidate Fit Notes": "3/10. Quantitative market-analysis skills transfer, but Ross has no gasoline/refined-products experience and does not meet the explicit 5+ years of product-analysis requirement or published gasoline-research track record. This is a large domain and seniority gap, not a hiring-probability estimate.",
    "Role / Desk Outlook Score /10": 6, "Role / Desk Outlook Notes": "6/10 neutral estimate. The role's analysis directly informs traders, refiners and investors, but public evidence does not establish the profitability or outlook of this specific Kpler research team. It is a market-intelligence role, not a trading-desk seat.",
    "Total Compensation Expectation (USD)": `USD ${kplerAnnualUsd.toLocaleString("en-US")}/year estimated gross base cash midpoint`,
    "Compensation Estimate Notes": `Employer does not publish pay. Low-confidence Singapore peer estimate: Jobstore lists SGD 6,500–9,500/month as an estimate for Kpler's comparable Senior Research Analyst, Middle Distillates; use SGD 8,000/month midpoint. Converted at ECB EUR/USD 1.1224 and EUR/SGD 1.4336 (2026-11-05; approximately USD/SGD ${usdPerSgd.toFixed(4)}). Gasoline-specific band not disclosed. Source: https://mobile.jobstore.com/sg/job/l38583823/senior-research-analyst-middle-distillates-job; FX: https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html`,
    "Role Fit Score /10": 5.5, "Role Fit Notes": "5.5/10. Commercial commodity-market analysis and published market calls are interesting, but this is refined-products research rather than power/gas trading, desk analytics or portfolio decisions; gasoline is also outside Ross's market background.",
    "Expected Earnings Score /10": 4.1, "Expected Earnings Notes": `Approximately USD ${kplerTenYear.toLocaleString("en-US")} 10-year gross cumulative estimate using first-year USD ${kplerAnnualUsd.toLocaleString("en-US")} and the methodology's 5.5% annual progression for analysis/research roles. Before tax/discounting; bonus, promotion and the salary estimate are uncertain.`,
    "Location Fit Score /10": 8.9, "Total Score /10": 5.9, "Total Score Status": "Provisional"
  },
  {
    "Company": "Kpler", "Location": "Singapore", "Role": "Senior Research Analyst, Middle Distillates",
    "Business": "Analytics / Data Provider", "Role Function": "Market Analysis & Research", "Commodity": "Oil",
    "Market Geography": "Asia-Pacific", "Time Horizon": "Not stated by employer",
    "Experience Requirement (years)": "5+ years in refined-products market analysis; deep middle-distillates expertise",
    "Owner": "Ross", "Status": "New", "Recruiter": "Direct company application",
    "Link": "https://jobs.lever.co/kpler/f6825e29-7b88-4ade-864c-68f3e560fcdf",
    "Posted": "Not stated by employer", "Date Found": "2026-11-06", "Deadline": "Not stated by employer",
    "Fit": "Low", "Confidence": "High — official Kpler Lever application page and Singapore careers inventory checked 2026-11-06; pay estimate is low-confidence third-party evidence.",
    "Next Action": "Stretch role: requires at least 5 years of diesel/gasoil and jet/kerosene analysis, East-of-Suez supply/trade-flow expertise, and published independent market research. Ross has transferable quantitative power analysis but no refined-products experience. Confirm willingness to pivot to oil-products research before applying.",
    "Requirements": "Own East-of-Suez diesel, gasoil and jet/kerosene market intelligence. Application asks about 5+ years of refined-products analysis, deep middle-distillates knowledge, East-of-Suez flows, Excel/data cross-validation of vessel/cargo data against refinery runs and stocks, and a record of publishing directional research and presenting to commercial clients. Official Kpler Lever page checked 2026-11-06.",
    "Opportunity ID": "opp:sr-ross-20261106-kpler-middle-distillates-sg", "Company ID": "co:kpler", "Scope Status": "In Scope",
    "Office(s) (source text)": "Singapore", "Office(s) (registry links)": "off:484375eb6907",
    "Candidate Fit Score /10": 3, "Candidate Fit Notes": "3/10. Quantitative energy-market analysis transfers, but Ross has no middle-distillates/refined-products experience and does not meet the posting's 5+ years of product-analysis requirement or market-specific publication record. This is a large domain and seniority gap, not a hiring-probability estimate.",
    "Role / Desk Outlook Score /10": 6, "Role / Desk Outlook Notes": "6/10 neutral estimate. The role's market intelligence serves commercial traders and clients, but no public evidence establishes this specific team’s profitability or outlook. It is a market-intelligence role, not a trading-desk seat.",
    "Total Compensation Expectation (USD)": `USD ${kplerAnnualUsd.toLocaleString("en-US")}/year estimated gross base cash midpoint`,
    "Compensation Estimate Notes": `Employer does not publish pay. Low-confidence Singapore estimate from Jobstore's Kpler posting for this role: SGD 6,500–9,500/month estimated range; midpoint SGD 8,000/month. Converted at ECB EUR/USD 1.1224 and EUR/SGD 1.4336 (2026-11-05; approximately USD/SGD ${usdPerSgd.toFixed(4)}). Source: https://mobile.jobstore.com/sg/job/l38583823/senior-research-analyst-middle-distillates-job; FX: https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html`,
    "Role Fit Score /10": 5.5, "Role Fit Notes": "5.5/10. Commercial commodity-market analysis is useful and interesting, but this is refined-products research rather than power/gas trading, desk analytics or portfolio decisions; the oil-product remit is outside Ross's direct market experience.",
    "Expected Earnings Score /10": 4.1, "Expected Earnings Notes": `Approximately USD ${kplerTenYear.toLocaleString("en-US")} 10-year gross cumulative estimate using first-year USD ${kplerAnnualUsd.toLocaleString("en-US")} and 5.5% annual progression for analysis/research roles. Before tax/discounting; bonus, promotion and the salary estimate are uncertain.`,
    "Location Fit Score /10": 8.9, "Total Score /10": 5.9, "Total Score Status": "Provisional"
  },
  {
    "Company": "Argus Media", "Location": "Singapore", "Role": "Senior/Market Reporter, Biofuels & Net Zero",
    "Business": "Market Reporting / News", "Role Function": "Market Analysis & Research", "Commodity": "Energy commodities",
    "Market Geography": "Global; Asia-Pacific", "Time Horizon": "Not applicable — editorial price reporting; no desk trading horizon stated",
    "Experience Requirement (years)": "Prior energy/commodity/journalism experience beneficial but not essential",
    "Owner": "Ross", "Status": "New", "Recruiter": "Direct company application",
    "Link": "https://careers.argusmedia.com/jobs/8593468-senior-market-reporter-biofuels-net-zero",
    "Posted": "Approximately 2026-10-23 (official listing observed as about two weeks old; approximate)", "Date Found": "2026-11-06", "Deadline": "Not stated by employer",
    "Fit": "Medium", "Confidence": "High — current official Argus Teamtailor posting checked 2026-11-06; salary estimate is medium-low confidence from Singapore reporter pay data.",
    "Next Action": "Potential adjacent fit: no prior commodities experience is required, but excellent writing, English, numeracy, industry sourcing and deadline discipline are central. Decide whether an editorial/reporting route is acceptable versus staying on a trading desk; do not count basic Mandarin as working-language proficiency.",
    "Requirements": "Cover ethanol and alternative marine fuels, with adjacent sustainable aviation fuel, biofuel feedstocks and carbon markets. Produce daily price assessments, market commentary, news and analysis; develop industry contacts, pitch stories, publish and present at webinars/conferences. Bachelor’s in journalism/English/communications/environmental studies/economics/business or relevant field; prior energy/finance/commodities experience beneficial but not required. Excellent writing, grammar, numeracy and spoken/written English required. Additional Chinese, Bahasa, Vietnamese, Korean or Japanese is beneficial but not mandatory; Ross has basic Mandarin only. Official posting checked 2026-11-06.",
    "Opportunity ID": "opp:sr-ross-20261106-argus-biofuels-reporter-sg", "Company ID": "co:argus-media", "Scope Status": "In Scope",
    "Office(s) (source text)": "Singapore", "Office(s) (registry links)": "off:d1ad6d14bd97",
    "Candidate Fit Score /10": 6, "Candidate Fit Notes": "6/10. Strong numerical energy-market analysis and curiosity transfer; the employer explicitly says prior commodity experience is not essential. Gaps are the writing/reporting craft, source-network building and direct biofuels knowledge. Basic Mandarin is below working proficiency and earns no stated language requirement credit; Chinese is only beneficial, not mandatory.",
    "Role / Desk Outlook Score /10": 6, "Role / Desk Outlook Notes": "6/10 neutral estimate. Argus publishes commodity price assessments and market intelligence, but this is an editorial/reporter seat, not a trading desk. No role-specific profitability or hiring outlook evidence was found.",
    "Total Compensation Expectation (USD)": `USD ${argusAnnualUsd.toLocaleString("en-US")}/year estimated gross pay midpoint, before undisclosed bonus`,
    "Compensation Estimate Notes": `Argus does not publish pay for this role. Estimate uses Singapore Senior Reporter pay: Indeed reports SGD 7,126/month from 13 reports; Glassdoor's Singapore range is SGD 7,000–8,000/month (3 reports). Annualized midpoint proxy SGD 7,126/month, converted at ECB EUR/USD 1.1224 and EUR/SGD 1.4336 (2026-11-05; approximately USD/SGD ${usdPerSgd.toFixed(4)}). Bonus is stated by employer but amount is not disclosed. Sources: https://sg.indeed.com/cmp/Argus-Media-Singapore-Group-Pte.-Ltd./salaries/Senior-Reporter; https://www.glassdoor.co.in/Salary/Argus-Media-Singapore-Salaries-EI_IE153509.0%2C11_IL.12%2C21_IC3235921.htm; FX: https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html`,
    "Role Fit Score /10": 6, "Role Fit Notes": "6/10. Energy and commodity price analysis is intellectually relevant, but the job is journalism/editorial coverage rather than a trading, quantitative desk or portfolio decision role. It is a plausible adjacent route, not a top destination.",
    "Expected Earnings Score /10": 3.8, "Expected Earnings Notes": `Approximately USD ${argusTenYear.toLocaleString("en-US")} 10-year gross cumulative estimate using first-year USD ${argusAnnualUsd.toLocaleString("en-US")} and 5.5% annual progression for analysis/research roles. Before tax/discounting; bonus, progression and the salary proxy are uncertain.`,
    "Location Fit Score /10": 8.9, "Total Score /10": 6.5, "Total Score Status": "Provisional"
  }
];

for (const record of records) {
  if (existingById.has(record["Opportunity ID"])) throw new Error(`Duplicate opportunity ID: ${record["Opportunity ID"]}`);
  for (const header of headers) if (!(header in record)) record[header] = null;
  for (const key of Object.keys(record)) if (!headers.includes(key)) throw new Error(`Unexpected field: ${key}`);
}

const updatedRows = [lng.rowNumber];
for (const r of records) {
  const rowNumber = jobs.getUsedRange().values.length + 1;
  jobs.getRange(`A${rowNumber}:AL${rowNumber}`).values = [headers.map((header) => r[header] ?? null)];
  updatedRows.push(rowNumber);
}
table.resize(`A1:AL${jobs.getUsedRange().values.length}`);
workbook.recalculate();
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(workbookPath);
console.log(JSON.stringify({
  updated: [{ id: lngId, row: lng.rowNumber, source: "exact official Singapore Lever page" }],
  added: records.map((r, i) => ({ id: r["Opportunity ID"], role: r.Role, total: r["Total Score /10"], row: updatedRows[i + 1] })),
  exchange_rate_usd_per_sgd: Number(usdPerSgd.toFixed(4)),
  annual_estimates_usd: { kpler_comparable_senior_research: kplerAnnualUsd, argus_senior_reporter: argusAnnualUsd },
  verified: true
}));
