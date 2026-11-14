import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const path = "C:/Users/ross/Projects/worldofcommodities/worldofcommodities.xlsx";
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(path));
const rows = (name) => {
  const values = wb.worksheets.getItem(name).getUsedRange().values;
  const headers = values[0].map((v) => String(v ?? "").trim());
  return { headers, rows: values.slice(1).filter((r) => r.some((v) => v !== null && v !== ""))
    .map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? null]))) };
};
const write = (name, data, headers) => {
  const ws = wb.worksheets.getItem(name);
  const table = ws.tables.items[0];
  if (!table) throw new Error(`Missing table: ${name}`);
  const all = [headers, ...data.map((r) => headers.map((h) => r[h] ?? null))];
  let n = headers.length, col = "";
  while (n) { const rem = (n - 1) % 26; col = String.fromCharCode(65 + rem) + col; n = Math.floor((n - 1) / 26); }
  ws.getRange(`A1:${col}${all.length}`).values = all;
  table.resize(`A1:${col}${all.length}`);
};

const { headers: jobHeaders, rows: jobs } = rows("Jobs");
const { headers: linkHeaders, rows: links } = rows("Job Location Links");
const companies = rows("Company Registry").rows;
const offices = rows("Office Registry").rows;
const locations = rows("Location Registry").rows;
const rankings = rows("Location Rankings").rows.filter((r) => r.Owner === "Ross" && r.Rank !== null && r.Rank !== "");

