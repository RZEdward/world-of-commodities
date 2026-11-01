const state = {
  items: [],
  offices: [],
  universities: [],
  institutions: [],
  view: "opportunities",
  filter: "all",
  query: "",
  facet: "",
  facetValue: "",
  sort: "name",
  map: null,
  markers: new Map(),
  selected: null,
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
  business_function: "Business function",
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
};

function categoryColor(value) {
  const category = String(value || "").split(";")[0].trim();
  return categoryColors[category] || "#c2c8ce";
}

function asDate(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
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
  return !normalized || /^(estimated\s*[-–—:]?\s*)?(not stated|not listed|unknown|n\/?a|tbd|[-–—])$/.test(normalized);
}

function facetValueFor(item, key) {
  if (key === "category") return item.category;
  if (key === "function") return item.business_function;
  if (key === "commodity") return item.commodity;
  if (key === "market") return item.market_geography;
  if (key === "horizon") return item.time_horizon;
  if (key === "status") return item.status;
  if (key === "office") return item.office;
  if (key === "deadline") return deadlineBucket(item);
  return "";
}

function searchHaystack(item) {
  return `${item.title} ${item.organization} ${item.location} ${item.office || ""} ${item.owner || ""} ${item.category || ""} ${item.business_function || ""} ${item.commodity || ""} ${item.market_geography || ""} ${item.time_horizon || ""} ${item.experience_requirement_years || ""} ${item.requirements || ""} ${item.next_action || ""}`.toLowerCase();
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
  const omitted = new Set(["id", "title", "organization", "latitude", "longitude", "coordinates", "locations", "source_url", "memberIds", "programmes", "link"]);
  const rows = [];

  const preferredOrder = ["university", "campus", "location", "course", "duration", "tuition_year_usd", "living_costs_year_usd", "total_cost_usd", "owner", "status", "link", "intake", "deadline", "fit", "confidence", "requirements", "next_action", "business_function", "commodity", "market_geography", "time_horizon", "category", "office", "description"];
  const fields = Object.entries(item).sort(([a], [b]) => {
    const ai = preferredOrder.indexOf(a), bi = preferredOrder.indexOf(b);
    return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
  });
  for (const [key, rawValue] of fields) {
    if (omitted.has(key) || rawValue == null || rawValue === "") continue;
    if (key === "source_url" && item.link) continue;
    const value = key === "kind" || key === "verification"
      ? String(rawValue).replace(/^\w/, (letter) => letter.toUpperCase())
      : Array.isArray(rawValue)
      ? rawValue.map((part) => typeof part === "object" ? part.name || JSON.stringify(part) : part).join(", ")
      : typeof rawValue === "object"
        ? JSON.stringify(rawValue)
        : String(rawValue);
    if (item.kind === "company" && key === "location" && item.office) continue;
    const label = key === "location"
      ? item.kind === "masters" ? "Location" : item.kind === "company" ? "Office" : "Location"
      : fieldLabels[key] || key.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
    rows.push(`<div class="map-popup-row"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`);
  }

  const posted = asDate(item.posted);
  const deadline = asDate(item.deadline);
  const today = new Date();
  const postedValue = posted ? `${daysBetween(posted, today)} days` : "Not listed";
  let deadlineValue = "Not listed";
  if (deadline) {
    const days = daysBetween(today, deadline);
    deadlineValue = days < 0 ? `${Math.abs(days)} days past` : `${days} days`;
  }
  if (item.kind !== "company") {
    rows.push(`<div class="map-popup-row"><dt>Days since posted</dt><dd>${escapeHtml(postedValue)}</dd></div>`);
    rows.push(`<div class="map-popup-row"><dt>Days until deadline</dt><dd>${escapeHtml(deadlineValue)}</dd></div>`);
  }

  const source = /^https?:\/\//i.test(item.source_url || "")
    ? `<a class="map-popup-source" href="${escapeHtml(item.source_url)}" target="_blank" rel="noopener">Open source ↗</a>`
    : "";
  const mapLocation = location.name || item.location || "Location not specified";
  return `<div class="map-popup">
    <div class="map-popup-title ${item.kind === "company" ? "company-title" : ""}">${escapeHtml(item.title)}</div>
    <div class="map-popup-organization">${escapeHtml(item.organization)} · ${escapeHtml(mapLocation)}</div>
    <dl class="map-popup-fields">${rows.join("")}</dl>
    ${source}
  </div>`;
}

