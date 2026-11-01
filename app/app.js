const persistedSharpnessHidden = (() => {
  try { return localStorage.getItem("woc.sharpness.hidden") === "true"; }
  catch { return false; }
})();

const state = {
  items: [],
  offices: [],
  unmappedCompanies: [],
  universities: [],
  recruiterPeople: [],
  recruitmentCompanies: [],
  institutions: [],
  locations: [],
  locationRankings: [],
  scoreModel: null,
  view: "opportunities",
  filter: "all",
  query: "",
  facet: "",
  facetValue: "",
  sort: "total_score",
  map: null,
  markers: new Map(),
  selected: null,
  activities: [],
  sharpnessAttempts: [],
  sharpnessOwner: "Ross",
  sharpnessExpanded: false,
  sharpnessHidden: persistedSharpnessHidden,
};

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

const statusClass = (item) => {
  if (item.status === "Closed") return "closed";
  return item.verification !== "verified" ? "review" : "";
};

const fieldLabels = {
  kind: "Type",
  verification: "Source check",
  function_market: "Function / market",
  business: "Business / company category",
  role_function: "Role function",
  business_function: "Role function",
  commodity: "Commodity",
  market_geography: "Market geography",
  time_horizon: "Time horizon",
  experience_requirement_years: "Experience requirement (years)",
  location: "Location / office",
  next_action: "Next action",
  date_found: "Date found",
  last_contacted: "Last contacted",
  tuition_year_usd: "Tuition / year (USD)",
  living_costs_year_usd: "Living costs / year (USD)",
  total_cost_usd: "Total cost (USD)",
  link: "Source link",
  coordinates: "Coordinates",
  office: "Office",
  category: "Category",
  source_url: "Source link",
  checked_on: "Checked on",
  confidence: "Confidence",
  research_notes: "Research notes",
  search_scope: "Search Scope",
  score_10: "Score /10",
  score_notes: "Score notes",
  candidate_fit_score_10: "Candidate fit score /10",
  candidate_fit_notes: "Candidate fit notes",
  role_fit_score_10: "Role fit score /10",
  role_fit_notes: "Role fit notes",
  expected_earnings_score_10: "Expected earnings score /10",
  expected_earnings_notes: "Expected earnings notes",
  total_compensation_expectation_usd: "Total compensation expectation (USD/year)",
  compensation_estimate_notes: "Compensation estimate basis",
  role_desk_outlook_score_10: "Role / desk outlook score /10",
  role_desk_outlook_notes: "Role / desk outlook notes",
  company_reputation_score_10: "Company reputation score /10",
  company_reputation_notes: "Company reputation notes",
  company_priority_rank: "Company search priority rank",
  company_priority_tier: "Company priority tier",
  company_search_focus: "Search focus",
  company_priority_rationale: "Priority rationale",
  university_reputation_score_10: "University reputation score /10",
  university_reputation_notes: "University reputation notes",
  course_fit_score_10: "Course fit score /10",
  course_fit_notes: "Course fit notes",
  course_programme_score_10: "Course / programme score /10",
  course_programme_notes: "Course / programme notes",
  recruitment_company_score_10: "Recruitment company score /10",
  recruitment_company_score_notes: "Recruitment company score notes",
  recruiter_assessment_score_10: "Recruiter assessment score /10",
  recruiter_assessment_notes: "Recruiter assessment notes",
  recruiter_relationship_score_10: "Recruiter relationship score /10",
  total_score_10: "Total score /10",
  location_fit_score_10: "Location fit score /10",
  total_score_method: "Total score weighting",
  recruiter_relationship_notes: "Recruiter relationship notes",
  glassdoor_score_10: "Glassdoor score /10",
  glassdoor_notes: "Glassdoor reviews",
  glassdoor_sources_search: "Glassdoor sources / search",
  reddit_score_10: "Reddit score /10",
  reddit_notes: "Reddit reviews",
  reddit_sources_search: "Reddit sources / search",
  reviews_checked_on: "Reviews checked on",
  review_research_status: "Review research status",
  business: "Business / company category",
  role_function: "Role function",
};

const categoryColors = {
  "Physical Commodity Trader": "#70d3f1",
  "Integrated Energy / Oil & Gas": "#ff9d70",
  "Utility / Power Producer": "#a9e078",
  "Prop Trading / Market Maker": "#c1a0ff",
  "Hedge Fund / Investment Manager": "#f28fce",
  "Bank / Financial Institution": "#f6d86b",
  "Exchange / Market Operator": "#70c8b4",
  "Analytics / Data Provider": "#a9c5db",
  "Market Reporting / News": "#f4b978",
  "Energy Software / Optimization": "#e58ce8",
  "Consulting / Professional Services": "#e7a1a8",
};

function categoryColor(value) {
  const category = String(value || "").split(";")[0].trim();
  return categoryColors[category] || "#c2c8ce";
}

function asDate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? date
    : null;
}

function daysBetween(from, to) {
  const day = 24 * 60 * 60 * 1000;
  const utcFrom = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate());
  const utcTo = Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate());
  return Math.round((utcTo - utcFrom) / day);
}

function deadlineBucket(item) {
  const date = asDate(item.deadline);
  if (!date) return "No deadline";
  const days = daysBetween(new Date(), date);
  if (days < 0) return "Overdue";
  if (days <= 7) return "0–7 days";
  if (days <= 30) return "8–30 days";
  return "31+ days";
}

function isPlaceholder(value) {
  if (value == null) return true;
  const normalized = String(value).trim().toLowerCase();
  return !normalized || /^(estimated\s*[-–—:]?\s*)?(not stated|not listed|not provided|unknown|n\/?a|tbd|[-–—])(?:\s|$)/.test(normalized);
}

function isPlaceholderAssessment(notes) {
  return /placeholder|pending|no attributable.*(?:review|evidence)|not yet been assessed/i.test(String(notes || ""));
}

function ratingText(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString(undefined, { maximumFractionDigits: 1 }) : String(value ?? "");
}

function facetValueFor(item, key) {
  if (key === "owner") return item.owner;
  if (key === "total_score") return item.total_score_10;
  if (key === "category" || key === "business") return item.business || item.category;
  if (key === "company_priority") return item.company_priority_tier;
  if (key === "function") return item.role_function || item.business_function;
  if (key === "role") return item.role_function || item.business_function;
  if (key === "commodity") return item.commodity;
  if (key === "market") return item.market_geography;
  if (key === "horizon") return item.time_horizon;
  if (key === "status") return item.status;
  if (key === "office") return item.office;
  if (key === "deadline") return deadlineBucket(item);
  return "";
}

function facetValuesFor(item, key) {
  const value = facetValueFor(item, key);
  return key === "commodity"
    ? String(value || "").split(";").map((part) => part.trim()).filter(Boolean)
    : value == null || value === "" ? [] : [value];
}

function searchHaystack(item) {
  return `${item.title} ${item.organization} ${item.location} ${item.office || ""} ${item.owner || ""} ${item.category || ""} ${item.company_priority_tier || ""} ${item.company_search_focus || ""} ${item.business || ""} ${item.role_function || item.business_function || ""} ${item.commodity || ""} ${item.market_geography || ""} ${item.time_horizon || ""} ${item.experience_requirement_years || ""} ${item.requirements || ""} ${item.next_action || ""}`.toLowerCase();
}

