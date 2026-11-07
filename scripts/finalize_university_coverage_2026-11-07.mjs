import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const path = "C:/Users/ross/Projects/worldofcommodities/worldofcommodities.xlsx";
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(path));
const read = (name) => {
  const values = wb.worksheets.getItem(name).getUsedRange().values;
  const headers = values[0].map((v) => String(v ?? "").trim());
  const rows = values.slice(1).filter((row) => row.some((v) => v !== null && v !== ""));
  return { headers, rows: rows.map((row) => Object.fromEntries(headers.map((h, i) => [h, row[i] ?? null]))) };
};
const write = (name, rows, headers) => {
  const sheet = wb.worksheets.getItem(name);
  const table = sheet.tables.items[0];
  if (!table) throw new Error(`Missing table for ${name}`);
  const values = [headers, ...rows.map((row) => headers.map((h) => row[h] ?? null))];
  let end = "";
  for (let n = headers.length; n; n = Math.floor((n - 1) / 26)) end = String.fromCharCode(65 + ((n - 1) % 26)) + end;
  sheet.getRange(`A1:${end}${values.length}`).values = values;
  table.resize(`A1:${end}${values.length}`);
};

const uni = read("University Registry");
const campuses = read("Campus Registry");
const masters = read("Masters");
const coverage = read("Search Coverage Log");
const runs = read("Search Runs");
const existingUni = new Map(uni.rows.map((r) => [r["University ID"], r]));
const activeIds = new Set(uni.rows.filter((r) => r["University ID"] && r["Search Active"] === true && r["University Search"] === true).map((r) => r["University ID"]));
const brown = existingUni.get("uni:brown-university");
if (brown) {
  brown["Search Active"] = false;
  brown["University Search"] = false;
  activeIds.delete("uni:brown-university");
}