function getFilteredItems() {
  const source = state.view === "institutions" ? state.institutions : state.items;
  const filtered = source.filter((item) => {
    const matchesKind = state.view === "institutions" ? state.filter === "all" || item.kind === state.filter : state.filter === "all" || item.kind === state.filter;
    const haystack = searchHaystack(item);
    const facetText = facetValueFor(item, state.facet);
    const matchesFacet = !state.facetValue || String(facetText || "").toLowerCase() === state.facetValue.toLowerCase();
    return matchesKind && matchesFacet && haystack.includes(state.query);
  });
  const deadline = (item) => { const date = asDate(item.deadline); return date ? date.getTime() : Number.MAX_SAFE_INTEGER; };
  return filtered.sort((a, b) => state.sort === "deadline" ? deadline(a) - deadline(b) : state.sort === "category" ? String(a.category || "").localeCompare(String(b.category || "")) || a.title.localeCompare(b.title) : state.sort === "location" ? String(a.office || a.location || "").localeCompare(String(b.office || b.location || "")) : a.title.localeCompare(b.title));
}

function renderControls() {
  const companyMode = state.view === "institutions";
  const filter = document.querySelector("#facet-filter"), value = document.querySelector("#facet-value"), sort = document.querySelector("#sort-order");
  const source = companyMode ? state.institutions : state.items.filter((item) => state.filter === "all" || item.kind === state.filter);
  const controls = document.querySelector("#list-controls");
  if (!source.length) { controls.hidden = true; return; }
  const fieldOptions = companyMode ? [["category", "Category"]] : [["function", "Business function"], ["commodity", "Commodity"], ["market", "Market geography"], ["horizon", "Time horizon"], ["status", "Status"], ["deadline", "Deadline"]];
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
  const values = [...new Set(matchingSource.map((item) => facetValueFor(item, state.facet)).filter((entry) => !isPlaceholder(entry)))].sort((a,b) => String(a).localeCompare(String(b)));
  const facetNoun = state.facet === "category" ? "categories" : state.facet === "function" ? "business functions" : state.facet === "commodity" ? "commodities" : state.facet === "market" ? "market geographies" : state.facet === "horizon" ? "time horizons" : state.facet === "deadline" ? "deadlines" : "statuses";
  value.innerHTML = `<option value="">Match · All ${facetNoun}</option>` + values.map((entry) => `<option value="${escapeHtml(entry)}">${escapeHtml(entry)}</option>`).join("");
  if (!values.includes(state.facetValue)) state.facetValue = "";
  value.value = state.facetValue;
  const sortOptions = companyMode ? [["name", "Name", () => matchingSource.some((item) => !isPlaceholder(item.title))], ["category", "Category", () => matchingSource.some((item) => !isPlaceholder(item.category))], ["location", "Office", () => matchingSource.some((item) => !isPlaceholder(item.office || item.location))]] : [["name", "Name", () => matchingSource.some((item) => !isPlaceholder(item.title))], ["deadline", "Deadline soonest", () => matchingSource.some((item) => asDate(item.deadline))], ["location", "Location", () => matchingSource.some((item) => !isPlaceholder(item.location || item.campus))]];
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
  if (state.view === "institutions" && state.filter !== "university") {
    const categories = [...new Set(state.offices.filter((item) => item.locations?.length).map((item) => String(item.category || "").split(";")[0].trim()).filter(Boolean))];
    legend.innerHTML = categories.map((category) => `<span><i class="key-dot" style="background:${categoryColor(category)}"></i>${escapeHtml(category)}</span>`).join("");
  } else {
    const kinds = [...new Set(getFilteredItems().map((item) => item.kind))];
    const kindNames = { job: "Jobs", masters: "Masters", recruiter: "People", university: "Universities" };
    const kindRows = kinds.map((kind) => `<span><i class="key-dot kind-${kind === "university" ? "masters" : kind}"></i>${kindNames[kind] || kind}</span>`).join("");
    const statusColors = { New: "#d7ff78", Researching: "#aab4bd", "Ready to Apply": "#54d6a5", Applied: "#69aaff", Interview: "#ffda70", Offer: "#a8e77a", Rejected: "#c47a83", Withdrawn: "#927f8b", Closed: "#6f7880", "On Hold": "#ff986c" };
    const statuses = [...new Set(state.items.filter((item) => item.locations?.length).map((item) => item.status).filter(Boolean))];
    legend.innerHTML = `${kindRows}${statuses.map((status) => `<span><i class="key-dot status-key" style="--status-color:${statusColors[status] || "#aab4bd"}"></i>${escapeHtml(status)}</span>`).join("")}`;
  }
}