const scoreNumber = (value) => {
  if (value == null || String(value).trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

function rankScore(rank, maxRank) {
  if (!Number.isFinite(rank) || !Number.isFinite(maxRank)) return null;
  if (maxRank <= 1) return 10;
  return 10 - ((rank - 1) * 4 / (maxRank - 1));
}

function addJobScores(item) {
  if (item.kind !== "job") return item;
  const owner = String(item.owner || "").trim().toLowerCase();
  const jobRanks = state.locationRankings.filter((row) => String(row.owner || "").trim().toLowerCase() === owner && /job/i.test(String(row.search_scope || "")));
  const rankByCity = new Map(jobRanks.map((row) => [String(row.city || "").trim().toLowerCase(), Number(row.rank)]));
  const validRanks = jobRanks.map((row) => Number(row.rank)).filter(Number.isFinite);
  const maxRank = validRanks.length ? Math.max(...validRanks) : null;
  const offeredCities = String(item.location || "").split(/[;|]/).map((city) => city.trim().toLowerCase()).filter(Boolean);
  const ranks = offeredCities.map((city) => rankByCity.get(city)).filter(Number.isFinite);
  // Workbook rows are one role per city. For legacy multi-city rows, score the
  // best city because it is the application location the owner would choose.
  const locationRank = ranks.length ? Math.min(...ranks) : null;
  const locationScore = locationRank === null ? null : rankScore(locationRank, maxRank);
  const scores = {
    candidate_fit: scoreNumber(item.candidate_fit_score_10),
    role_fit: scoreNumber(item.role_fit_score_10),
    desk_outlook: scoreNumber(item.role_desk_outlook_score_10),
    expected_earnings: scoreNumber(item.expected_earnings_score_10),
    company_reputation: scoreNumber(item.company_reputation_score_10),
    location: locationScore,
  };
  const weights = state.scoreModel?.job_total_weights || {};
  const requiredKeys = ["candidate_fit", "role_fit", "desk_outlook", "expected_earnings", "company_reputation", "location"];
  const validWeights = requiredKeys.every((key) => Number.isFinite(Number(weights[key])) && Number(weights[key]) >= 0)
    && Math.abs(requiredKeys.reduce((sum, key) => sum + Number(weights[key]), 0) - 1) < 0.001;
  const completeScores = requiredKeys.every((key) => scores[key] !== null);
  const total = validWeights && completeScores
    ? requiredKeys.reduce((sum, key) => sum + scores[key] * Number(weights[key]), 0)
    : null;
  const noteText = [item.candidate_fit_notes, item.role_fit_notes, item.role_desk_outlook_notes, item.expected_earnings_notes, item.company_reputation_notes]
    .filter(Boolean).join(" ");
  const provisional = /estimate|estimated|provisional|proxy|low confidence|inferred/i.test(noteText)
    || item.verification !== "verified";
  const weightLabel = validWeights ? requiredKeys.map((key) => `${key.replaceAll("_", " ")} ${Math.round(Number(weights[key]) * 100)}%`).join(", ") : "weights unavailable";
  return { ...item, location_rank: locationRank, location_fit_score_10: locationScore === null ? "" : Number(locationScore.toFixed(2)),
    total_score_10: total === null ? "" : Number(total.toFixed(1)),
    total_score_status: total === null ? "Incomplete" : provisional ? "Provisional" : "Supported",
    total_score_method: `Weighted average: ${weightLabel}. Location is 6–10 from rank; at 25% weight it can change the total by at most 1.0 point. Multi-city postings are separate role-city rows.` };
}

function syncCustomDropdown(select, hostId) {
  const host = document.querySelector(`#${hostId}`);
  if (!host) return;
  const selected = select.options[select.selectedIndex];
  const options = [...select.options];
  host.innerHTML = `<div class="custom-select">
    <button class="custom-select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="${escapeHtml(select.getAttribute("aria-label"))}">
      <span>${escapeHtml(selected?.textContent || "Select")}</span><i aria-hidden="true"></i>
    </button>
    <div class="custom-select-menu" role="listbox" hidden>
      ${options.map((option, index) => `<button class="custom-select-option ${index === select.selectedIndex ? "selected" : ""}" type="button" role="option" aria-selected="${index === select.selectedIndex}" data-index="${index}">${escapeHtml(option.textContent)}</button>`).join("")}
    </div>
  </div>`;
  const control = host.firstElementChild;
  const trigger = control.querySelector(".custom-select-trigger");
  const menu = control.querySelector(".custom-select-menu");
  trigger.addEventListener("click", () => {
    const shouldOpen = menu.hidden;
    document.querySelectorAll(".custom-select-menu").forEach((entry) => { entry.hidden = true; entry.previousElementSibling?.setAttribute("aria-expanded", "false"); entry.parentElement?.classList.remove("open"); });
    menu.hidden = !shouldOpen;
    trigger.setAttribute("aria-expanded", String(shouldOpen));
    control.classList.toggle("open", shouldOpen);
    if (shouldOpen) menu.querySelector(`[data-index="${select.selectedIndex}"]`)?.focus();
  });
  trigger.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    control.classList.add("open");
    menu.querySelector(`[data-index="${select.selectedIndex}"]`)?.focus();
  });
  control.querySelectorAll(".custom-select-option").forEach((optionButton) => {
    optionButton.addEventListener("click", () => {
      select.selectedIndex = Number(optionButton.dataset.index);
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    optionButton.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const options = [...control.querySelectorAll(".custom-select-option")];
        const next = Math.max(0, Math.min(options.length - 1, options.indexOf(optionButton) + (event.key === "ArrowDown" ? 1 : -1)));
        options[next]?.focus();
      } else if (event.key === "Escape") {
        menu.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
        control.classList.remove("open");
        trigger.focus();
      }
    });
  });
}

