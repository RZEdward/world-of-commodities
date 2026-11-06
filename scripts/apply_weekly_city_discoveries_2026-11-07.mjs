import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const path = "C:/Users/ross/Projects/worldofcommodities/worldofcommodities.xlsx";
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(path));
const sheet = (name) => wb.worksheets.getItem(name);
const values = (name) => sheet(name).getUsedRange().values;
const rowsAsObjects = (name) => {
  const data = values(name);
  const headers = data[0].map((v) => String(v ?? "").trim());
  return data.slice(1).filter((r) => r.some((v) => v !== null && v !== ""))
    .map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? null])));
};
const writeTable = (name, rows, columns) => {
  const ws = sheet(name);
  const table = ws.tables.items[0];
  if (!table) throw new Error(`${name} sheet is missing its existing table`);
  const all = [columns, ...rows.map((r) => columns.map((h) => r[h] ?? null))];
  let endCol = "", n = columns.length;
  while (n > 0) { const rem = (n - 1) % 26; endCol = String.fromCharCode(65 + rem) + endCol; n = Math.floor((n - 1) / 26); }
  ws.getRange(`A1:${endCol}${all.length}`).values = all;
  table.resize(`A1:${endCol}${all.length}`);
};
const jobsSheet = sheet("Jobs");
const jobsData = values("Jobs");
const jobHeaders = jobsData[0].map((v) => String(v ?? "").trim());
const jobs = rowsAsObjects("Jobs");
const expiredSheet = sheet("Expired Roles");
const expiredHeaders = values("Expired Roles")[0].map((v) => String(v ?? "").trim());
const expired = rowsAsObjects("Expired Roles");
const companyRows = rowsAsObjects("Company Registry");
const officeRows = rowsAsObjects("Office Registry");
const locationRows = rowsAsObjects("Location Registry");
const linkRows = rowsAsObjects("Job Location Links");
const masterRows = rowsAsObjects("Masters");
const companyTable = sheet("Company Registry").tables.items[0];
const companyHeaders = values("Company Registry")[0].map((v) => String(v ?? "").trim());
const linkHeaders = values("Job Location Links")[0].map((v) => String(v ?? "").trim());
const masterHeaders = values("Masters")[0].map((v) => String(v ?? "").trim());
const companiesByName = new Map(companyRows.map((r) => [String(r.Company ?? "").toLowerCase(), r]));
const companiesById = new Map(companyRows.map((r) => [String(r["Company ID"] ?? ""), r]));
const officesById = new Map(officeRows.map((r) => [String(r["Office ID"] ?? ""), r]));
const locationsByCity = new Map(locationRows.map((r) => [String(r.City ?? "").toLowerCase(), r]));
const existingIds = new Set(jobs.map((r) => String(r["Opportunity ID"] ?? "")));

// Retire the expired Chevron role only after checking its official page and deadline.
const chevronId = "opp:1974ccf30798";
const chevronIndex = jobs.findIndex((r) => r["Opportunity ID"] === chevronId);
if (chevronIndex < 0) throw new Error(`Expected Chevron role not found: ${chevronId}`);
const chevron = { ...jobs.splice(chevronIndex, 1)[0] };
chevron.Status = "Expired";
chevron["Expired On"] = "2026-11-07";
chevron["Expiry Reason"] = "Official deadline was 2026-11-06 23:59 SGT; on 2026-11-07 the employer posting returned 404 and its live vacancies page no longer exposed this requisition. No active application route was confirmed.";
expired.push(Object.fromEntries(expiredHeaders.map((h) => [h, chevron[h] ?? null])));

// Add two employers whose current London energy-analysis and commodities roles
// meet the registry inclusion threshold; reputation remains dynamically imputed.
const newCompanies = [
  { Company: "enfinium", Category: "Utility / Power Producer", "Company ID": "co:enfinium", "Search Active": true,
    "Office Research Status": "Not started", "Review Research Status": "Not researched", Owner: "Ross" },
];
for (const row of newCompanies) {
  if (companiesByName.has(row.Company.toLowerCase()) || companiesById.has(row["Company ID"])) continue;
  companyRows.push(row);
  companiesByName.set(row.Company.toLowerCase(), row);
  companiesById.set(row["Company ID"], row);
}

