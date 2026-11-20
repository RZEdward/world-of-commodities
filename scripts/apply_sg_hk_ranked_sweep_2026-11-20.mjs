import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const workbookPath = "C:/Users/ross/Projects/worldofcommodities/worldofcommodities.xlsx";
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
const date = "2026-11-20";
const jobs = workbook.worksheets.getItem("Jobs");
const jobTable = jobs.tables.items[0];
const jobRows = jobs.getUsedRange().values;
const jobHeaders = jobRows[0].map((v) => String(v ?? "").trim());
const jobIndex = Object.fromEntries(jobHeaders.map((h, i) => [h, i]));
const jobById = new Map(jobRows.slice(1).map((row, i) => [String(row[jobIndex["Opportunity ID"]] ?? ""), { row, rowNumber: i + 2 }]));
const companySheet = workbook.worksheets.getItem("Company Registry");
const companyTable = companySheet.tables.items[0];
const companyRows = companySheet.getUsedRange().values;
const companyHeaders = companyRows[0].map((v) => String(v ?? "").trim());
const companyIndex = Object.fromEntries(companyHeaders.map((h, i) => [h, i]));
const officeSheet = workbook.worksheets.getItem("Office Registry");
const officeRows = officeSheet.getUsedRange().values;
const officeHeaders = officeRows[0].map((v) => String(v ?? "").trim());
const officeIndex = Object.fromEntries(officeHeaders.map((h, i) => [h, i]));
const linksSheet = workbook.worksheets.getItem("Job Location Links");
const linksTable = linksSheet.tables.items[0];
const linkRows = linksSheet.getUsedRange().values;
const linkHeaders = linkRows[0].map((v) => String(v ?? "").trim());
const linkIndex = Object.fromEntries(linkHeaders.map((h, i) => [h, i]));

const cityIds = {
  "Hong Kong": "loc:hong-kong", "Singapore": "loc:singapore", "London": "loc:london",
  "Geneva": "loc:geneva", "Sydney": "loc:sydney",
};
const companyNameById = new Map(companyRows.slice(1).map((r) => [String(r[companyIndex["Company ID"]] ?? ""), String(r[companyIndex.Company] ?? "")]));
const knownCompanyIds = new Set(companyRows.slice(1).map((r) => String(r[companyIndex["Company ID"]] ?? "")));
const officeByCompanyCity = new Map();
for (const row of officeRows.slice(1)) {
  const companyId = String(row[officeIndex["Company ID"]] ?? "");
  const locationId = String(row[officeIndex["Location ID"]] ?? "");
  if (companyId && locationId) officeByCompanyCity.set(`${companyId}|${locationId}`, String(row[officeIndex["Office ID"]] ?? ""));
}
const cell = (row, field) => row[jobIndex[field]];
const setCell = (rowNumber, field, value) => {
  let n = jobIndex[field] + 1, col = "";
  while (n > 0) { const rem = (n - 1) % 26; col = String.fromCharCode(65 + rem) + col; n = Math.floor((n - 1) / 26); }
  jobs.getRange(`${col}${rowNumber}`).values = [[value]];
};
const existingLinkIndices = new Set(linkRows.slice(1).map((r) => String(r[linkIndex["Opportunity ID"]] ?? "")));
const companyAdds = [];
for (const [name, category, id, source] of [
  ["SEFE", "Integrated Energy / Oil & Gas", "co:sefe", "https://careers.sefe.eu/job/Graduate-LNG-%28mfd%29/1568-en_GB"],
  ["JERA Global Energy Solutions", "Physical Commodity Trader", "co:jera-global-energy-solutions", "https://sg.indeed.com/viewjob?jk=78122388666b568e"],
  ["PRISM Energy International", "Physical Commodity Trader", "co:prism-energy-international", "https://sg.indeed.com/viewjob?jk=13c425b1097e1448"],
]) {
  if (knownCompanyIds.has(id)) continue;
  const record = Object.fromEntries(companyHeaders.map((h) => [h, null]));
  Object.assign(record, {
    Company: name, Category: category, "Company ID": id, "Search Active": true,
    "Office Research Status": "Role city verified; street office address not established in posting",
    "Review Research Status": "Not researched in job sweep", Owner: "Ross",
  });
  companyAdds.push(record);
  knownCompanyIds.add(id);
  companyNameById.set(id, name);
}

const makeJob = (x) => {
  const record = Object.fromEntries(jobHeaders.map((h) => [h, null]));
  Object.assign(record, {
    Company: x.company, Location: x.city, Role: x.role, Business: x.business,
    "Role Function": x.function, Commodity: x.commodity, "Market Geography": x.geography,
    "Time Horizon": x.horizon || "Not stated by employer", "Experience Requirement (years)": x.experience,
    Owner: "Ross", Status: "New", Recruiter: x.recruiter || "Direct company application", Link: x.url,
    Posted: x.posted || "Not stated by employer", "Date Found": date, Deadline: x.deadline || "Not stated by employer",
    Fit: x.fit, Confidence: x.confidence, "Next Action": x.next,
    Requirements: x.requirements, "Opportunity ID": x.id, "Company ID": x.companyId, "Scope Status": "In Scope",
    "Office(s) (source text)": x.city, "Office(s) (registry links)": x.officeId || "",
    "Candidate Fit Score /10": x.candidate, "Candidate Fit Notes": x.candidateNotes,
    "Role / Desk Outlook Score /10": null, "Role / Desk Outlook Notes": null,
    "Total Compensation Expectation (USD)": x.comp,
    "Compensation Estimate Notes": x.compNotes,
    "Role Fit Score /10": x.roleFit, "Role Fit Notes": x.roleNotes,
    "Expected Earnings Score /10": x.earnings, "Expected Earnings Notes": x.earningsNotes,
    "Location Fit Score /10": x.locationFit, "Total Score /10": null, "Total Score Status": "Provisional",
  });
  return record;
};