function buildPopupContent(item, location) {
  if (item.programmes?.length > 1) {
    const panels = item.programmes.map((program) => `<section class="course-panel">${buildPopupContent(program, location)}</section>`).join("");
    return `<div class="map-popup campus-popup">
      <div class="map-popup-title">${escapeHtml(item.organization)}</div>
      <div class="map-popup-organization">${item.programmes.length} programmes · ${escapeHtml(location.name || item.location || item.campus || "Campus")}</div>
      <div class="course-panels">${panels}</div>
    </div>`;
  }
  if (item.kind === "location") {
    const ownerRow = item.owner ? `<div class="map-popup-row"><dt>Owner</dt><dd>${escapeHtml(item.owner)}</dd></div>` : "";
    return `<div class="map-popup">
      <div class="map-popup-title">${escapeHtml(item.title)}</div>
      <div class="map-popup-organization">${escapeHtml(item.organization)} · ${escapeHtml(location.name || item.title)}</div>
      <dl class="map-popup-fields"><div class="map-popup-row"><dt>Search Scope</dt><dd>${escapeHtml(item.search_scope || "Not specified")}</dd></div>${ownerRow}</dl>
    </div>`;
  }
  const omitted = new Set(["id", "title", "organization", "latitude", "longitude", "coordinates", "locations", "source_url", "memberIds", "programmes", "link", "scope_key", "job_search", "university_search", "office_source_text", "registry_offices", "scope_status"]);
  const rows = [];
  const jobImmediateRows = [];
  const jobDetailRows = [];
  const jobScoreKeys = new Set([
    "total_score_10", "total_score_status", "total_score_method",
    "candidate_fit_score_10", "candidate_fit_notes",
    "role_fit_score_10", "role_fit_notes",
    "company_reputation_score_10", "company_reputation_notes",
    "role_desk_outlook_score_10", "role_desk_outlook_notes",
    "expected_earnings_score_10", "expected_earnings_notes",
    "location_fit_score_10",
  ]);
  const immediateJobKeys = new Set(["location", "owner", "status", "deadline", "total_compensation_expectation_usd"]);
  const pushRow = (markup, key) => {
    if (item.kind !== "job") rows.push(markup);
    else if (immediateJobKeys.has(key)) jobImmediateRows.push(markup);
    else jobDetailRows.push(markup);
  };

  const preferredOrder = ["university", "course", "campus", "location", "owner", "status", "company_priority_rank", "company_priority_tier", "company_search_focus", "company_priority_rationale", "candidate_fit_score_10", "candidate_fit_notes", "role_fit_score_10", "role_fit_notes", "company_reputation_score_10", "company_reputation_notes", "role_desk_outlook_score_10", "role_desk_outlook_notes", "location_fit_score_10", "expected_earnings_score_10", "expected_earnings_notes", "total_score_10", "total_score_method", "total_compensation_expectation_usd", "compensation_estimate_notes", "university_reputation_score_10", "university_reputation_notes", "course_fit_score_10", "course_fit_notes", "course_programme_score_10", "course_programme_notes", "recruitment_company_score_10", "recruitment_company_score_notes", "recruiter_assessment_score_10", "recruiter_assessment_notes", "recruiter_relationship_score_10", "confidence", "intake", "deadline", "fit", "link", "requirements", "next_action", "business", "role_function", "business_function", "commodity", "market_geography", "time_horizon", "category", "office", "description"];
  const fields = Object.entries(item).sort(([a], [b]) => {
    const ai = preferredOrder.indexOf(a), bi = preferredOrder.indexOf(b);
    return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
  });
  for (const [key, rawValue] of fields) {
    if (item.kind === "job" && jobScoreKeys.has(key)) continue;
    if (item.kind === "masters" && (key === "confidence" || key === "fit")) continue;
    if (item.kind === "job" && (key === "confidence" || key === "fit")) continue;
    const showUnspecifiedDeadline = item.kind === "job" && key === "deadline" && isPlaceholder(rawValue);
    if (omitted.has(key) || key.endsWith("_id") || rawValue == null || rawValue === "" || (isPlaceholder(rawValue) && !showUnspecifiedDeadline) || (item.kind === "job" && key === "category")) continue;
    if (key === "source_url" && item.link) continue;
    const value = key.endsWith("_score_10") && Number.isFinite(Number(rawValue))
      ? (Math.round(Number(rawValue) * 10) / 10).toFixed(1).replace(/\.0$/, "")
      : key === "total_compensation_expectation_usd" && Number.isFinite(Number(rawValue))
      ? `USD ${Math.round(Number(rawValue)).toLocaleString()}/year`
      : key === "kind" || key === "verification"
      ? String(rawValue).replace(/^\w/, (letter) => letter.toUpperCase())
      : key === "deadline" && showUnspecifiedDeadline
      ? "Not stated by employer"
      : Array.isArray(rawValue)
      ? rawValue.map((part) => typeof part === "object" ? part.name || JSON.stringify(part) : part).join(", ")
      : typeof rawValue === "object"
        ? JSON.stringify(rawValue)
        : String(rawValue);
    if (item.kind === "company" && key === "location" && item.office) continue;
    const label = key === "location"
      ? item.kind === "masters" ? "Location" : item.kind === "company" ? "Office" : "Location"
      : fieldLabels[key] || key.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
    const rendered = key === "glassdoor_sources_search" || key === "reddit_sources_search" ? sourceLinks(value) || escapeHtml(value) : escapeHtml(value);
    pushRow(`<div class="map-popup-row"><span class="map-popup-label">${escapeHtml(label)}</span><span class="map-popup-value">${rendered}</span></div>`, key);
  }

  const posted = asDate(item.posted);
  const deadline = asDate(item.deadline);
  const today = new Date();
  const postedDays = posted ? daysBetween(posted, today) : null;
  const postedValue = posted ? `${postedDays} ${postedDays === 1 ? "day" : "days"}` : "";
  let deadlineValue = "";
  if (deadline) {
    const days = daysBetween(today, deadline);
    const magnitude = Math.abs(days);
    const unit = magnitude === 1 ? "day" : "days";
    deadlineValue = days < 0 ? `${magnitude} ${unit} past` : `${days} ${unit}`;
  }
  if (item.kind !== "company") {
    if (postedValue) pushRow(`<div class="map-popup-row"><span class="map-popup-label">Days since posted</span><span class="map-popup-value">${escapeHtml(postedValue)}</span></div>`, "days_since_posted");
    if (deadlineValue) pushRow(`<div class="map-popup-row"><span class="map-popup-label">Days until deadline</span><span class="map-popup-value">${escapeHtml(deadlineValue)}</span></div>`, "days_until_deadline");
  }

  const scoreRows = item.kind === "job" ? [
    ["total_score_10", "Total score", "total_score_method", "total_score_status"],
    ["candidate_fit_score_10", "Candidate fit", "candidate_fit_notes"],
    ["role_fit_score_10", "Role fit", "role_fit_notes"],
    ["company_reputation_score_10", "Company reputation", "company_reputation_notes"],
    ["role_desk_outlook_score_10", "Desk outlook", "role_desk_outlook_notes"],
    ["expected_earnings_score_10", "Expected earnings", "expected_earnings_notes"],
    ["location_fit_score_10", "Location fit", ""],
  ].filter(([key]) => scoreNumber(item[key]) !== null).map(([key, label, noteKey, statusKey]) => {
    let note = noteKey ? item[noteKey] : "";
    if (key === "location_fit_score_10") {
      const weight = Number(state.scoreModel?.job_total_weights?.location);
      const swing = Number(state.scoreModel?.location_max_total_contribution_swing);
      note = `Based on the owner-ranked location, scaled within the agreed 6–10 range.${Number.isFinite(weight) ? ` Weight: ${Math.round(weight * 100)}% of total.` : ""}${Number.isFinite(swing) ? ` Maximum total-score impact: ${swing.toFixed(1)} point.` : ""}`;
    }
    const score = `${ratingText(item[key])}/10`;
    const accessibleNote = note ? ` ${String(note).replace(/\s+/g, " ").trim()}` : "";
    return `<tr class="${key === "total_score_10" ? "score-total" : ""}"><th scope="row">${escapeHtml(label)}</th><td class="score-value" tabindex="0" aria-label="${escapeHtml(`${label}: ${score}.${accessibleNote}`)}"${note ? ` data-note="${escapeHtml(note)}"` : ""}>${escapeHtml(score)}${statusKey && item[statusKey] ? `<span class="score-status">${escapeHtml(String(item[statusKey]).toLowerCase())}</span>` : ""}</td></tr>`;
  }).join("") : "";
  const scoreSummary = scoreRows ? `<section class="score-summary" aria-label="Opportunity scores"><table><thead><tr><th>Score</th><th>/10</th></tr></thead><tbody>${scoreRows}</tbody></table></section>` : "";

  const source = /^https?:\/\//i.test(item.source_url || "")
    ? `<a class="map-popup-source" href="${escapeHtml(item.source_url)}" target="_blank" rel="noopener">Open source ↗</a>`
    : "";
  // Job popup headers should identify the city, not repeat a street address.
  const mapLocation = item.kind === "job"
    ? item.location || "Location not specified"
    : location.name || item.location || "Location not specified";
  const history = state.activities.filter((entry) => entry["Entity ID"] === item.id || entry.entity_id === item.id);
  const activityHtml = history.length ? `<section class="activity-history"><h3>Activity</h3>${history.map((entry) => `<div class="map-popup-row"><dt>${escapeHtml(entry.Date || entry.date || "")}</dt><dd>${escapeHtml(entry.Activity || entry.activity || "")}${entry.Status || entry.status ? ` · ${escapeHtml(entry.Status || entry.status)}` : ""}</dd></div>`).join("")}</section>` : "";
  return `<div class="map-popup">
    <div class="map-popup-title ${item.kind === "company" ? "company-title" : ""}">${escapeHtml(item.title)}</div>
    <div class="map-popup-organization">${escapeHtml(item.organization)} · ${escapeHtml(mapLocation)}</div>
    <div class="map-popup-fields">${item.kind === "job" ? `${jobImmediateRows.join("")}${scoreSummary}${jobDetailRows.join("")}` : rows.join("")}</div>
    ${activityHtml}
    ${source}
  </div>`;
}