// Campus points are scoped by the active University Registry. Location Registry
// is for job-search geography; an academic campus can be elsewhere.
const campusRows = [
  ["camp:columbia-morningside", "uni:columbia-university", "Columbia University", "Morningside Campus", "loc:new-york", "New York, New York, United States", "40.808769, -73.959990", "Campus-level (official Columbia map point)", "https://ombuds.columbia.edu/content/locations | https://www.openstreetmap.org/search?query=Columbia%20University%20Morningside%20Campus", "Official Columbia Morningside campus location; point matches university campus location.", "Ross"],
  ["camp:cornell-ithaca", "uni:cornell-university", "Cornell University", "Ithaca Main Campus", "loc:ithaca", "Ithaca, New York, United States", "42.4529160, -76.4800635", "Campus-level (OSM campus feature)", "https://maps.cornell.edu/ | https://www.openstreetmap.org/search?query=Cornell%20University%20Ithaca%20campus", "Main Ithaca campus. ORIE MEng uses Ithaca as the primary campus; Financial Engineering concentration includes a later term at Cornell's NYC site.", "Ross"],
  ["camp:dartmouth-hanover", "uni:dartmouth-college", "Dartmouth College", "Hanover Main Campus", "loc:hanover", "Hanover, New Hampshire, United States", "43.7034509, -72.2945505", "Campus-level (OSM campus feature)", "https://home.dartmouth.edu/about/campus-map | https://www.openstreetmap.org/search?query=Dartmouth%20College%20Hanover%20campus", "Dartmouth main campus; Energy Engineering MEng is on-campus.", "Ross"],
  ["camp:penn-main", "uni:university-of-pennsylvania", "University of Pennsylvania", "University City Campus", "loc:philadelphia", "Philadelphia, Pennsylvania, United States", "39.9522148, -75.1955729", "Campus-level (OSM campus feature)", "https://maps.upenn.edu/ | https://www.openstreetmap.org/search?query=University%20of%20Pennsylvania%20campus", "Main University City campus.", "Ross"],
  ["camp:stanford-main", "uni:stanford-university", "Stanford University", "Stanford Main Campus", "loc:palo-alto", "Palo Alto, California, United States", "37.4313138, -122.1693654", "Campus-level (OSM campus feature)", "https://campus-map.stanford.edu/ | https://www.openstreetmap.org/search?query=Stanford%20University%20main%20campus", "Main Stanford campus; both new course records use this same campus point.", "Ross"],
  ["camp:mit-main", "uni:massachusetts-institute-of-technology", "Massachusetts Institute of Technology", "Cambridge Main Campus", "loc:cambridge-ma", "Cambridge, Massachusetts, United States", "42.3582529, -71.0966272", "Campus-level (OSM campus feature)", "https://whereis.mit.edu/ | https://www.openstreetmap.org/search?query=Massachusetts%20Institute%20of%20Technology%20campus", "Main MIT campus; 2026-27 graduate cost budget used as cost basis.", "Ross"],
  ["camp:caltech-main", "uni:california-institute-of-technology", "California Institute of Technology", "Pasadena Main Campus", "loc:pasadena", "Pasadena, California, United States", "34.1370800, -118.1253400", "Campus-level (OSM university feature)", "https://www.caltech.edu/map | https://www.openstreetmap.org/way/29111188", "Main campus coordinate from named OSM university feature. No suitable terminal master's programme identified in the current target areas.", "Ross"],
  ["camp:berkeley-main", "uni:university-of-california-berkeley", "University of California, Berkeley", "Berkeley Campus", "loc:berkeley", "Berkeley, California, United States", "37.8754996, -122.2390685", "Campus-level (OSM campus feature)", "https://www.berkeley.edu/map/ | https://www.openstreetmap.org/search?query=University%20of%20California%20Berkeley%20campus", "Berkeley main campus; MAIML and MCS course records use this same campus point.", "Ross"],
  ["camp:fudan-handan", "uni:fudan-university", "Fudan University", "Handan Main Campus", "loc:shanghai", "Shanghai, China", "31.2988900, 121.4991700", "Campus vicinity (named Handan campus feature)", "https://www.fudan.edu.cn/en/2019/1018/c265a102294/page.psp | https://www.openstreetmap.org/search?query=Fudan%20University%20Handan%20Campus", "Official campus map identifies Handan campus; coordinate is the named campus point and should be refined if a building-specific programme appears.", "Ross"],
  ["camp:sjtu-minhang", "uni:shanghai-jiao-tong-university", "Shanghai Jiao Tong University", "Minhang Campus", "loc:shanghai", "Shanghai, China", "31.0275548, 121.4323084", "Campus-level (OSM campus feature)", "https://gc.sjtu.edu.cn/about/maps-directions/ | https://www.openstreetmap.org/search?query=Shanghai%20Jiao%20Tong%20University%20Minhang%20Campus", "Main engineering campus; the Low Carbon Energy lead remains in Research Inbox until the 2027 intake and course site are confirmed.", "Ross"],
  ["camp:nju-gulou", "uni:nanjing-university", "Nanjing University", "Gulou Campus", "loc:nanjing", "Nanjing, China", "32.0566400, 118.7736100", "Campus-level (OSM university feature)", "https://njunju.nju.edu.cn/EN/7d/e8/c7120a163304/page.htm | https://www.openstreetmap.org/way/88779953", "Gulou campus; the active international 2027 programme list checked did not yield a strong course match.", "Ross"],
  ["camp:ustc-east", "uni:university-of-science-and-technology-of-china", "University of Science and Technology of China", "Hefei East Campus", "loc:hefei", "Hefei, China", "31.8390200, 117.2638000", "Campus-level (OSM campus feature)", "https://en.ustc.edu.cn/ | https://www.openstreetmap.org/way/262614785", "East Campus named university feature. No suitable English-accessible target-area master's programme for 2027 was confirmed in this pass.", "Ross"],
];
const campusSeen = new Set(campuses.rows.map((r) => r["Campus ID"]));
const originalCampusCount = campuses.rows.length;
for (const [id, universityId, university, campus, locationId, location, coordinates, precision, source, notes, owner] of campusRows) {
  if (!activeIds.has(universityId)) throw new Error(`Campus ${id} does not belong to an active University Registry entry`);
  if (campusSeen.has(id)) continue;
  campuses.rows.push(Object.fromEntries(campuses.headers.map((h) => [h, ({
    "Campus ID": id, "University ID": universityId, University: university, Campus: campus,
    "Location ID": locationId, Location: location, Coordinates: coordinates,
    "Coordinate Precision": precision, "Source URL": source, "Checked On": "2026-11-07",
    Confidence: precision.startsWith("Campus-level") ? "High — named campus feature or official campus map verified" : "Medium — named campus verified; point is campus vicinity",
    Notes: notes, Owner: owner,
  })[h] ?? null])));
  campusSeen.add(id);
}