const roles = [
  {
    id: "opp:sr-ross-20261120-squarepoint-junior-commodities-analyst-singapore", company: "Squarepoint Capital", companyId: "co:squarepoint-capital", city: "Singapore", officeId: "off:bf7daa087899",
    role: "Junior Commodities Fundamental Analyst", business: "Prop Trading / Market Maker", function: "Commodity Fundamentals Research",
    commodity: "Energy and other commodities", geography: "Global", experience: "Advanced quantitative degree; research/modelling experience, ideally internship or related role",
    url: "https://www.squarepoint-capital.com/open-opportunities?gh_jid=7335465&id=7335465", posted: "Not stated by employer", fit: "High",
    confidence: "High — official Squarepoint listing is live; requirements cross-checked against current Singapore listing on Indeed 2026-11-20",
    next: "Strong analyst-led prop-desk fit. Confirm the advanced-degree interpretation for an integrated MSci and apply if the posting remains open.",
    requirements: "Build fundamental commodity supply-demand models and desk analytics; produce ad hoc analysis for trade ideas; improve data quality and maintain fundamental data processes. Requires an advanced degree in a quantitative subject, Python, research/modelling experience and strong writing. Singapore role; official listing also names Geneva and London. Employer does not specify commodities covered in the requisition.",
    candidate: 7.5, candidateNotes: "7.5/10. Strong quantitative power-market modelling, Python and end-to-end forecasting transfer directly to fundamental commodity models. Gaps: no direct oil/metals market coverage and advanced-degree equivalency should be confirmed.",
    roleFit: 8.5, roleNotes: "8.5/10. Analyst role directly supports a trading desk with fundamental models and trade-idea analysis, matching Ross’s preferred analytical route. Commodity assignment is unspecified.",
    comp: "USD 175,000/year estimated gross total cash midpoint", compNotes: "Low-confidence Singapore estimate based on Indeed's third-party SGD 15,000–22,500/month listing for this role; midpoint annualized and converted at approximately USD 0.78/SGD. Employer gives no salary range and does not state bonus. Range about USD 140,000–210,000/year.",
    earnings: 6.1, earningsNotes: "Estimated 10-year gross earnings potential based on USD 175,000 first-year total cash and 8% illustrative annual progression; before tax/discounting, bonus and P&L uncertain.",
    locationFit: 8.9,
  },
  {
    id: "opp:sr-ross-20261120-squarepoint-junior-commodities-analyst-london", company: "Squarepoint Capital", companyId: "co:squarepoint-capital", city: "London", officeId: "off:dd4dcb4f1712",
    role: "Junior Commodities Fundamental Analyst", business: "Prop Trading / Market Maker", function: "Commodity Fundamentals Research",
    commodity: "Energy and other commodities", geography: "Global", experience: "Advanced quantitative degree; research/modelling experience, ideally internship or related role",
    url: "https://www.squarepoint-capital.com/open-opportunities?gh_jid=7335465&id=7335465", posted: "Not stated by employer", fit: "High",
    confidence: "High — official Squarepoint listing checked 2026-11-20; London is explicitly named",
    next: "Strong analyst-led prop-desk fit; confirm integrated MSci meets advanced-degree wording before applying.",
    requirements: "Build fundamental commodity supply-demand models and desk analytics; produce ad hoc analysis for trade ideas; improve data quality and maintain fundamental data processes. Requires an advanced degree in a quantitative subject, Python, research/modelling experience and strong writing. The employer does not specify commodities covered in the requisition.",
    candidate: 7.5, candidateNotes: "7.5/10. Quantitative power modelling, Python and forecasting transfer well; gaps are direct commodity breadth and advanced-degree interpretation.",
    roleFit: 8.5, roleNotes: "8.5/10. Fundamental analysis supporting a trading desk is a strong preference match; commodity allocation is unspecified.",
    comp: "USD 180,000/year estimated gross total cash midpoint", compNotes: "Low-confidence London prop-firm analyst estimate; employer publishes no compensation. Broad illustrative range USD 140,000–220,000/year; bonus and P&L not known.",
    earnings: 6.2, earningsNotes: "Estimated 10-year gross potential based on USD 180,000 first-year total cash and 8% illustrative progression; before tax/discounting and uncertain variable pay.",
    locationFit: 6.4,
  },
  {
    id: "opp:sr-ross-20261120-squarepoint-junior-commodities-analyst-geneva", company: "Squarepoint Capital", companyId: "co:squarepoint-capital", city: "Geneva", officeId: "off:45ea419536ab",
    role: "Junior Commodities Fundamental Analyst", business: "Prop Trading / Market Maker", function: "Commodity Fundamentals Research",
    commodity: "Energy and other commodities", geography: "Global", experience: "Advanced quantitative degree; research/modelling experience, ideally internship or related role",
    url: "https://www.squarepoint-capital.com/open-opportunities?gh_jid=7335465&id=7335465", posted: "Not stated by employer", fit: "High",
    confidence: "High — official Squarepoint listing checked 2026-11-20; Geneva is explicitly named",
    next: "Strong analyst-led prop-desk fit; confirm integrated MSci meets advanced-degree wording before applying.",
    requirements: "Build fundamental commodity supply-demand models and desk analytics; produce ad hoc analysis for trade ideas; improve data quality and maintain fundamental data processes. Requires an advanced degree in a quantitative subject, Python, research/modelling experience and strong writing. The employer does not specify commodities covered in the requisition.",
    candidate: 7.5, candidateNotes: "7.5/10. Quantitative power modelling, Python and forecasting transfer well; gaps are direct commodity breadth and advanced-degree interpretation.",
    roleFit: 8.5, roleNotes: "8.5/10. Fundamental analysis supporting a trading desk is a strong preference match; commodity allocation is unspecified.",
    comp: "USD 190,000/year estimated gross total cash midpoint", compNotes: "Low-confidence Geneva quantitative analyst estimate; employer publishes no compensation. Broad illustrative range USD 150,000–230,000/year; bonus and P&L not known.",
    earnings: 6.4, earningsNotes: "Estimated 10-year gross potential based on USD 190,000 first-year total cash and 8% illustrative progression; before tax/discounting and uncertain variable pay.",
    locationFit: 6.0,
  },
  {
    id: "opp:sr-ross-20261120-sefe-graduate-lng-singapore", company: "SEFE", companyId: "co:sefe", city: "Singapore", officeId: "",
    role: "Graduate — LNG Trading", business: "Integrated Energy / Oil & Gas", function: "LNG Trading & Portfolio Analysis",
    commodity: "LNG; Natural gas", geography: "Global", experience: "Graduate programme; quantitative/analytical bachelor's or master's completed or near completion",
    url: "https://careers.sefe.eu/job/Graduate-LNG-%28mfd%29/1568-en_GB", posted: "2026-11-16", deadline: "2026-12-16", fit: "High",
    confidence: "High — official SEFE Singapore front-office posting checked 2026-11-20",
    next: "Deadline 16 December 2026. Check whether the graduate intake accepts a candidate with two years' full-time experience and whether the role is an appropriate level before investing in the application.",
    requirements: "Graduate LNG trading role spanning market analysis, trade execution, exposure/P&L reporting, cargo and portfolio optimisation, shipping, operations and risk. Requires a quantitative/analytical degree; prior LNG experience is not required. Application closes 16 December 2026.",
    candidate: 7, candidateNotes: "7/10. Quantitative energy-market modelling and current European power/gas analysis transfer; no direct LNG experience, and two years of work may be above the intended graduate cohort.",
    roleFit: 8.5, roleNotes: "8.5/10. Front-office LNG exposure, analytical work and portfolio optimisation strongly match Ross's energy-market interests; graduate seniority is the main drawback.",
    comp: "USD 90,000/year estimated gross total cash midpoint", compNotes: "Employer says competitive salary and bonus potential but publishes no figures. Low-confidence Singapore graduate trading estimate, broad range USD 75,000–105,000/year.",
    earnings: 4.5, earningsNotes: "Estimated 10-year gross potential based on USD 90,000 first-year total cash and 8% illustrative progression; bonus/P&L and level progression uncertain.",
    locationFit: 8.9,
  },
  {
    id: "opp:sr-ross-20261120-jera-lng-market-fundamentals-analyst-singapore", company: "JERA Global Energy Solutions", companyId: "co:jera-global-energy-solutions", city: "Singapore", officeId: "",
    role: "Market Fundamentals Analyst — LNG", business: "Physical Commodity Trader", function: "LNG Fundamentals & Trading Research",
    commodity: "LNG; Natural gas", geography: "Global; Asia-Pacific", experience: "2–4 years in LNG, natural gas, power or energy-market analysis",
    url: "https://sg.indeed.com/viewjob?jk=78122388666b568e", posted: "2026-11-16 (Indeed listing stated 4 days before 2026-11-20)", fit: "High",
    confidence: "Medium-high — detailed employer-profile listing on Indeed; confirm on JERA's application system before applying",
    next: "High-priority gas analyst lead: verify the role remains open and submit through the employer's application route. Strong adjacency to current power/gas balance work; direct LNG experience is preferred but not the only route.",
    requirements: "Build global LNG balances and long-term price views, models and analysis for trading. Listing asks 2–4 years in LNG, natural gas, power or energy markets; direct LNG experience preferred. No language requirement was stated in the available listing. Salary listing SGD 12,000–17,000/month is third-party and unverified by employer.",
    candidate: 6.5, candidateNotes: "6.5/10. Two years of power forecasting/model work and current powerburn/gas-balance analysis are relevant; only one week on the gas desk and no direct LNG analysis leave a material domain gap.",
    roleFit: 8.5, roleNotes: "8.5/10. LNG market fundamentals, balance modelling and trader-facing analysis are close to Ross's preferred analyst path and energy interests.",
    comp: "USD 135,000/year estimated gross total cash midpoint", compNotes: "Third-party Indeed range SGD 12,000–17,000/month annualizes to about USD 112,000–159,000 at ~0.78 USD/SGD. Employer has not verified pay; bonus not separated.",
    earnings: 5.5, earningsNotes: "Estimated 10-year gross potential based on USD 135,000 first-year total cash and 8% illustrative progression; variable pay, promotion and tenure uncertain.",
    locationFit: 8.9,
  },
  {
    id: "opp:sr-ross-20261120-jera-crude-market-fundamentals-analyst-singapore", company: "JERA Global Energy Solutions", companyId: "co:jera-global-energy-solutions", city: "Singapore", officeId: "",
    role: "Market Fundamentals Analyst — Crude Oil", business: "Physical Commodity Trader", function: "Crude Oil Fundamentals & Trading Research",
    commodity: "Crude oil", geography: "Global; Asia-Pacific", experience: "4–7 years in oil-market research or analysis",
    url: "https://sg.indeed.com/viewjob?jk=d1f38a0a63eb20df", posted: "Current listing checked 2026-11-20", fit: "Low",
    confidence: "Medium-high — detailed employer-profile listing on Indeed; confirm on JERA's application system before applying",
    next: "Low priority: explicit oil-market experience and seniority gaps. Verify whether the listing is active before applying.",
    requirements: "Crude oil fundamental analysis and price modelling for trading decisions, including global supply, demand and market drivers. Listing asks 4–7 years of oil research; salary shown by Indeed is not independently employer-verified.",
    candidate: 3, candidateNotes: "3/10. Strong quantitative energy analysis transfers, but Ross has no crude-oil research/trading experience and falls below the stated 4–7 years.",
    roleFit: 6.5, roleNotes: "6.5/10. Analyst position at an energy trading group is attractive, but crude-oil focus is materially less aligned than power/gas.",
    comp: "USD 135,000/year estimated gross total cash midpoint", compNotes: "Third-party Indeed range SGD 12,000–17,000/month; converted midpoint about USD 135,000/year at ~0.78 USD/SGD. Employer has not verified pay or bonus.",
    earnings: 5.5, earningsNotes: "Estimated 10-year gross potential based on USD 135,000 first-year total cash and 8% illustrative progression; variable pay uncertain.",
    locationFit: 8.9,
  },
  {
    id: "opp:sr-ross-20261120-prism-lng-market-analyst-singapore", company: "PRISM Energy International", companyId: "co:prism-energy-international", city: "Singapore", officeId: "",
    role: "LNG Market Analyst", business: "Physical Commodity Trader", function: "LNG Market Analysis",
    commodity: "LNG; Natural gas", geography: "Asia-Pacific; Global", experience: "3+ years LNG market analysis; business-level Korean required",
    url: "https://sg.indeed.com/viewjob?jk=13c425b1097e1448", posted: "2026-11-19 (Indeed listing stated 1 day before 2026-11-20)", fit: "Low",
    confidence: "Medium-high — detailed employer-profile listing on Indeed; official employer application path not independently confirmed",
    next: "Language and direct-LNG requirements are hard barriers: the listing requires business Korean and 3+ years LNG analysis. Confirm before spending time on an application.",
    requirements: "LNG market analysis and trading briefings using supply-demand, pricing, market and policy information, with analytics/AI tools. Listing requires at least 3 years of LNG market analysis and business-level Korean. Third-party listing indicates SGD 12,000–19,000/month; employer has not verified compensation.",
    candidate: 2.5, candidateNotes: "2.5/10. Quantitative energy modelling transfers, but Ross has only one week in gas, no direct LNG analysis and no Korean; both stated requirements are substantial gaps.",
    roleFit: 8, roleNotes: "8/10. LNG analysis supporting trading is attractive; the language and experience gates do not reduce role preference, only candidate fit.",
    comp: "USD 145,000/year estimated gross total cash midpoint", compNotes: "Third-party listing range SGD 12,000–19,000/month implies about USD 112,000–178,000/year at ~0.78 USD/SGD. Not employer-verified; bonus not separated.",
    earnings: 5.7, earningsNotes: "Estimated 10-year gross potential based on USD 145,000 first-year total cash and 8% illustrative progression; bonus, promotion and tenure uncertain.",
    locationFit: 8.9,
  },
  {
    id: "opp:sr-ross-20261120-prism-lng-originator-singapore", company: "PRISM Energy International", companyId: "co:prism-energy-international", city: "Singapore", officeId: "",
    role: "LNG Originator", business: "Physical Commodity Trader", function: "LNG Origination",
    commodity: "LNG; Natural gas", geography: "Asia-Pacific; Global", experience: "2+ years LNG commercial/origination; business-level Korean required",
    url: "https://sg.indeed.com/viewjob?jk=2b89d8aa3ce2ac12", posted: "2026-11-19 (Indeed listing stated 1 day before 2026-11-20)", fit: "Low",
    confidence: "Medium-high — detailed employer-profile listing on Indeed; official employer application path not independently confirmed",
    next: "Low priority: business Korean and direct LNG origination experience are explicit requirements. Verify the role and language gate before applying.",
    requirements: "LNG commercial origination covering counterparties, contracts and trading opportunities. Listing asks 2+ years in LNG commercial/origination and business-level Korean. Salary shown in third-party listing only.",
    candidate: 1.5, candidateNotes: "1.5/10. Ross has no LNG origination, contract negotiation or Korean proficiency; only adjacent power/gas analysis transfers.",
    roleFit: 6.5, roleNotes: "6.5/10. Commercial energy role has some appeal, but it is a relationship/contract origination seat rather than the analytical desk role Ross prefers.",
    comp: "USD 145,000/year estimated gross total cash midpoint", compNotes: "Third-party listing range SGD 12,000–19,000/month implies about USD 112,000–178,000/year at ~0.78 USD/SGD. Not employer-verified; bonus not separated.",
    earnings: 5.7, earningsNotes: "Estimated 10-year gross potential based on USD 145,000 first-year total cash and 8% illustrative progression; bonus, promotion and tenure uncertain.",
    locationFit: 8.9,
  },
  {
    id: "opp:sr-ross-20261120-clp-tariff-strategy-hong-kong", company: "CLP Power", companyId: "co:clp-power", city: "Hong Kong", officeId: "off:2d0d0aefe2ca",
    role: "Assistant Manager — Tariff Strategy & Development", business: "Utility / Power Producer", function: "Power Tariff & Market Strategy",
    commodity: "Electricity; Power", geography: "Hong Kong", experience: "5+ years relevant experience; lower grade may be considered for strong candidates",
    url: "https://iabhtj.fa.ocs.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CLP-Recruitment-System/jobs?src=levels.fyiutm_mediumutm_mediumutm_mediumutm_medium", posted: "Not stated by employer", fit: "Low",
    confidence: "High — current CLP careers board confirms vacancy and Hong Kong location; detailed experience wording cross-checked against LinkedIn on 2026-11-20",
    next: "Low-to-medium priority. The role is power tariff/policy research, not a trading desk, and asks for five years; the employer says less-experienced high-potential candidates may be considered at a lower grade.",
    requirements: "Tariff design/development, market research, pricing, regulation and customer data analysis at CLP. Baseline asks five years' relevant experience, while allowing lower grade consideration for less experience/high potential. English or Chinese language requirement was not stated in the reviewed listing.",
    candidate: 4, candidateNotes: "4/10. Power-market analysis and quantitative modelling are relevant, but tariff/regulatory strategy differs from trading analysis and the stated baseline is five years.",
    roleFit: 4.5, roleNotes: "4.5/10. The power-market work is relevant, but this is utility tariff strategy rather than trading, desk analysis or portfolio optimisation.",
    comp: "USD 100,000/year estimated gross base midpoint", compNotes: "Employer does not disclose compensation in the reviewed listing. Low-confidence Hong Kong assistant-manager estimate; broad range USD 75,000–125,000/year, bonus unknown.",
    earnings: 4.8, earningsNotes: "Estimated 10-year gross potential based on USD 100,000 first-year base and 5.5% illustrative progression; bonus and grade uncertain.",
    locationFit: 10,
  },
  {
    id: "opp:sr-ross-20261120-socgen-bernstein-asia-energy-hong-kong", company: "Société Générale", companyId: "co:societe-generale", city: "Hong Kong", officeId: "off:15de7559adf2",
    role: "Equity Research Associate — Asia Energy (Bernstein)", business: "Bank / Financial Institution", function: "Energy Equity Research",
    commodity: "Oil; Natural gas; Power; Energy storage", geography: "Asia-Pacific", experience: "Experience not specified; advanced financial modelling; English and Mandarin fluency",
    url: "https://careers.societegenerale.com/en/job-offers/equity-research-associate-asia-energy-bernstein-hong-kong-260007C3-en", posted: "2026-05-28", fit: "Low",
    confidence: "High — current official Société Générale posting checked 2026-11-20",
    next: "Low priority unless willing to pursue sell-side equity research and can meet the stated Mandarin proficiency requirement; Ross's current Mandarin is HSK2/basic.",
    requirements: "Equity research coverage of Asia energy, including oil, gas, power and storage. Requires advanced financial modelling, strong academics, and excellent written/spoken English and Mandarin; energy experience is a plus. No minimum years stated.",
    candidate: 3, candidateNotes: "3/10. Energy fundamentals and modelling transfer, but there is no sell-side equity research experience and the explicit fluent Mandarin requirement is not met.",
    roleFit: 5.5, roleNotes: "5.5/10. Strong energy research content, but equity research is farther from trading-desk analysis and portfolio decisions than Ross's preferred destination.",
    comp: "USD 110,000/year estimated gross total cash midpoint", compNotes: "No compensation disclosed. Low-confidence Hong Kong research-associate estimate, broad range USD 85,000–140,000/year; variable compensation unknown.",
    earnings: 5.1, earningsNotes: "Estimated 10-year gross potential based on USD 110,000 first-year cash and 6% illustrative progression; bonus and promotion uncertain.",
    locationFit: 10,
  },
  {
    id: "opp:sr-ross-20261120-phillips66-heavies-market-research-singapore", company: "Phillips 66", companyId: "co:phillips-66", city: "Singapore", officeId: "off:20984ae84c86",
    role: "Advisor — Heavies Market Research", business: "Integrated Energy / Oil & Gas", function: "Fuel Oil Market Research",
    commodity: "Fuel oil; Residual products", geography: "Asia-Pacific; Global", experience: "4+ years in fuel-oil/residual-market analysis",
    url: "https://careers.phillips66.com/content/Singapore-Opportunities/?locale=en_US", posted: "Current employer Singapore opportunities listing checked 2026-11-20", fit: "Low",
    confidence: "Medium-high — employer Singapore opportunities page lists the role; detailed requirements and salary cross-checked against LinkedIn on 2026-11-20",
    next: "Low priority: seniority and fuel-oil domain gaps; role is market research rather than power/gas. Employer-linked salary range is SGD 10,050–11,725/month before any undisclosed bonus.",
    requirements: "Fuel oil/residual market research and analysis for trading/business decisions. Listing calls for at least four years of relevant fuels experience. Singapore; detailed role information appears on employer and LinkedIn listings.",
    candidate: 2.5, candidateNotes: "2.5/10. Quantitative energy analysis transfers, but Ross has no fuel-oil/residual products experience and is below the four-year requirement.",
    roleFit: 5, roleNotes: "5/10. Commercial market research informs energy trading but is focused on fuel oil, outside Ross's power/gas experience and first-choice market.",
    comp: "USD 105,000/year estimated gross base midpoint", compNotes: "Employer/LinkedIn band SGD 10,050–11,725/month annualizes to SGD 121k–141k, roughly USD 94k–110k at ~0.78 USD/SGD; midpoint used. Any bonus not disclosed.",
    earnings: 5, earningsNotes: "Estimated 10-year gross potential based on USD 105,000 first-year base and 6% illustrative progression; bonus and promotion uncertain.",
    locationFit: 8.9,
  },
  {
    id: "opp:sr-ross-20261120-imc-commodities-analyst-sydney", company: "IMC Trading", companyId: "co:imc-trading", city: "Sydney", officeId: "off:f901b5e29088",
    role: "Commodities Analyst", business: "Prop Trading / Market Maker", function: "Commodity Fundamentals & Trading Research",
    commodity: "Crude oil; Refined products; LNG; Petrochemicals; Base metals; Coal", geography: "Global; Asia-Pacific", experience: "3+ years in commodity-focused analysis",
    url: "https://www.imc.com/ap/careers/jobs/5018650101", posted: "2026-11-19", fit: "Medium",
    confidence: "High — official IMC Sydney posting checked 2026-11-20",
    next: "Analyst-led trading role with strong fundamental content. Assess the 3+ year commodity-analysis threshold and wide product scope before applying.",
    requirements: "Build global commodity supply-demand/inventory balances, model curves and spreads, monitor catalysts, and translate fundamental, macro and geopolitical research into trader-facing ideas; maintain models and research tools in Python/SQL. Requires 3+ years in commodity analysis. No Mandarin requirement stated in this general posting.",
    candidate: 5.5, candidateNotes: "5.5/10. Strong power forecasting/modelling and developing gas-balance work transfer to energy fundamentals. Ross is about one year short of the 3+ year requirement and has limited direct experience in most products listed.",
    roleFit: 8, roleNotes: "8/10. Desk-facing fundamental analysis, supply-demand balances and Python research tools fit Ross's analyst preference; broad oil/metal/coal coverage dilutes the power/gas match.",
    comp: "USD 140,000/year estimated gross total cash midpoint", compNotes: "Employer does not publish a range. Low-confidence Sydney buy-side commodities analyst estimate; broad range USD 110,000–170,000/year, bonus/P&L not disclosed.",
    earnings: 5.6, earningsNotes: "Estimated 10-year gross potential based on USD 140,000 first-year total cash and 8% illustrative progression; variable pay, promotion and tenure uncertain.",
    locationFit: 6.4,
  },
  {
    id: "opp:sr-ross-20261120-exxon-quant-analyst-lead-vs-lng-singapore", company: "ExxonMobil", companyId: "co:exxonmobil", city: "Singapore", officeId: "off:5bc0f7b87556",
    role: "Quantitative Analyst Lead — V&S LNG", business: "Integrated Energy / Oil & Gas", function: "LNG Valuation & Portfolio Optimisation",
    commodity: "LNG; Natural gas", geography: "Global; Asia-Pacific; Europe; Americas", experience: "Significant front-office quant leadership; LNG valuation, optionality, optimization and team leadership",
    url: "https://jobs.exxonmobil.com/ExxonMobil/job/Singapore-Quantitative-Analyst-Lead%2C-V%26S-LNG-98633/1411113600/", posted: "2026-11-14", fit: "Low",
    confidence: "High — official ExxonMobil posting live and checked 2026-11-20",
    next: "Major seniority mismatch: this leads an LNG quantitative team and requires significant LNG front-office quant leadership. Track for the desk, not as a near-term application target.",
    requirements: "Lead LNG quantitative analysts supporting global trading, portfolio optimization, origination and structured transactions; build valuation and optimization frameworks for contracts, shipping, storage and regas assets. Requires advanced quantitative degree, extensive LNG front-office quant experience and team leadership.",
    candidate: 2, candidateNotes: "2/10. Strong model-building skills are relevant, but Ross has no LNG valuation, contract optionality or quantitative team-leadership experience; the posting requires significant front-office LNG quant experience.",
    roleFit: 8, roleNotes: "8/10. LNG quant valuation and portfolio optimisation are commercially attractive energy work, but the lead/senior remit is well above Ross's current level.",
    comp: "USD 250,000/year estimated gross total cash midpoint", compNotes: "No employer compensation disclosed. Broad low-confidence estimate for a Singapore front-office quant lead, USD 200,000–300,000/year; variable pay is unquantified.",
    earnings: 7, earningsNotes: "Estimated 10-year gross potential based on USD 250,000 first-year total cash and 8% illustrative progression; bonus, P&L and promotion uncertain.",
    locationFit: 8.9,
  },
  {
    id: "opp:sr-ross-20261120-shell-power-market-analyst-london", company: "Shell Trading", companyId: "co:shell-trading", city: "London", officeId: "off:175c0c641de6",
    role: "Power Market Analyst — Short/Medium Term", business: "Integrated Energy / Oil & Gas", function: "Short/Medium-Term Power Fundamentals",
    commodity: "Power; Natural gas", geography: "Europe; Global", horizon: "Day-ahead to 2 years ahead",
    experience: "Proven power-market fundamentals and stack-modelling experience; Python/Excel; European market knowledge",
    url: "https://shell.wd3.myworkdayjobs.com/en-US/shellcareers/job/London-York-Road/Power-Market-Analyst_R202611", posted: "2026-07-27 (official page says live; checked 2026-11-20)", fit: "High",
    confidence: "High — official Shell Trading & Supply posting is live and has an Apply action; checked 2026-11-20",
    next: "Top-priority application. This is a close match to Ross's European power analysis, short/medium-term forecasting, stack modelling, Python and trader-facing commercial analysis. Complete Shell's mandatory online assessment after submitting.",
    requirements: "Short/medium-term fundamentals analyst covering day-ahead to two years ahead. Develop actionable power-price views and trading signals; analyze generation, demand, transmission and regulation; combine stack modelling and market fundamentals; collaborate with Power, Gas, traders, quants and business developers. Requires proven power fundamentals, stack-modelling tools, European power knowledge, Python/Excel, time-series data, and ability to defend analysis to traders. Flow-based coupling is desirable.",
    candidate: 9, candidateNotes: "9/10. Direct match to two years of European power analysis, CWE, stack-model ownership, short-term pricing/forecasting, Python and trading-stakeholder work. Remaining gaps are Shell-specific tools and experience generating a proven profitable track record; experience level otherwise aligns closely.",
    roleFit: 9.5, roleNotes: "9.5/10. Direct short/medium-term power analysis and trade-signal work with a large collaborative desk, plus gas-team exposure, closely matches Ross's ideal analyst role.",
    comp: "USD 165,000/year estimated gross total cash midpoint", compNotes: "Employer says competitive pay and performance-related increase but publishes no range. Low-confidence London trading-house power analyst estimate; broad range USD 130,000–200,000/year; bonus is variable.",
    earnings: 5.9, earningsNotes: "Estimated 10-year gross potential based on USD 165,000 first-year total cash and 7% illustrative progression; bonus, P&L, progression and tenure uncertain.",
    locationFit: 6.4,
  },
  {
    id: "opp:sr-ross-20261120-shell-energy-analyst-power-fundamentals-london", company: "Shell Trading", companyId: "co:shell-trading", city: "London", officeId: "off:175c0c641de6",
    role: "Energy Analyst — Power Fundamentals Forecasting", business: "Integrated Energy / Oil & Gas", function: "Power Forecasting & Trading Analytics",
    commodity: "Power; Natural gas; Weather", geography: "Europe", horizon: "Day-ahead to long term; role page also notes long-term forecasts up to 35 years",
    experience: "Experienced-professional; quantitative degree, strong production coding and forecasting/model deployment",
    url: "https://shell.wd3.myworkdayjobs.com/ShellCareers/job/London-York-Road/Energy-Analyst_R201954?source=APPLICANT_SOURCE_FWP", posted: "Official role inventory active; page checked 2026-11-20", fit: "High",
    confidence: "High — official Shell Trading job page with Apply action, checked 2026-11-20",
    next: "High priority. The page describes forecasting and optimization models for Power Fundamentals, with trading decisions as the goal; highlight end-to-end demand, wind, solar, availability and pricing-model production work.",
    requirements: "Develop and productionise forecasting and optimisation models for Shell Energy Europe Market Analysis/Power Fundamentals. Process power, gas and weather datasets; forecast demand, wind, solar and prices; validate models and build production deployment for daily trading decisions. Requires quantitative modelling/programming and cloud deployment experience; the posting values fundamentals knowledge and collaboration with domain experts.",
    candidate: 8.5, candidateNotes: "8.5/10. Strong match to production European power demand/renewables/availability forecasting and pricing-model work. Cloud deployment/model platform details may differ, and the role may be more data-science/model engineering than direct analyst coverage.",
    roleFit: 8.5, roleNotes: "8.5/10. Power fundamentals forecasting directly supports trading and matches Ross's technical strengths; it is less directly market-view ownership than the separate Short/Medium-Term Power Market Analyst role.",
    comp: "USD 155,000/year estimated gross total cash midpoint", compNotes: "Employer does not publish pay. Low-confidence London energy trading data-science/analyst estimate; broad range USD 125,000–190,000/year and variable bonus unknown.",
    earnings: 5.8, earningsNotes: "Estimated 10-year gross potential based on USD 155,000 first-year total cash and 7% illustrative progression; bonus and progression uncertain.",
    locationFit: 6.4,
  },
  {
    id: "opp:sr-ross-20261120-shell-gas-quant-structurer-london", company: "Shell Trading", companyId: "co:shell-trading", city: "London", officeId: "off:175c0c641de6",
    role: "Gas Quant Structurer", business: "Integrated Energy / Oil & Gas", function: "Gas Quantitative Modelling & Structuring",
    commodity: "Natural gas", geography: "Europe; Global", horizon: "Not stated by employer",
    experience: "Quantitative professional; specific years not visible in checked excerpt; gas valuation/optionalities likely required",
    url: "https://shell.wd3.myworkdayjobs.com/en-US/ShellCareers/job/Gas-Quant-Structurer_R208302", posted: "Official page says posted 11 days before 2026-11-20", fit: "Medium",
    confidence: "High — official Shell Trading & Supply role page live; checked 2026-11-20",
    next: "Stretch/adjacent role: inspect the full qualifications carefully. It is a gas structuring/valuation seat rather than a conventional fundamentals analyst role; Ross has no direct gas optionality or structuring experience.",
    requirements: "Quantitative professional in the Gas Deal Structuring team; develop pricing/valuation models for commercial gas products and structures. The role is front-office, but available listing emphasizes quantitative structuring rather than market fundamentals.",
    candidate: 4.5, candidateNotes: "4.5/10. Power modelling and quantitative software skills transfer, but Ross has only just moved to gas and has no stated structuring, valuation or gas-derivatives experience.",
    roleFit: 6.5, roleNotes: "6.5/10. Front-office gas quant work is relevant, but structuring is less aligned than direct analyst/fundamentals and trading-decision roles.",
    comp: "USD 180,000/year estimated gross total cash midpoint", compNotes: "No compensation disclosed. Low-confidence London gas quant/structuring estimate; broad range USD 140,000–230,000/year, bonus uncertain.",
    earnings: 6.2, earningsNotes: "Estimated 10-year gross potential based on USD 180,000 first-year total cash and 7% illustrative progression; variable pay and level uncertain.",
    locationFit: 6.4,
  },
  {
    id: "opp:sr-ross-20261120-point72-power-dispatch-quant-new-york", company: "Point72", companyId: "co:point72", city: "New York", officeId: "off:5dc93c869418",
    role: "Quant Researcher — Power Dispatch Modeling", business: "Hedge Fund / Investment Manager", function: "Power Dispatch Modelling & Investment Research",
    commodity: "Power; Electricity", geography: "United States; ERCOT/PJM/CAISO", horizon: "Short-term dispatch and forward scenarios",
    experience: "Master's/PhD; 5+ years direct SCUC/SCED power dispatch modelling; commercial solvers and US ISO knowledge",
    url: "https://careers.point72.com/CSJobDetail?jobCode=CSS-0013351&jobName=quant-researcher-power-dispatch-modeling&locale=English&location=New+York+%7C+Stamford&retURL=%2FCSCareerSearch", posted: "Current official posting checked 2026-11-20", fit: "Low",
    confidence: "High — official Point72 posting checked 2026-11-20",
    next: "Long-shot benchmark: excellent technical/market adjacency, but 5+ years of direct US dispatch modelling, US ISO expertise and a graduate degree are stated requirements; US work authorization is also unresolved.",
    requirements: "Build and maintain ERCOT and other US ISO dispatch models in Python and a commercial solver, reproduce historical grid operations, improve scenario forecasts and communicate results to an investment team. Requires master's/PhD and 5+ years direct SCUC/SCED modelling, Gurobi/CPLEX, US grid operations and SQL/time-series experience.",
    candidate: 4.5, candidateNotes: "4.5/10. European stack model, MILP and market analysis transfer strongly; however this requires five years direct SCUC/SCED work, US power-market knowledge and a master's/PhD. Work authorization is a separate obstacle and isn't folded into the technical-fit score.",
    roleFit: 8.5, roleNotes: "8.5/10. Power dispatch modelling and scenario analysis for investment decisions closely match Ross's intellectual interests; US market scope and investment-fund setting differ from his current European trading-desk work.",
    comp: "USD 200,000/year estimated gross base midpoint", compNotes: "Official listing gives USD 150,000–250,000 annual base, excluding discretionary bonus; midpoint used. Actual offer depends on experience and location.",
    earnings: 6.7, earningsNotes: "Estimated 10-year gross potential based on USD 200,000 first-year base and 8% illustrative progression; discretionary bonus, promotion and tenure uncertain.",
    locationFit: 9.7,
  },
  {
    id: "opp:sr-ross-20261120-northpool-junior-spot-trader-vancouver", company: "Northpool", companyId: "co:northpool", city: "Vancouver", officeId: "off:c53945223b30",
    role: "(Junior) Spot Trader — Intraday Power", business: "Prop Trading / Market Maker", function: "Intraday Power Trading",
    commodity: "Power; Electricity", geography: "North America; Canada", horizon: "Intraday / spot",
    experience: "Maximum 2 years' experience; analytical degree; Canadian residency and permanent work permit required",
    url: "https://www.northpool.nl/vacancies/junior-spot-trader-id-vancouver", posted: "Current official vacancy checked 2026-11-20; planned start March 2027", fit: "Low",
    confidence: "High — official Northpool vacancy checked 2026-11-20",
    next: "Check Canadian work-permit eligibility first. The posting requires Canadian residency/permanent work permit and includes 12–15 months' training in Leiden before Vancouver shift trading; it is a trader role, not analyst.",
    requirements: "Junior intraday power spot trading with market fundamentals, quantitative decision-making, simulations and risk management. Max two years' experience, analytical/quant degree, strong mathematics and willingness to work evenings/weekends. Requires Canadian residency and permanent work permit; 12–15 month training in Leiden precedes Vancouver placement.",
    candidate: 4, candidateNotes: "4/10. Ross's previous GB intraday power rotation and quantitative energy analysis are relevant, but Canadian work authorization/residency is explicitly required and the N. American market is new.",
    roleFit: 6.5, roleNotes: "6.5/10. Direct intraday power work is relevant, but Ross prefers analyst roles and this is a shift-trading position with a Canadian market focus.",
    comp: "USD 110,000/year estimated gross total cash midpoint", compNotes: "Employer does not disclose pay. Low-confidence Vancouver junior power-trader estimate, broad range USD 85,000–135,000/year; variable compensation unknown.",
    earnings: 5.2, earningsNotes: "Estimated 10-year gross potential based on USD 110,000 first-year cash and 7% illustrative progression; bonus and tenure uncertain.",
    locationFit: 6.4,
  },
  {
    id: "opp:sr-ross-20261120-alinta-energy-spot-trader-sydney", company: "Alinta Energy", companyId: "co:alinta-energy", city: "Sydney", officeId: "",
    role: "Energy Spot Trader", business: "Utility / Power Producer", function: "Short-Term Power & Gas Trading",
    commodity: "Power; Natural gas", geography: "Australia; National Electricity Market; Western Australia", horizon: "Spot / short-term dispatch",
    experience: "1–3 years in energy trading/support/market operations; Australian work rights required",
    url: "https://careers.alintaenergy.com.au/jobs/energy-spot-trader-sydney-nsw-australia-2dc68198-315b-4663-b228-935852921d2d", posted: "Live; closes 2026-12-04", deadline: "2026-12-04", fit: "Medium",
    confidence: "High — official Alinta Energy listing checked 2026-11-20",
    next: "Deadline 4 December. The one-to-three-year experience range is close, but confirm Australian work authorization/sponsorship before applying; role is trading rather than analyst.",
    requirements: "Trade short-term electricity and gas in Australian markets, including dispatch, bids/offers and spot decisions. Requires 1–3 years' energy trading/support/market operations and Australian work rights.",
    candidate: 5.5, candidateNotes: "5.5/10. European power-market analysis, GB intraday rotation and developing gas-balance experience transfer; Australian market structures and work rights are gaps.",
    roleFit: 6.5, roleNotes: "6.5/10. Energy spot trading is relevant, but the role is execution/trading rather than Ross's preferred analyst route and focuses on Australian markets.",
    comp: "USD 140,000/year estimated gross total cash midpoint", compNotes: "Employer does not publish compensation. Low-confidence Sydney energy trader estimate, broad range USD 110,000–170,000/year; variable pay not confirmed.",
    earnings: 5.6, earningsNotes: "Estimated 10-year gross potential based on USD 140,000 first-year total cash and 8% illustrative progression; bonus and promotion uncertain.",
    locationFit: 6.4,
  },
  {
    id: "opp:sr-ross-20261120-ls-power-energy-marketing-analyst-new-york", company: "LS Power", companyId: "co:ls-power", city: "New York", officeId: "off:role-ls-power-new-york",
    role: "Analyst / Associate — Energy Marketing & Trading", business: "Utility / Power Producer", function: "Energy Market Analysis & Trading",
    commodity: "Power; Natural gas; FTRs; Emissions; Renewable certificates", geography: "United States", horizon: "Not stated by employer",
    experience: "Analyst/Associate; confirm exact experience and US market requirements on application",
    url: "https://careers-lspower.icims.com/jobs/1582/analyst-associate%2C-energy-marketing-%26-trading/job?in_iframe=1", posted: "Current official ATS listing checked 2026-11-20", fit: "Medium",
    confidence: "High — official LS Power ATS posting checked 2026-11-20; exact experience detail should be reviewed on application",
    next: "Strong energy-analysis title but US markets and US work authorization are major practical gates. Read the full requisition before applying.",
    requirements: "Energy Marketing & Trading analyst/associate role involving commodity market analysis and trading opportunities across power, FTRs, emissions/RECs, natural gas and related products. Detailed experience requirements were not available in the search extract.",
    candidate: 6, candidateNotes: "6/10. Quantitative power modelling and trading analysis transfer, but US ISO/market design knowledge and US work authorization are unresolved; gas and emissions experience is limited.",
    roleFit: 8, roleNotes: "8/10. Analyst/associate remit across power and gas trading is attractive and matches Ross's analyst preference; US market focus is a significant difference.",
    comp: "USD 150,000/year estimated gross total cash midpoint", compNotes: "Employer did not publish salary in the retrieved listing. Low-confidence New York energy-markets analyst estimate, broad range USD 120,000–190,000/year; bonus unknown.",
    earnings: 5.8, earningsNotes: "Estimated 10-year gross potential based on USD 150,000 first-year cash and 8% illustrative progression; variable pay and promotion uncertain.",
    locationFit: 9.7,
  },
  {
    id: "opp:sr-ross-20261120-rwe-quant-risk-analyst-london", company: "RWE Supply & Trading", companyId: "co:rwe-supply-trading", city: "London", officeId: "off:9493fbeaffe9",
    role: "Quantitative Risk Analyst — Energy Trading", business: "Physical Commodity Trader", function: "Trading Risk Analytics",
    commodity: "Power; Natural gas; LNG; Oil", geography: "Global", horizon: "Not stated by employer",
    experience: "Experienced professional; exact years not stated in the reviewed extract",
    url: "https://jobs.rwe.com/RWE/job/London-%28Senior%29-Quantitative-Risk-Analyst-City-EC2R-8HP/1454355333/", posted: "Current official RWE listing checked 2026-11-20", fit: "Low",
    confidence: "High — official RWE posting checked 2026-11-20",
    next: "Lower priority: quant risk/P&L modelling on an energy trading desk, but risk is a support function and less aligned with Ross's direct analyst preference. Review experience level before applying.",
    requirements: "Build and maintain quantitative risk/P&L models for commodity trading, supporting trading decisions across power, gas/LNG and oil. Exact experience requirements should be confirmed on the official page.",
    candidate: 5.5, candidateNotes: "5.5/10. Quantitative model-building and power/gas market context are useful; direct trading risk, P&L attribution and risk-model governance experience are not established.",
    roleFit: 4.5, roleNotes: "4.5/10. Strong company and commodity context, but quantitative risk is a middle-office/support remit rather than a market-analysis or trading role Ross prefers.",
    comp: "USD 150,000/year estimated gross total cash midpoint", compNotes: "Employer does not publish compensation in the reviewed listing. Low-confidence London trading quant-risk estimate, broad range USD 120,000–180,000/year; bonus uncertain.",
    earnings: 5.8, earningsNotes: "Estimated 10-year gross potential based on USD 150,000 first-year cash and 7% illustrative progression; bonus and career progression uncertain.",
    locationFit: 6.4,
  },
];