function attachScoreTooltips(popupElement) {
  for (const cell of popupElement.querySelectorAll(".score-value[data-note]")) {
    if (cell.dataset.tooltipReady) continue;
    cell.dataset.tooltipReady = "true";
    let tooltip;
    const hide = () => {
      tooltip?.remove();
      tooltip = null;
    };
    const show = () => {
      hide();
      tooltip = document.createElement("div");
      tooltip.className = "score-tooltip";
      tooltip.setAttribute("role", "tooltip");
      tooltip.textContent = cell.dataset.note;
      document.body.append(tooltip);
      const rect = cell.getBoundingClientRect();
      const box = tooltip.getBoundingClientRect();
      let left = rect.right + 10;
      if (left + box.width > window.innerWidth - 8) left = rect.left - box.width - 10;
      left = Math.max(8, Math.min(left, window.innerWidth - box.width - 8));
      const top = Math.max(8, Math.min(rect.top, window.innerHeight - box.height - 8));
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
    };
    cell.addEventListener("mouseenter", show);
    cell.addEventListener("mouseleave", hide);
    cell.addEventListener("focus", show);
    cell.addEventListener("blur", hide);
    cell.addEventListener("keydown", (event) => {
      if (event.key === "Escape") hide();
    });
  }
}

function getFilteredItems() {
  const source = state.view === "institutions" ? state.institutions : state.view === "locations" ? state.locations : state.items;
  const filtered = source.filter((item) => {
    const matchesKind = state.view === "locations"
      ? state.filter === "all" || item.scope_key === state.filter
      : state.filter === "all" || item.kind === state.filter;
    const haystack = searchHaystack(item);
    const facetValues = facetValuesFor(item, state.facet);
    const matchesFacet = !state.facetValue || (state.facet === "total_score"
      ? Number.isFinite(Number(item.total_score_10)) && Number(item.total_score_10) > Number(state.facetValue)
      : facetValues.some((value) => String(value).toLowerCase() === state.facetValue.toLowerCase()));
    return matchesKind && matchesFacet && haystack.includes(state.query);
  });
  const deadline = (item) => { const date = asDate(item.deadline); return date ? date.getTime() : Number.MAX_SAFE_INTEGER; };
  const scoreSorts = { candidate_fit: "candidate_fit_score_10", role_fit: "role_fit_score_10", company_score: "company_reputation_score_10", desk_outlook: "role_desk_outlook_score_10", expected_earnings: "expected_earnings_score_10", total_score: "total_score_10" };
  return filtered.sort((a, b) => state.view === "institutions" && state.sort === "company_rank" ? (Number(a.company_priority_rank) || 99999) - (Number(b.company_priority_rank) || 99999) || a.title.localeCompare(b.title) : scoreSorts[state.sort]
    ? (scoreNumber(b[scoreSorts[state.sort]]) ?? -1) - (scoreNumber(a[scoreSorts[state.sort]]) ?? -1) || a.title.localeCompare(b.title)
    : state.view === "locations" && state.sort === "rank" ? (Number(a.rank) || 999) - (Number(b.rank) || 999) || a.title.localeCompare(b.title)
      : state.sort === "deadline" ? deadline(a) - deadline(b) : state.sort === "owner" ? String(a.owner || "").localeCompare(String(b.owner || "")) || a.title.localeCompare(b.title) : state.sort === "category" ? String(a.category || "").localeCompare(String(b.category || "")) || a.title.localeCompare(b.title) : state.sort === "location" ? String(a.office || a.location || "").localeCompare(String(b.office || b.location || "")) : a.title.localeCompare(b.title));
}

function renderControls() {
  const locationMode = state.view === "locations";
  const companyMode = state.view === "institutions";
  const filter = document.querySelector("#facet-filter"), value = document.querySelector("#facet-value"), sort = document.querySelector("#sort-order");
  const source = locationMode ? state.locations : companyMode ? state.institutions : state.items.filter((item) => state.filter === "all" || item.kind === state.filter);
  const controls = document.querySelector("#list-controls");
  if (!source.length) { controls.hidden = true; return; }
  const fieldOptions = locationMode ? [["owner", "Owner"]] : companyMode ? [["category", "Category"], ["company_priority", "Company priority"], ["owner", "Owner"]] : [["business", "Business / company category"], ["role", "Role function"], ["commodity", "Commodity"], ["market", "Market geography"], ["horizon", "Time horizon"], ["status", "Status"], ["deadline", "Deadline"], ["owner", "Owner"], ["total_score", "Total score"]];
  const matchingSource = source.filter((item) => searchHaystack(item).includes(state.query));
  controls.hidden = matchingSource.length === 0;
  if (!matchingSource.length) return;
  const fields = fieldOptions.filter(([key]) => matchingSource.some((item) => !isPlaceholder(facetValueFor(item, key))));
  if (!fields.length) {
    controls.children[0].hidden = true;
    controls.children[1].hidden = true;
  } else {
    controls.children[0].hidden = false;
    controls.children[1].hidden = false;
  }
  if (!fields.length) state.facet = "";
  filter.innerHTML = fields.map(([key, label]) => `<option value="${key}">Filter · ${label}</option>`).join("");
  state.facet = fields.some(([key]) => key === state.facet) ? state.facet : fields[0]?.[0] || "";
  filter.value = state.facet;
  const values = state.facet === "total_score"
    ? [4, 5, 6, 7, 8, 9].filter((threshold) => matchingSource.some((item) => Number(item.total_score_10) > threshold)).map(String)
    : [...new Set(matchingSource.flatMap((item) => facetValuesFor(item, state.facet)).filter((entry) => !isPlaceholder(entry)))].sort((a,b) => String(a).localeCompare(String(b)));
  const facetNoun = state.facet === "owner" ? "owners" : state.facet === "category" || state.facet === "business" ? "businesses" : state.facet === "company_priority" ? "priority tiers" : state.facet === "function" || state.facet === "role" ? "role functions" : state.facet === "commodity" ? "commodities" : state.facet === "market" ? "market geographies" : state.facet === "horizon" ? "time horizons" : state.facet === "deadline" ? "deadlines" : "statuses";
  value.innerHTML = state.facet === "total_score"
    ? '<option value="">Score · Any</option>' + values.map((entry) => `<option value="${entry}">Score &gt; ${entry}</option>`).join("")
    : `<option value="">Match · All ${facetNoun}</option>` + values.map((entry) => `<option value="${escapeHtml(entry)}">${escapeHtml(entry)}</option>`).join("");
  if (!values.includes(state.facetValue)) state.facetValue = "";
  value.value = state.facetValue;
  const sortOptions = locationMode ? [["rank", "Location rank", () => matchingSource.some((item) => Number(item.rank) > 0)], ["name", "City", () => matchingSource.some((item) => !isPlaceholder(item.title))], ["owner", "Owner", () => matchingSource.some((item) => !isPlaceholder(item.owner))]] : companyMode ? [["company_rank", "Company rank", () => matchingSource.some((item) => Number(item.company_priority_rank) > 0)], ["name", "Name", () => matchingSource.some((item) => !isPlaceholder(item.title))], ["category", "Category", () => matchingSource.some((item) => !isPlaceholder(item.category))], ["owner", "Owner", () => matchingSource.some((item) => !isPlaceholder(item.owner))], ["location", "Location", () => matchingSource.some((item) => !isPlaceholder(item.office || item.location))]] : [["total_score", "Total score · high to low", () => matchingSource.some((item) => scoreNumber(item.total_score_10) !== null)], ["deadline", "Deadline soonest", () => matchingSource.some((item) => asDate(item.deadline))], ["location", "Location", () => matchingSource.some((item) => !isPlaceholder(item.location || item.campus))], ["candidate_fit", "Candidate fit · high to low", () => matchingSource.some((item) => scoreNumber(item.candidate_fit_score_10) !== null)], ["role_fit", "Role fit · high to low", () => matchingSource.some((item) => scoreNumber(item.role_fit_score_10) !== null)], ["company_score", "Company score · high to low", () => matchingSource.some((item) => scoreNumber(item.company_reputation_score_10) !== null)], ["desk_outlook", "Desk outlook · high to low", () => matchingSource.some((item) => scoreNumber(item.role_desk_outlook_score_10) !== null)], ["expected_earnings", "Expected earnings · high to low", () => matchingSource.some((item) => scoreNumber(item.expected_earnings_score_10) !== null)], ["owner", "Owner", () => matchingSource.some((item) => !isPlaceholder(item.owner))]];
  const sorts = sortOptions.filter(([, , hasItems]) => hasItems());
  sort.innerHTML = sorts.map(([key, label]) => `<option value="${key}">Sort · ${label}</option>`).join("");
  if (!sorts.some(([key]) => key === state.sort)) state.sort = sorts[0][0];
  sort.value = state.sort;
  syncCustomDropdown(filter, "facet-filter-menu");
  syncCustomDropdown(value, "facet-value-menu");
  syncCustomDropdown(sort, "sort-order-menu");
}