const runScope = JSON.parse(await (await import("node:fs/promises")).readFile(
  new URL("../research/search_runs/sr-ross-2026-11-07-001-77d7b1/scope.json", import.meta.url), "utf8"
));
const rankByCity = new Map(runScope.job_cities.map((r) => [r.city.toLowerCase(), Number(r.rank)]));
const maxRank = Math.max(...rankByCity.values());
const locationScore = (city) => Math.round((10 - ((rankByCity.get(city.toLowerCase()) - 1) * 4 / (maxRank - 1))) * 10) / 10;
const observedReps = companyRows.filter((r) => r["Glassdoor Score Basis"] === "Observed")
  .map((r) => Number(r["Company Reputation Score /10"]))
  .filter((n) => Number.isFinite(n) && n >= 0 && n <= 10).sort((a, b) => a - b);
const median = (a) => a.length ? (a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2) : null;
const globalObservedMedian = median(observedReps);
const observedCategoryReps = (category) => companyRows.filter((r) => r.Category === category && r["Glassdoor Score Basis"] === "Observed")
  .map((r) => Number(r["Company Reputation Score /10"]))
  .filter((n) => Number.isFinite(n) && n >= 0 && n <= 10).sort((a, b) => a - b);
const imputedRep = (co) => {
  const c = companiesById.get(co);
  if (!c) return null;
  const same = observedCategoryReps(c.Category);
  return same.length >= 5 ? median(same) : globalObservedMedian;
};
const total = (s) => Math.round((s.candidate * .15 + s.role * .25 + s.earnings * .15 + s.desk * .15 + s.reputation * .05 + s.location * .25) * 10) / 10;
const tenYear = (first, growth) => Math.round(first * ((Math.pow(1 + growth, 10) - 1) / growth));
const record = (o) => {
  const rep = imputedRep(o.companyId);
  const locScore = locationScore(o.city);
  const s = { candidate: o.candidate, role: o.roleFit, earnings: o.earnings, desk: o.desk, reputation: rep, location: locScore };
  const ten = tenYear(o.firstYearUsd, o.growth);
  const earningsNotes = `Approximately USD ${ten.toLocaleString("en-US")} 10-year gross cumulative estimate using first-year USD ${o.firstYearUsd.toLocaleString("en-US")} and ${(o.growth * 100).toFixed(1)}% illustrative annual progression for ${o.family}. Before tax/discounting; bonus, promotion, tenure and compensation estimate are uncertain.`;
  return {
    Company: o.company, Location: o.city, Role: o.title, Business: o.business,
    "Role Function": o.function, Commodity: o.commodity, "Market Geography": o.geography,
    "Time Horizon": o.horizon ?? "Not stated by employer", "Experience Requirement (years)": o.experience,
    Owner: "Ross", Status: "New", Recruiter: "Direct company application", Link: o.url,
    Posted: o.posted ?? "Not stated by employer", "Date Found": "2026-11-07", Deadline: o.deadline ?? "Not stated by employer",
    Fit: o.fit, Confidence: `${o.confidence} — official employer posting checked 2026-11-07; compensation and score estimates are separately labelled.`,
    "Next Action": o.next, Requirements: o.requirements, "Opportunity ID": o.id,
    "Company ID": o.companyId, "Scope Status": "In Scope", "Office(s) (source text)": o.officeText,
    "Office(s) (registry links)": o.officeId ?? "", "Candidate Fit Score /10": o.candidate,
    "Candidate Fit Notes": o.candidateNotes, "Role / Desk Outlook Score /10": o.desk,
    "Role / Desk Outlook Notes": o.deskNotes, "Total Compensation Expectation (USD)": `USD ${o.firstYearUsd.toLocaleString("en-US")}/year estimated gross ${o.compLabel}`,
    "Compensation Estimate Notes": o.compNotes, "Role Fit Score /10": o.roleFit, "Role Fit Notes": o.roleNotes,
    "Expected Earnings Score /10": o.earnings, "Expected Earnings Notes": earningsNotes,
    "Location Fit Score /10": locScore, "Total Score /10": rep == null ? null : total(s),
    "Total Score Status": rep == null ? "Incomplete — company reputation sample unavailable" : "Provisional",
  };
};

