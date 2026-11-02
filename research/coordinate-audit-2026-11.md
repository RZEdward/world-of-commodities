# Coordinate audit — 2026-11-02

## Registry coverage

- Office Registry now has 1,068 rows, each linked to an in-scope Location Registry ID and carrying coordinates. One Taipei office row had been incorrectly assigned to Nanjing because “Nanjing East Road” occurs in the Taipei street address; that out-of-scope row was removed.
- 179 offices now have address/building evidence: 152 address-level matches and 27 building-level matches. This includes 50 additional office coordinates from the follow-up pass. The other 889 office rows retain a registered city/area estimate because the research did not establish a defensible building point.
- All 17 Campus Registry rows now have a campus or building point. The final three refinements are Oxford Engineering Science’s Thom Building, Cambridge’s Centre for Mathematical Sciences (the course-linked DAMTP location), and KAIST Seoul Campus.
- All 29 Location Registry rows have coordinates. These are city-level search-scope points, not office or campus coordinates.

## Evidence and decisions

The earlier sweep reviewed 378 map lookups and refined 107 office rows. The follow-up checked 242 address-bearing company/office records against the registered city, retried unresolved entries with the address alone, and reviewed the official office pages already collected. Fifty entries qualified through a matching OpenStreetMap house number or named building. Each changed Office Registry row retains its original office source and adds the OSM feature link, matched feature name, and check date in `Research Notes`.

Campus sources and map features were matched as follows:

- Oxford MSc Energy Systems is offered by Engineering Science; the Thom Building is the department’s main site at Parks Road. Coordinates use OSM way 66710279. [Oxford course page](https://www.ox.ac.uk/admissions/graduate/courses/msc-energy-systems), [Thom Building](https://www.ox.ac.uk/about/how-we-are-run/equality-diversity/access-guide/academic-depts/thom-building), [OSM feature](https://www.openstreetmap.org/way/66710279).
- Cambridge’s MPhil in Quantitative Climate and Environmental Science is cross-departmental and includes DAMTP. The campus point is the Centre for Mathematical Sciences on Wilberforce Road, from the official DAMTP address and OSM way 4195915. [Course page](https://www.postgraduate.study.cam.ac.uk/courses/directory/maammpqce), [DAMTP address](https://www.damtp.cam.ac.uk/about/contacts), [OSM feature](https://www.openstreetmap.org/way/4195915).
- KAIST Seoul Campus is officially listed at 85 Hoegi-ro; OSM way 416468238 is tagged as the Seoul Campus. [KAIST campus page](https://www.kaist.ac.kr/en/html/kaist/01200203.html), [OSM feature](https://www.openstreetmap.org/way/416468238).
- Macquarie’s official current New York address is 660 Fifth Avenue. OSM’s building feature is named “660 Fifth Avenue” but retains the legacy 666 house-number tag; the coordinates represent that verified building. [Macquarie announcement](https://www.macquarie.com/cl/en/about/news/2024/macquarie-group-demonstrates-commitment-to-the-americas-with-move-to-iconic-new-york-address-at-660-fifth-avenue), [OSM feature](https://www.openstreetmap.org/way/118476502).

The company office address is not evidence that the company currently occupies the site; the cited company page and check date remain in each row. Where an OSM result conflicted with the registered city or listed street number, it was rejected. For example, a Taipei address was not geocoded to Nanjing, and a result for Macquarie’s former building number was accepted only after confirming that OSM’s feature name and Macquarie’s current official address refer to the same building.

## Map display and remaining uncertainty

Verified office and campus points use their researched coordinates. City/area estimates keep their registered approximate coordinates; the dashboard separates coincident estimated pins with a deterministic map-only offset and labels them as estimates. This keeps pins visible without inventing office coordinates. Exact shared buildings remain grouped in a counted marker.

There are no blank coordinate cells in the Office, Campus, or Location registries. There are still 889 office records whose individual building coordinates are not established. Those rows are explicitly approximate rather than presented as precise. The 29 Location Registry points are intentionally city centroids used for search scope.