function renderLegend() {
  const legend = document.querySelector("#legend-items");
  const legendItem = (name, color) => `<span><i class="key-dot" style="background:${color}"></i>${escapeHtml(name)}</span>`;
  if (state.view === "locations") {
    const scopes = [...new Set(getFilteredItems().map((item) => item.search_scope))];
    const colors = { "Job": "#70c8b4", "Masters": "#c1a0ff", "Jobs & Masters": "#d7ff78" };
    legend.innerHTML = scopes.map((scope) => `<span><i class="key-dot" style="background:${colors[scope]}"></i>${escapeHtml(scope)}</span>`).join("");
  } else if (state.view === "institutions" && state.filter === "recruiter_person") {
    legend.innerHTML = legendItem("Recruiters", "#ffb86e");
  } else if (state.view === "institutions" && state.filter === "recruitment_company") {
    legend.innerHTML = "";
  } else if (state.view === "institutions" && state.filter === "university") {
    legend.innerHTML = legendItem("Universities", "#c1a0ff");
  } else if (state.view === "institutions") {
    const categories = [...new Set(state.offices.filter((item) => item.locations?.length).map((item) => String(item.category || "").split(";")[0].trim()).filter(Boolean))];
    legend.innerHTML = categories.map((category) => legendItem(category, categoryColor(category))).join("");
    if (state.filter === "all") legend.innerHTML += legendItem("Universities", "#c1a0ff") + legendItem("Recruiters", "#ffb86e");
  } else {
    const kinds = [...new Set(getFilteredItems().map((item) => item.kind))];
    const kindNames = { job: "Jobs", masters: "Masters", recruiter: "People", university: "Universities" };
  const kindRows = kinds.map((kind) => `<span><i class="key-dot kind-${kind === "university" ? "masters" : kind}"></i>${kindNames[kind] || kind}</span>`).join("");
    const statusColors = { New: "#d7ff78", Researching: "#aab4bd", "Ready to Apply": "#54d6a5", Applied: "#69aaff", Interview: "#ffda70", Offer: "#a8e77a", Rejected: "#c47a83", Withdrawn: "#927f8b", Closed: "#6f7880", "On Hold": "#ff986c" };
    const statuses = [...new Set(state.items.filter((item) => item.locations?.length).map((item) => item.status).filter(Boolean))];
    legend.innerHTML = `${kindRows}${statuses.map((status) => `<span><i class="key-dot status-key" style="--status-color:${statusColors[status] || "#aab4bd"}"></i>${escapeHtml(status)}</span>`).join("")}`;
  }
}

function sharpnessGroups() {
  const attempts = state.sharpnessAttempts.filter((row) => String(row.owner || "").trim() === state.sharpnessOwner && [row.score, row.completion_pct, row.time_taken_minutes].some((value) => value !== undefined && value !== null && String(value).trim() !== ""));
  const groups = new Map();
  for (const row of attempts) {
    const platform = String(row.platform || "Platform not specified").trim();
    const assessment = String(row.assessment || row.mode_topic || "Assessment not specified").trim();
    const attemptType = String(row.attempt_type || "Type not specified").trim();
    const metric = String(row.score_metric || "Score").trim();
    const key = `${platform}\u0000${assessment}\u0000${attemptType}\u0000${metric}`;
    if (!groups.has(key)) groups.set(key, { platform, assessment, attemptType, metric, rows: [] });
    groups.get(key).rows.push(row);
  }
  for (const group of groups.values()) {
    group.rows.sort((a, b) => {
      const at = Date.parse(a.attempt_timestamp || "") || 0;
      const bt = Date.parse(b.attempt_timestamp || "") || 0;
      return at - bt;
    });
    group.latest = group.rows[group.rows.length - 1];
    const scored = group.rows.filter((row) => row.score !== undefined && row.score !== null && String(row.score).trim() !== "").map((row) => ({row, score:Number(row.score)})).filter(({score}) => Number.isFinite(score));
    group.highscore = scored.length ? Math.max(...scored.map((item) => item.score)) : null;
    group.highscoreRow = scored.find((item) => item.score === group.highscore)?.row || null;
    const lastTen = scored.slice(-10).map((item) => item.score);
    group.lastTenMean = lastTen.length ? lastTen.reduce((sum, score) => sum + score, 0) / lastTen.length : null;
    const completions = group.rows.filter((row) => row.completion_pct !== undefined && row.completion_pct !== null && String(row.completion_pct).trim() !== "").map((row) => Number(row.completion_pct)).filter(Number.isFinite);
    const times = group.rows.filter((row) => row.time_taken_minutes !== undefined && row.time_taken_minutes !== null && String(row.time_taken_minutes).trim() !== "").map((row) => Number(row.time_taken_minutes)).filter(Number.isFinite);
    group.latestCompletion = group.latest.completion_pct;
    group.latestTime = group.latest.time_taken_minutes;
    group.lastTenCompletion = completions.length ? completions.slice(-10).reduce((sum, n) => sum + n, 0) / Math.min(10, completions.length) : null;
    group.lastTenTime = times.length ? times.slice(-10).reduce((sum, n) => sum + n, 0) / Math.min(10, times.length) : null;
    group.count = group.rows.length;
  }
  return [...groups.values()].sort((a, b) => a.platform.localeCompare(b.platform) || a.assessment.localeCompare(b.assessment) || a.attemptType.localeCompare(b.attemptType) || a.metric.localeCompare(b.metric));
}