const additions = [
  {
    id: "opp:weekly-20261107-modo-modeling-ny", company: "Modo Energy", companyId: "co:modo-energy", city: "New York",
    title: "Market Analyst, Modeling (CAISO / SPP)", business: "Analytics / Data Provider", function: "Power Market Modeling & Analytics",
    commodity: "Power", geography: "United States — CAISO / SPP", experience: "2+ years in power market modeling, analytics, or quantitative energy roles",
    url: "https://job-boards.greenhouse.io/modoenergy/jobs/4997974101", officeId: "off:role-modo-energy-new-york",
    officeText: "New York hybrid; street address not published", candidate: 7.5, roleFit: 8, desk: 7.3, earnings: 5.8, firstYearUsd: 140000, growth: .055, family: "analysis/modeling",
    compLabel: "base midpoint (equity excluded)", confidence: "High", fit: "High",
    requirements: "Build and maintain dispatch, price and capacity-expansion models for CAISO/SPP; analyze market clearing and ancillary services; test models against outturn; explain outputs to clients. Requires a quantitative/engineering/economics degree, 2+ years in power modeling/analytics/quantitative energy, Python, git, optimization modeling, and knowledge of at least one US power market. Official posting states $110,000–$170,000 base plus equity; hybrid with three NYC office days.",
    candidateNotes: "7.5/10. Direct power-market modeling, forecasting and optimization work align strongly with Ross's experience. Reduce for no US ISO market experience and the posting's explicit optimization/modeling expectations; this is role match, not hiring probability.",
    roleNotes: "8/10. Strong analytical modeling close to how assets are valued, dispatched and traded; worthwhile desk-facing work, though it is external market analytics rather than a trading seat.",
    deskNotes: "7.3/10 working estimate. Modo's models are used for storage and power investment/operating decisions; no public profitability evidence for this specific modeling team was found.",
    compNotes: "Employer-posted $110k–$170k base; midpoint USD 140k. Equity and benefits excluded because no amount is stated. Official source: https://job-boards.greenhouse.io/modoenergy/jobs/4997974101",
    next: "Strong adjacent power-modeling target. Assess US market-rule/optimization gaps and prepare examples of forecasting, dispatch/optimization modeling and model validation before applying.",
    posted: "Not stated by employer", deadline: "Not stated by employer", geography2: "",
    experience: "2+ years in power market modeling, analytics, or quantitative energy roles", horizon: "Not stated by employer", commodity: "Power", geography: "United States — CAISO / SPP",
  },
  {
    id: "opp:weekly-20261107-imc-analyst-sydney", company: "IMC Trading", companyId: "co:imc-trading", city: "Sydney",
    title: "Commodities Analyst – China", business: "Prop Trading / Market Maker", function: "Commodity Market Analysis & Trading Research",
    commodity: "Oil; LNG; Petrochemicals; Base metals; Coal", geography: "China; Global", experience: "3+ years in a commodities-focused analytical role",
    url: "https://www.imc.com/eu/careers/jobs/4948205101", officeId: "off:f901b5e29088",
    officeText: "Sydney (IMC Sydney office registry link)", candidate: 3.5, roleFit: 7.5, desk: 8, earnings: 4.7, firstYearUsd: 93000, growth: .055, family: "analysis/research",
    compLabel: "estimated gross base midpoint; variable bonus not disclosed", confidence: "High", fit: "Low",
    requirements: "Fundamental, macroeconomic and geopolitical analysis across Chinese/global commodities, generating ideas with traders, and building Python/SQL data models. Requires 3+ years in commodity-focused analysis, strong Chinese commodity-market/value-chain knowledge, Python/SQL, and fluent written and spoken Mandarin and English. Official listing is in Sydney and currently has an Apply Now route.",
    candidateNotes: "3.5/10. Quantitative energy analysis and power-market context transfer, but there is no direct Chinese commodity-chain experience and the stated requirement is fluent Mandarin and English. Ross has basic Mandarin only, so the language requirement is not met.",
    roleNotes: "7.5/10. Desk-facing commodity fundamentals and idea generation at a high-quality prop firm are attractive. The covered portfolio is broad commodities and China-focused, not a power/gas desk.",
    deskNotes: "8/10 evidence-based estimate: the company is actively hiring into a described China commodities desk and the analyst feeds live trading decisions. Public source does not reveal that team’s P&L.",
    compNotes: "No role pay disclosed. Low-confidence first-year estimate USD 93k (about AUD 135k at ECB 6 Nov 2026 cross-rate), anchored to 2026 Australian energy-market analyst benchmark midpoint; excludes any unquantified IMC performance bonus. Benchmark: https://luvi.com.au/assets/reports/luvi-salary-benchmarking-2026-q9t7.pdf; FX: https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html",
    next: "Language and commodity-market requirements are major barriers. Do not treat basic Mandarin as meeting the stated fluency requirement; consider only if willing to make a substantial language and China-market transition.",
    deadline: "Not stated by employer", posted: "Not stated by employer", compSource: "low confidence",
  },
  {
    id: "opp:weekly-20261107-imc-trader-sydney", company: "IMC Trading", companyId: "co:imc-trading", city: "Sydney",
    title: "Commodities Trader – China", business: "Prop Trading / Market Maker", function: "Commodity Trading",
    commodity: "Energy; Precious metals; Base metals", geography: "China; Global", experience: "Proven track record trading Chinese and/or global commodity futures and derivatives",
    url: "https://www.imc.com/us/careers/jobs/4795169101", officeId: "off:f901b5e29088",
    officeText: "Sydney (IMC Sydney office registry link)", candidate: 2.5, roleFit: 8, desk: 8, earnings: 5.2, firstYearUsd: 99000, growth: .10, family: "prop trading/quant",
    compLabel: "estimated gross pay proxy; bonus/P&L excluded", confidence: "High", fit: "Low",
    requirements: "Develop and execute China-focused futures/derivatives strategies across energy, precious and base metals; manage risk and work with analysts, quants and technologists. Requires a proven trading track record in Chinese/global commodities, strong knowledge of Chinese exchanges/rules and risk management. Employer page currently has Apply Now; no deadline or language threshold stated on this trader page.",
    candidateNotes: "2.5/10. Ross has trading and power-analysis experience, but no proven Chinese commodity-futures track record or exchange expertise. This is a substantial product/market requirement gap.",
    roleNotes: "8/10. Direct front-office commodity trading at a top prop firm aligns with Ross's preferred work, though China multi-commodity coverage is outside his current specialization.",
    deskNotes: "8/10. The employer describes an expanding proprietary China commodities desk and current trader hiring; public evidence does not establish desk-level profitability.",
    compNotes: "No role-specific pay disclosed. Low-confidence proxy USD 99k/year, converted from Indeed's estimated AUD 143,808 average annual IMC Sydney trader pay (five postings); does not capture variable trading bonus/P&L and may materially understate upside. https://au.indeed.com/cmp/Imc-Financial-Markets/salaries/Trader/Sydney-NSW; ECB cross-rate 2026-11-06: https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html",
    next: "Major experience gap: requires an established China/global commodity-futures trading record. Treat as a stretch only; the role is not a power-analyst bridge.",
    deadline: "Not stated by employer", posted: "Not stated by employer",
  },
  {
    id: "opp:weekly-20261107-trafigura-crude-trader-geneva", company: "Trafigura", companyId: "co:trafigura", city: "Geneva",
    title: "Crude Trader", business: "Physical Commodity Trader", function: "Physical Commodity Trading",
    commodity: "Oil — crude", geography: "West Africa; Latin America; Atlantic Basin; Global", experience: "1–3 years crude physical trading and 3+ years total commodities trading",
    url: "https://trafigura.wd3.myworkdayjobs.com/en-US/TrafiguraCareerSite/job/Crude-Trader_R-018866", officeId: "off:5e39e35410a5",
    officeText: "Geneva regional hub (registered office)", candidate: 2.5, roleFit: 4.5, desk: 8.5, earnings: 6.6, firstYearUsd: 195500, growth: .08, family: "other trading/quant",
    requirements: "Trade and develop West African/Latin American crude books; physical optimization, risk, P&L, arbitrage, grades, logistics and refinery economics. Requires 1–3 years crude physical trading and 3+ years commodities trading, relevant regional crude knowledge and evidence of P&L contribution. Official posting states Geneva and was listed about seven days before 7 Nov 2026.",
    candidateNotes: "2.5/10. Ross has power trading/analysis experience but no crude-oil physical trading, crude grades, cargo logistics or P&L track record in the named regions; the explicit experience requirements are not met.",
    roleNotes: "4.5/10. It is a real front-office trading role at a high-ranked house, but crude oil is substantially outside Ross's power/gas preference. The prestigious employer does not erase the commodity preference gap.",
    deskNotes: "8.5/10. Specific desk is actively hiring for book ownership, optimization and P&L, but public evidence cannot establish this crude book's profitability.",
    compNotes: "Employer does not disclose pay. Estimate uses Glassdoor's Geneva Oil Trader total-pay range CHF154k–167k (median CHF160k) for Trafigura, converted at ECB 6 Nov 2026 EUR/CHF 0.9143 and EUR/USD 1.1165 (about USD 195.5k). Small/unclear sample; bonus volatility is not fully represented. https://www.glassdoor.com/Salaries/geneva-oil-trader-salary-SRCH_IL.0%2C6_IS6926_KO7%2C17.htm; ECB rates: https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.eu.html",
    next: "Very large direct crude-domain and track-record gap. Keep visible as an open low-fit role, but prioritize direct power/gas analyst and trading opportunities instead.",
    deadline: "Not stated by employer", posted: "2026-10-31 (approx.; listing said posted 7 days ago on 2026-11-07)",
  },
  {
    id: "opp:weekly-20261107-enfinium-energy-analyst-london", company: "enfinium", companyId: "co:enfinium", city: "London",
    title: "Energy Analyst", business: "Utility / Power Producer", function: "Energy Market Analysis & Asset Commercialization",
    commodity: "Power; Waste-derived energy; Carbon", geography: "United Kingdom", experience: "Up to 3 years in commercial/business or similar analytical work",
    url: "https://recruitment.enfinium.co.uk/vacancies/315/energy-analyst.html", officeText: "London (employer posting location; specific street address not stated)",
    candidate: 8, roleFit: 7.5, desk: 7, earnings: 3.7, firstYearUsd: 55000, growth: .055, family: "analysis/research",
    requirements: "Analyze energy markets and commercial performance; support energy trading, settlements, contract management, PPAs, private-wire agreements, REGOs, CfDs, generation forecasts, Capacity Market activities and regulatory reporting. Requires up to 3 years in a similar analytical/commercial role, UK energy knowledge, relevant degree and advanced Excel. London; permanent. Official careers index and posting showed an 8 Nov 2026 deadline and Apply route on 7 Nov.",
    candidateNotes: "8/10. Strong match to UK power-market analysis and previous GB intraday experience. Some adjustment for asset-owner/commercial work, settlements and carbon/support-scheme processes beyond the direct trading-analytics core.",
    roleNotes: "7.5/10. Substantive power-market, trading-support, PPA/CfD and generation-commercial work. It is an asset operator role rather than a pure trading desk, so it sits below direct power desk analysis/trading.",
    deskNotes: "7/10 working estimate: company has a 350 MW energy-from-waste portfolio and is hiring an analyst to optimize commercial value; no role-specific profitability or P&L is public.",
    compNotes: "Employer posting does not state salary. Low-confidence early-career London energy/commercial analyst estimate USD 55k/year (about GBP 43.8k at ECB 6 Nov 2026 cross-rate); bonus not included. Treat as a market estimate pending recruiter confirmation. FX source: https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.eu.html",
    next: "Urgent: official careers index showed application deadline 8 Nov 2026. Review and apply before the deadline if the role remains open; cite UK power-market modelling and GB intraday experience. Confirm salary and sponsorship directly.",
    deadline: "2026-11-08", posted: "2026-07-03", confidence: "High", fit: "High",
  },
];