function render() {
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
  const filterOptions = companyMode
    ? [["all", "All", state.institutions.length], ["company", "Companies", state.offices.length], ["university", "Universities", state.universities.length]]
    : [["all", "All", state.items.length], ["job", "Jobs", state.items.filter(x => x.kind === "job").length], ["masters", "Masters", state.items.filter(x => x.kind === "masters").length], ["recruiter", "People", state.items.filter(x => x.kind === "recruiter").length]];
  document.querySelector("#filters").setAttribute("aria-label", companyMode ? "Institution type" : "Opportunity type");
  document.querySelector("#filters").innerHTML = filterOptions.filter(([key, , count]) => key === "all" || count > 0).map(([key, label, count]) => `<button class="filter ${state.filter === key ? "active" : ""}" data-filter="${key}">${label}<span>${count}</span></button>`).join("");
  setText("#list-heading-label", companyMode ? "INSTITUTIONS & OFFICES" : "OPPORTUNITIES");
  document.querySelector("#search").placeholder = companyMode ? "Search institutions or offices" : "Search opportunities";
  renderControls();
  setText("#result-count", filtered.length);
  const mappedCount = filtered.reduce((count, item) => count + (item.locations?.length || 0), 0);
  setText("#mapped-count", mappedCount);
  renderLegend();

  document.querySelector("#opportunity-list").innerHTML = filtered.length
    ? filtered.map((item) => companyMode
      ? `<button class="opportunity company-entry ${state.selected === item.id ? "selected" : ""}" data-id="${escapeHtml(item.id)}">
          <div class="opportunity-head"><div><h2>${escapeHtml(item.title)}</h2><div class="org">${escapeHtml(item.category || "University")}</div></div><i class="key-dot" style="background:${item.kind === "company" ? categoryColor(item.category) : "#c1a0ff"}"></i></div>
          <div class="loc">⌖ ${escapeHtml(item.office || item.location || "Office not specified")}</div>
        </button>`
      : `<button class="opportunity ${state.selected === item.id ? "selected" : ""}" data-id="${escapeHtml(item.id)}">
          <div class="opportunity-head"><div><h2>${escapeHtml(item.title)}</h2><div class="org">${escapeHtml(item.organization)}</div></div><span class="status ${statusClass(item)}">${escapeHtml(item.status || "Needs review")}</span></div>
          <div class="loc">⌖ ${escapeHtml(item.location || item.campus || "Location not listed")} <span class="kind-tag">· ${escapeHtml(item.kind)}</span></div>
          ${item.kind === "job" && (item.business_function || item.commodity || item.market_geography || item.time_horizon) ? `<div class="loc">${escapeHtml([item.business_function, item.commodity, item.market_geography, item.time_horizon].filter((part) => !isPlaceholder(part)).join(" · "))}</div>` : ""}
          ${item.owner ? `<div class="loc">Owner · ${escapeHtml(item.owner)}</div>` : ""}
          ${!isPlaceholder(item.deadline) ? `<div class="loc">Deadline · ${escapeHtml(item.deadline)}${asDate(item.deadline) ? ` · ${escapeHtml(deadlineBucket(item))}` : ""}</div>` : ""}
        </button>`).join("")
    : '<div class="empty">No matching records.</div>';

  document.querySelectorAll(".opportunity").forEach((button) => {
    button.addEventListener("click", () => selectItem(button.dataset.id, true));
  });
}

function selectItem(id, flyTo) {
  const source = state.view === "institutions" ? state.institutions : state.items;
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
  const kindColors = { job: "#73d8f4", masters: "#c1a0ff", recruiter: "#ffb86e" };
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
  const color = isCompany ? categoryColor(item.category) : kindColors[item.kind] || "#d2d8dd";
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
  const marker = new maplibregl.Marker({ element })
    .setLngLat([location.longitude, location.latitude])
    .setPopup(new maplibregl.Popup({ offset: 13, maxWidth: "360px", closeButton: true, closeOnClick: true, focusAfterOpen: false }).setHTML(popupContent))
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
    render();
  });
}

async function initializeDashboard() {
  try {
    const response = await fetch("../data/opportunities.json");
    if (!response.ok) throw new Error("Unable to read data/opportunities.json");

    const data = await response.json();
    state.items = data.opportunities || [];
    state.offices = data.offices || [];
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
    state.universities = [...universityGroups.values()];
    state.institutions = [...state.offices, ...state.universities];
    setText("#updated-label", `DATA ${data.updated_at || "—"}`);
    render();
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

document.querySelectorAll(".view-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".view-button").forEach((view) => view.classList.remove("active"));
    button.classList.add("active");
    state.view = button.dataset.view;
    state.filter = "all";
    state.selected = null;
    for (const markers of state.markers.values()) for (const marker of markers) marker.getPopup()?.remove();
    render();
    if (!state.map?.loaded()) return;
    if (state.view === "institutions") {
      const points = state.institutions.flatMap((item) => item.locations || []);
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