function scoreText(value) {
  if (value === null || value === undefined || String(value).trim() === "" || !Number.isFinite(Number(value))) return "—";
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function completionText(value) {
  if (value === null || value === undefined || String(value).trim() === "" || !Number.isFinite(Number(value))) return "—";
  const raw = Number(value);
  return `${scoreText(raw <= 1 ? raw * 100 : raw)}%`;
}

function sourceLinks(value) {
  const urls = String(value || "").split(/;\s*/).filter((url) => /^https?:\/\//i.test(url));
  return urls.map((url, index) => `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${urls.length === 1 ? "Open source / search" : `Source ${index + 1}`}</a>`).join(" · ");
}

function renderSharpness() {
  const ownerSelect = document.querySelector("#sharpness-owner");
  if (!ownerSelect) return;
  document.querySelector(".sharpness-panel").hidden = state.sharpnessHidden;
  const owners = [...new Set(["Ross", "Michael", ...state.sharpnessAttempts.map((row) => String(row.owner || "").trim()).filter(Boolean)])].sort((a, b) => a === "Ross" ? -1 : b === "Ross" ? 1 : a.localeCompare(b));
  ownerSelect.innerHTML = owners.map((owner) => `<option value="${escapeHtml(owner)}">${escapeHtml(owner)}</option>`).join("");
  if (!owners.includes(state.sharpnessOwner)) state.sharpnessOwner = owners[0] || "Ross";
  ownerSelect.value = state.sharpnessOwner;
  syncCustomDropdown(ownerSelect, "sharpness-owner-menu");
  const groups = sharpnessGroups();
  const platforms = [...new Set(["Zetamac", "LeetCode", "GRE", "GMAT", ...groups.map((group) => group.platform)])];
  const highscores = document.querySelector("#sharpness-highscores");
  highscores.innerHTML = groups.length
    ? groups.map((group) => `<div class="sharpness-score-row"><span>${escapeHtml(group.platform)} · ${escapeHtml(group.assessment)} <small>${escapeHtml(group.attemptType)}</small><small class="sharpness-latest-metrics">Best ${scoreText(group.highscore)} ${escapeHtml(group.metric)} · Latest ${completionText(group.latestCompletion)} complete · ${scoreText(group.latestTime)} min</small></span></div>`).join("")
    : platforms.map((platform) => `<div class="sharpness-score-row"><span>${escapeHtml(platform)}</span><strong>—</strong></div>`).join("");
  const details = document.querySelector("#sharpness-detail-panel");
  details.hidden = !state.sharpnessExpanded;
  document.querySelector("#sharpness-details-toggle").setAttribute("aria-expanded", String(state.sharpnessExpanded));
  document.querySelector("#sharpness-details-toggle").innerHTML = `Details <i aria-hidden="true">${state.sharpnessExpanded ? "−" : "+"}</i>`;
  details.innerHTML = groups.length
    ? groups.map((group) => `<section class="sharpness-detail-group">
        <div class="sharpness-detail-title">${escapeHtml(group.platform)} · ${escapeHtml(group.assessment)} · ${escapeHtml(group.attemptType)}</div>
        <div class="sharpness-detail-row"><span>Score metric</span><strong>${escapeHtml(group.metric)}</strong></div>
        <div class="sharpness-detail-row"><span>Latest score</span><strong>${scoreText(group.latest.score)}</strong></div>
        <div class="sharpness-detail-row"><span>Latest timestamp</span><strong>${escapeHtml(group.latest.attempt_timestamp || "—")}</strong></div>
        <div class="sharpness-detail-row"><span>Last 10 mean score</span><strong>${scoreText(group.lastTenMean)}</strong></div>
        <div class="sharpness-detail-row"><span>Highscore</span><strong>${scoreText(group.highscore)}${group.highscoreRow?.attempt_timestamp ? ` · ${escapeHtml(group.highscoreRow.attempt_timestamp)}` : ""}</strong></div>
        <div class="sharpness-detail-row"><span>Latest completion</span><strong>${completionText(group.latestCompletion)}</strong></div>
        <div class="sharpness-detail-row"><span>Last 10 mean completion</span><strong>${group.lastTenCompletion === null ? "—" : completionText(group.lastTenCompletion)}</strong></div>
        <div class="sharpness-detail-row"><span>Latest time (min)</span><strong>${scoreText(group.latestTime)}</strong></div>
        <div class="sharpness-detail-row"><span>Last 10 mean time (min)</span><strong>${scoreText(group.lastTenTime)}</strong></div>
        <div class="sharpness-detail-row"><span>Recorded sessions</span><strong>${group.count}</strong></div>
      </section>`).join("")
    : `<div class="sharpness-empty">No assessment attempts logged for ${escapeHtml(state.sharpnessOwner)} yet. Add sessions in the Interview Sharpness sheet.</div>`;
}

function render() {
  if (state.view === "institutions" && !["all", "company", "university", "recruiter_person"].includes(state.filter)) state.filter = "all";
  const filtered = getFilteredItems();
  const visibleIds = new Set(filtered.map((item) => item.id));
  for (const item of filtered) for (const memberId of item.memberIds || []) visibleIds.add(memberId);
  for (const [id, markers] of state.markers) {
    for (const marker of markers) {
      const members = marker.memberIds || [id];
      marker.getElement().style.display = members.some((member) => visibleIds.has(member)) ? "" : "none";
    }
  }

  const companyMode = state.view === "institutions";
  const locationMode = state.view === "locations";
  const filterOptions = locationMode
    ? [["all", "All", state.locations.length], ["jobs", "Jobs", state.locations.filter(x => x.job_search).length], ["masters", "Masters", state.locations.filter(x => x.university_search).length], ["both", "Jobs & Masters", state.locations.filter(x => x.job_search && x.university_search).length]]
    : companyMode
    ? [["all", "All", state.institutions.length], ["company", "Companies", state.institutions.filter(x => x.kind === "company").length], ["university", "Universities", state.universities.length], ["recruiter_person", "Recruiters", state.recruiterPeople.length]]
    : [["all", "All", state.items.length], ["job", "Jobs", state.items.filter(x => x.kind === "job").length], ["masters", "Masters", state.items.filter(x => x.kind === "masters").length], ["recruiter", "People", state.items.filter(x => x.kind === "recruiter").length]];
  document.querySelector("#filters").setAttribute("aria-label", locationMode ? "Search scope" : companyMode ? "Institution type" : "Opportunity type");
  document.querySelector("#filters").innerHTML = filterOptions.filter(([key, , count]) => key === "all" || count > 0).map(([key, label, count]) => `<button class="filter ${state.filter === key ? "active" : ""}" data-filter="${key}">${label}<span>${count}</span></button>`).join("");
  setText("#list-heading-label", locationMode ? "LOCATIONS" : companyMode ? "INSTITUTIONS & OFFICES/CAMPUSES" : "OPPORTUNITIES");
  document.querySelector("#search").placeholder = locationMode ? "Search cities" : companyMode ? "Search institutions or offices" : "Search opportunities";
  renderControls();
  setText("#result-count", filtered.length);
  const mappedCount = filtered.reduce((count, item) => count + (item.locations?.length || 0), 0);
  setText("#mapped-count", mappedCount);
  renderLegend();

  document.querySelector("#opportunity-list").innerHTML = filtered.length
    ? filtered.map((item) => locationMode
      ? `<button class="opportunity location-entry ${state.selected === item.id ? "selected" : ""}" data-id="${escapeHtml(item.id)}">
          <div class="opportunity-head"><div><h2>${escapeHtml(item.title)}</h2></div><i class="key-dot" style="background:${item.scope_key === "both" ? "#d7ff78" : item.scope_key === "masters" ? "#c1a0ff" : "#70c8b4"}"></i></div>
          <div class="loc">Search Scope · ${escapeHtml(item.search_scope)}</div>
          ${item.owner ? `<div class="loc">Owner · ${escapeHtml(item.owner)}</div>` : ""}
        </button>`
      : companyMode
      ? `<button class="opportunity company-entry ${state.selected === item.id ? "selected" : ""}" data-id="${escapeHtml(item.id)}">
          <div class="opportunity-head"><div><h2>${escapeHtml(item.title)}</h2><div class="org">${escapeHtml(item.category || item.kind.replaceAll("_", " "))}</div></div><i class="key-dot" style="background:${item.kind === "company" ? categoryColor(item.category) : item.kind === "university" ? "#c1a0ff" : item.kind === "recruiter_person" ? "#ffb86e" : "#70c8b4"}"></i></div>
          <div class="loc">⌖ ${escapeHtml(item.office || item.location || "Office not specified")}</div>
          ${item.kind === "company" && item.company_priority_rank ? `<div class="loc company-rank">Search priority · #${escapeHtml(item.company_priority_rank)} · ${escapeHtml(item.company_priority_tier || "")}</div>` : ""}
          ${item.kind === "university" && item.university_reputation_score_10 !== undefined ? `<div class="loc">University reputation · ${ratingText(item.university_reputation_score_10)}/10${isPlaceholderAssessment(item.university_reputation_notes) ? " · pending" : ""}</div>` : ""}
          ${item.kind === "company" && item.company_reputation_score_10 !== undefined ? `<div class="loc">Company reputation · ${ratingText(item.company_reputation_score_10)}/10${isPlaceholderAssessment(item.company_reputation_notes) ? " · pending" : ""}</div>` : ""}
          ${item.owner ? `<div class="loc">Owner · ${escapeHtml(item.owner)}</div>` : ""}
        </button>`
      : `<button class="opportunity ${state.selected === item.id ? "selected" : ""}" data-id="${escapeHtml(item.id)}">
          <div class="opportunity-head"><div><h2>${escapeHtml(item.title)}</h2><div class="org">${escapeHtml(item.organization)}</div></div><span class="status ${statusClass(item)}">${escapeHtml(item.status || "Needs review")}</span></div>
          <div class="loc">⌖ ${escapeHtml(item.location || item.campus || "Location not listed")} <span class="kind-tag">· ${escapeHtml(item.kind)}</span></div>
          ${item.kind === "job" && (item.business || item.role_function || item.business_function || item.commodity || item.market_geography || item.time_horizon) ? `<div class="loc">${escapeHtml([item.business, item.commodity, item.market_geography, item.time_horizon].filter((part) => !isPlaceholder(part)).join(" · "))}</div>` : ""}
          ${item.kind === "job" && item.total_score_10 !== "" ? `<div class="loc total-score">Total score · ${ratingText(item.total_score_10)}/10${item.total_score_status === "Provisional" ? " · provisional" : ""}</div>` : ""}
          ${item.kind === "masters" && item.university_reputation_score_10 !== undefined ? `<div class="loc">University reputation · ${ratingText(item.university_reputation_score_10)}/10${isPlaceholderAssessment(item.university_reputation_notes) ? " · pending" : ""}</div>` : ""}
          ${item.kind === "masters" && item.course_programme_score_10 !== undefined ? `<div class="loc">Course / programme · ${ratingText(item.course_programme_score_10)}/10${isPlaceholderAssessment(item.course_programme_notes) ? " · pending" : ""}</div>` : ""}
          ${item.kind === "masters" && item.course_fit_score_10 !== undefined ? `<div class="loc">Course fit · ${ratingText(item.course_fit_score_10)}/10</div>` : ""}
          ${item.kind === "recruiter" && item.recruiter_assessment_score_10 !== undefined ? `<div class="loc">Recruiter · ${ratingText(item.recruiter_assessment_score_10)}/10${isPlaceholderAssessment(item.recruiter_assessment_notes) ? " · pending" : ""}</div>` : ""}
          ${item.kind === "recruiter" && item.recruitment_company_score_10 !== undefined ? `<div class="loc">Recruitment company · ${ratingText(item.recruitment_company_score_10)}/10${isPlaceholderAssessment(item.recruitment_company_score_notes) ? " · pending" : ""}</div>` : ""}
          ${item.kind === "recruiter" && item.recruiter_relationship_score_10 !== undefined ? `<div class="loc">Recruiter relationship · ${ratingText(item.recruiter_relationship_score_10)}/10${isPlaceholderAssessment(item.recruiter_relationship_notes) ? " · pending" : ""}</div>` : ""}
          ${item.owner ? `<div class="loc">Owner · ${escapeHtml(item.owner)}</div>` : ""}
          ${!isPlaceholder(item.deadline) ? `<div class="loc">Deadline · ${escapeHtml(item.deadline)}${asDate(item.deadline) ? ` · ${escapeHtml(deadlineBucket(item))}` : ""}</div>` : ""}
        </button>`).join("")
    : '<div class="empty">No matching records.</div>';

  document.querySelectorAll(".opportunity").forEach((button) => {
    button.addEventListener("click", () => selectItem(button.dataset.id, true));
  });
}

function selectItem(id, flyTo) {
  const source = state.view === "institutions" ? state.institutions : state.view === "locations" ? state.locations : state.items;
  const item = source.find((entry) => entry.id === id);
  if (!item) return;

  state.selected = id;
  render();

  const markers = state.markers.get(id) || (item.memberIds || []).flatMap((memberId) => state.markers.get(memberId) || []);
  if (markers.length) {
    const firstLocation = markers[0].getLngLat();
    if (flyTo && state.map) {
      state.map.flyTo({
        center: [firstLocation.lng, firstLocation.lat],
        zoom: 5,
        padding: { top: 24, right: 24, bottom: Math.round(window.innerHeight * 0.5), left: 340 },
        duration: 700,
      });
    }
    if (!markers[0].getPopup()?.isOpen()) markers[0].togglePopup();
  }

}

function createMarker(item, location) {
  const element = document.createElement("div");
  const kindColors = { job: "#73d8f4", masters: "#c1a0ff", recruiter: "#ffb86e", recruiter_person: "#ffb86e", recruitment_company: "#70c8b4", university: "#c1a0ff" };
  const statusBorders = {
    New: "#d7ff78",
    Researching: "#aab4bd",
    "Ready to Apply": "#54d6a5",
    Applied: "#69aaff",
    Interview: "#ffda70",
    Offer: "#a8e77a",
    Rejected: "#c47a83",
    Withdrawn: "#927f8b",
    Closed: "#6f7880",
    "On Hold": "#ff986c",
  };
  const isCompany = item.kind === "company";
  const color = isCompany ? categoryColor(item.category) : item.kind === "location" ? (item.scope_key === "both" ? "#d7ff78" : item.scope_key === "masters" ? "#c1a0ff" : "#70c8b4") : kindColors[item.kind] || "#d2d8dd";
  const border = isCompany ? "#101513" : statusBorders[item.status] || "#69747d";
  element.style.cssText = `
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: ${color};
    border: 2px solid ${border};
    box-shadow: 0 0 0 3px #101513;
    cursor: pointer;`;

  const popupContent = buildPopupContent(item, location);
  const popup = new maplibregl.Popup({ offset: 13, maxWidth: "360px", closeButton: true, closeOnClick: true, focusAfterOpen: false }).setHTML(popupContent);
  popup.on("open", () => attachScoreTooltips(popup.getElement()));
  const marker = new maplibregl.Marker({ element })
    .setLngLat([location.longitude, location.latitude])
    .setPopup(popup)
    .addTo(state.map);
  marker.memberIds = item.memberIds || [item.id];

  element.addEventListener("click", () => {
    state.selected = marker.memberIds[0];
    render();
  });
  return marker;
}

function initializeMap() {
  if (!window.maplibregl) {
    document.querySelector("#map").innerHTML = '<div class="empty">Map library could not load. Check your connection.</div>';
    return;
  }

  state.map = new maplibregl.Map({
    container: "map",
    style: "https://tiles.openfreemap.org/styles/dark",
    center: [122, 19],
    zoom: 3,
    pitch: 0,
    attributionControl: false,
  });
  state.map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "bottom-right");

  state.map.on("load", () => {
    for (const item of state.items.filter((entry) => entry.kind !== "masters")) {
      const locations = item.locations?.length
        ? item.locations
        : Number.isFinite(item.longitude) && Number.isFinite(item.latitude)
          ? [item]
          : [];
      const markers = locations.map((location) => createMarker(item, location));
      if (markers.length) state.markers.set(item.id, markers);
    }
    const campusGroups = new Map();
    for (const item of state.items.filter((entry) => entry.kind === "masters")) {
      const locationKey = (item.locations || []).map((p) => `${p.latitude},${p.longitude}`).join(";");
      const groupKey = `${item.organization.toLowerCase()}|${String(item.campus || "").toLowerCase()}|${locationKey}`;
      if (!campusGroups.has(groupKey)) campusGroups.set(groupKey, { ...item, id: `campus:${groupKey}`, programmes: [], memberIds: [], locations: item.locations || [] });
      const group = campusGroups.get(groupKey);
      group.programmes.push(item);
      group.memberIds.push(item.id);
    }
    for (const group of campusGroups.values()) {
      const markers = group.locations.map((location) => createMarker(group, location));
      if (markers.length) for (const id of group.memberIds) state.markers.set(id, markers);
    }
    for (const institution of state.universities) {
      state.markers.set(institution.id, institution.memberIds.flatMap((id) => state.markers.get(id) || []));
    }
    for (const item of state.offices) {
      const markers = (item.locations || []).map((location) => createMarker(item, location));
      if (markers.length) state.markers.set(item.id, markers);
    }
    for (const item of [...state.unmappedCompanies, ...state.recruitmentCompanies, ...state.recruiterPeople]) {
      const markers = (item.locations || []).map((location) => createMarker(item, location));
      if (markers.length) state.markers.set(item.id, markers);
    }
    for (const item of state.locations) {
      state.markers.set(item.id, (item.locations || []).map((location) => createMarker(item, location)));
    }
    render();
  });
}

async function initializeDashboard() {
  try {
    const response = await fetch("../data/opportunities.json");
    if (!response.ok) throw new Error("Unable to read data/opportunities.json");

    const data = await response.json();
    state.items = data.opportunities || [];
    state.scoreModel = data.score_model || null;
    state.locationRankings = data.location_rankings || [];
    const companyRankById = new Map((data.company_rankings || []).map((row) => [`${String(row.owner || "").toLowerCase()}|${row.company_id}`, row]));
    state.items = state.items.map(addJobScores);
    state.activities = data.activities || [];
    state.sharpnessAttempts = data.sharpness_attempts || [];
    const attachCompanyRank = (item) => {
      const ranking = companyRankById.get(`${String(item.owner || "Ross").toLowerCase()}|${item.company_id}`) || companyRankById.get(`ross|${item.company_id}`);
      return ranking ? { ...item, company_priority_rank: Number(ranking.rank), company_priority_tier: ranking.priority_tier, company_search_focus: ranking.search_focus, company_priority_rationale: ranking.rationale } : item;
    };
    state.offices = (data.offices || []).map(attachCompanyRank);
    state.unmappedCompanies = (data.unmapped_companies || []).map(attachCompanyRank);
    state.recruiterPeople = data.recruiter_people || [];
    state.recruitmentCompanies = data.recruitment_companies || [];
    const scopeFor = (row) => {
      const jobs = row.job_search === true || String(row.job_search).toLowerCase() === "true";
      const masters = row.university_search === true || String(row.university_search).toLowerCase() === "true";
      return { jobs, masters, search_scope: jobs && masters ? "Jobs & Masters" : jobs ? "Job" : masters ? "Masters" : "", scope_key: jobs && masters ? "both" : jobs ? "jobs" : "masters" };
    };
    const rankByCityOwner = new Map((data.location_rankings || []).map((row) => [`${String(row.owner || "").toLowerCase()}|${String(row.city || "").toLowerCase()}`, Number(row.rank)]));
    state.locations = (data.locations || []).map((row) => {
      const scope = scopeFor(row);
      const [latitude, longitude] = String(row.coordinates || "").split(",").map(Number);
      const location = { name: row.city, latitude, longitude };
      const rank = rankByCityOwner.get(`${String(row.owner || "").toLowerCase()}|${String(row.city || "").toLowerCase()}`);
      return { ...row, ...scope, rank, id: `location:${row.city.toLowerCase()}`, kind: "location", title: row.city, organization: "Search locations", location: row.city, latitude, longitude, locations: [location] };
    }).filter(item => item.search_scope && Number.isFinite(item.latitude) && Number.isFinite(item.longitude));
    const universityGroups = new Map();
    for (const item of state.items.filter((entry) => entry.kind === "masters")) {
      const campus = item.campus || item.location || "Campus not specified";
      const key = `${item.organization.toLowerCase()}|${String(campus).toLowerCase()}`;
      if (!universityGroups.has(key)) universityGroups.set(key, { id: `institution:${key}`, kind: "university", title: item.organization, organization: item.organization, university: item.organization, campus, office: campus, location: item.location || campus, category: "University", memberIds: [], locations: [] });
      const group = universityGroups.get(key);
      group.memberIds.push(item.id);
      group.locations.push(...(item.locations || []));
      group.locations = group.locations.filter((point, index, points) => points.findIndex((other) => other.latitude === point.latitude && other.longitude === point.longitude) === index);
    }
    state.universities = data.universities?.length ? data.universities : [...universityGroups.values()];
    state.institutions = [...state.offices, ...state.unmappedCompanies, ...state.universities, ...state.recruiterPeople];
    setText("#updated-label", `DATA ${data.updated_at || "—"}`);
    render();
    renderSharpness();
    initializeMap();
  } catch (error) {
    document.querySelector("#opportunity-list").innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`;
  }
}

document.querySelector("#filters").addEventListener("click", (event) => {
  const button = event.target.closest(".filter");
  if (!button) return;
  state.filter = button.dataset.filter;
  state.facetValue = "";
  render();
});

document.querySelector("#sharpness-owner").addEventListener("change", (event) => {
  state.sharpnessOwner = event.target.value;
  renderSharpness();
});
document.querySelector("#sharpness-details-toggle").addEventListener("click", () => {
  state.sharpnessExpanded = !state.sharpnessExpanded;
  renderSharpness();
});

function toggleSharpnessPanel() {
  state.sharpnessHidden = !state.sharpnessHidden;
  document.querySelector(".sharpness-panel").hidden = state.sharpnessHidden;
  try { localStorage.setItem("woc.sharpness.hidden", String(state.sharpnessHidden)); }
  catch { /* The panel remains toggleable when browser storage is unavailable. */ }
}

document.querySelectorAll(".view-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".view-button").forEach((view) => view.classList.remove("active"));
    button.classList.add("active");
    state.view = button.dataset.view;
    state.sort = state.view === "locations" ? "rank" : state.view === "institutions" ? "name" : "total_score";
    state.filter = "all";
    state.selected = null;
    for (const markers of state.markers.values()) for (const marker of markers) marker.getPopup()?.remove();
    render();
    if (!state.map?.loaded()) return;
    if (state.view === "institutions" || state.view === "locations") {
      const points = (state.view === "institutions" ? state.institutions : state.locations).flatMap((item) => item.locations || []);
      if (points.length > 1) {
        const bounds = new maplibregl.LngLatBounds();
        points.forEach((point) => bounds.extend([point.longitude, point.latitude]));
        state.map.fitBounds(bounds, { padding: { top: 55, right: 45, bottom: 55, left: 350 }, maxZoom: 5, duration: 650 });
      } else if (points.length === 1) state.map.flyTo({ center: [points[0].longitude, points[0].latitude], zoom: 3, duration: 650 });
    } else {
      state.map.flyTo({ center: [122, 19], zoom: 3, duration: 650 });
    }
  });
});

document.querySelector("#search").addEventListener("input", (event) => {
  state.query = event.target.value.trim().toLowerCase();
  render();
});

document.querySelector("#facet-filter").addEventListener("change", (event) => { state.facet = event.target.value; state.facetValue = ""; render(); });
document.querySelector("#facet-value").addEventListener("change", (event) => { state.facetValue = event.target.value; render(); });
document.querySelector("#sort-order").addEventListener("change", (event) => { state.sort = event.target.value; render(); });

document.addEventListener("click", (event) => {
  if (event.target.closest(".custom-select")) return;
  document.querySelectorAll(".custom-select-menu").forEach((menu) => {
    menu.hidden = true;
    menu.previousElementSibling?.setAttribute("aria-expanded", "false");
    menu.parentElement?.classList.remove("open");
  });
});

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "i") {
    event.preventDefault();
    toggleSharpnessPanel();
    return;
  }
  if (event.key !== "Escape") return;
  document.querySelectorAll(".custom-select-menu").forEach((menu) => {
    menu.hidden = true;
    menu.previousElementSibling?.setAttribute("aria-expanded", "false");
    menu.parentElement?.classList.remove("open");
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    document.querySelector("#search").focus();
  }
});

initializeDashboard();