for (const o of additions) {
  if (existingIds.has(o.id) || jobs.some((r) => r.Link === o.url || (r.Company === o.company && r.Role === o.title && r.Location === o.city)))
    throw new Error(`Duplicate job row: ${o.id}`);
  if (!companiesById.has(o.companyId)) throw new Error(`Missing Company Registry row for ${o.company}`);
  if (!locationsByCity.has(o.city.toLowerCase())) throw new Error(`Unregistered Job Search city: ${o.city}`);
  const mappedOffice = o.officeId ? officesById.get(o.officeId) : null;
  if (o.officeId && !mappedOffice) throw new Error(`Unknown Office ID ${o.officeId}`);
  jobs.push(Object.fromEntries(jobHeaders.map((h) => [h, record(o)[h] ?? null])));
  const loc = locationsByCity.get(o.city.toLowerCase());
  const linkRecord = {
    "Opportunity ID": o.id, "Office ID": o.officeId ?? "", "Location ID": loc["Location ID"],
    Company: o.company, Office: mappedOffice?.Office ?? `${o.city} — posting location; street address not stated`, City: o.city,
    Relation: mappedOffice ? "Registered company office" : "Posting city (office not linked)",
    "Source location text": o.officeText, Confidence: mappedOffice ? "High" : "Medium",
    Notes: mappedOffice ? "Role city linked to the employer's registered office." : "Employer states the registered target city; map uses Location Registry city-centre point until its actual office is researched.", Owner: "Ross",
  };
  linkRows.push(Object.fromEntries(linkHeaders.map((h) => [h, linkRecord[h] ?? null])));
}