const programs = [
  {
    "University": "Stanford University", "Campus": "Stanford Main Campus", "Location": "Palo Alto, California, United States",
    "Course": "M.S. in Management Science and Engineering — Energy and Environment concentration",
    "Duration": "Typically 18 months (five quarters); can be completed in 9 months with a heavier load",
    "Tuition/year (USD)": "About USD 47,000/year equivalent; 45-unit tuition estimate about USD 70,500 total",
    "Living Costs/year (USD)": "Estimated USD 60,000/year; official MS&E cost page reports USD 15,091 per quarter (2024-25)",
    "Total Cost (USD)": "About USD 145,955 for a typical five-quarter course using the official 2024-25 MS&E estimate; future tuition may be higher",
    "Owner": "Ross", "Status": "New", "Link": "https://msande.stanford.edu/academics-admissions/graduate/ms-program/ms-degree",
    "Intake": "Autumn 2027", "Deadline": "2026-12-01 23:59 Pacific Time", "Fit": "High",
    "Confidence": "High for course, duration and deadline; medium for costs because the programme's published itemized estimate is 2024-25",
    "Requirements": "Quantitative or engineering bachelor's degree; multivariable calculus, linear algebra and programming are expected. GRE policy should be confirmed in the live application portal. The Energy and Environment concentration is one of the approved MS areas.",
    "Next Action": "Deadline is Dec 1, 2026. Check prerequisite-course equivalence, line up recommendations and transcripts, and prepare a focused statement connecting power-market forecasting/model building to the Energy and Environment concentration. Stanford MS&E applications are highly selective.",
    "Coordinates": "37.4313138, -122.1693654", "Opportunity ID": "opp:masters:stanford-msande-energy-environment-2027",
    "University ID": "uni:stanford-university", "Campus ID": "camp:stanford-main", "Course Fit Score /10": 8.5,
    "Course Fit Notes": "Strong applied quantitative and energy-systems fit, including an Energy and Environment concentration; less directly focused on physical power trading than the current job.",
    "Course / Programme Score /10": 9.5, "Course / Programme Notes": "Top-tier quantitative engineering programme with established analytics and decision-science curriculum. Score reflects programme substance and institutional strength, not an admissions probability."
  },
  {
    "University": "Stanford University", "Campus": "Stanford Main Campus", "Location": "Palo Alto, California, United States",
    "Course": "M.S. in Computational and Mathematical Engineering (ICME)", "Duration": "2 years",
    "Tuition/year (USD)": "Estimated USD 66,700/year at the 2026-27 full-time graduate engineering rate",
    "Living Costs/year (USD)": "Estimated USD 60,000/year; Stanford graduate living budget varies by housing and enrollment quarters",
    "Total Cost (USD)": "About USD 253,000 for two years before aid; estimate uses 2026-27 tuition and a rounded annual living budget",
    "Owner": "Ross", "Status": "New", "Link": "https://icme.stanford.edu/academics-admission/icme-master-science",
    "Intake": "Autumn 2027", "Deadline": "2027-01-29 23:59 Pacific Time", "Fit": "High",
    "Confidence": "High for 2027 deadline, two-year structure and curriculum; medium-low for total cost estimate",
    "Requirements": "Strong applied mathematics foundation expected, including linear algebra, numerical methods, probability/stochastics and programming; admission is competitive. GRE is not accepted for the ICME MS.",
    "Next Action": "Deadline Jan 29, 2027. Review mathematics prerequisites and choose a relevant track such as Mathematical and Computational Finance or Data Science. Cost estimate is not an aid-adjusted quote.",
    "Coordinates": "37.4313138, -122.1693654", "Opportunity ID": "opp:masters:stanford-icme-cme-2027",
    "University ID": "uni:stanford-university", "Campus ID": "camp:stanford-main", "Course Fit Score /10": 8,
    "Course Fit Notes": "Excellent computational mathematics, statistics and financial applications; useful for forecasting/model building, but not an energy-market degree.",
    "Course / Programme Score /10": 9.5, "Course / Programme Notes": "Rigorous two-year terminal MS with established tracks in data science, imaging and mathematical/computational finance; highly quantitative and technically demanding."
  },
  {
    "University": "Massachusetts Institute of Technology", "Campus": "Cambridge Main Campus", "Location": "Cambridge, Massachusetts, United States",
    "Course": "S.M. in Technology and Policy — Energy and the Environment",
    "Duration": "2 years (standard master's study)", "Tuition/year (USD)": "USD 66,720 (2026-27, 9-month graduate tuition)",
    "Living Costs/year (USD)": "About USD 42,300 estimated non-tuition living and personal costs, annualized from MIT's 2026-27 budget",
    "Total Cost (USD)": "About USD 218,000 for two academic years at the 2026-27 sticker-price budget, before aid",
    "Owner": "Ross", "Status": "New", "Link": "https://oge.mit.edu/programs/technology-and-policy-program/",
    "Intake": "Fall 2027", "Deadline": "2026-12-15 23:59 Eastern Time", "Fit": "Medium-High",
    "Confidence": "High — official programme, deadline and 2026-27 MIT cost pages checked 2026-11-07; actual TPP aid may materially reduce cost",
    "Requirements": "Statement of objectives, three recommendations, transcripts and CV/resume. GRE is optional for the 2026-27 admission cycle. International English-proficiency requirements apply unless the stated exemption criteria are met.",
    "Next Action": "Deadline Dec 15, 2026. Position the application around energy-market modelling, power-system transition and evidence-based policy. TPP says many students receive funded research assistantships, but funding is not guaranteed.",
    "Coordinates": "42.3582529, -71.0966272", "Opportunity ID": "opp:masters:mit-technology-policy-energy-2027",
    "University ID": "uni:massachusetts-institute-of-technology", "Campus ID": "camp:mit-main", "Course Fit Score /10": 7.5,
    "Course Fit Notes": "Strong energy and systems-policy connection with room for quantitative analysis; role direction is policy/technology rather than a trading desk.",
    "Course / Programme Score /10": 9, "Course / Programme Notes": "Selective interdisciplinary MIT master's with energy/environment research area and a substantial applied policy curriculum; assistantship funding is common but not assured."
  },
  {
    "University": "University of California, Berkeley", "Campus": "Berkeley Campus", "Location": "Berkeley, California, United States",
    "Course": "Master of Artificial Intelligence and Machine Learning (MAIML)", "Duration": "2 semesters (about 1 year)",
    "Tuition/year (USD)": "USD 84,004 estimated tuition and fees for the programme",
    "Living Costs/year (USD)": "Estimated USD 40,000/year; housing and insurance vary",
    "Total Cost (USD)": "About USD 124,000 including estimated one-year living costs",
    "Owner": "Ross", "Status": "New", "Link": "https://cdss.berkeley.edu/academics/graduate-education/master-artificial-intelligence-and-machine-learning/faq",
    "Intake": "Fall 2027", "Deadline": "2027-01-11 20:59 Pacific Time", "Fit": "Medium-High",
    "Confidence": "High — official 2027 deadline, duration and tuition estimate checked 2026-11-07; living cost is an estimate",
    "Requirements": "Designed for STEM graduates. Preparation includes programming, data structures, multivariable calculus, linear algebra, probability and statistics. GRE is optional.",
    "Next Action": "Deadline Jan 11, 2027 at 20:59 Pacific. Review mathematical and programming prerequisites; prepare transcripts, recommendations and a statement that ties energy forecasting/model-building to applied ML. Confirm international applicant requirements in the portal.",
    "Coordinates": "37.8754996, -122.2390685", "Opportunity ID": "opp:masters:berkeley-maiml-2027",
    "University ID": "uni:university-of-california-berkeley", "Campus ID": "camp:berkeley-main", "Course Fit Score /10": 7.5,
    "Course Fit Notes": "Strong match to applied AI/ML and quantitative model-building interests; less directly connected to commodities or energy markets.",
    "Course / Programme Score /10": 9, "Course / Programme Notes": "New, full-time Berkeley professional master's taught across EECS and Statistics with rigorous computational/statistical foundations; two semesters and on-campus."
  },
  {
    "University": "University of California, Berkeley", "Campus": "Berkeley Campus", "Location": "Berkeley, California, United States",
    "Course": "Master of Climate Solutions (MCS)", "Duration": "2 semesters (about 1 year)",
    "Tuition/year (USD)": "USD 87,870 estimated programme fees for Fall 2027 and Spring 2028",
    "Living Costs/year (USD)": "Estimated USD 40,000/year; housing and insurance vary",
    "Total Cost (USD)": "About USD 128,000 including estimated one-year living costs; excludes travel and personal setup costs",
    "Owner": "Ross", "Status": "New", "Link": "https://climatesolutions.berkeley.edu/mcs/faq/",
    "Intake": "Fall 2027", "Deadline": "2026-12-01 20:59 Pacific Time (priority); 2027-01-22 20:59 Pacific Time (standard)", "Fit": "Medium-High",
    "Confidence": "High — official Fall 2027 entry, deadlines and two-semester fee schedule checked 2026-11-07; living cost is an estimate",
    "Requirements": "Master of Climate Solutions application; applicants from varied academic fields may apply. GRE is optional. Priority application is recommended for international students needing an early decision.",
    "Next Action": "Priority deadline Dec 1, 2026; standard deadline Jan 22, 2027. Check whether the programme's climate implementation focus matches the desired pivot; not a trading or quantitative-finance degree.",
    "Coordinates": "37.8754996, -122.2390685", "Opportunity ID": "opp:masters:berkeley-climate-solutions-2027",
    "University ID": "uni:university-of-california-berkeley", "Campus ID": "camp:berkeley-main", "Course Fit Score /10": 7,
    "Course Fit Notes": "Direct energy/climate relevance and an applied transition focus, but less technical and less trading-oriented than the user's strongest target courses.",
    "Course / Programme Score /10": 8.5, "Course / Programme Notes": "Berkeley professional master's focused on climate solutions with a defined Fall 2027 cohort and strong institutional platform; published 2027 costs are estimates."
  },
  {
    "University": "Columbia University", "Campus": "Morningside Campus", "Location": "New York, New York, United States",
    "Course": "M.S. in Artificial Intelligence — Robotics and Perception or Business, Finance, and Operations concentration",
    "Duration": "3 semesters (full-time; about 16 months)",
    "Tuition/year (USD)": "About USD 56,440/year equivalent; 30-point tuition at USD 2,822/point is about USD 84,660 total",
    "Living Costs/year (USD)": "Estimated USD 36,000/year in New York; varies substantially with housing",
    "Total Cost (USD)": "About USD 133,000 for the 3-semester course including estimated living costs",
    "Owner": "Ross", "Status": "New", "Link": "https://ms-ai.engineering.columbia.edu/masters-artificial-intelligence/admissions",
    "Intake": "Fall 2027", "Deadline": "2027-01-15 (priority); 2027-02-15 (regular)", "Fit": "High",
    "Confidence": "High for 3-semester curriculum and 2027 deadlines; tuition estimate based on 2026-27 point rate; living estimate",
    "Requirements": "Full-time on-campus STEM-oriented master's; a STEM undergraduate degree is recommended but not required. GRE is not required for the 2027 cycle. International English-proficiency requirements may apply.",
    "Next Action": "Choose between Robotics and Perception and Business, Finance, and Operations concentrations. Review the formal math/programming prerequisites and confirm current per-point tuition before applying.",
    "Coordinates": "40.808769, -73.959990", "Opportunity ID": "opp:masters:columbia-msai-2027",
    "University ID": "uni:columbia-university", "Campus ID": "camp:columbia-morningside", "Course Fit Score /10": 8.5,
    "Course Fit Notes": "Very strong match to the stated AI/robotics interest; the finance/operations concentration also connects to commercial applications, though the degree is not energy-specific.",
    "Course / Programme Score /10": 9, "Course / Programme Notes": "On-campus, STEM-designated 30-point program with three-semester pathway, Robotics and Perception and Finance/Operations concentrations, and a two-semester applied capstone option."
  },
  {
    "University": "Cornell University", "Campus": "Ithaca Main Campus", "Location": "Ithaca, New York, United States",
    "Course": "M.Eng. in Operations Research and Information Engineering — Financial Engineering concentration",
    "Duration": "Typically 1 year; the Financial Engineering concentration spans 3 semesters, including a term at Cornell's New York City site",
    "Tuition/year (USD)": "About USD 73,946 for 2026-27 tuition estimate",
    "Living Costs/year (USD)": "Estimated USD 36,144/year for Ithaca, based on Cornell graduate cost budget",
    "Total Cost (USD)": "About USD 110,100 for one year before any extra third-semester NYC living costs",
    "Owner": "Ross", "Status": "New", "Link": "https://www.duffield.cornell.edu/orie/meng/meng-admissions-requirements-ithaca/",
    "Intake": "Fall 2027", "Deadline": "2026-12-01", "Fit": "High",
    "Confidence": "High for curriculum and deadline; medium for cost estimate, and total may be higher for the three-semester Financial Engineering concentration",
    "Requirements": "Quantitative preparation is expected. GRE or GMAT requirements depend on current program guidance; verify the 2027 application page. The Financial Engineering concentration has additional probability, finance and calculus preparation expectations.",
    "Next Action": "Deadline Dec 1, 2026. Verify test policy, prerequisite coursework, required recommendations and exact tuition for the three-semester concentration; include the possible NYC term in budget and campus planning.",
    "Coordinates": "42.4529160, -76.4800635", "Opportunity ID": "opp:masters:cornell-orie-meng-fe-2027",
    "University ID": "uni:cornell-university", "Campus ID": "camp:cornell-ithaca", "Course Fit Score /10": 8,
    "Course Fit Notes": "Strong operations-research, optimization, stochastic modelling and quantitative-finance pathway; relevant to market models but not specifically energy trading.",
    "Course / Programme Score /10": 8.5, "Course / Programme Notes": "Established engineering master's with rigorous OR/stochastics/data science core and a Financial Engineering concentration; third semester can be in NYC."
  },
  {
    "University": "Dartmouth College", "Campus": "Hanover Main Campus", "Location": "Hanover, New Hampshire, United States",
    "Course": "M.Eng. — Energy Engineering Track", "Duration": "3 terms (about 9 months)",
    "Tuition/year (USD)": "USD 95,596 annualized; official 2026-27 tuition is USD 71,697 for the 3-term programme",
    "Living Costs/year (USD)": "About USD 43,285 for programme-period living, health and other costs, derived from official 2026-27 total cost",
    "Total Cost (USD)": "USD 114,982 estimated total for three terms (official 2026-27 cost of attendance)",
    "Owner": "Ross", "Status": "New", "Link": "https://engineering.dartmouth.edu/graduate/meng/energy",
    "Intake": "Fall 2027", "Deadline": "2026-12-15 (Round 1 priority); 2027-02-15 (Round 2)", "Fit": "Medium-High",
    "Confidence": "High — official track, 2026-27 costs and admissions deadlines checked 2026-11-07",
    "Requirements": "Full-time on-campus MEng. Energy core covers sustainable design, climate change, energy utilization, conversion and systems. Applicants need an engineering or science background; verify prerequisites and application material requirements.",
    "Next Action": "Priority deadline Dec 15, 2026. Review the science/engineering eligibility and prepare recommendations, transcript, CV and statement. Energy systems focus is strong; career direction is less directly trading-oriented.",
    "Coordinates": "43.7034509, -72.2945505", "Opportunity ID": "opp:masters:dartmouth-energy-meng-2027",
    "University ID": "uni:dartmouth-college", "Campus ID": "camp:dartmouth-hanover", "Course Fit Score /10": 7.5,
    "Course Fit Notes": "Relevant energy-systems education and strong applied optimization/ML electives; less focused on market trading than the energy finance options.",
    "Course / Programme Score /10": 8.5, "Course / Programme Notes": "Compact, in-person energy engineering track with systems, conversion and utilization core plus quantitative engineering electives; known costs and two-round deadlines."
  },
  {
    "University": "University of Pennsylvania", "Campus": "University City Campus", "Location": "Philadelphia, Pennsylvania, United States",
    "Course": "M.S.E. in Robotics", "Duration": "2 years (10 course units; typical 4-semester plan)",
    "Tuition/year (USD)": "About USD 48,800/year equivalent using 2026-27 per-course-unit tuition and fees",
    "Living Costs/year (USD)": "About USD 28,500 per 9-month academic year using Penn's 2026-27 SEAS living budget",
    "Total Cost (USD)": "About USD 155,000 for a typical two-year plan, combining 10 course units and two academic-year budgets; exact course load changes billing",
    "Owner": "Ross", "Status": "New", "Link": "https://catalog.upenn.edu/graduate/programs/robotics-mse/",
    "Intake": "Fall 2027", "Deadline": "2026-11-01 (priority; passed); 2027-02-01 (regular; confirm in the live Penn Engineering application portal)", "Fit": "High",
    "Confidence": "High for curriculum and 2026-27 cost basis; medium for the 2027 deadline, which is shown on the current graduate application listing but should be confirmed in the portal",
    "Requirements": "10 course units across AI, robot design, control, perception, technical electives and general electives. The 2026-27 catalog includes machine learning, computer vision, control, optimization and robotics courses. Engineering, science or mathematics preparation is relevant; confirm program prerequisites and recommendation requirements in the live application.",
    "Next Action": "The Nov 1 priority deadline has passed; the regular Fall 2027 deadline is listed as Feb 1, 2027. Verify the deadline and all materials in the Penn Engineering application portal. Review math, programming and engineering preparation; this is a substantial technical pivot rather than a power-market credential.",
    "Coordinates": "39.9522148, -75.1955729", "Opportunity ID": "opp:masters:penn-robotics-mse-2027",
    "University ID": "uni:university-of-pennsylvania", "Campus ID": "camp:penn-main", "Course Fit Score /10": 8,
    "Course Fit Notes": "Direct fit to the stated robotics interest, with vision, perception, control and ML; less directly useful for the existing power-trading path.",
    "Course / Programme Score /10": 9, "Course / Programme Notes": "Interdisciplinary Robotics MSE administered through GRASP, with a current 2026-27 curriculum spanning AI, machine learning, vision, controls and robotics."
  },
  {
    "University": "Nanyang Technological University", "Campus": "Main Campus", "Location": "Singapore",
    "Course": "M.Sc. in Financial Engineering", "Duration": "12 months full-time",
    "Tuition/year (USD)": "About USD 56,300 equivalent for full-time 2027 intake (S$73,030 tuition incl. GST)",
    "Living Costs/year (USD)": "Estimated USD 24,000/year; depends on housing and personal choices",
    "Total Cost (USD)": "About USD 80,300 including estimated one-year living costs; excludes travel and application expenses",
    "Owner": "Ross", "Status": "New", "Link": "https://www.ntu.edu.sg/business/admissions/graduate-studies/msc-financial-engineering/admissions",
    "Intake": "August 2027", "Deadline": "2026-11-30 (Round 1); 2027-01-31 (Round 2); 2027-03-31 (Round 3)", "Fit": "High",
    "Confidence": "High — official 2027 intake, deadlines, fee and duration checked 2026-11-07; USD conversions and living expenses are approximate",
    "Requirements": "Good quantitative undergraduate degree; GMAT or GRE required for most applicants; English test if undergraduate instruction was not in English. NTU says tests taken online after 2023 are not accepted. Work experience is preferred, not required.",
    "Next Action": "Round 1 deadline Nov 30, 2026. Confirm test and English-score requirements and prepare the application early. The CMU track has a different fee; this record uses the standard non-CMU track.",
    "Coordinates": "1.3484104, 103.6829332", "Opportunity ID": "opp:masters:ntu-mfe-2027",
    "University ID": "uni:nanyang-technological-university", "Campus ID": "camp:ntu-singapore", "Course Fit Score /10": 7.5,
    "Course Fit Notes": "Useful quantitative-finance training and a strong location; adjacent to energy trading rather than a dedicated commodity or power-market course.",
    "Course / Programme Score /10": 8.5, "Course / Programme Notes": "Established quantitative master's with one-year full-time path and 2027 fee/deadline information already published; test and cost requirements are material."
  },
  {
    "University": "KAIST", "Campus": "Seoul Campus — Kim Jaechul Graduate School of AI", "Location": "Seoul, South Korea",
    "Course": "M.S. in Artificial Intelligence — Kim Jaechul Graduate School of AI", "Duration": "About 2 years (thesis master's; verify with department)",
    "Tuition/year (USD)": "About USD 14,300/year equivalent from KAIST's published KRW 19.118m tuition (2023 cost table; may have changed)",
    "Living Costs/year (USD)": "About USD 8,300/year equivalent from KAIST's published KRW 11.071m non-tuition budget (2023 table; living pattern varies)",
    "Total Cost (USD)": "About USD 45,200 for two years before aid, using the dated 2023 cost table; most international students may receive substantial tuition support",
    "Owner": "Ross", "Status": "On Hold", "Link": "https://gsai.kaist.ac.kr/academics/",
    "Intake": "Fall 2027 (international application dates not published)", "Deadline": "Not published for Fall 2027; recheck when KAIST posts the international graduate guide", "Fit": "High",
    "Confidence": "High for Seoul campus, curriculum, English international instruction and TBA cycle; medium-low for duration/cost because the published cost table is from 2023",
    "Requirements": "Thesis master's, 33+ credits. KAIST says English is the official language for international students and requires English proficiency unless a listed waiver applies. Fall 2027 international dates are TBA.",
    "Next Action": "Monitor the Fall 2027 international graduate announcement (historically early-December early track and early-March regular track). Check lab fit, scholarship selection and current tuition before applying. KAIST GSAI is at its Seoul Campus, not the Daejeon main campus.",
    "Coordinates": "37.5937974, 127.0467160", "Opportunity ID": "opp:masters:kaist-gsai-ms-2027",
    "University ID": "uni:kaist", "Campus ID": "camp:kaist-seoul", "Course Fit Score /10": 8.5,
    "Course Fit Notes": "Very strong match to stated AI/robotics interest; high technical intensity and research orientation, with no direct energy-market focus.",
    "Course / Programme Score /10": 9, "Course / Programme Notes": "Dedicated AI graduate school with thesis MS, extensive advanced electives and strong research environment; admission timing for Fall 2027 is not yet published."
  },
];