const specs = [
  {
    id: "opp:woodside-eu-gas-market-analyst-singapore-2026-11",
    company: "Woodside Energy", companyId: "co:woodside-energy", officeId: "off:1b81dca2cc0c", city: "Singapore",
    role: "EU Gas Market Analyst", posted: "2026-11-10", deadline: "2026-11-27", candidate: 6,
    roleFit: 8.5, desk: 6.5, comp: 160000, progression: 0.055,
    commodity: "LNG; Natural gas", geography: "Europe; Asia-Pacific; North America",
    function: "Market Analysis & Research", horizon: "Not stated by employer",
    experience: "Relevant LNG/gas or power-market analysis experience; no minimum years stated",
    requirements: "Woodside lists EU Gas Market Analyst openings in Singapore or London. The work is fundamental LNG/gas analysis across JKM, TTF and Henry Hub, with China- and India-focused variants developing local market expertise. Requires relevant gas/LNG or power-market analysis experience, supply-demand modelling, Python/Excel and clear trading insight. No specific minimum years stated.",
    candidateNotes: "6/10. European power modelling and powerburn analysis feeding European gas balances are relevant; direct LNG, global gas-balance and Asian gas-market experience is limited, and the move to gas is very recent.",
    roleNotes: "8.5/10. Front-office market analysis translating gas fundamentals into tradeable views is strongly aligned with Ross’s interest in energy analysis and cross-market links.",
    deskNotes: "6.5/10 provisional. Program Galileo is building global trading, analytics and digital capability, but the posting does not provide performance or profitability evidence for this specific gas team.",
    next: "Apply before 2026-11-27 if pursuing; confirm which market variant is available in Singapore. Emphasize powerburn-to-gas balance work and quantify experience honestly.",
  },
  {
    id: "opp:woodside-lng-market-analyst-singapore-2026-11",
    company: "Woodside Energy", companyId: "co:woodside-energy", officeId: "off:1b81dca2cc0c", city: "Singapore",
    role: "LNG Market Analyst", posted: "2026-11-10", deadline: "2026-11-27", candidate: 5,
    roleFit: 8, desk: 6.5, comp: 160000, progression: 0.055,
    commodity: "LNG; Natural gas", geography: "Asia-Pacific; Europe; North America",
    function: "Market Analysis & Research", horizon: "Not stated by employer",
    experience: "Relevant energy, LNG/gas or power-market analysis experience; no minimum years stated",
    requirements: "Analyse global LNG and gas supply-demand balances, LNG flows, outages, storage, policy and regional dynamics across Asia, Europe and the US; develop actionable insights for Trading. Requires relevant energy/gas/power analysis experience, regional supply-demand modelling and Excel and/or Python. No specific minimum years stated.",
    candidateNotes: "5/10. This follows Ross’s calibrated LNG baseline: power-market and powerburn context transfers, but he has no direct LNG analysis or trading experience and only recently moved to gas.",
    roleNotes: "8/10. Global LNG fundamentals and trading-facing analysis are attractive and build on Ross’s interest in energy commodities, despite the current LNG experience gap.",
    deskNotes: "6.5/10 provisional. The employer describes a new global trading transformation and trading-facing LNG analytics; no desk-specific P&L or track-record evidence is public in the posting.",
    next: "Apply before 2026-11-27 if interested. Present direct powerburn/gas-balance work as adjacent experience; do not imply prior LNG coverage.",
  },
  {
    id: "opp:woodside-power-analyst-singapore-2026-11",
    company: "Woodside Energy", companyId: "co:woodside-energy", officeId: "off:1b81dca2cc0c", city: "Singapore",
    role: "Power Analyst", posted: "2026-11-10", deadline: "2026-11-27", candidate: 8.5,
    roleFit: 9.5, desk: 6.5, comp: 160000, progression: 0.055,
    commodity: "Power; Natural gas; Coal", geography: "Asia-Pacific",
    function: "Power Market Analysis", horizon: "Not stated by employer",
    experience: "Relevant power-market analysis or related energy analytical experience; no minimum years stated",
    requirements: "Develop fundamental power-market views from generation mix, demand, system balances, fuels, renewables, outages and interconnector flows; assess price formation, spreads and regional balances and provide actionable insight to Trading. Requires relevant power-market analysis or related energy analytical experience, data integration and Excel/Python capability. No specific minimum years stated.",
    candidateNotes: "8.5/10. Strong direct match to Ross’s European power-market modelling, forecasting, stack-model ownership and trading support. Reduced from 9–10 because this is APAC rather than his established European market and the exact regional remit is not specified.",
    roleNotes: "9.5/10. Trading-facing power fundamentals, price formation and spreads closely match Ross’s preferred analyst work; the Singapore location and global trading build-out add appeal.",
    deskNotes: "6.5/10 provisional. Program Galileo is explicitly adding analytics and trading capability, but the new initiative provides no public performance record for this particular power team.",
    next: "Highest-priority Woodside track to investigate. Apply by 2026-11-27; tailor the CV to market modelling, price formation, forecasting and trader-facing decisions.",
  },
  {
    id: "opp:totalenergies-eu-power-quant-modeling-analyst-geneva-2026-11",
    company: "TotalEnergies", companyId: "co:totalenergies", officeId: "off:44c37e6ef886", city: "Geneva",
    role: "Quantitative Modeling Analyst - EU Power", posted: "2026-11-13", deadline: "Not stated by employer as checked 2026-11-14", candidate: 8.5,
    roleFit: 10, desk: 7.5, comp: 180000, progression: 0.055,
    commodity: "Power; Natural gas", geography: "Europe",
    function: "Quantitative Power Analysis & Trading Analytics", horizon: "Short- and medium-term",
    experience: "3–5 years in European power markets; quantitative Master's or higher",
    requirements: "Own and enhance European power fundamental forecasting frameworks, including stack, optimization and delta models; develop short- and medium-term market views, assess trade ideas, back-test signals and build analytical tools for traders. Requires a quantitative Master's or higher, 3–5 years in European power markets, strong Python/modeling and cloud experience; AWS, Databricks and ML/AI familiarity. French is a plus; English is required.",
    candidateNotes: "8.5/10. Exceptional technical and domain overlap: European power analysis, stack and optimization models, price formation, forecasting, Python/AWS and trader-facing work. The main gaps are the stated 3–5 years (Ross has about 2) and the quantitative Master's requirement; his MSci and experience need employer interpretation.",
    roleNotes: "10/10. This is almost exactly Ross’s preferred destination: European power-market analysis and modelling embedded with traders, with direct responsibility for views, signals and trade ideas.",
    deskNotes: "7.5/10 provisional. The posting describes a mature European power trading function and direct trader integration, but no specific desk P&L or current profitability evidence was located.",
    next: "High-priority application. Check the employer posting for current availability and degree interpretation, then apply promptly; make the 2-year experience and MSci status explicit.",
  },
  {
    id: "opp:totalenergies-quantitative-lng-analyst-geneva-2026-11",
    company: "TotalEnergies Trading", companyId: "co:totalenergies-trading", officeId: "off:2ff69eceb64b", city: "Geneva",
    role: "Quantitative LNG Analyst", posted: "2026-10-30", deadline: "Not stated by employer as checked 2026-11-14", candidate: 5,
    roleFit: 8, desk: 7.5, comp: 155000, progression: 0.055,
    commodity: "LNG; Natural gas", geography: "Global",
    function: "Gas & LNG Market Analysis / Quantitative Research", horizon: "Not stated by employer",
    experience: "2+ years in LNG/natural gas; relevant MSc",
    requirements: "Geneva trading-floor role in the Gas/LNG/Dry Modelling and Analysis team: maintain and develop analytical tools, model global gas fundamentals and support TGP trading decisions. Listing states a relevant MSc, 2+ years in LNG/natural gas, Python/SQL, quantitative methods and fluent English; French is a plus. The employer application route is through the Swiss Job-Room listing.",
    candidateNotes: "5/10. Ross has transferable power-market and emerging European gas-balance work, but no LNG experience and does not yet have 2 years of gas/LNG experience. This is adjacent capability, not direct LNG fit.",
    roleNotes: "8/10. Quantitative global gas/LNG market modelling directly supports trading and is attractive to Ross; the work is a strong preference fit even though current candidate fit is moderate.",
    deskNotes: "7.5/10 provisional. The role sits in a global gas modelling team advising trading desks and management; this supports strategic relevance, but no team-specific P&L evidence is disclosed.",
    next: "Review the official Job-Room listing promptly. Treat the 2+ years LNG/natural-gas requirement as a material gap and ask whether closely related European power experience is accepted.",
  },
  {
    id: "opp:totalenergies-quant-modeling-analyst-oil-geneva-2026-11",
    company: "TotalEnergies", companyId: "co:totalenergies", officeId: "off:44c37e6ef886", city: "Geneva",
    role: "Quant Modeling Analyst - Oil", posted: "2026-11-02", deadline: "Not stated by employer as checked 2026-11-14", candidate: 4,
    roleFit: 6.5, desk: 7.5, comp: 145000, progression: 0.055,
    commodity: "Oil; Natural gas; Biofuels", geography: "Global",
    function: "Quantitative Trading Analytics & Tools", horizon: "Not stated by employer",
    experience: "Quantitative Master's or engineering degree; trading-floor/commodity experience is a plus, no minimum years stated",
    requirements: "Trading-floor Front Innovation Tools role building models and digital tools for physical and paper Oil and Gas desks, including option pricing, structured products, dashboards, credit-risk monitoring and logistics optimization. Requires a quantitative Master's or engineering degree with programming; Python/C++ and prior trading-floor or commodity-market experience are advantages. Desired start January 2027.",
    candidateNotes: "4/10. Ross’s quantitative modelling, Python and trading-floor exposure transfer, but he has no oil-market or derivatives-structuring experience. This is a material commodity and product gap.",
    roleNotes: "6.5/10. The trading-floor quantitative tools work is attractive, but the role is centered on oil and structured/derivatives tools rather than Ross’s preferred power-market analysis.",
    deskNotes: "7.5/10 provisional. The team directly supports multiple physical and paper trading desks from the trading floor; public evidence does not establish profitability of any specific supported desk.",
    next: "Lower priority than the EU Power role. Consider only if broad trading-floor quantitative tooling across oil and gas is appealing; verify the official posting remains open.",
  },
];