const additions = [];
for (const role of roles) {
  if (jobById.has(role.id)) throw new Error(`Opportunity already exists: ${role.id}`);
  const row = makeJob(role);
  additions.push(row);
}

// Refresh already-tracked openings and correct false city records found during this sweep.
const refreshes = [
  ["opp:sr-ross-20261105-drw-commodities-macro-london", { Confidence: "High — official DRW London listing live; checked 2026-11-20", "Posted": "Live on official DRW board 2026-11-20", "Next Action": "Minimum three years relevant work; Ross has about two. Analyst supports a PM with commodity balances, Python research tools, risk and P&L analysis. Apply only if the one-year experience gap is acceptable." }],
  ["opp:sr-ross-20261105-drw-qr-commodities-london", { Confidence: "High — official DRW London listing live; checked 2026-11-20", "Posted": "Live on official DRW board 2026-11-20", "Next Action": "Minimum two years in an alpha-generating role plus deployed predictive models; direct strategy-alpha ownership is the key gap. Commodity quant role is current, but the desk asset mix is not specified." }],
  ["opp:weekly-20261107-imc-analyst-sydney", { Confidence: "High — official IMC Sydney posting checked 2026-11-20", "Next Action": "This is the separate China-focused analyst requisition in Sydney, not Hong Kong. It requires 3+ years of commodity analysis and fluent Mandarin/English. Ross has basic Mandarin only; retain as a low-fit stretch, not a language-qualified application." }],
  ["opp:sr001:co-exxonmobil:hong-kong:senior-gas-trading-analyst-north-american-gas", { "Scope Status": "Out of Scope", Confidence: "High — official ExxonMobil posting confirms Spring, Texas; Hong Kong aggregator location is incorrect (checked 2026-11-20)", "Next Action": "Excluded from the Hong Kong map: employer's live location is Spring, Texas, outside registered job-search cities. Do not use the recruiter-hosted Hong Kong location." }],
  ["opp:sweep:269e48e2aa57", { "Scope Status": "Out of Scope", Confidence: "High — official IMC posting identifies Sydney only; Hong Kong listing was a false location (checked 2026-11-20)", "Next Action": "Excluded from the Hong Kong map: this China commodities analyst requisition is Sydney-only and requires 3+ years commodity analysis plus fluent Mandarin and English. The separate Sydney record is the canonical row." }],
  ["opp:sweep:02d35efba06e", { Link: "https://gentcommodity.com/careers/", "Date Found": "2026-11-20", Confidence: "Medium-high — official Gent Commodity career page shows an active Singapore Commodity Trader opening; product allocation and office address not stated in the available page", "Next Action": "Current Singapore trader opening, with graduate eligibility. The advertised desk/product allocation is unclear, so confirm whether this involves power/gas before applying; salary was not disclosed." }],
];
const changed = [];
for (const [id, fields] of refreshes) {
  const entry = jobById.get(id);
  if (!entry) continue;
  for (const [field, value] of Object.entries(fields)) setCell(entry.rowNumber, field, value);
  changed.push(id);
}