const masterIds = new Set(masters.rows.map((r) => r["Opportunity ID"]));
for (const program of programs) {
  if (!activeIds.has(program["University ID"])) throw new Error(`Programme university is not active in University Registry: ${program.University}`);
  if (!campusSeen.has(program["Campus ID"])) throw new Error(`Programme campus missing from Campus Registry: ${program["Campus ID"]}`);
  if (!masterIds.has(program["Opportunity ID"])) {
    masters.rows.push(Object.fromEntries(masters.headers.map((h) => [h, program[h] ?? null])));
    masterIds.add(program["Opportunity ID"]);
  }
}

const runId = "sr:ross:2026-11-07:university-coverage-final";
const run = {
  "Search Run ID": runId, "Started On": "2026-11-07", "Completed On": "2026-11-07", "Scope Version": "University Registry v1",
  "Run Type": "Monthly university programme coverage finalization", "Run Status": "Complete",
  "Sources Checked": "Official university programme, admissions, fee and campus pages; OSM named-campus features for coordinate checks",
  "Candidates Found": programs.length, "Promoted": programs.length, "Duplicates": 0, "Rejected": 0,
  "Notes": "Reviewed all 34 active universities from University Registry only. Added 11 relevant 2027 programme records across existing universities. Recorded current no-match outcomes for Caltech, Fudan, Nanjing University, Shanghai Jiao Tong University (2027 admissions cycle not yet published for the Research Inbox lead), and USTC. Brown deactivated because Providence was explicitly removed from Ross's scope. City St George remains inactive and its excluded records are not exported. Campus coordinates are scoped by university/campus registry, not the job Location Registry. Full coverage record: research/university-coverage-2026-11-07.md.",
  "Owner": "Ross", "Locations Covered": "All active University Registry entries; programme campuses mapped at the actual university/campus",
  "Masters Cities Covered": "Every active University Registry entry (34); no city-based institution additions",
  "Companies Covered": 0, "Source Families": "University programme pages; international admissions pages; official tuition/living cost pages; official campus maps; OSM campus features",
  "New Masters": programs.length, "Updated Masters": 0, "Companies Added": 0, "Offices Added": 0,
  "Elapsed Minutes": null, "Search Tool Calls": null, "Codex Usage": "Not surfaced",
  "Coverage Gaps": "Several Fall 2027 international cycles are not yet published, particularly KAIST; SJTU 2027 international intake/campus-specific programme remains in Research Inbox. Chinese programme searches were constrained to existing University Registry institutions; no city-based additions made.",
  "Cadence Changes": "Monthly programme/deadline refresh; weekly glance only for deadlines within 30 days. University coverage is driven by University Registry IDs, not city matching.",
  "Results Summary": "34 active registry universities reviewed; 11 programme records added across 9 universities. Five active registry universities have no suitable confirmed 2027 programme record after review (Caltech, Fudan, Nanjing, SJTU pending next cycle, USTC). New course rows include multiple courses at Stanford and Berkeley, each sharing one exact campus coordinate. All 34 active universities now have at least one campus point."
};
const existingRun = runs.rows.find((r) => r["Search Run ID"] === runId);
if (existingRun) Object.assign(existingRun, run);
else runs.rows.push(Object.fromEntries(runs.headers.map((h) => [h, run[h] ?? null])));

