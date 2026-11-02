# Coordinate audit — 2026-11-02

## What changed

- Reviewed 378 map lookups: 332 office-address candidates, 17 campuses and 29 registered search cities.
- Added address-level coordinates to 107 office records. In the broad sweep, the listed street number and road had to match; postcodes were matched when the source address and map data both supplied one. Each updated office row has the OpenStreetMap feature link and match details in `Research Notes`; its original official office source remains in `Source URL`.
- Corrected Macquarie Commodities’ Sydney office to the `1Elizabeth` building (OSM way 1241501338) after the first search result matched a different `1 Elizabeth Street` in another Sydney suburb. The official Macquarie locations page lists the Sydney address.
- A focused native-language pass added building/address coordinates for six Tokyo offices (five distinct points; S&P Global and Platts share the same registered building). The remaining Tokyo office records still have only city-level evidence.
- Updated 14 of 17 campus records to a campus feature or campus address point. The Oxford, Cambridge UK and KAIST Seoul records remain at their registered city coordinates because the searches did not establish a sufficiently reliable campus point. Their notes record that limitation.
- Retained the 29 Location Registry coordinates as city-level search-scope points. They represent the target cities, not office addresses.

## Map display

Office and campus records with verified address or campus points use those coordinates. Where a record only has a registered city-centre estimate, its stored coordinates remain unchanged. The dashboard separates coincident city-estimate markers by a deterministic, small map-only offset and labels the popup `City-level estimate · pin offset slightly for visibility`. Selecting a record zooms to its point and opens its detail panel. Records with genuinely identical verified coordinates remain grouped in a counted marker whose list opens each record.

The visual offset is only a collision aid. It does not replace or imply a researched street address, and the registry continues to store the real city-centre coordinate and its uncertainty.

## Checks and limits

- The dashboard feed contains 1,069 mapped office records and 172 mapped opportunities. Office records are joined through registered Location IDs; the 29 search cities remain the scope source.
- Nominatim results were accepted only when the street number and road matched; a conflicting postcode or a result more than 12 km from the registered city point was rejected. The exact-match rule is intentionally conservative. A map match is coordinate evidence, not proof that an office is still occupied there; see each row’s official source and check date.
- Address-level/campus-level positions now exist where the available evidence supports them. Remaining city-centre values are explicitly approximate and spread only in the map renderer to prevent visual overlap.