// Add the new company entities discovered in real Singapore vacancies, without inventing office addresses.
if (companyAdds.length) {
  const merged = [companyHeaders, ...companyRows.slice(1), ...companyAdds.map((r) => companyHeaders.map((h) => r[h] ?? null))];
  const last = merged.length;
  let endCol = companyHeaders.length, col = "";
  while (endCol > 0) { const rem = (endCol - 1) % 26; col = String.fromCharCode(65 + rem) + col; endCol = Math.floor((endCol - 1) / 26); }
  companySheet.getRange(`A1:${col}${last}`).values = merged;
  companyTable.resize(`A1:${col}${last}`);
}

const startJobsRow = jobs.getUsedRange().values.length + 1;
for (let i = 0; i < additions.length; i++) {
  const rowNumber = startJobsRow + i;
  jobs.getRange(`A${rowNumber}:AL${rowNumber}`).values = [jobHeaders.map((h) => additions[i][h] ?? null)];
}
jobTable.resize(`A1:AL${startJobsRow + additions.length - 1}`);

const newLinks = [];
for (const role of roles) {
  const values = Object.fromEntries(linkHeaders.map((h) => [h, null]));
  Object.assign(values, {
    "Opportunity ID": role.id, "Office ID": role.officeId || null, "Location ID": cityIds[role.city],
    Company: role.company, Office: role.city, City: role.city, Relation: "role_location",
    "Source location text": role.city, Confidence: role.confidence, Notes: "Official or credible vacancy names this registered city; no street office address asserted.", Owner: "Ross",
  });
  newLinks.push(linkHeaders.map((h) => values[h] ?? null));
}
const keptLinks = [];
for (const row of linkRows.slice(1)) {
  const id = String(row[linkIndex["Opportunity ID"]] ?? "");
  if (id === "opp:sr001:co-exxonmobil:hong-kong:senior-gas-trading-analyst-north-american-gas" || id === "opp:sweep:269e48e2aa57") continue;
  keptLinks.push(row);
}
const normalizedLinks = [...keptLinks, ...newLinks].map((row) => linkHeaders.map((_, i) => row[i] ?? null));
const linkMatrix = [linkHeaders, ...normalizedLinks];
const linkLast = linkMatrix.length;
linksSheet.getRange(`A1:K${linkLast}`).values = linkMatrix;
linksTable.resize(`A1:K${linkLast}`);

workbook.recalculate();
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(workbookPath);
console.log(JSON.stringify({ companies_added: companyAdds.map((r) => r.Company), jobs_added: additions.map((r) => ({ id: r["Opportunity ID"], company: r.Company, city: r.Location, role: r.Role })), jobs_refreshed_or_excluded: changed, job_links_added: newLinks.length, false_location_links_removed: 2 }));