// Current UNIGE official page confirms the upcoming test requirement and internship structure.
const unige = masterRows.find((r) => r["Opportunity ID"] === "opp:masters:unige-commodity-trading-2027");
if (!unige) throw new Error("UNIGE MSc Commodity Trading row not found");
unige.Confidence = "High — official GSEM admissions page and 2026–27 course plan checked 2026-11-07";
unige.Deadline = "2027-02-28 (application period 2027-01-15 to 2027-02-28)";
unige.Requirements = "90 ECTS; 3 semesters (maximum 5). The official admissions page says GMAT or GRE is mandatory for the upcoming application period; GMAT scores below 550 are not considered. Application documents include a maximum-two-page CV, prior-study transcripts/degrees, one-page English motivation letter and completed test proof. A 24-ECTS traineeship/internship in Switzerland with a commodities-trading company or related bank/service firm is a required programme component. The 2026–27 plan includes commodity price mechanisms, oil and gas, renewables, metals, agri-commodities, options, data science/fundamental analysis, shipping and trade finance. English; non-Francophones do not need a French proficiency test per programme material.";
unige["Next Action"] = "For the Jan 15–Feb 28, 2027 application window, schedule and complete GRE or GMAT early enough to submit the official score; GMAT below 550 is not considered. Prepare a two-page CV, English motivation letter, transcripts and degree certificates. Research the mandatory Swiss commodities-sector traineeship requirement and the programme's employer-matching process before applying.";
unige.Link = "https://www.unige.ch/gsem/en/programs/masters/admissions/master-commodity-trading";

const companiesWithNew = [...companyRows];
writeTable("Jobs", jobs, jobHeaders);
writeTable("Expired Roles", expired, expiredHeaders);
writeTable("Job Location Links", linkRows, linkHeaders);
writeTable("Company Registry", companiesWithNew, companyHeaders);
writeTable("Masters", masterRows, masterHeaders);
wb.recalculate();
await (await SpreadsheetFile.exportXlsx(wb)).save(path);
console.log(JSON.stringify({
  moved_to_expired: { opportunity_id: chevronId, title: chevron.Role, expired_on: "2026-11-07" },
  added_jobs: additions.map((o) => ({ id: o.id, title: o.title, company: o.company, city: o.city, score: total({ candidate:o.candidate, role:o.roleFit, earnings:o.earnings, desk:o.desk, reputation:imputedRep(o.companyId), location:locationScore(o.city) }) })),
  added_companies: newCompanies.map((r) => r.Company),
  refreshed_master: unige["Opportunity ID"],
  location_ranks_used: Object.fromEntries(additions.map((o) => [o.city, rankByCity.get(o.city.toLowerCase())])),
  tables: { jobs: jobs.length, expired: expired.length, job_location_links: linkRows.length, companies: companyRows.length, masters: masterRows.length },
}));
