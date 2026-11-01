# Scoring and search methodology

This is the current owner-approved baseline for the workbook, dashboard, and future daily/on-demand search. Update this document and the `Score Model` sheet together when Ross changes a rule.

## Job ranking

Total score is a weighted average on a 0–10 scale:

- Location: 25%
- Role fit (how desirable the work is to Ross): 25%
- Candidate fit (how closely Ross matches the role): 15%
- Expected earnings: 15%
- Desk outlook: 15%
- Company reputation: 5%

Keep every component between 0 and 10. Missing inputs are incomplete; never silently substitute a midpoint. Estimated inputs must carry their basis and confidence in notes, and a total using an estimate is marked provisional.

### Location

Use the owner-specific Location Rankings for job-search cities only. Map rank 1 to 10 and the lowest active rank to 6, linearly. At a 25% weight, the full location range changes total score by at most 1.0 point. If a vacancy accepts applications in several cities, create one role-city row per city, each with its own location score and application status, and link each to that city’s registered office(s). Keep the same source URL and shared role details. Deduplicate offices within one city. Never add cities outside the owner’s Job Search scope.

### Candidate fit

Ground it in Ross’s CV: European/CWE power forecasting and modeling from day-ahead to calendar+2, current power trading, previous GB intraday rotation ranked first of five on P&L/risk progression, Japanese nine-region power model, and daily powerburn views used by gas traders. Power analysis/modeling in Europe is strongest; gas analysis and adjacent asset optimization are plausible; trader roles are a little weaker than direct analysis/modeling matches. Japan/Australia are weaker market matches than CWE. Carbon is weaker, then oil/coal, then agriculture/metals. External energy-market research can be a strong candidate match even when its role fit is lower. Apply explicit years, language, and domain requirements as modest evidence-based deductions. This is not a hiring probability.

Calibrate by the actual product and day-to-day work, not a broad “energy” label: direct European power analysis/modeling is 9–10; adjacent power markets and external power research are lower; gas analysis gets partial credit for the powerburn context but no assumed trading experience; an LNG analyst is about 5 for candidate fit because Ross has no direct LNG work; oil structuring is about 3 because neither oil nor structured products are in his experience; agriculture/metals generally 2–3. A lower candidate-fit score can coexist with a high role-fit score when Ross would enjoy the work (for example, LNG analysis around 8 role fit / 5 candidate fit).

### Role fit and earnings

Role fit captures Ross’s preference: power/gas trading, quant trading, and front-office market decisions highest; asset optimization and trading analytics next; external market intelligence lower; consulting lower again; middle/back-office support much lower. Company category and reputation can smooth this score only by a combined maximum of ±0.6 points. Starting category adjustments: prop/HF +0.4, physical trader/integrated energy +0.15, bank −0.1, utility −0.25, consulting −0.1. Add at most ±0.25 for company quality; company reputation separately remains 5% of total.

Do not award high role fit solely because a posting says “trading,” “energy,” or “structuring.” Oil structuring is about 3 for Ross’s preferences; LNG analysis can be about 8 because he would enjoy it, even though candidate fit is about 5. Power desk analysis/trading is the strongest preference; external power analytics is usually around 7; generic non-power commodities and support functions are lower.

Expected earnings is a 10-year cumulative gross estimate anchored to estimated first-year total compensation. Illustrative annual progression: prop/HF trading or quant 10%; other trading/quant 8%; analysis/research 5.5%; consulting 6%; operations/support 4%. Sum ten years before tax and discounting. Promotion, bonus, P&L, tenure, and compensation estimates are uncertain. Score using broad logarithmic anchors, not a narrow linear range: $250k=1, $400k=2, $650k=3, $950k=4, $1.4m=5, $2m=6, $2.85m=7, $4m=8, $5.6m=9, $8m=10.

### Desk outlook and employer reputation

Desk outlook uses current hiring, desk/team descriptions, business strategy, market trends, and published results. Prefer role/team evidence; label company-wide segment results as context, not proof of this desk’s profitability. Use a reasoned low-confidence estimate when public disclosure is limited rather than a blanket 5 placeholder.

Glassdoor and Reddit are separate employer-wide reputation signals, not desk scores. Use attributable evidence from the last five years. Reddit starts around 6; move it only for atypical positive or negative evidence judged relative to company category and reviewer standards. Estimate a missing Reddit score by multiplying observed Glassdoor by the live median Reddit/Glassdoor ratio for the category when at least five paired observed companies exist; otherwise use the live global median if at least two pairs exist. Estimated, indirect, unverified, and stale values never train the ratio. If the evidence sample is too small, use a neutral 6 estimate and label low confidence. Never use a hardcoded conversion factor.

## Search workflow rules

- Search and map roles only in the owner’s registered Job Search cities; universities use the separate university-search scope.
- Preserve one role-city row per distinct application location, with a unique opportunity ID and a link to the location/office registry. Same source posting may therefore have multiple location rows.
- Search current employer career sites first, then reputable aggregators and market-specific sources. Verify the live posting, title, location, deadline, requirements, and source URL before adding it.
- Keep explicit separation between company, office/city, role, owner, application status, company reputation, candidate fit, role fit, expected earnings, and desk outlook.
- Record evidence, checked date, and confidence for estimates. “Not stated” is appropriate only when a reasonable bounded estimate cannot be supported.
- Recalculate scores after registry, ranking, compensation, review, or role evidence changes; then regenerate the dashboard feed from the workbook.