const log = {
  "Run ID": runId, "Checked On": "2026-11-07", "Search Family": "University programme discovery and deadline coverage",
  "Source / Platform": "Official university programme/admissions/fees/campus pages; OSM named campus features",
  "Market / Location Scope": "All active University Registry IDs; campus location recorded from actual programme site, independent of Job Location Registry",
  "Company Category / Rank Band": "Not applicable — registry universities only",
  "Query Pack / Search Terms": "2027 energy, power, climate, commodity trading, quantitative finance, computational mathematics, applied AI, statistics, atmospheric science, robotics, computer vision, autonomous systems and control master's programmes",
  "Language": "English official pages; targeted Korean-language checks where necessary; English proficiency and teaching language recorded only when official sources support them",
  "Cadence Used": "Monthly/admissions-cycle; weekly deadline glance within 30 days",
  "Items Reviewed": activeIds.size, "Relevant Leads": programs.length, "New Roles": 0, "Updated Records": 0,
  "Registry Candidates": 0, "Duplicates": 0, "Rejected": 0, "Elapsed Minutes": null,
  "Yield / Evidence Notes": "All 34 active University Registry entries were accounted for in research/university-coverage-2026-11-07.md. Eleven 2027 programme rows were added across nine universities. Five active universities have no suitable confirmed programme record this cycle; SJTU remains a research lead pending 2027 international admissions and campus-specific confirmation. Brown is inactive after explicit Providence exclusion. Multiple courses share campus IDs and coordinates at Stanford and Berkeley.",
  "Cadence Recommendation": "Refresh monthly and at admissions-cycle announcements; check near deadlines weekly when within 30 days.",
  "Next Review On": "2026-12-07",
  "Source URLs": "https://msande.stanford.edu/academics-admissions/graduate/admission/ms-admission; https://icme.stanford.edu/academics-admission/icme-application-deadlines; https://oge.mit.edu/programs/technology-and-policy-program/; https://sfs.mit.edu/graduate-students/cost-of-attendance/grad-cost-of-attendance/; https://cdss.berkeley.edu/academics/graduate-education/master-artificial-intelligence-and-machine-learning/faq; https://climatesolutions.berkeley.edu/mcs/faq/; https://ms-ai.engineering.columbia.edu/masters-artificial-intelligence/admissions; https://www.duffield.cornell.edu/orie/meng/meng-admissions-requirements-ithaca/; https://engineering.dartmouth.edu/graduate/meng/energy; https://www.ntu.edu.sg/business/admissions/graduate-studies/msc-financial-engineering/admissions; https://gsai.kaist.ac.kr/academics/; https://admission.kaist.ac.kr/intl-graduate/Admission/YearlyTimelines"
};
const existingLog = coverage.rows.find((r) => r["Run ID"] === runId && r["Search Family"] === log["Search Family"]);
if (existingLog) Object.assign(existingLog, log);
else coverage.rows.push(Object.fromEntries(coverage.headers.map((h) => [h, log[h] ?? null])));

write("University Registry", uni.rows, uni.headers);
write("Campus Registry", campuses.rows, campuses.headers);
write("Masters", masters.rows, masters.headers);
write("Search Runs", runs.rows, runs.headers);
write("Search Coverage Log", coverage.rows, coverage.headers);
wb.recalculate();
await (await SpreadsheetFile.exportXlsx(wb)).save(path);
console.log(JSON.stringify({ active_universities: activeIds.size, campus_records_added: campuses.rows.length - originalCampusCount, total_campuses: campuses.rows.length, programs_added: programs.length, master_rows: masters.rows.length, brown_search_active: brown?.["Search Active"] ?? null }));