const companyById = new Map(companies.map((r) => [r["Company ID"], r]));
const officeById = new Map(offices.map((r) => [r["Office ID"], r]));
const locByCity = new Map(locations.map((r) => [String(r.City).toLowerCase(), r]));
const rankingByCity = new Map(rankings.map((r) => [String(r.City).toLowerCase(), Number(r.Rank)]));
const maxRank = Math.max(...rankings.map((r) => Number(r.Rank)));
const anchors = [[250000,1],[400000,2],[650000,3],[950000,4],[1400000,5],[2000000,6],[2850000,7],[4000000,8],[5600000,9],[8000000,10]];
const earningsScore = (total) => {
  if (total <= anchors[0][0]) return 1;
  for (let i = 1; i < anchors.length; i++) if (total <= anchors[i][0]) {
    const [x0,y0] = anchors[i-1], [x1,y1] = anchors[i];
    return Math.round((y0 + (total-x0)/(x1-x0)*(y1-y0))*10)/10;
  }
  return 10;
};
const comp10yr = (firstYear, rate) => firstYear * (Math.pow(1 + rate, 10) - 1) / rate;
const locationFit = (rank) => Math.round((10 - ((rank - 1) * 4 / (maxRank - 1))) * 10) / 10;
const weight = { candidate: .15, role: .25, earnings: .15, desk: .15, reputation: .05, location: .25 };
const seenRows = new Map();
for (let i = 0; i < jobs.length; i++) {
  const r = jobs[i];
  if (r["Company ID"] === "co:woodside-energy" || r["Company ID"] === "co:totalenergies" || r["Company ID"] === "co:totalenergies-trading") {
    const key = `${String(r.Company).toLowerCase()}|${String(r.Role).toLowerCase()}|${String(r.Location).toLowerCase()}`;
    seenRows.set(key, i);
  }
}
const existingIndexById = new Map(jobs.map((r, i) => [String(r["Opportunity ID"] || ""), i]));
let refreshed = 0, added = 0;
for (const spec of specs) {
  const company = companyById.get(spec.companyId);
  const office = officeById.get(spec.officeId);
  const loc = locByCity.get(spec.city.toLowerCase());
  const rank = rankingByCity.get(spec.city.toLowerCase());
  if (!company || !office || !loc || !rank) throw new Error(`Missing registry data for ${spec.company} / ${spec.city}`);
  const rep = Number(company["Company Reputation Score /10"]);
  const locScore = locationFit(rank);
  const cumulative = comp10yr(spec.comp, spec.progression);
  const earn = earningsScore(cumulative);
  const total = Math.round((spec.candidate*weight.candidate + spec.roleFit*weight.role + earn*weight.earnings + spec.desk*weight.desk + rep*weight.reputation + locScore*weight.location)*10)/10;
  const job = {
    Company: spec.company, Location: spec.city, Role: spec.role, Business: company.Category,
    "Role Function": spec.function, Commodity: spec.commodity, "Market Geography": spec.geography,
    "Time Horizon": spec.horizon, "Experience Requirement (years)": spec.experience,
    Owner: "Ross", Status: "New", Recruiter: "Direct company application", Link: spec.link,
    Posted: spec.posted, "Date Found": "2026-11-14", Deadline: spec.deadline,
    Fit: spec.candidate < 6 ? "Low" : spec.candidate < 8 ? "Medium" : "High",
    Confidence: spec.id.startsWith("opp:woodside-") ? "High — current official employer posting checked 2026-11-14; pay is a market estimate." : spec.id.includes("eu-power") || spec.id.includes("quant-modeling-analyst-oil") ? "High — live TotalEnergies apply route linked from a current posting checked 2026-11-14; pay is an estimate." : "Medium — current Swiss Job-Room/aggregator listing checked 2026-11-14; reconfirm employer application route and active status; pay is an estimate.",
    "Next Action": spec.next, Requirements: spec.requirements, "Opportunity ID": spec.id,
    "Company ID": spec.companyId, "Scope Status": "In Scope", "Office(s) (source text)": office.Office,
    "Office(s) (registry links)": office["Office ID"], "Candidate Fit Score /10": spec.candidate,
    "Candidate Fit Notes": spec.candidateNotes, "Role / Desk Outlook Score /10": spec.desk,
    "Role / Desk Outlook Notes": spec.deskNotes,
    "Total Compensation Expectation (USD)": `USD ${Math.round(spec.comp/1000)}k/year estimated gross total cash midpoint`,
    "Compensation Estimate Notes": `Employer does not disclose compensation. Working range USD ${Math.round(spec.comp*.82/1000)}k–${Math.round(spec.comp*1.18/1000)}k/year gross total cash; midpoint USD ${Math.round(spec.comp/1000)}k. ${spec.city === "Geneva" ? "Cross-checked against Michael Page Switzerland Salary Guide 2027: Commodity Trading quantitative analyst and market/research analyst CHF130k–170k (CHF150k midpoint); role seniority, bonus and firm-specific package vary. https://www.michaelpage.ch/salary-guide/generatepdf/global " : "No employer-specific Singapore salary range found; proxy based on comparable energy trading analytics roles, so confidence is low. "}Not company-specific pay data; bonus and benefits uncertain. 10-year expected-earnings model uses ${Math.round(spec.progression*100)}% illustrative annual progression.`,
    "Role Fit Score /10": spec.roleFit, "Role Fit Notes": spec.roleNotes,
    "Expected Earnings Score /10": earn,
    "Expected Earnings Notes": `10-year gross estimate about USD ${Math.round(cumulative/1000)}k using first-year USD ${Math.round(spec.comp/1000)}k and ${Math.round(spec.progression*100)}% illustrative annual progression. Before tax/discounting; bonus, P&L, promotion and tenure uncertain.`,
    "Location Fit Score /10": locScore, "Total Score /10": total, "Total Score Status": "Provisional",
  };
  if (spec.id === "opp:woodside-eu-gas-market-analyst-singapore-2026-11" || spec.id === "opp:woodside-lng-market-analyst-singapore-2026-11" || spec.id === "opp:woodside-power-analyst-singapore-2026-11") {
    job.Link = "https://careers.woodside.com.au/job/LNG-Market-Analytics/1370171266/";
  } else if (spec.id === "opp:totalenergies-eu-power-quant-modeling-analyst-geneva-2026-11") {
    job.Link = "https://jobs.totalenergies.com/en_US/careers/JobDetail/Quantitative-Modeling-Analyst-EU-Power/86206";
  } else if (spec.id === "opp:totalenergies-quantitative-lng-analyst-geneva-2026-11") {
    job.Link = "https://www.job-room.ch/job-search/100770d3-93ee-4a4b-8ffd-9ac27d8fa8bb";
  } else {
    job.Link = "https://jobs.totalenergies.com/en_US/careers/JobDetail/Quant-Modeling-Analyst-Oil/85173";
  }
  const existingIndex = existingIndexById.get(spec.id);
  const mapped = Object.fromEntries(jobHeaders.map((h) => [h, job[h] ?? null]));
  if (existingIndex !== undefined) { jobs[existingIndex] = mapped; refreshed++; }
  else { jobs.push(mapped); added++; }
  existingIndexById.set(spec.id, existingIndex === undefined ? jobs.length - 1 : existingIndex);

  const link = {
    "Opportunity ID": spec.id, "Office ID": office["Office ID"], "Location ID": loc["Location ID"],
    Company: spec.company, Office: office.Office, City: spec.city, Relation: "Registered employer office",
    "Source location text": `${spec.city} named in the current job posting; linked to the registered ${spec.company} office.`,
    Confidence: spec.id.startsWith("opp:woodside-") || spec.id.includes("eu-power") ? "High" : "Medium",
    Notes: spec.id.includes("quantitative-lng") ? "Role is described as Geneva trading floor; employer identity listed as TOTSA / TotalEnergies Trading." : "Role location linked to the existing in-scope office record.", Owner: "Ross",
  };
  const linkIndex = links.findIndex((r) => r["Opportunity ID"] === spec.id);
  const normalizedLink = Object.fromEntries(linkHeaders.map((h) => [h, link[h] ?? null]));
  if (linkIndex >= 0) links[linkIndex] = normalizedLink;
  else links.push(normalizedLink);
}

write("Jobs", jobs, jobHeaders);
write("Job Location Links", links, linkHeaders);
wb.recalculate();
await (await SpreadsheetFile.exportXlsx(wb)).save(path);
console.log(JSON.stringify({ added, refreshed, jobs: jobs.length, jobLocationLinks: links.length, opportunities: specs.map((s) => ({ id:s.id, role:s.role, company:s.company, city:s.city, deadline:s.deadline, total:Number(jobs.find((r)=>r["Opportunity ID"]===s.id)["Total Score /10"]) })) }, null, 2));
