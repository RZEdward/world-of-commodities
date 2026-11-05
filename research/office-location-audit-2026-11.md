# Office location audit — 2026-11-03

## Current registry state

- **1,005** office rows, each with a unique Office ID and a link to one of the 29 cities in the active Location Registry.
- **340** address/postcode-level points and **373** building or complex-level points are supported by researched office information and a matching map address/building feature.
- **292** rows remain on their registered city anchors. Some contain an official street/building address, but the available map data did not establish the individual point; others have only a city-level office record. Their precision stays labelled as a city-level fallback.
- **62** out-of-scope rows and **8** exact duplicate rows were removed. Their IDs, source links, and reasons remain in the JSON audit file.
- Goldman Sachs' distinct Hong Kong, London, and Singapore locations are separate rows. Macquarie city records were enriched from its official location directory; separate company rows remain linked to their own offices.
- The Location Registry still contains **29** cities and the Campus Registry **20** campuses. Chicago, Harbin, Providence, and Xi'an remain excluded.

The full row-level change trail, removed records, point precision, map feature IDs, and rejected candidates are in [`office-location-audit-2026-11.json`](office-location-audit-2026-11.json).

## Scope and office matching

An official global directory may list many countries/cities in a single page. A candidate is used only when its city and address are tied to that office row. The 62 removals included rows attached to a different city, unrelated regional offices, and non-city entities. A nearby suburb is not silently treated as a registered city. Each remaining record's `Location ID` must resolve to an active Location Registry row.

Coordinate precision is evidence-based:

1. **Address-level:** official street number and street are corroborated by a map feature in the registered city. Where the source supplies a postcode, it should agree with the map feature.
2. **Building-level:** the official named building matches the map feature in the registered city. If a postcode or street-number label conflicts, do not claim address-level precision; retain the building point only when the named building is unambiguous and record the discrepancy. Where a tower sits inside a larger complex and the map only resolves the complex, state that limitation.
3. **City-level fallback:** no reliable individual office point was found. Use the registered city coordinate; do not invent a building point or describe it as a verified office address.

Separate offices stay as separate rows even when they belong to the same company and city. Exact duplicate rows were removed. One-number geocoder matches are not enough: the wrong-suburb result for Macquarie's 1 Elizabeth Street was rejected, then replaced using the official Sydney postcode and a map point at the Sydney address. Full accepted and rejected match evidence is retained in the audit JSON.

## Research performed and known limits

The audit rechecked **269 official-source URLs**; **210** returned readable page content. A stricter pass found **289** distinct official-page address candidates; **184** produced map features, and **62** unique office points passed the address/city checks. A further pass checked **202** addresses already present in fallback rows; **111** returned candidates and **48** passed the stricter match review. The incorrect Artarmon result for Macquarie's Sydney address was excluded and corrected independently.

A final directory pass used company office listings to fill addresses for Goldman Sachs and Macquarie rows, including distinct Goldman Sachs locations at 1 Raffles Link and 60 Anson Road in Singapore, and 25 Shoe Lane and 2 Stonecutter Street in London. The second London address is recorded, but remains on the city anchor because the available map result matched only the street segment. Selected source-backed map points were added for Tokyo, Seoul, Geneva, London, Boston, Zurich, and Singapore. A second stored-address geocoding pass queried 160 unresolved office addresses. It returned 66 candidates; 14 named-building candidates were manually matched to native-language map records and applied only when the official office source named the same building. A regulatory-source check also confirmed Jefferies addresses in Hong Kong, Singapore, Tokyo, London, and Sydney; five mapped points were checked against corresponding buildings/address features. A further one-by-one official-source pass verified 20 in-scope addresses, including InCommodities, Optiver, Cargill, Balyasny, HSBC, LSEG, Aramco, Valero, MUFG, NAB, Bank of America, TD Securities, Scotiabank, and several London/New York investment firms. Their building/map features and postal-code limitations are preserved in the workbook notes. Sources for this batch include [InCommodities contact](https://incommodities.com/contact), [Optiver Singapore](https://www.optiver.com/join-us/locations/singapore/), [Cargill Singapore](https://www.cargill.com/worldwide/singapore), [Balyasny offices](https://www.bamfunds.com/about-us/locations), [HSBC contact directory](https://www.hsbc.com/contact-us), [LSEG New York](https://www.lseg.com/en/careers/where-we-work/new-york-usa), [Aramco Europe contact](https://europe.aramco.com/en/contact-us), [Valero offices](https://www.valero.com/about/offices), [MUFG global network](https://www.bk.mufg.jp/global/globalnetwork/emea/index.html), [NAB global branches](https://www.nab.com.au/corporate/global-relationships/contact-us), [Bank of America locations](https://business.bofa.com/content/boaml/en_us/locations.html), [TD Securities offices](https://www.tdsecurities.com/ca/en/our-offices), [Scotiabank Singapore disclosure](https://www.gbm.scotiabank.com/content/dam/scotiabank/gbm/market-insights/research-and-market-commentary/Electricity-in-Mexico.pdf), [Toyota Tsusho global network](https://www.toyota-tsusho.com/english/company/network/), [ExodusPoint offices](https://www.exoduspoint.com/), [Taula London](https://www.taulacapital.com/contact), [BlueCrest](https://www.bluecrestcapital.com/), and [Cathay Petroleum](https://www.cathaypetroleum.com/get-in-touch). For Jefferies, see [current legal disclosures](https://www.jefferies.com/compliance-disclaimers/general-disclosure-for-marketing-communications/) and [MAS Financial Institutions Directory](https://eservices.mas.gov.sg/fid/institution/detail/1595-JEFFERIES-SINGAPORE-LIMITED). Office locations were not imputed from headquarters, job postings, or unrelated subsidiaries.

Primary company sources include [Goldman Sachs Locations](https://www.goldmansachs.com/our-firm/locations/), [Macquarie Office Locations](https://www.macquarie.com/au/en/about/contact/locations.html), [TD Securities Offices](https://www.tdsecurities.com/ca/en/our-offices), [OCBC International Network](https://www.ocbc.com/group/about-us/international-network.page), and [Goldman Sachs Locations for the two Hong Kong offices](https://www.goldmansachs.com/our-firm/locations/). The workbook retains each row's own source URL and check date.

**This is not 90% address-point coverage.** The current workbook has 702 non-city-level points out of 1005 unique office rows; 303 remain city-level fallbacks. The fallback count is a concrete research backlog, not a claim that no addresses exist. Address text may be known even if the map could not verify the exact feature. No city anchor is presented as an individual office coordinate.

The address verification pass has added 18 source-backed points across two batches: ADM Tokyo, Freepoint London, Energy Intelligence London, Kraken London, Tower Research Shanghai, TP ICAP Shanghai, and Man Group and Brevan Howard at the same verified New York building. Seven building-level pins retain postcode discrepancies, and the Accenture Singapore complex pin has a two-number street-address difference; each limitation is stated on its row.

Additional verified updates on November 2 add the Macquarie Group Sydney office at 1 Elizabeth Street, Mercuria Tokyo at TOKYO TORCH (complex-level), and the RWE Singapore Land Tower for both the RWE and RWE Supply & Trading records. The map feature and source level are retained in each row; none of these imply an exact suite entrance.

The second named-building pass added Marubeni’s Singapore and Shanghai offices, Macquarie Commodities Shanghai, Vitol Geneva, Accenture Singapore, Allegro Development London, Caixin Beijing, LCP Delta Cambridge, G-Research London, and Point72 San Francisco. Complex-level and cross-postcode candidates are explicitly labeled in the workbook.

On November 3, another 50 previously unqueried official-address records were checked. Seventeen office points passed the address/building match: Equinor's London and Brooklyn offices; Trafigura Geneva; Citadel Securities Zurich and Tokyo; Tower Research Capital's two New York offices; Nasdaq and Virtu/PIMCO in New York; Shenzhen Energy; Argus Media Seoul and Shanghai; EDF Trading and Hartree Partners Tokyo; Equinor Tokyo; and S&P Global Hong Kong. Exact feature IDs and source notes are stored on each Office Registry row. Thirty-three candidate results were left unused because they resolved only a road, an ambiguous/other-city feature, or a different building. The office queue is still open: 620 rows retain city anchors.

## Dashboard map behavior

The dashboard renders an individual node for each office and campus. Numbered cluster bubbles have been removed. When several stored points coincide, the app applies a deterministic, small screen-space offset so each node can be selected; the workbook latitude/longitude is unchanged. Approximate points are labelled as city-level estimates in the panel, and the exact stored coordinate is displayed. This visual separation does not create new geographic evidence.

## Next audit priorities

Continue one company/city at a time. Start from official location/contact pages, then use local company pages, regulator/company registries, and LinkedIn only to locate further primary evidence. For China, Japan, and Korea, use native-language office-name and address searches. Record the source's actual office entity and address; avoid assuming that a parent and every subsidiary occupy each other's offices. Geocode exact addresses, check the returned city, street, building, and postcode, and preserve the source and map feature. If a page is inaccessible or only lists a city, log that outcome and keep the city anchor until better evidence is found.


A targeted November 3 follow-up reviewed another 25 address/building queries. Two new office points passed: TD Securities at 22 Vanderbilt Avenue in New York (address-level; OSM node/2716011976 matches house number, street and postcode), and Macquarie at Two Liberty Place in Philadelphia (building-level; official building name matches OSM way/42785013, whose address tags differ). Twenty-three candidates were left unresolved or rejected for road-only, wrong-city/address, unrelated-tenant, or no-match results. The totals are now 265 address-level, 126 building-level, and 618 city-level fallback rows (391 non-city-level points). The source directories are [TD Securities offices](https://www.tdsecurities.com/ca/en/our-offices) and [Macquarie offices](https://www.macquarie.com/au/en/about/contact/locations.html); the map features are [22 Vanderbilt](https://www.openstreetmap.org/node/2716011976) and [Two Liberty Place](https://www.openstreetmap.org/way/42785013).

A November 3 named-building pass checked 12 additional map queries and promoted four: Jingan Asset Management at [COSCO Tower](https://www.openstreetmap.org/way/148228836) in Hong Kong (exact address tags); S&P Global at [K. Wah Centre](https://www.openstreetmap.org/way/255632242) in Shanghai and [Marunouchi Kitaguchi Building](https://www.openstreetmap.org/relation/3817813) in Tokyo (officially named buildings); and Vitol at [Nova South](https://www.openstreetmap.org/way/451259201) in London. Vitol’s official page gives 160 Victoria Street while OSM tags Nova South as 130 Victoria Street, so that pin is building-level only. The counts are now 266 address-level, 129 building-level, and 614 city-level fallbacks (395 non-city-level rows). Sources: [Jingan contact](https://www.jingan.hk/), [S&P Global office directory](https://www.spglobal.com/en/contact-us/office-locations), and [Vitol contact directory](https://www.vitol.com/contact/).

A priority-desk pass verified two additional London buildings and upgraded four registry rows: the Statkraft/Statkraft Markets office at [22 Bishopsgate](https://www.openstreetmap.org/way/717332347) and the Vattenfall/Vattenfall Energy Trading office at [70 St Mary Axe](https://www.openstreetmap.org/way/556686921). Statkraft confirms London is a main trading-desk location and its UK office address is 22 Bishopsgate; Vattenfall’s UK office directory gives 70 St Mary Axe and its contact page links the energy-trading team to the UK office. Statkraft’s New York desk is confirmed by city, but an office street address was not verified; Stamford was not substituted. The counts are now 268 address-level, 131 building-level, and 610 city-level fallbacks (399 non-city-level rows).

The high-ranked Tokyo trader pass resolved InCommodities’ Tokyo office to [Marunouchi Park Building](https://www.openstreetmap.org/way/363563886). InCommodities lists Level 8, 2-6-1 Marunouchi; Mitsubishi Estate’s Japanese directory confirms the same building/address. The OSM polygon is named in English and Japanese, and its footprint centroid is stored as a building-level coordinate. Sources: [InCommodities contact](https://incommodities.com/contact) and [Mitsubishi Estate building directory](https://office.mec.co.jp/search/detail/011418). Totals: 268 address-level, 132 building-level, 609 city-level fallbacks (400 non-city-level rows).

A high-priority office pass added three more mapped entries. Saudi Aramco’s Beijing HQ is in China World Tower 3; the named [OSM building footprint](https://www.openstreetmap.org/way/116944490) matches the official address. Vortexa’s London entry was corrected: its own 2025 report lists [Tower 42, Leaf A&B, 25 Old Broad Street](https://www.openstreetmap.org/way/166431059), and Companies House confirms the registered-office change from Portsoken House in December 2024. TOTSA TotalEnergies Trading’s legal notice lists Route de l’Aéroport 10; [OSM node/3856274357](https://www.openstreetmap.org/node/3856274357) matches the number and street. The point is in Cointrin/Meyrin within Geneva’s metro scope; the stated PO Box 1215 was kept separate from the physical street address. Counts: 269 address-level, 134 building-level, 606 city-level fallbacks (403 non-city-level rows).

A second high-priority pass mapped Chubu Electric Power’s London office at 210 High Holborn to [OSM way/97237915](https://www.openstreetmap.org/way/97237915), matching house number and street; OSM has no postcode on the footprint. Northpool’s official contact page lists its Canada office at 320 Granville Street, Suite 970; the [320 Granville OSM footprint](https://www.openstreetmap.org/way/1173159900) matches the building. A Vancouver business licence record states Suite 980, so the office label follows Northpool’s current site while mapping only the building. Uniper’s official London office is 42–44 Grosvenor Gardens; adjacent [OSM #42](https://www.openstreetmap.org/way/147253656) and [#44](https://www.openstreetmap.org/way/147253657) footprints support a shared range-level point. The subsidiary row is mapped to the published group office with an explicit caveat, since no separate suite was found. Counts: 270 address-level, 137 building-level, 602 city-level fallback rows (407 non-city-level rows).

A third high-priority pass added ADNOC Trading’s Singapore office at One George Street and Geneva office at Quai de l’Ile 13, and Danske Commodities’ London and Singapore offices. The [One George Street footprint](https://www.openstreetmap.org/way/47300930) matches the official Singapore address; [OSM node/1335858814](https://www.openstreetmap.org/node/1335858814) matches ADNOC’s Geneva house number, street and postcode. Danske’s London contact page names Waverley House, One Kingdom Street; [OSM way/42032682](https://www.openstreetmap.org/way/42032682) maps the named #1 building, though its postcode tag (W2 6PY) differs from the official W2 6BD. Its Singapore address matches [Asia Square Tower 1](https://www.openstreetmap.org/way/407941850) at 8 Marina View. Counts: 271 address-level, 140 building-level, 598 city-level fallback rows (411 non-city-level rows).

An RWE-specific pass mapped eight group/trading rows. RWE Trading Americas’ official New York address at 50 Rockefeller Plaza matches [OSM node/2717543352](https://www.openstreetmap.org/node/2717543352). The Singapore office is at 50 Raffles Place, Singapore Land Tower ([OSM way/46595418](https://www.openstreetmap.org/way/46595418)). RWE’s Beijing branch address matches Gateway Plaza, whose property owner publishes coordinates 39.956765, 116.458489. RWE Supply & Trading Japan lists Marunouchi Trust Tower Main, 1-8-3 Marunouchi; the building owner and [OSM way/145412771](https://www.openstreetmap.org/way/145412771) confirm the building. The Shanghai address is documented but remains unmapped until a reliable point is established; London remains pending exact building-feature verification. Counts: 273 address-level, 144 building-level, 592 city-level fallbacks (417 non-city-level rows).

RWE’s final two unresolved registered office cities were mapped. Its official London page names The Northcliffe, 28 Tudor Street; the [Historic England listed-building record](https://historicengland.org.uk/listing/the-list/list-entry/1262507) identifies Northcliffe House at that address and supplies the building location. RWE’s official Shanghai page lists its floor-6 office at No.89 Jilong Road in Zhenfeng Building. [Amap identifies a tenant at the exact street address](https://www.amap.com/place/B0HB9ZDZKI) and provides a location pin; the provider’s GCJ-02 coordinates were transformed to WGS84 before storage. The marker represents the building/address, not RWE’s floor. Counts: 275 address-level, 146 building-level, 588 city-level fallback rows (421 non-city-level rows).

A power/exchange-office pass mapped EEX London at 11 Westferry Circus to [OSM node/9359206899](https://www.openstreetmap.org/node/9359206899), EEX Japan at the Marunouchi Kitaguchi Building to [OSM relation/3817813](https://www.openstreetmap.org/relation/3817813), and EDF Trading’s Cardinal Place London HQ to [OSM way/107063630](https://www.openstreetmap.org/way/107063630); EDF Trading’s corporate registry gives the same address as its official contact page. Counts: 276 address-level, 148 building-level, 585 city-level fallback rows (424 non-city-level rows).

A Gunvor office follow-up mapped the Geneva office at Rue du Rhône 80–84 to [OSM node/963893774](https://www.openstreetmap.org/node/963893774), a building address node for no. 80 within the official range. The Singapore entity’s current ACRA-derived record lists suite 29-01 at 128 Beach Road, Guoco Midtown; the [OSM office tower footprint](https://www.openstreetmap.org/way/725743263) matches address and postcode. Gunvor London remains city-level because Companies House’s current registered office at 28 King Street conflicts with an SRA office listing at 3 Burlington Gardens, and no exact OSM feature could be matched confidently. Counts: 276 address-level, 150 building-level, 583 city-level fallbacks (426 non-city-level rows).

A Hudson River Trading pass mapped six target-city offices using its current [official office directory](https://www.hudsonrivertrading.com/offices/): 3 World Trade Center, New York ([OSM way/166839381](https://www.openstreetmap.org/way/166839381)); 20 University Road, Cambridge ([way/1356477215](https://www.openstreetmap.org/way/1356477215)); Ocean Financial Centre, Singapore ([way/172915346](https://www.openstreetmap.org/way/172915346)); HSBC Building / Shanghai IFC South Tower ([way/164968674](https://www.openstreetmap.org/way/164968674)); 28 Stanley Street, Hong Kong ([way/1215615598](https://www.openstreetmap.org/way/1215615598)); and Three IFC, Seoul ([way/621752528](https://www.openstreetmap.org/way/621752528)). OSM postcode conflicts for NYC and Seoul are noted on the rows. London remains city-level pending a reliable match. Counts: 276 address-level, 156 building-level, 577 city-level fallbacks (432 non-city-level rows).

A Sucden office pass mapped New York 60 Broad Street ([OSM way/169362524](https://www.openstreetmap.org/way/169362524)), Singapore One Finlayson Green ([way/314352312](https://www.openstreetmap.org/way/314352312)), Shanghai JingAn Kerry Centre Tower 1 ([way/255636963](https://www.openstreetmap.org/way/255636963)), Geneva Rue de la Croix-d’Or 19 ([node/1291747245](https://www.openstreetmap.org/node/1291747245)), and London Plantation Place South ([way/141329944](https://www.openstreetmap.org/way/141329944)). London is the Sucden Financial subsidiary office; its official postcode EC3R 5AZ differs from OSM’s EC3R 7AG. Shanghai’s OSM house-number tag appears malformed (15151), so only the matching named complex is pinned. Counts: 277 address-level, 160 building-level, 572 city-level fallbacks (437 non-city-level rows).

A Bunge pass mapped Geneva’s Route de Florissant 13 office to [OSM node/2194822358](https://www.openstreetmap.org/node/2194822358), matching the 2025 SEC filing and live Swiss entity address. Singapore’s Bunge Asia Pte. Ltd. address at 1 Wallich Street #08-01 matches the [Guoco Tower footprint](https://www.openstreetmap.org/way/393100849); the active entity/LEI record was updated in March 2026. Bunge’s current contact page lists Shanghai only as a city and the registered Chinese management-company address appears separate, so Shanghai remains a city-level fallback. Counts: 278 address-level, 161 building-level, 570 city-level fallbacks (439 non-city-level rows).

An ING pass mapped all ten registered city rows from the [current ING Wholesale Banking directory](https://www.ingwb.com/contact), ING Germany’s locations page and the [HKMA bank register](https://vpr.hkma.gov.hk/eng/regulatory-resources/registers/register-of-ais-and-lros/info/100155): Hanover Riethorst 4; London Moorgate 8–10; Singapore Guoco Tower; Hong Kong Three Pacific Place; Tokyo Meiji Yasuda Seimei Building; Shanghai World Financial Center; Beijing China World Tower 3A; Seoul Finance Center; Sydney 60 Margaret Street; New York 1133 Avenue of the Americas. Map features are linked in each workbook row. London’s OSM postal tag differs; Seoul’s house-number tag differs; Sydney uses an OSM node explicitly tagged ING on Margaret Street without a house number. Counts: 279 address-level, 168 building-level, 562 city-level fallbacks (447 non-city-level rows).

A TD Securities pass mapped all six queued in-scope rows using the [current company directory](https://www.tdsecurities.com/ca/en/our-offices): Boston Two International Place, Hong Kong Two Pacific Place, Seoul Centropolis A, Shanghai Plaza 66, Tokyo Otemachi Park Building, and London 33 Cork Street. Each workbook row links to its mapped feature. Tokyo uses the rooftop helipad point physically on Otemachi Park Building, while Shanghai is a complex-level point. Counts: 279 address-level, 174 building-level, 556 city-level fallbacks (453 non-city-level rows).

A Balyasny pass mapped all six queued registered-city offices using the [current firm directory](https://www.bamfunds.com/about-us/locations): Boston 500 Boylston Street; Hong Kong Two Exchange Square; London 23 King Street; New York 767 Fifth Avenue; San Francisco 101 California Street; and Tokyo JP Tower. Points reference named OSM footprints where indexed; Hong Kong and London use linked coordinates for the exact office site. Counts: 279 address-level, 180 building-level, 550 city-level fallbacks (459 non-city-level rows).

Bunge Shanghai is now mapped to the official office at 50/F MAXDO Center, 8 Xingyi Road, from [Bunge China](https://www.bunge.com/en/china). The named MAXDO Center point from [Amap](https://ditu.amap.com/place/B001538C22) was converted from GCJ-02 to WGS-84 for the dashboard. Current audit counts: 279 address-level, 181 building-level, 549 city-level fallbacks (460 non-city-level rows).


A Barclays pass verified five registered-city offices independently. New York is at 745 Seventh Avenue; Hong Kong at Cheung Kong Center; Singapore at MBFC Tower 2; Tokyo at Roppongi Hills Mori Tower; Sydney at Quay Quarter Tower. The addresses are sourced from Barclays employer listings/privacy pages and HKMA; points are the corresponding OSM building footprints. Current audit: 279 address-level, 186 building-level, 544 city-level fallbacks (465 non-city-level rows).


Four additional office rows were upgraded: HRT London at 100 Liverpool Street (postcode point EC2M 2AT); Tower Research London at The Minster Building (postcode point EC3R 7AG); Tower Research Singapore at the Marina One complex (the specific West Tower outline was not available in OSM); and Second Foundation Tokyo at VORT Kioizaka (Japanese address and Yahoo Japan Maps POI match). Precision labels preserve these distinctions. Audit: 280 address-level, 189 building/complex-level, 540 city-level fallbacks (469 non-city-level rows).


COFCO International’s Geneva HQ is confirmed at Route de Malagnou 101–105 by company-published material; OSM node/3721575799 matches 101 and the street, but its postcode differs from the company source, so that discrepancy stays visible. ENGIE Global Markets Singapore is confirmed at 8 Marina View, #34-01, Asia Square Tower 1; the branch’s official role listing, ENGIE contact page and OSM building relation agree. Audit: 281 address-level, 190 building-level, 538 city-level fallbacks (471 non-city-level rows).


Six more registered offices were mapped on 2026-11-03: Equinor Singapore (Asia Square Tower 1), London (One Kingdom Street), and Beijing (Twin Towers West Tower); QatarEnergy Shanghai (Lippo Plaza), Tokyo (Grand Cube), and Seoul (Gangnam Finance Center). QatarEnergy’s official Global Offices page also gives its Beijing office address at China World Office Tower 2, but that building-specific point has not yet been resolved, so its row remains a fallback for now. Equinor London’s official W2 6BD and OSM W2 6PY postcode disagreement is documented. Current audit counts: 283 address-level, 194 building-level, 532 city-level fallbacks (477 non-city-level rows).


QatarEnergy Beijing is now mapped to China World Office Tower 2. Its official Global Offices page gives Room 1011 and the street address; Baidu Maps provides a Tower 2-specific POI. The returned BD-09 Mercator point was converted to WGS-84 for the dashboard. Audit counts: 283 address-level, 195 building-level, 531 city-level fallbacks (478 non-city-level rows).


A DBS and ABN AMRO Clearing pass mapped 14 registered office rows from their official directories: DBS Singapore, Sydney, Shanghai, Hong Kong, Tokyo, Seoul, London, and New York; ABN AMRO Clearing Sydney, Hong Kong, Tokyo, Singapore, London, and New York. OSM footprint/address features are linked row by row. Notes preserve street-number, feature-address, and suite-level limitations rather than implying a floor-level pin. Current audit: 283 address-level, 209 building-level, 517 city-level fallbacks (492 non-city-level rows).


Ørsted’s current official contact directory confirms London at 5 Howick Place, SW1P 1WG, and Boston at 399 Boylston Street. Two London entity rows now use the official postcode centroid returned by postcodes.io (not represented as an entrance/building pin); the trading-entity Boston row uses the already verified office-site point. Current audit: 286 address-level, 209 building-level, 514 city-level fallbacks (495 non-city-level rows).


Bank of America’s current official global directory resolved all eight registered-city rows: New York (One Bryant Park), Shanghai (IFC Tower 2), Hong Kong (Cheung Kong Centre), Seoul (Seoul Finance Center), Zurich (Stockerhof), London (2 King Edward Street), Tokyo (Nihonbashi 1-chome Mitsui Building), and Sydney (Governor Phillip Tower). Each office row now carries the official address and its named OSM feature/precision. Current audit: 287 address-level, 216 building-level, 506 city-level fallbacks (503 non-city-level rows).


A Gunvor pass mapped the verified Geneva and Singapore sites, plus Shanghai and Beijing at their last published exact addresses. Gunvor’s 2025 brochure confirms active offices in all four cities; exact Shanghai/Beijing addresses are from the older 2019 annual report and therefore marked medium confidence pending current-address confirmation. Geneva’s active Swiss UID confirms Rue du Rhône 80–84 as of 2026-10-26. Singapore’s DOE filing confirms 12 Marina Boulevard #35-03; the current group page corroborates the tower. London remains a city fallback because Gunvor UK’s registered-office address conflicts with an SRA office listing. Four city rows assigned to the Singapore subsidiary outside Singapore were removed because there was no evidence those were subsidiary offices; parent-group rows remain. Current audit: 288 address-level, 220 building-level, 497 city-level fallbacks (508 non-city-level rows; 1005 office rows).


A Mercuria pass mapped four current registered-city offices. The company’s [contact directory](https://mercuria.com/contact-us/) gives Geneva Rue du Rhône 50 and London 62 Buckingham Gate. Its [Asia Pacific directory](https://mercuria.com/what-we-do/our-regions/asia-pacific/) gives Beijing China World Tower B and Shanghai Kerry Pudong Office Building, both corroborated by the active/full-corrob [Beijing LEI record](https://lei.bloomberg.com/leis/view/549300X81U1PE8YIZP97) where relevant. Geneva and London match OSM address/building features; Shanghai matches the [Kerry Pudong complex feature](https://mapcarta.com/W709897742). The Beijing pin uses Amap POI [B0FFL34WF2](https://ditu.amap.com/place/B0FFL34WF2), explicitly named Guomao Phase 3B, transformed from GCJ-02 to WGS-84; floor/unit precision is not implied. Counts after this pass: 289 address-level, 223 building-level, 493 city-level fallbacks (512 non-city-level rows).


A workbook integrity check found four valid Office Registry rows placed immediately below the Excel table range: two TD Securities London offices, Goldman Sachs Singapore at 60 Anson Road, and Goldman Sachs London at 2 Stonecutter Street. They are now included in the table used by the dashboard exporter, preserving their existing research and map precision. Corrected table-based totals: 1,009 rows, 290 address-level, 225 building-level, 494 city-level fallbacks (515 non-city-level rows).


A November 3 LDC/Olam pass mapped three in-scope rows. LDC’s current [locations directory](https://www.ldc.com/who-we-are/locations/) lists Beijing at Ying Ke Zhong Xin, North Worker Stadium Road and Shanghai at No.1359 Yaolong Road. Native-language building/property sources identify Beijing’s Yingke Center at A2 Workers Stadium North Road and Shanghai’s Crystal Plaza at 1359 Yaolong Road; matching OSM commercial-complex features are linked in the rows. The Beijing Amap POI is explicitly Yingke Center at the same A2 address; its GCJ-02 point was converted to WGS-84 and lies within about 40 m of the OSM complex centroid. Olam’s 2025 interim financial statements list its registered office and principal place of business at 7 Straits View, #20-01, Marina One East Tower, corroborated by the current corporate site; the [OSM Marina One Offices feature](https://www.openstreetmap.org/way/463857949) represents the complex, not the exact East Tower entrance. All three points are labelled complex-level. Counts: 290 address-level, 228 building/complex-level, 491 city-level fallbacks (518 non-city-level rows).


A November 3 Toyota Tsusho pass mapped all four queued registered-city rows. The current [global office directory](https://www.toyota-tsusho.com/english/company/network/) lists Tokyo at Shinagawa Front Building, New York at 825 Third Avenue, Shanghai at Wheelock Square, and Beijing at Beijing Fortune Building (also identified as Beijing Development Building). Tokyo, New York, and Shanghai map to matching named building features; Beijing’s exact No. 5 address matches the Amap 北京发展大厦 POI and its GCJ-02 building point was converted to WGS-84 and independently checked against a building-location photograph. Toyota Tsusho announced that the Tokyo Head Office is expected to move around FY2030, so the present point is explicitly time-sensitive. Counts: 290 address-level, 232 building-level, 487 city-level fallbacks (522 non-city-level rows).


A November 3 HSBC pass mapped the current Shanghai headquarters to the Shanghai IFC North Tower and the Tokyo office to HSBC Building, Nihonbashi, using HSBC’s current group and country pages plus matching named OSM building features. The stale Vancouver row was removed: HSBC confirms that its Canada business and subsidiaries were sold to RBC and the transaction completed on 2024-03-28. Totals now cover 1,008 office rows: 290 address-level, 234 building-level, 484 city-level fallbacks (524 non-city-level rows).


A November 3 MFT Energy pass mapped its New York and Tokyo offices from the current [company contact page](https://mft-energy.com/contact/). NYC Planning Labs Geosearch resolves 860 Broadway to the exact municipal property point (BBL 1008460026, BIN 1016128); the pin is the address/building point, not the sixth-floor suite. Tokyo’s official 2-1-3 Nihonbashi address matches the named [Urbannet Nihonbashi 2-chome Building](https://www.openstreetmap.org/way/187598485), tagged with the matching building number and postcode. Totals remain 1,008 office rows: 290 address-level, 236 building-level, 482 city-level fallbacks (526 non-city-level rows).


A workbook integrity pass found four duplicate Office Registry rows sharing IDs with exact copies already in the table (two TD Securities London records and two Goldman Sachs London/Singapore records). All fields matched, so the extra copies were removed; the researched office rows and coordinates were retained. Final current totals: 1,004 office rows, 289 address-level, 234 building-level, 481 city-level fallbacks (523 non-city-level rows). The audit ledger now records eight exact duplicates removed across the full review.


A November 3 follow-up mapped IMC Trading’s Hong Kong office to the named [100QRC building](https://www.openstreetmap.org/way/723231734), matching IMC’s current Unit 1702, 100 Queen’s Road Central address. BP Trading’s Singapore role city was matched to BP Singapore Pte. Ltd.’s active LEI address, validated against ACRA, at Marina One East Tower; Singapore OneMap supplies the matching postal-building point. Graviton’s current company LinkedIn location and move post identify a newer physical office at 36 Robinson Road, City House; OneMap resolves the matching 068877 building point. Its older official office page and legal-entity record still list One Raffles Place, so that physical-versus-registered-address conflict is recorded in the row and should be rechecked when the company locator changes. DXT’s current contact page distinguishes a Corporate Office at Wilkie Edge from an Operations office at Samsung Hub; both exact postal building points are resolved by Singapore OneMap and are now separate Singapore rows. Totals: 1,005 office rows, 289 address-level, 239 building-level, and 477 city-level fallbacks (528 non-city-level rows).


A November 3 Alvean pass resolved its Geneva trading office to Esplanade de Pont-Rouge 4 in Grand-Lancy. Alvean’s [current locations page](https://alvean.com/our-locations/) and [business page](https://alvean.com/our-business/) identify the Geneva trading office; the active [LEI record](https://lei.bloomberg.com/leis/view/549300IOW92TBZQIR750) and Swisscom Directories branch listing independently give Esplanade de Pont-Rouge 4, 1212 Grand-Lancy. The Swiss federal [geo.admin.ch address gazetteer](https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=Esplanade%20de%20Pont-Rouge%204%2C%201212%20Grand-Lancy&type=locations&limit=5) resolves house number 4 to 46.1873169, 6.1264005; [OSM way/547729055](https://www.openstreetmap.org/way/547729055) identifies the commercial Esplanade 4–6 building. This is an address-level point, not a suite pin. Totals: 1,005 office rows, 290 address-level, 239 building-level, and 476 city-level fallbacks (529 non-city-level rows).


A November 3 utility/operator pass mapped CLP’s current Kai Tak headquarters to the named [CLP Headquarters OSM building](https://www.openstreetmap.org/way/1138054767), corroborated by CLP’s current English and Chinese contact pages. A generic address geocoder returned the nearby Dorsett hotel for address number 43 and was rejected. SP Group’s current contact address and financial disclosure identify 2 Kallang Sector, SP Group Building; Singapore OneMap resolves the exact 349277 postal building point. AEMO’s 2024 official minutes and current employer location list both identify its Sydney office at 20 Bond Street, matched to [OSM way/85690882](https://www.openstreetmap.org/way/85690882). The AEMO Markets registry alias shares this same physical office. Totals: 1,005 office rows, 290 address-level, 243 building-level, and 472 city-level fallbacks (533 non-city-level rows).


An Argus Media pass mapped New York and Tokyo to address-level points. The current [Argus locations page](https://www.argusmedia.com/en/our-locations) lists 500 Fifth Avenue, Suite 2222; NYC GeoSearch returns the exact site at 40.753933, -73.981197 and BBL 1012580034, corroborated by the [NYC Landmarks designation](https://s-media.nyc.gov/agencies/lpc/lp/2427.pdf). For Tokyo, Argus lists BUREX Kyobashi 609, 2-7-14 Kyobashi; the [building operator](https://www.burex.jp/en/building/kyobashi) confirms the address and Japan GSI resolves its address point to 35.676823, 139.771164. Beijing remains city-level: evidence confirms Oriental Plaza but not the coordinates of Office Tower E3 specifically. Argus’s San Francisco locator provides an email address but no street location. No complex centroid or city guess was promoted. Totals: 1005 office rows, 292 address-level, 243 building-level, and 470 city-level fallbacks (535 non-city-level rows).

The Argus Beijing office is now pinned to the tower-specific East Office Tower E3 POI, matching Argus’s official Room 4-6, 10/F address at Oriental Plaza. [Baidu Maps](https://map.baidu.com/mobile/webapp/place/detail/qt=s&wd=%E5%8C%97%E4%BA%AC%E5%B8%82%E4%B8%9C%E9%95%BF%E5%AE%89%E8%A1%971%E5%8F%B7%E4%B8%9C%E6%96%B9%E5%B9%BF%E5%9C%BA%E4%B8%9C%E4%B8%89%E5%8A%9E%E5%85%AC%E6%A5%BC20%E5%B1%82&uid=80598b041e9fe7d98a36ee12/vt=map) identifies the exact E3 tower; the [Dongcheng District government](https://www.bjdch.gov.cn/ztzl/yhyshj/zxdt/202103/t20210324_2978562.html) independently refers to the E3 office building. The Baidu point is BD-09 Mercator 12960322.22, 4826095.99; after explicit BD-09 → GCJ-02 → WGS-84 transformation, the stored point is 39.9085694, 116.4106332. This is tower-level, not a room point. Argus San Francisco remains city-level because its official locations page has no street address. Totals: 1005 office rows, 292 address-level, 244 building-level, and 469 city-level fallbacks (536 non-city-level rows).

A November 3 Nomura pass mapped all 12 registered city rows to official-address-backed office points: Tokyo Otemachi Head Office; London 1 Angel Lane; New York Worldwide Plaza; Hong Kong Two IFC; Singapore MBFC Tower 2; Sydney Governor Phillip Tower; Beijing Development Building; Shanghai Central Plaza; Seoul Finance Center; Zurich Kasernenstrasse 1; Boston One Federal; and San Francisco Three Embarcadero Center. The current [Nomura office directories](https://www.nomuraholdings.com/en/company/group/asia.html), [Americas directory](https://www.nomuraholdings.com/en/company/group/americas/office.html), and [EMEA directory](https://www.nomuraholdings.com/en/company/group/europe/office.html) provide the city-specific addresses. Building/address features are cited row by row in the workbook. New York uses the NYC address/parcel point; Zurich uses the Swiss federal address register. Amap’s Beijing East Gate and Shanghai Central Plaza POIs were converted from GCJ-02 to WGS-84, with the raw coordinates and conversion note recorded. Suite-level precision is not implied; the London postcode and Seoul house-number discrepancies and the multiple Tokyo office sites remain explicit. Totals: 1005 office rows, 294 address-level, 254 building-level, and 457 city-level fallbacks (548 non-city-level rows).


A precision-label integrity pass on November 3 replaced 0 literal “undefined” precision values with evidence-based address, building, or building-complex labels derived from the existing official-address and map-feature notes; it did not alter coordinates. Address/postcode points are counted as address-level; named building, building-complex, and building-range features are counted in the building-level bucket. The Argus search and coverage log was reconciled to four reviewed offices, three promoted points, and one unresolved San Francisco city fallback. Current totals: 1005 office rows, 297 address-level, 251 building/building-complex-level, and 457 city-level fallbacks (548 researched non-city-level rows).


A November 3 ANZ office pass mapped all nine existing ANZ rows across eight cities. The current [ANZ Institutional contact directory](https://www.anz.com/institutional/contact-us/) publishes addresses for Singapore, Hong Kong, Shanghai, Tokyo, Seoul, London, and New York; its current Singapore address at Marina One West Tower took effect on October 19, 2026. ANZ’s [official Beijing relocation notice](https://www.anz.com/content/dam/anzcom/pdf/institutional/markets/china/zh-hans/disclosures/bank-notice-and-regulatory-disclosure/change-of-business-address-of-beijing-branch.pdf) and [2024 China annual report](https://www.anz.com/content/dam/anzcom/pdf/institutional/markets/china/en/disclosures/china-annual-report-2024-en.pdf) confirm the Beijing Branch at Excel Centre, matched to [Amap’s building POI](https://ditu.amap.com/place/B000A84SI6). Map features are linked on each workbook row: Three Exchange Square and Marina One are marked at complex level, and Shanghai, Tokyo, Seoul, London, and New York at building level. The two Shanghai rows represent different branch units in the same tower. The Beijing Amap point was converted from GCJ-02 to WGS-84; street-address/postcode discrepancies are described in the row notes. Current totals: 1005 office rows, 296 address/postcode-level, 261 building/complex-level, and 448 city-level fallbacks (557 non-city-level rows).


A November 3 Citadel pass mapped seven existing Citadel locations (New York 425 Park, San Francisco, London, Hong Kong, Singapore, Sydney and Tokyo). Citadel and Citadel Securities each list both 425 Park Avenue and 660 Fifth Avenue in New York; each has a separate 660 Fifth record, using the NYC official address point and building feature (the tower was formerly addressed as 666 Fifth). Citadel’s official 680 Atlantic Avenue address in Boston is recorded, but the available locator did not verify the office building, so its point remains at the registered city anchor. Sources: [Citadel privacy notice](https://www.citadel.com/privacy/), [Citadel Securities privacy notice](https://www.citadelsecurities.com/privacy/), [NYC Finance address record](https://a836-pts-access.nyc.gov/care/datalets/datalet.aspx?UseSearch=no&pin=1012681102). Current totals: 1007 office rows; 301 address/postcode-level, 265 building/complex-level, and 441 city-level fallbacks.


A November 3 Jefferies pass resolved the six remaining registered city rows using its current [global office directory](https://www.jefferies.com/global-locations/) and individual city pages, which publish addresses and coordinates: Boston, Philadelphia, San Francisco, Zurich, Beijing and Seoul. Jefferies Singapore was already mapped. Current totals: 1007 office rows; 307 address-level, 265 building/complex-level and 435 city-level fallbacks.


A November 3 Morgan Stanley pass mapped ten of its thirteen registered city rows to named office/building points: New York, Boston, San Francisco, London, Zurich, Hong Kong, Singapore, Tokyo, Shanghai and Seoul. The current official sources identify the offices; map features were matched by address/building name. Sydney is plotted at the Chifley Tower complex, with an OSM component-address caveat recorded. Beijing’s current Jiu An Plaza address and Shenzhen’s Morgan Stanley Investment Management China Kerry Plaza address are documented, but both remain city anchors until exact building pins can be verified. Current totals: 1007 office rows; 308 address-level, 275 building/complex-level and 424 city-level fallbacks.


A November 3 Mitsubishi Corporation pass mapped Seoul’s Centropolis Tower A and Vancouver’s Granville Square. The official office network gives the Vancouver address at Unit 2800, 200 Granville Street; the map feature is the named Granville Square building, and its differing OSM postcode is noted. Current official China pages now confirm Shanghai at 96 Yingchun Road and Beijing at 6F West Tower, Genesis Beijing, 8 Xinyuan South Road; both retain their registered city coordinates while exact tower map points are unresolved. Current totals: 1007 office rows; 308 address-level, 277 building/complex-level and 422 city-level fallbacks.


A November 3 Standard Chartered pass resolved four city fallbacks. Shanghai uses the Amap Standard Chartered Tower POI matching the official 201 Century Avenue address; Hong Kong and Tokyo use the named Standard Chartered Bank Building and Sanno Park Tower map footprints; Seoul uses the bank POI at its official Jong-ro 47 address. Current totals: 1007 office rows; 309 address-level, 280 building/complex-level and 418 city-level fallbacks.


A November 3 NAB/Gunvor pass mapped NAB’s Sydney headquarters (NAB Place at 2 Carrington Street), Shanghai branch (One Lujiazui, with a postcode mismatch in OSM), and Tokyo branch (Muromachi Higashi Mitsui Building). Gunvor’s registered London address at Almack House is now represented by the postcode centroid for SW1Y 6QW; the public evidence does not establish that the London trading floor is at that registered address, so the record says so and carries medium confidence. Current totals: 1007 office rows; 310 address-level, 283 building/complex-level and 414 city-level fallbacks.


A November 3 BloombergNEF pass added Bloomberg group office anchors in London, Shanghai and Singapore. London is Bloomberg UK’s registered HQ/Bloomberg POI; Shanghai uses the HSBC Building at Shanghai IFC, corroborated by a 2026 Bloomberg News office listing; Singapore uses the Bloomberg Singapore entity’s One Marina Boulevard registered office. These are parent-group locations, not proof of BNEF team-specific occupancy, so notes and medium confidence state the limitation. Current totals: 1007 office rows; 311 address-level, 285 building/complex-level and 411 city-level fallbacks.


A November 3 Millennium pass mapped all three unresolved registered offices using the current official global-presence directory: Geneva at Le Rhone, 2 place de Hollande; London principal office at 20 Grosvenor Street; and Tokyo at Tokyo Midtown Tower, 9-7-1 Akasaka. Each has an address point or named building match. Current totals: 1007 office rows; 312 address-level, 287 building/complex-level and 408 city-level fallbacks.


A November 3 Chinese-language Mitsubishi Corporation pass resolved both remaining China offices. Shanghai’s official 96 Yingchun Road address matches the named Amap company POI. Beijing’s official branch list and company location map identify Genesis Beijing West Tower, 8 Xinyuan South Road; the Amap tower POI matches. Amap coordinates use GCJ-02; raw points and inverse-transformed WGS-84 points are recorded in the workbook. Current totals: 1007 office rows; 313 address-level, 288 building/complex-level and 406 city-level fallbacks.


A November 3 TotalEnergies pass mapped Geneva’s World Trade Center 1 (10 Route de l’Aéroport) and Singapore’s Frasers Tower (182 Cecil Street). The current TotalEnergies Trading page identifies both as regional trading hubs; official notices confirm the entity addresses, and named OSM footprints match. Current totals: 1007 office rows; 313 address-level, 290 building/complex-level and 404 city-level fallbacks.


A November 3 S&P Global/Enverus pass mapped S&P Global’s Beijing office at Fortune Financial Center (Amap point converted from GCJ-02 to WGS-84) and Enverus’s New York address at 21 West 46th Street and London office at 138 Cheapside using its current global locations directory and matching OSM address features. Current totals: 1007 office rows; 315 address-level, 291 building/complex-level and 401 city-level fallbacks.


A November 3 Eni pass confirmed London and Singapore trading offices on Eni’s current corporate subsidiary page. Singapore’s Ngee Ann City Tower A has a named building point; its OSM postcode differs by one digit. London’s Eni House address is verified, but only the SW1W 8PZ postcode centroid was available, so the building remains unpinned. Current totals: 1007 office rows; 316 address-level, 292 building/complex-level and 399 city-level fallbacks.


A November 3 priority-company pass mapped Baringa’s current Singapore hub at 8 Marina View, Asia Square Tower 1 to [OSM way/407941850](https://www.openstreetmap.org/way/407941850), and Pavilion Energy’s published 12 Marina Boulevard address to [OSM way/116905041](https://www.openstreetmap.org/way/116905041), Marina Bay Financial Centre Tower 3. Both coordinates represent building footprints, not suites. Other reviewed offices without a reliable current address/building match remain at their registered city anchors.


A November 3 Marathon Petroleum pass mapped the Singapore office at 101 Thomson Road, United Square to [OSM way/172529122](https://www.openstreetmap.org/way/172529122), supported by MPC’s current careers site and an employer-attributed trader listing. The London office at 54 Portland Place was corroborated by the active [Companies House entity](https://find-and-update.company-information.service.gov.uk/company/13503286) and an MPC-attributed listing, and matched to [OSM way/661385057](https://www.openstreetmap.org/way/661385057). Both are building-level points. A struck-off Singapore company and a closed historical UK establishment were rejected as stale evidence.


Drax’s current UK contact page confirms its London office, and a 2025 Drax public-access statement gives the London contact address as 3rd Floor, Alder Castle, 10 Noble Street, EC2V 7JX. The address matches [OSM way/170205772](https://www.openstreetmap.org/way/170205772), Alder Castle House. The point is the building centroid, not Drax’s floor.


A November 3 Citi pass resolved all nine registered offices with current country pages and regulatory records. New York, London, Singapore, Hong Kong, Tokyo, Shanghai, Sydney, and Zurich match named OSM building features. Seoul uses Citi’s confirmed 50 Saemunan-ro address and Korean road-address point because no corresponding OSM Citibank Center building was found. These are Citi company-office points, not assertions that a commodities desk sits at each location.


A November 3 CBA pass resolved all eight registered offices from current CommBank branch pages. Sydney, New York, Tokyo, and Shanghai match named office buildings; Singapore uses OneMap’s postal building point; Hong Kong and Beijing use named complex centroids; London uses the official 60 Ludgate Hill postcode centroid. Each row labels its precision, so complex/postcode points are not presented as exact entrances.


Argus’s official global office inventory confirms its San Francisco office; the employer’s LinkedIn location listing gives 315 Montgomery Street, Suite 841, San Francisco, CA 94104. That matches [OSM way/32859357](https://www.openstreetmap.org/way/32859357), the named building at that exact address. The coordinate is the building point, not the suite.


A November 3 pass resolved Citadel Boston to South Station Tower using [Citadel’s current location listing](https://www.citadel.com/who-we-are/) and [Hines’ property page and map link](https://www.hines.com/properties/south-station-tower-boston?_sp=ddcd65ba-32b4-4496-8057-954d076ac9db). Mizuho’s [current office directories](https://www.mizuhogroup.com/bank/locations/asia), [Americas](https://www.mizuhogroup.com/bank/locations/americas), [Europe](https://www.mizuhogroup.com/bank/locations/europe), and [corporate information](https://www.mizuhogroup.com/who-we-are/company-information?tab=company-overview) provided addresses for its seven remaining registered city rows (Tokyo, New York, London, Seoul, Singapore, Beijing, Shanghai); these are bank subsidiary or headquarters locations and do not establish trading desk occupancy. ED&F Man Sugar’s [current Singapore office listing](https://www.edfmansugar.com/office/edf-man-sugar-singapore/) gives 27 Cantonment Road; the point matches the [Singapore Land Authority OneMap address search](https://www.onemap.gov.sg/api/common/elastic/search?searchVal=27%20Cantonment%20Road&returnGeom=Y&getAddrDetails=Y&pageNum=1). Current counts: 1007 office rows; 320 address/postcode-level, 320 building/complex-level, and 367 city-level fallbacks.


Squarepoint Capital’s [official locations page](https://www.squarepoint-capital.com/locations) confirms the six registered cities, and its [employer-maintained LinkedIn profile](https://www.linkedin.com/company/squarepoint-capital/) publishes street addresses for Boston, Geneva, Hong Kong, London, New York and Singapore. The Singapore address is corroborated by [MAS](https://eservices.mas.gov.sg/fid/institution/detail/200468-SQUAREPOINT-OPERATIONS-PRIVATE-LIMITED), London by [Companies House](https://find-and-update.company-information.service.gov.uk/company/OC393269), and One Island East by [Swire Properties](https://www.swireproperties.com/en/portfolio/current-developments/taikoo-place-and-cityplaza/taikoo-place/one-island-east/). Every point links to the matched OSM feature in the workbook; company location alone does not imply desk occupancy. Totals: 1007 office rows; 322 address/postcode-level, 324 building/complex-level, and 361 city-level fallbacks.


Woodside’s [current global contact directory](https://www.woodside.com/contact) publishes addresses for Beijing, Seoul, Singapore, Tokyo and London. The Beijing, Singapore, Tokyo and London addresses were matched to the named OSM building/address features recorded in the workbook; Singapore is corroborated by [Companies House’s active Woodside Energy Trading Singapore entity](https://find-and-update.company-information.service.gov.uk/company/FC040858), and Tokyo’s tower by [Mitsubishi Estate](https://office.mec.co.jp/en/search/detail/011526). Seoul remains city-level because no building-specific coordinate was verified. OSM’s London address feature reports W1K 3HZ while Woodside’s current directory states W1K 3HY; this mismatch is disclosed. Totals: 1007 office rows; 323 address/postcode-level, 327 building/complex-level, and 357 city-level fallbacks.


Deutsche Bank’s [current global office directory](https://www.db.com/who-we-are/global-network/addresses-and-contact), [Singapore contacts](https://www.deutschehelix.db.com/singapore/company/contacts), [Korea contacts](https://www.deutsche-bank.com.cn/korea/company/contacts?language_id=1), [China contacts](https://www.deutsche-bank.com.cn/china/company/contacts), and [Japan relocation notice](https://china.db.com/japan/notice-of-relocation-of-deutsche-bank-group-in-japan?language_id=1) provided current addresses in all six registered cities. London is updated to 21 Moorfields, and Tokyo to Azabudai Hills Mori JP Tower after the relocation. Each row links to the matched OSM building feature; branch presence does not establish commodity-desk occupancy. Totals: 1007 office rows; 322 address/postcode-level, 333 building/complex-level, and 352 city-level fallbacks.


ENGIE Southeast Asia’s [current contact directory](https://www.engie-sea.com/contact-us/) lists its regional headquarters at 108 Pasir Panjang Road, Golden Agri Plaza. The matching [Singapore Land Authority OneMap result](https://www.onemap.gov.sg/api/common/elastic/search?searchVal=108%20Pasir%20Panjang%20Road%20Golden%20Agri%20Plaza&returnGeom=Y&getAddrDetails=Y&pageNum=1) supplies its building/address point. This is separate from the existing ENGIE Supply & Energy Management trading-office record at Asia Square Tower 1. ENGIE’s [Japan market page](https://engie-sem.com/global-presence/japan/engie-energy-marketing-japan-eemj/) confirms a Tokyo office and physical power/derivatives activity but no address; its row remains city-level. Current totals: 1007 office rows; 323 address/postcode-level, 333 building/complex-level, and 351 city-level fallbacks.


A trading-house office pass mapped four rows. [ConocoPhillips’ current UK locations page](https://careers.conocophillips.com/locations/united-kingdom/united-kingdom-locations/) explicitly describes its London Angel Court staff as covering trading and trading support. [Shell UK](https://www.shell.co.uk/about-us/contact-us) lists Shell Trading and Shipping at Shell Centre. [Phillips 66 International Trading](https://www.sra.org.uk/consumers/register/organisation/?sraNumber=632345) has a Singapore head office at Millenia Tower, and the active [Phillips 66 Limited Companies House record](https://find-and-update.company-information.service.gov.uk/company/00529086) lists its London address at 200–202 Aldersgate Street. Building features and their OSM links are stored per row. Current total: 1007 offices; 323 address/postcode-level, 337 building/complex-level, 347 city-level.


Optiver’s current [Hong Kong](https://www.optiver.com/join-us/locations/hong-kong/), [London](https://www.optiver.com/join-us/locations/london/) and [Shanghai](https://www.optiver.com/join-us/locations/shanghai/) pages provided current addresses for all three registered rows. Hong Kong is mapped to AIA Central’s [OSM/Mapcarta tower feature](https://mapcarta.com/W107324767); London to the numbered [20 Old Bailey OSM building](https://www.openstreetmap.org/way/107643569) (OSM postcode metadata differs by one character); Shanghai’s China Fortune Tower address matches [Amap’s named POI](https://ditu.amap.com/place/B00155KQJ1), whose GCJ-02 coordinate was converted to WGS-84 for the workbook. Totals: 1007 office rows; 323 address/postcode-level, 340 building/complex-level, 344 city-level fallbacks.


Akuna’s current [company office page](https://akunacapital.com/who-we-are/) gives London as Office 10.11, 30 Crown Place; this is matched to [OSM way/159061775](https://www.openstreetmap.org/way/159061775). OSM’s postcode metadata differs from Akuna’s by the final two letters, so the workbook discloses the discrepancy. Shanghai remains city-level: Akuna’s current page lists No. 889 Guozhan Road, while employer-maintained LinkedIn and Shanghai company information list No. 839 / Shanghai Huadian Tower. The disagreement is logged rather than converted into a potentially misplaced pin. Totals: 1007 offices; 323 address/postcode-level, 341 building/complex-level, and 343 city-level.


ENGIE International Supply & Energy Management’s [official Japan trading-office announcement](https://engie-sem.com/engie-gems-expands-these-activities-in-japan/) explicitly locates the Tokyo physical power-trading office in GranTokyo South Tower. The [named OSM building footprint](https://www.openstreetmap.org/way/95274405) supplies its WGS-84 centroid; no suite was published. Current totals: 1007 office rows; 323 address/postcode-level, 342 building/complex-level, and 342 city-level fallbacks.


Maven Securities’ [current office directory](https://www.mavensecurities.com/contact/) identifies its London office as Level 7, 155 Bishopsgate, EC2M 3TQ; the [employer-specific OSM node](https://www.openstreetmap.org/node/10120020491) matches the office and postcode. Repsol’s [current Singapore trading page](https://www.repsol.com/en/about-us/where-we-work/repsol-worldwide/asia/singapore/index.cshtml) links its trading office directly to MBFC Tower 2; its [OSM footprint](https://www.openstreetmap.org/way/116905042) matches 10 Marina Boulevard, Singapore 018983. Current totals: 1007 office rows; 324 address/postcode-level, 343 building/complex-level, and 340 city-level fallbacks.


Morgan Stanley’s [current Greater China directory](https://www.morganstanley.com/about-us/global-offices/asia-pacific/greater-china) and [China contact page](https://www.morganstanleychina.com/contact-us) specify Beijing’s Jiu An Plaza Tower A address; the tower-specific [Baidu Maps POI](https://map.baidu.com/mobile/webapp/place/detail/foo%3Dbar%26qt%3Dninf%26wd%3D%E6%99%AF%E7%82%B9%26c%3D131%26searchFlag%3Dsort%26center_rank%3D1%26nb_x%3D12959445.79%26nb_y%3D4832177.96%26da_src%3Dunifynearbyclick%26uid%3D0dcf0186bac3f3013586f471%26industry%3D%26qid%3D%26pos%3D%26da_ref%3D%26da_qrtp%3D%26da_adquery%3D%26da_adtitle%3D%E7%8E%96%E5%AE%89%E5%B9%BF%E5%9C%BA-A%E5%BA%A7%26da_adindus%3D%E6%88%BF%E5%9C%B0%E4%BA%A7%3B%E5%86%99%E5%AD%97%E6%A5%BC%26detail_from%3Dlist%26vt%3Dmap) matches that building. For Shenzhen, the current [Morgan Stanley Investment Management China contact page](https://www.morganstanleyfunds.com.cn/en/about-us/contact-us/) gives Tower Two, Kerry Plaza at No. 1 Zhongxin 4th Road; its [Amap Tower Two POI](https://ditu.amap.com/place/B02F37VN9B) agrees. Raw Chinese map coordinates and conversion details are in the workbook.

I also removed two Statkraft New York **office** rows that had been inferred from a job listing. Statkraft’s [current US contact page](https://www.statkraft.us/contact-us/) and [country page](https://www.statkraft.com/Global-presence/united-states-of-america/) name San Francisco and Stamford, not New York; the posting’s New York job location remains in the opportunity record. Current totals: 1005 office rows; 324 address/postcode-level, 345 building/complex-level, and 336 city-level fallbacks.


Woodside’s [current office directory](https://www.woodside.com/contact) lists its Seoul office on 12F of Mirae Asset Centre 1 East Tower at 26 Eulji-ro 5-gil. The matched [OSM office point](https://www.openstreetmap.org/node/11913468274) is named Mirae Asset Securities and is at that same street/postcode inside the complex; it is the mapped office/complex point, not a tower entrance. Norlys’ [current contact directory](https://www.norlysenergytrading.com/contact) lists 20 Cecil Street, PLUS Building #14-01. [CapitaLand](https://www.capitaland.com/sg/en/lease/businesspark-industrial-logistics2/campaign/global-property-listing/commercial/plus.html) confirms the current PLUS address; [OSM way/171999278](https://www.openstreetmap.org/way/171999278) is the same 20 Cecil Street 049705 tower under its former name, GSH Plaza. Current totals: 1005 office rows; 324 address/postcode-level, 347 building/complex-level, and 334 city-level fallbacks.


BNP Paribas’ current country directories/legal notices verify its registered-city offices in [London](https://www.bnpparibas.co.uk/en/bnp-paribas-in-the-uk/legal-notice/), [New York](https://usa.bnpparibas/en/homepage/contact-us/), [Hong Kong](https://www.bnpparibas.com.hk/en/contact-us/), [Singapore](https://apac.bnpparibas/en/singapore/contact-us/), [Tokyo](https://www.bnpparibas.jp/en/contact-us/), [Shanghai](https://china.bnpparibas.com/en/contact-us/), [Zurich](https://www.bnpparibas.ch/en/contacts/), [Sydney](https://apac.bnpparibas/en/australia-new-zealand/contact-us/), and [Seoul](https://www.bnpparibas.co.kr/en/contact-us/). Singapore’s 20 Collyer Quay address is geocoded by the [Singapore Land Authority’s OneMap](https://www.onemap.gov.sg/api/common/elastic/search?searchVal=20%20Collyer%20Quay%20Singapore%20049319&returnGeom=Y&getAddrDetails=Y&pageNum=1), and [GuocoLand’s 2026 annual report](https://links.sgx.com/FileOpen/GuocoLand-Annual%20Report%202026.ashx?App=Announcement&FileID=904776) identifies BNP Paribas as an anchor tenant there. The other address points match named [London](https://www.openstreetmap.org/way/8076474), [New York](https://www.openstreetmap.org/way/137707119), [Hong Kong](https://www.openstreetmap.org/way/25589595), [Tokyo](https://www.openstreetmap.org/relation/3818454), [Shanghai](https://www.openstreetmap.org/way/165792123), [Zurich](https://www.openstreetmap.org/way/101704091), [Sydney](https://www.openstreetmap.org/way/335699134), and [Seoul](https://www.openstreetmap.org/way/781583304) OSM features. These sources verify bank/CIB offices, not commodities-desk occupancy; the New York OSM ZIP mismatch is disclosed in the row. Totals: 1005 office rows; 326 address/postcode-level, 354 building/complex-level, 325 city-level fallbacks.


Two Sigma’s [current official offices page](https://www.twosigma.com/offices/) publishes coordinates alongside the New York headquarters address at 100 Avenue of the Americas and the Tokyo address at Forum Building, 2-24-11 Minami-Aoyama. Both coordinates were copied from the employer page, retaining its distinction between Two Sigma’s 100 Avenue New York HQ and its separate 101 Avenue office. Totals: 1005 office rows; 328 address-level, 354 building/complex-level, 323 city-level fallbacks.


SIG’s [current office directory](https://sig.com/who-we-are/office-locations/) lists Beijing at the East Wing of The Exchange Twin Towers and Shanghai at Corporate Avenue, 222 Hubin Road. Amap identifies the Beijing [Twin Towers East](https://www.amap.com/place/B000A856FI) POI and Shanghai [One Corporate Avenue Tower 1](https://ditu.amap.com/place/B001550C5U) at the respective official addresses. Flow Traders’ [current location page](https://www.flowtraders.com/about/where-we-operate/) lists its Shanghai representative office at Unit 801, Tower 2, Jing An Kerry Centre, 1515 West Nanjing Road; the [Amap Tower 2 POI](https://ditu.amap.com/place/B00156GXB6) matches. Amap publishes GCJ-02 coordinates; raw values and the WGS-84 transformations are documented in the workbook rows. The Tower 2 point is separate from another registered business at Tower 3/complex level. SIG Tokyo remains at city precision pending a reliable building match. Totals: 1005 office rows; 328 address/postcode-level, 357 building/complex-level, 320 city-level fallbacks.


Trafigura’s [current locations page](https://www.trafigura.com/who-we-are/locations/) lists its Tokyo office at 3F, KDX Shinbashi Building, 2-2-9 Shinbashi; [Kenedix Property Design](https://kenedix-pm.com/building/minatoku/A021.html) confirms the building at the same address, and [Yahoo Maps](https://map.yahoo.co.jp/v3/place/xTYazpxrH0w) supplies its named building point. SIG’s [current office directory](https://sig.com/who-we-are/office-locations/) lists 3F, COI Nishi-Aoyama Building, 1-11-1 Shibuya; building owner [Hulic](https://www.hulic.co.jp/business/rent/residence/460) confirms the current name HULIC Shibuya Mitake-dori Building at the same address, and [Yahoo Maps](https://map.yahoo.co.jp/v3/place/U941Sp-leUM) provides the named building point. Trafigura Beijing remains city-level because its city presence is documented but no current official street address was verified. Totals: 1005 office rows; 328 address/postcode-level, 359 building/complex-level, 318 city-level fallbacks.


Nanook Energy Advisors LLP’s [current Companies House record](https://find-and-update.company-information.service.gov.uk/company/OC377859) gives its registered office as Typeworks, 25 Bowling Green Lane, London EC1R 0BF; its [filing history](https://find-and-update.company-information.service.gov.uk/company/OC377859/filing-history) records the move from 45 Holmes Road on 16 May 2025. The matching [OSM numbered-address point](https://www.openstreetmap.org/node/1656745014) is at No. 25 and postcode EC1R 0BF. Nanook’s [employer-maintained LinkedIn profile](https://uk.linkedin.com/company/nanook-energy-advisors-llp) describes London/Farringdon but does not show whether the registered address is staffed by the team. The workbook therefore labels this as a registered-office point and explicitly leaves workplace occupancy unverified. Totals: 1005 office rows; 329 address/postcode-level, 359 building/complex-level, 317 city-level fallbacks.


## Priority trading-office update — November 3, 2026

- Chevron’s [current UK page](https://www.chevron.com/worldwide/united-kingdom) identifies London as one of four global trading floors and lists 1 Westferry Circus, Canary Wharf, E14 4HA. The address matches the Chevron-named [OSM node](https://www.openstreetmap.org/node/7171355122).
- Chevron’s [current Singapore page](https://www.chevron.com/worldwide/singapore) lists 3 Fraser Street, #12-28, DUO Tower, Singapore 189352. The location matches the named [DUO Tower OSM footprint](https://www.openstreetmap.org/way/560240330). Chevron’s UK page also identifies Singapore as a global trading floor.
- JERA Global Markets’ [current Japanese contact page](https://www.jeratrading.com/ja/contact-us?_url=%2Fcontact-us) lists two separate entities and office addresses: JERA Global Markets Co., Ltd. at 14F, Nihonbashi 1-chome Mitsui Building, 1-4-1 Nihonbashi; and JERA Global Markets Services Co., Ltd. at 25F, Nihonbashi Takashimaya Mitsui Building, 2-5-1 Nihonbashi. The building managers and OSM footprints independently match [Nihonbashi 1-chome Mitsui Building](https://www.openstreetmap.org/way/187598470) and [Nihonbashi Takashimaya Mitsui Building](https://www.openstreetmap.org/way/449619430). The workbook keeps these as separate office rows and pins each building footprint.
- ExxonMobil’s [current Singapore location page](https://corporate.exxonmobil.com/locations/singapore) and [contact directory](https://corporate.exxonmobil.com/who-we-are/contact-us/directory) list 1 HarbourFront Place, HarbourFront Tower One; its [OSM building feature](https://www.openstreetmap.org/way/47418847) matches the address. This verifies the local ExxonMobil office, not the Global Trading desk’s specific floor or occupancy. The current location page gives postal code 098633; one directory division lists 098657, so the workbook retains the location page’s code and records the discrepancy.

Five office rows updated. Totals: 1005 office rows; 331 address/postcode-level, 362 building/complex-level, 312 city-level fallbacks.


## Glencore office update — November 3, 2026

- Baar: Glencore’s [current website terms](https://www.glencore.com/en/terms/terms-of-use) and [media contact page](https://www.glencore.com/media-and-insights/media-contacts) give Baarermattstrasse 3 as its physical address; its Swiss site confirms Baar as global headquarters. The address matches the named [OSM Glencore building](https://www.openstreetmap.org/way/53210794).
- London: the [current Glencore group-entity register](https://www.glencore.com/who-we-are/transparency/group-entities) lists Glencore UK Ltd at 18 Hanover Square; its [governance page](https://www.glencore.com/sustainability/ethics-and-compliance/governance-and-structure) confirms London as a principal marketing office. The [numbered OSM feature](https://www.openstreetmap.org/way/1012469604) matches the address. This is labelled as a registered office because the source does not establish the marketing team’s exact staffed floor.
- New York: Glencore’s [current US careers page](https://www.glencore.com/en/careers/us/R200001810) explicitly identifies the Midtown Manhattan office at 90 Park Ave; its governance page confirms New York as a principal marketing office. The address matches [OSM building way/265875655](https://www.openstreetmap.org/way/265875655).
- Beijing remains a city-level fallback. Glencore’s [current group-entity register](https://www.glencore.com/who-we-are/transparency/group-entities) lists Glencore (Beijing) Trading Co. at 27 East Third Ring Road North, and secondary business/address sources suggest a specific Jiaming Center suite, but I have not reconciled the street number, local Chinese address variants, and tower footprint well enough to publish an exact point.

Three rows updated; Beijing retained for follow-up. Totals: 1005 office rows; 334 address/postcode-level, 362 building/complex-level, 309 city-level fallbacks.


## Centrica Energy office update — November 3, 2026

Centrica Energy’s [current contact page](https://centricaenergy.com/contact/) lists the London office at Marble Arch Park House, 116 Park Street; it matches [OSM Park House way/26996750](https://www.openstreetmap.org/way/26996750). For Singapore, Centrica’s current contact and [power-trading pages](https://centricaenergy.com/trading/power/) confirm a local presence and trading office. Its [2024 trading subsidiary annual report](https://annualreport.centricaenergy.com/media/1rhlbk1b/centrica-energy-trading-as_ar24.pdf) lists 12 Marina View, #17-04, Asia Square Tower 2; [OSM way/407941851](https://www.openstreetmap.org/way/407941851) is the matching building. The report's postcode (238852) conflicts with the building/map postcode (018961); the workbook omits the conflicting postal code and identifies the point as a registered subsidiary address, not confirmed current team occupancy.

Two rows updated. Totals: 1005 office rows; 335 address/postcode-level, 363 building/complex-level, 307 city-level fallbacks.


## Energy-specialist office update — November 3, 2026

- Equilibrium Energy's [current contact page](https://www.equilibriumenergy.com/contact) lists its New York office at 25 W 39th St, Suite 800; the address matches [OSM way/265301857](https://www.openstreetmap.org/way/265301857). Its San Francisco HQ was already mapped from the same official page and remains at the separately named 333 Kearny St address.
- Fuse Energy’s [current privacy policy](https://www.fuseenergy.com/legal/privacy-policy) and [Companies House filing history](https://find-and-update.company-information.service.gov.uk/company/08469701/filing-history) show the registered-office move to One Bank Street, Canary Wharf, on 26 May 2026. The address matches [OSM way/532616071](https://www.openstreetmap.org/way/532616071), representing the One/Five Bank Street office complex. The workbook labels this as a registered-office pin; exact staffed-floor occupancy is not separately confirmed.
- Ompex’s [current contact page](https://ompex.ch/kontakt/) lists its Zurich office at Birmensdorferstrasse 108, 8003 Zürich; the address matches [OSM way/67665849](https://www.openstreetmap.org/way/67665849).
- SET’s [current office directions](https://swiss-energy-trading.ch/contact/) publish Schanzeneggstrasse 3, 8002 Zürich, and warn that the office entrance is about 3 m to the right of the main No. 3 building. [OSM node/3345442339](https://www.openstreetmap.org/node/3345442339) is the numbered address point; the map pin is within that small stated offset.

Four rows updated. Totals: 1005 office rows; 337 address/postcode-level, 365 building/complex-level, 303 city-level fallbacks.


An export integrity check found two exact duplicate copies at 660 Fifth Avenue below the structured Office Registry table: one each for Citadel and Citadel Securities. In each case both the Office ID and all cell values matched the retained record. The stray copies were cleared; the distinct Citadel and Citadel Securities office records remain in the table.


## Singapore priority office update — November 3, 2026

- Shell Singapore’s [current contact page](https://www.shell.com.sg/contact-us.html) gives The Metropolis Tower 1, 9 North Buona Vista Drive, #06-01. [OSM way/1563020894](https://www.openstreetmap.org/way/1563020894) is the named office tower. Shell says it plans to relocate to Asia Square Tower 1 in 2027; the current site remains the mapped address until that move occurs.
- BP Singapore’s trading-office address at 7 Straits View, #26-01, Marina One East Tower is supported by a current [NUS event listing](https://nus.edu.sg/cfg/events/details/4325), a [BP office event post](https://www.linkedin.com/posts/bp_discover-energy-trading-at-bp-singapore-activity-7497587650254716928-V0RJ), and [Marina One management](https://www.marinaone.com.sg/contact1.html). The point uses the official [OneMap postcode record](https://www.onemap.gov.sg/api/common/elastic/search?searchVal=018936%26returnGeom=Y%26getAddrDetails=Y%26pageNum=1).
- Chevron’s [current Singapore page](https://www.chevron.com/worldwide/singapore) lists 3 Fraser Street #12-28, DUO Tower; the row is pinned to the named building, matching the separate Chevron Supply and Trading office entry.
- J.P. Morgan’s [official office announcement](https://www.jpmorgan.com/about-us/corporate-news/2022/jpm-new-office-singapore) identifies CapitaSpring as its Singapore city office and APAC FX/commodities hub. The current [building-owner page](https://www.cict.com.sg/office/capitaspring.html) lists JPMorgan Chase as a major tenant at 86 & 88 Market Street; [OSM way/694047464](https://www.openstreetmap.org/way/694047464) maps the CapitaSpring building.

Four Singapore rows updated. Totals: 1005 office rows; 706 address/building-level points, 299 city-level fallbacks.


## Astomos Tokyo and London offices — November 3, 2026

- Astomos’s [current official contact page](https://www.astomos.com/contact-us) lists the Tokyo head office at 24F Sapia Tower, 1-7-12 Marunouchi; [OSM way/91264848](https://www.openstreetmap.org/way/91264848) is the named building.
- The same page lists its London branch at Mid City Place, 71 High Holborn, WC1V 6BA. [OSM node/338505258](https://www.openstreetmap.org/node/338505258) is the named Mid City Place feature at No. 71; its metadata uses a different postcode, so the company’s postcode is retained and the discrepancy noted.

Two Astomos rows updated. Totals: 1005 office rows; 708 address/building-level points, 297 city-level fallbacks.


## Shell London office — November 3, 2026

Shell’s [current UK contact page](https://www.shell.co.uk/about-us/contact-us) identifies Shell Trading and Shipping at Shell Centre, London SE1 7NA. Shell’s [global contact page](https://www.shell.com/who-we-are/contact-us.html) also lists its London headquarters there. [OSM way/46250966](https://www.openstreetmap.org/way/46250966) is the named Shell Centre building; the registry pin is building-level because Shell does not publish a numbered entrance in the current contact listing.

One London row updated. Totals: 1005 office rows; 709 address/building-level points, 296 city-level fallbacks.


## Engelhart Europe/Asia offices — November 3, 2026

Engelhart’s [current global locations page](https://www.ectp.com/about/locations/) lists these addresses. London’s Berkeley Square House matches [OSM way/188266316](https://www.openstreetmap.org/way/188266316); Tokyo’s Shinjuku NS Building matches [OSM way/45763022](https://www.openstreetmap.org/way/45763022). Geneva’s WTC II address matches the [WTC II site pin](https://www.waze.com/live-map/directions/wtc-ii-route-de-pre-bois-29-meyrin?to=place.w.3998158.39981583.7711089), which is marked as parking/site-level rather than an office entrance.

Three rows updated. Totals: 1005 office rows; 712 address/building-level points, 293 city-level fallbacks.


## Aurora Energy Research Singapore — November 3, 2026

Aurora’s [current company contact page](https://auroraer.com/company/contact) lists its office at 3 Pickering Street #03-53, Nankin Row, Singapore 048660. The official [Singapore OneMap address record](https://www.onemap.gov.sg/api/common/elastic/search?searchVal=3%20Pickering%20Street%20Singapore%20048660%26returnGeom=Y%26getAddrDetails=Y%26pageNum=1) resolves the address to 1.2842881, 103.8474300. The pin is the address point for the office site, not the suite entrance.


## Seoul office points — November 3, 2026

Macquarie’s [current office directory](https://www.macquarie.com/au/en/about/contact/locations.html) gives its Seoul address as 17–18F, Unit A, Centropolis, 26 Ujeongguk-ro. OSM way/840120858 is the named Centropolis Building A footprint at 37.5716731, 126.9834598. ADM’s [APAC office directory](https://www.adm.com/zh-Hans-CN/about-adm/locations/asia-pacific/) lists Archer Daniels Midland Korea at Taiwha Building, 4F, 29 Insadong 5-gil. Photon resolves the address to OSM way/555337332 (태화빌딩), at 37.5720030, 126.9848632. Both are building-footprint points; neither identifies a suite or floor entrance.


## Beijing trading and commodities offices — November 3, 2026

Macquarie’s [current office directory](https://www.macquarie.com/au/en/about/contact/locations.html) lists its Beijing team at West Tower, The Genesis, 8 Xinyuan South Road. Its registered group and commodities rows are the same physical office and now share one point. The point is corroborated by Mitsubishi Corporation’s official 6/F West Tower address and company Beijing map; Amap’s named Qihào POI and [OSM’s Genesis Beijing feature](https://www.openstreetmap.org/way/1007602026) identify the office complex. Marubeni’s [current Beijing directory](https://www.marubeni.com/en/company/network/asia/) gives 22F West Tower, World Financial Centre, No.1 East 3rd Ring Middle Road; [OSM way/156297789](https://www.openstreetmap.org/way/156297789) is the matching named 环球金融中心 feature. Mitsui’s [current China office directory](https://www.mitsui.com/cn/en/company/location/index.html) gives 37F China World Tower A, 1 Jianguomenwai Avenue; [OSM way/116944490](https://www.openstreetmap.org/way/116944490) identifies China World Tower A. These are building points, not office-floor entrances.


## JEPX Tokyo office — November 3, 2026

JEPX’s [current Japanese access page](https://www.jepx.jp/company/access/) lists Okayasu Building 4F, 1-7-14 Shibaura. The current [MyBasket tenant listing](https://www.mybasket.co.jp/shop/detail/7945.html) uses the same building/address and publishes its site point at 35.648058, 139.754211. [JLL’s building record](https://www.jllproperty.jp/listings/okayasu-building-office) confirms Okayasu Building at the same street address. The map point represents the office building/site, not JEPX’s fourth-floor entrance.


## FGE Singapore and Kpler London — November 3, 2026

FGE’s [current Singapore contact page](https://www.fgenergy.com/company/contact/fge-singapore/) lists 8 Eu Tong Sen Street #20-89/90, The Central, Office 1, Singapore 059818. Singapore [OneMap](https://www.onemap.gov.sg/api/common/elastic/search?searchVal=8%20Eu%20Tong%20Sen%20Street%20Singapore%20059818%26returnGeom=Y%26getAddrDetails=Y%26pageNum=1) resolves the exact address to 1.2888386, 103.8465580. Kpler’s [current local office directory](https://www.kpler.com/company/local-offices) lists its London office at 52 Grosvenor Gardens; [OSM relation/1625854](https://www.openstreetmap.org/relation/1625854) is the named building multipolygon at 51.4959793, -0.1461355. The pins represent the office site/building rather than floor entrances.


## Rystad London and ION New York — November 3, 2026

Rystad’s [current contact page](https://www.rystadenergy.com/contact) lists 77 Coleman Street, EC2R 5BJ and links its own Google Maps pin at 51.5169149, -0.0895905. ION’s [current commodities office directory](https://commoditiesconnection.iongroup.com/offices/) lists 1345 Sixth Avenue, 50th floor, New York; [OSM way/265150596](https://www.openstreetmap.org/way/265150596) is the Burlington House building footprint at 40.7629997, -73.9790535. The three ION, Openlink and Endur registry records refer to this one physical office and now share the same point. OSM’s postcode for Burlington House is 10104 while ION’s current office directory says 10105; that discrepancy is retained in the row.


## ICIS Tokyo/Seoul and Marunouchi Kitaguchi offices — November 3, 2026

ICIS’s [current contact directory](https://www.icis.com/explore/contact/?channel=chemicals%26commodity=chemical%26intcmp=CHEM-free-articles-pages-promo-pricing%26mode=icispricing) gives Tokyo as 11F, Tokyo Midtown Yaesu Central Tower, 2-2-1 Yaesu; the [property’s official facilities page](https://www.yaesu.tokyo-midtown.com/about/facilities) confirms that address, and Japan GSI resolves it to the site reference point 35.679695, 139.769165. The same ICIS directory gives Seoul as 4F, Chunwoo Building, 206 Noksapyeong-daero. [OSM node/9354022226](https://www.openstreetmap.org/node/9354022226) is a co-located tenant pin at that exact street number, and the Seoul city diplomatic directory also locates the Argentine Embassy in Chunwoo Building at 206; the coordinate 37.5361344, 126.9873598 is used as the shared building/site point. Energy Exemplar’s [current office page](https://www.energyexemplar.com/contact-us) and Volue’s [office locator](https://www.volue.io/contact-us/office-locations) list 9F, WeWork Marunouchi Kitaguchi, 1-6-5 Marunouchi. WeWork’s [official location page](https://wework.co.jp/en/location/tokyo/marunouchi-nihonbashi-area/marunouchi-kitaguchi) confirms the named location; GSI’s address reference point is 35.683708, 139.766266. Japanese coordinates are address/block site references, not floor entrances.


## ADM Shanghai office complex — November 3, 2026

ADM’s [current APAC directory](https://www.adm.com/en-us/about-adm/locations/asia-pacific/) lists its Shanghai office at B5 Building, 180 Yizhou Road, Xuhui District. An [AmCham Shanghai event listing](https://amcham-shanghai.glueup.cn/event/adm-technical-innovation-center-tour-23929/) confirms the address as ADM’s Shanghai office, and a local [address listing](https://m.city8.com/sh/enterprise/8d8w3r793rzobb6436_address) names ADM at the same B5 building. Amap identifies the wider [Huaxin Huixiangcheng complex](https://ditu.amap.com/place/B0FFJM7ZL3) at GCJ-02 31.171274, 121.408645; converted to WGS-84 the stored point is 31.1731388, 121.4039999. No B5-specific mapped footprint was found, so this is explicitly a complex-level point, not a B5 entrance.


## Cargill multi-office pass — November 3, 2026

Four city-only Cargill entries were upgraded. The official [Switzerland page](https://www.cargill.com/worldwide/switzerland-en) gives Esplanade de Pont-Rouge 4, Grand-Lancy, and [Cargill Ocean Transportation](https://www.cargill.com/transportation/location-and-contact) identifies Geneva as its head office; OSM address node 12691499730 supplies the address point. The current [Cargill Japan locations page](https://www.cargill.co.jp/en/locations) gives 1-13-2 Yurakucho, Tokyo; the point is kept at building-level and no floor/entrance precision is claimed. The official [Cargill Industrial locations page](https://www.cargill.com/industrial/contact) lists One ICC, Shanghai International Commerce Center, 999 Huaihai Road; the coordinate is explicitly complex-level, corroborated by the [property owner](https://www.shkp.com/en-US/our-business/mainland-and-other-properties/shanghai-icc). Cargill UK’s [contact page](https://www.cargill.co.uk/en/contact) gives its registered office as 7th Floor, 33 King William Street; OSM way 326054344 maps number 33. Cargill Ocean Transportation confirms a London team but does not publish that team’s street address, so the panel note distinguishes the registered-office pin from desk occupancy.

Hong Kong remains city-only. Cargill’s [official sugar trading page](https://www.cargill.com/food-beverage/na/sugar-world-trading) confirms a trading office, but current third-party directories conflict between Mira Place and Dorset House/Taikoo Place, while company-register aggregators show other registered-office addresses. I did not promote any of these to an office pin without authoritative confirmation.


## Energy Aspects and Wood Mackenzie — November 3, 2026

The current [Energy Aspects office directory](https://www.energyaspects.com/contact) publishes the London, New York, Houston, Tokyo, and Singapore addresses. London’s 25 North Colonnade and New York’s One World Trade Center were matched to the respective mapped buildings; the Houston suite is at One Allen Center, confirmed by the [Texas Department of Licensing and Regulation project record](https://www.tdlr.texas.gov/TABS/Search/Project/TABS2024019959), and the building pin is kept at tower level. Tokyo’s 6-5 Nihonbashi-Kabutocho address is confirmed by the [FinGATE facility page](https://www.fingate.tokyo/facility/kabuto/) and positioned with Japan’s [GSI address-search service](https://msearch.gsi.go.jp/address-search/AddressSearch?q=%E6%9D%B1%E4%BA%AC%E9%83%BD%E4%B8%AD%E5%A4%AE%E5%8C%BA%E6%97%A5%E6%9C%AC%E6%A9%8B%E5%85%9C%E7%94%BA6-5). Singapore’s #13-02 address is at One George Street, corroborated by [CapitaLand](https://www.capitaland.com/content/dam/capitaland-media-library/commercial/Singapore/Singapore/One%20George%20Street/Portfolio_One_George_Street.pdf).

Wood Mackenzie’s current [official locations page](https://www.woodmac.com/about/our-locations/) gives all five mapped addresses. Singapore is One Marina Boulevard; Beijing is suite 2619, China World Office 1; Shanghai is unit 2101 in K. Wah Centre, whose [owner confirms the address](https://www.kwih.com/en/mainland-china-properties/shanghai-k--wah-centre); Seoul is 21F, Seoul Finance Center, confirmed by the [building operator](https://sfckorea.co.kr/); and London is 26F, 22 Bishopsgate. Map points are at the address or named building level; suite and floor numbers are retained as text, not represented as coordinate precision.


## Fluence Energy — November 3, 2026

Fluence’s current [official contact page](https://fluenceenergy.com/contact/) lists all four offices. Singapore is #15-02, Parkview Square; the point is from [Singapore OneMap](https://www.onemap.gov.sg/home/). Tokyo is 8F, Pacific Century Place, matched to OSM way 95274368. Zurich is Hornbachstrasse 50, matched to OSM way 98310511. London is Unit 180, 3rd Floor, Exmouth House, 3/11 Pine Street; [Workspace](https://www.workspace.co.uk/workspaces/exmouth-house) confirms the building/address, but the available public map point is block-level, so the registry records address-area precision and does not claim a building centroid. These are Fluence Energy locations, not the separate Fluence Corporation directory.


## ExxonMobil Hong Kong — November 3, 2026

The Hong Kong Government’s [registered gas-supplier register](https://www.emsd.gov.hk/en/gas_safety/registers/registered_gas_supply_companies_list/index.html) gives ExxonMobil Hong Kong’s office as 23/F, Central Plaza, 18 Harbour Road, Wan Chai. A [2026 government fuel-supplier notice](https://gia.info.gov.hk/general/202604/29/P2026042900808_541117_1_1777461690248.pdf) confirms suites 2301, 2307–2308 on that floor. The building operator confirms [Central Plaza at 18 Harbour Road](https://www.centralplaza.com.hk/); the office is mapped at building-level, with no floor/suite precision claimed. ExxonMobil’s London job posting confirms a central London trading office but publishes no street address, so that row remains city-only.


## BlackRock Asia-Pacific offices — November 3, 2026

BlackRock’s current [global office directory](https://www.blackrock.com/corporate/about-us/who-we-are/contacts-and-locations) confirms the Hong Kong, Shanghai, Beijing and Tokyo addresses. Hong Kong’s Champion Tower pin is matched to [OSM way 85320726](https://www.openstreetmap.org/way/85320726). Seoul is verified from BlackRock’s current [Korean-language office page](https://www.blackrock.com/kr/individual/ko/company-introduction/blackrock-asset-management/contact-us), with a Gran Seoul Tower 1 building point. Shanghai’s current address is corroborated by BlackRock’s Chinese subsidiary page and Amap’s named Lujiazui Financial Plaza POI; Amap GCJ-02 31.231343, 121.516184 is transformed to WGS-84 31.2334095, 121.5118106. Tokyo’s official 1-8-3 Marunouchi address is confirmed as the Main Tower by [Mori Trust](https://www.mori-trust.co.jp/english/business/office/marunouchi_trusttower-main/) and positioned with Japan GSI’s address point. Beijing remains city-only: the exact address is official, but no reliable point for Excel Center was validated, so no nearby Financial Street pin was substituted.


## Intercontinental Exchange global offices — November 3, 2026

ICE’s current [official offices page](https://www.ice.com/about/offices) provided the street/building addresses for all eight city-only rows. New York’s 11 Wall Street address matches OSM address node 2824828203. Beijing, Hong Kong and Singapore match mapped China World Office 1, The Center and Six Battery Road building points. Sydney’s 161 Castlereagh Street address is within the Liberty Place precinct; the point is the ANZ Bank Centre tower, as confirmed by the [property owner](https://www.ifminvestors.com/en-au/capabilities/real-estate/our-real-estate-portfolio/liberty-place/) and [City of Sydney planning documents](https://www.cityofsydney.nsw.gov.au/development-applications/161-castlereagh-street). Tokyo’s Sumitomo Irifune Building address is confirmed by [Sumitomo Realty](https://office.sumitomo-rd.co.jp/building/detail/chuou/irifune) and positioned using Japan GSI’s address point. Geneva 25 Rue Kléberg matches OSM address node 1511880798. London’s Sancroft address is in Paternoster Square; its point comes from [Sancroft venue information](https://asbp.org.uk/locations/convene-sancroft) and is explicitly address-area-level rather than a building entrance.


## Cboe Global Markets — November 3, 2026

Cboe’s [current contact page](https://www.cboe.com/contact-us) gives its New York office as 17 State Street, matched to OSM way 274483198. A [Cboe Japan relocation notice](https://cdn.cboe.com/resources/jp/notices/market/Notice-of-Office-Relocation.pdf) identifies Akasaka Intercity 5F, effective June 5, 2023; the old Shin-Toyo address repeated in the notice footer is superseded by its explicit “New Office Address” section. The [Cboe company locations listing](https://www.linkedin.com/company/cboe/) gives 133 Wai Yip Street in Hong Kong and 7 Straits View in Singapore. Hong Kong’s 12th-floor detail is corroborated by a [FINRA BrokerCheck filing](https://files.brokercheck.finra.org/firm/firm_136734.pdf); Singapore’s source does not establish a specific Marina One tower, so its coordinate is complex-level. A [Cboe Australia submission to ASIC](https://cdn.cboe.com/resources/government_relations/20240910-Cboe-Australia-submission-ASIC-CP-379-CS-Services-Rules.pdf) lists Level 23, Governor Phillip Tower, 1 Farrer Place, Sydney. Each mapped point is linked to the corresponding OSM feature.


## Tradition — November 3, 2026

Tradition’s current regional pages list street/building addresses across all eleven city-only registry rows: [North America](https://tradition.com/contact-us/north-america.aspx), [Europe](https://www.tradition.com/contact-us/europe.aspx), and [Asia-Pacific](https://www.tradition.com/contact-us/asia-pacific.aspx). Address points were matched against OSM and local building/address records. Singapore’s [MAS Financial Institutions Directory](https://eservices.mas.gov.sg/fid/institution/detail/288-TRADITION-SINGAPORE-PTE-LTD) has the current regulated address at 2 Central Boulevard, #09-01, IOI Central Boulevard Towers; that supersedes the older 63 Market Street address on Tradition’s APAC page. Seoul and Tokyo have verified street/building labels but only address-area point precision. Shenzhen’s office is in Tower One, Kerry Plaza, while the available point locates the Kerry Plaza complex and a neighboring tower; it is recorded only at complex-level.


## SMBC global network — November 3, 2026

The [SMBC International Directory as of June 30, 2026](https://www.smfg.co.jp/english/investor/library/annual/fy2025e_f02_pdf/fy2025e_f02_20.pdf) publishes addresses for Tokyo, Beijing, Hangzhou, Hong Kong, Shanghai, Shenzhen, Singapore, Seoul and Sydney. New York and San Francisco are listed on the current [Americas locations page](https://www.smbcgroup.com/americas/about-us/Our-Americas-Locations); London is on SMBC’s [EMEA locations page](https://www.smbcgroup.com/EMEA/contact-us). Map coordinates were matched to named buildings/address features and logged individually. Shenzhen is Tower Two of Kerry Plaza, per the SMBC directory, and is not conflated with Tower One. Beijing and Hangzhou building points are matched to mapped Kerry Centre features; Seoul is checked against the building operator and Korean road-address data.


## China International Capital Corporation — November 3, 2026

CICC’s 2024 annual report provides current office/branch addresses for Beijing, Shanghai, Shenzhen, Hangzhou and Nanjing. The official international office report covers New York, London, Singapore, San Francisco and Tokyo; CICC’s Hong Kong office is in the company profile. The New York address was resolved against the current [FINRA BrokerCheck firm listing](https://brokercheck.finra.org/firm/summary/143221), which says 280 Park Avenue, 32nd Floor; some older profiles still show 350 Park Avenue. Singapore uses the [MAS-registered 6 Battery Road address](https://eservices.mas.gov.sg/fid/institution/detail/2068-CHINA-INTERNATIONAL-CAPITAL-CORPORATION-SINGAPORE-PTE-LIMITED). Named building/address points were matched to OSM and, for Hangzhou, to the Amap Zhongtian Qiantang Ginza POI converted from GCJ-02 to WGS-84. Nanjing’s street/building address is confirmed, but its precise mapped building feature was not isolated, so that one remains at city-anchor precision.


## RBC Capital Markets office network — November 3, 2026

Nine registered city offices were upgraded using RBC’s current [regional office directories](https://www.rbccm.com/en/our-offices), [FINRA BrokerCheck](https://files.brokercheck.finra.org/firm/firm_31194.pdf), MAS and mapped building/address features. The Zurich row remains city-only: current RBC Capital Markets pages list Lausanne (and the RBC Europe page lists Lausanne/Lugano), while Zurich references found belong to RBC BlueBay or Investor Services. This possible registry mismatch is recorded for later review; no unrelated affiliate office was substituted.


## Société Générale offices — November 3, 2026

All eight registered locations now have verified street/building addresses from Société Générale’s current [group locations](https://www.societegenerale.com/en/group/locations), regional office pages and HKMA. Six map to building/complex points. Hong Kong (Three Pacific Place) and London (One Bank Street) have address evidence but remain at their city anchors until the exact map features are resolved.


## BGC Group offices — November 3, 2026

All seven registered locations were mapped from BGC’s official city-specific office pages and matched to named OSM building/address features. The official Tokyo page confirms Electric Power Trading as a local specialization; the Singapore page confirms Energy, Commodities & Shipping coverage.


## Crédit Agricole CIB offices — November 3, 2026

Seven of eight registered rows were upgraded using the current [Crédit Agricole Group locations directory](https://www.credit-agricole.com/en/group/list-of-our-locations) and mapped named buildings. Zurich remains city-only because the directory attributes Zurich to CA Indosuez/CACEIS, not CIB. Shanghai is complex-level because the mapped Plaza 66 feature does not isolate Tower 2.


## CRU Group Asia-Pacific offices — November 3, 2026

All six registered locations now have current address evidence from CRU’s [official office pages](https://www.crugroup.com/en/about-us/locations/). Singapore and Sydney are mapped to named buildings. Beijing, Shanghai, Tokyo and Seoul remain city-level because exact office-site map features were not independently resolved; Seoul’s suite address is from CRU’s company LinkedIn locations.


## MUFG priority offices — November 3, 2026

MUFG’s official Asia-Pacific network and city pages verify its current Tokyo, Beijing, Shanghai, Singapore and Hong Kong locations; MUFG Americas verifies New York. Tokyo’s official building map resolves the Mitsubishi UFJ Trust and Banking Building; Singapore’s Marina One address was matched to postal/building geodata; Hong Kong uses OSM way 107324767 for AIA Central; and Beijing’s exact-address Amap east-gate point was transformed from GCJ-02 to WGS-84. New York uses the named 1221 Avenue of the Americas building point. Shanghai’s current address at New Bund Times Square is documented, but its exact building map feature was not resolved, so the city anchor remains.


## OCBC priority offices — November 3, 2026

OCBC’s current [international network](https://www.ocbc.com/group/about-us/international-network.page) verifies Tokyo, Seoul, and Shanghai addresses; current official pages and the 2025 annual report verify New York, Sydney, and London addresses. Tokyo (Sanno Park Tower) and Seoul (Seoul Finance Center) were matched to OSM building features. For New York, Sydney, and London, ArcGIS World Geocoding returned exact street-level PointAddress matches (score 100) against the official addresses. Shanghai’s OCBC Bank Tower address is verified, but its exact map feature remains unresolved, so its city anchor remains.


## Mirae Asset Securities priority offices — November 3, 2026

The current [Mirae Asset Securities global network](https://securities.miraeasset.com/newir/view/mobile/en/business/global.jsp) and company contact pages verify the six registered city offices. Seoul HQ is Mirae Asset CENTER1; New York is 810 Seventh Avenue; Singapore’s local securities entity and MAS list 6 Battery Road #29-04; Beijing is F1004, The Exchange Beijing, 118 Jianguo Road; Shanghai is Unit C1, Level 5, Mirae Asset Tower, 166 Lujiazui Ring Road; Shenzhen is at Office Tower T8, Qianhai Kerry Business Center. Named OSM/Mapcarta buildings support the Seoul-adjacent addresses, Singapore, Beijing and Shanghai pins. New York’s current address was resolved to the 810 Seventh Avenue building. Shenzhen is deliberately labeled complex-level and uses the Qianhai Kerry Centre complex point because Tower T8’s distinct map feature was not isolated. The current webpage was preferred over older PDF addresses where the published locations differ.


## Schonfeld and UOB priority offices — November 4, 2026

Nine offices were upgraded. Schonfeld New York’s principal address is from the current SEC AdviserInfo filing (590 Madison Avenue); London is from Companies House and the building’s own site; Hong Kong is from the active LEI record last updated 2026-08-26 and corroborated with the Companies Registry, plus the SEC filing; Singapore is from SEC AdviserInfo; and Tokyo is from the Japanese Investment Advisers Association’s 2026 member directory and SEC filing. Those addresses were resolved to the named buildings using OSM/Mapcarta or ArcGIS PointAddress results. UOB’s official network records confirm its Singapore global headquarters and Tokyo/Seoul branches; UOB Hong Kong’s current contact page confirms Champion Tower; those match named OSM building features. The current UOB China branch page confirms the Beijing Tower C Office Park address, but neither ArcGIS nor OpenStreetMap isolated the specific tower reliably, so Beijing remains at the city anchor.


## Sojitz, HKEX, and JPX offices — November 4, 2026

Eleven city-only offices were upgraded using current official directories and matching map points. Sojitz Tokyo, Singapore, and New York were matched to the Iino Building, Guoco Tower, and an exact 1120 Avenue of the Americas address geocode. HKEX’s registered Hong Kong office, Beijing representative office, Singapore office, and New York office were checked against its current contact directory; Beijing’s Winland IFC POI was converted from GCJ-02 to WGS-84 and remains complex-level. JPX’s official global directory confirms its Tokyo headquarters, New York, Beijing, and Hong Kong offices; Beijing is pinned to the broader Yintai Centre complex because the specific tower could not be isolated. Sojitz London was checked against the current Europe operating-bases directory, which names Amsterdam but no London office; no London address was inferred, and the city fallback remains.


## Samsung Securities global offices — November 4, 2026

Samsung Securities’ current official global network confirms its Seoul, New York, Tokyo, and Beijing offices and addresses. Seoul was matched to the Korean road-address record for Samsung Electronics Building; New York was matched to an exact ArcGIS PointAddress; Tokyo was matched to the named Iidabashi Grand Bloom building and its official Japanese building site. Beijing’s official current address is Room 2101-4, Samsung Tower, Building 1, 31 Jinghui Street; geocoding resolved only Chaoyang District, and no reliable Samsung Tower map feature was established, so the coordinate remains city-level.


## Goldman Sachs priority offices — November 4, 2026

The current Goldman Sachs global directory and its Chinese-language locations page confirm the Beijing Winland International Center, Shenzhen Tower Three at Kerry Plaza, and Seoul HeungKuk Life Insurance Building. Those official addresses were matched to Amap/OSM named complex or building features; Shenzhen and Beijing are not represented as exact tower entrances. The separate registry row at 2 Stonecutter Street, London is not listed as a separate office in the current Goldman directory, which lists the London operation at Plumtree Court, 25 Shoe Lane. It remains at city precision pending confirmation of whether that row is a separate location or a stale alternate address. The HKEX Beijing Winland IFC coordinate was also corrected after recalculating its Amap GCJ-02 point with the standard inverse transform.


## CRU East Asia offices — November 4, 2026

CRU’s current official location pages confirm its Beijing, Shanghai, Tokyo, and Seoul offices. Beijing’s Room 1605 at Raffles City was matched to the complex footprint; Shanghai’s Unit 1002 at Plaza 336 was matched to the Huaxu International Building OSM feature; and Tokyo’s Azabu Green Terrace office was matched to an exact ArcGIS PointAddress. CRU’s current Seoul page confirms a representative office and contact number but does not publish a street address. The older Garage coworking address could not be independently confirmed and remains at city precision.


## CLP China offices — November 4, 2026

CLP’s current official China contact page confirms its Beijing regional headquarters, Shanghai branch and Shenzhen branch. Beijing’s Suite 1730 address at China World Trade Tower was matched to the broader China World Trade Center complex; Shanghai’s Suite 905 at 1728 Nanjing West Road was matched to Paramount Metropolis; and Shenzhen’s Suites 1113–1115 at ICC Tower were matched to the named building POI. Amap GCJ-02 points for Shanghai and Shenzhen were converted to WGS-84, with the conversion basis recorded in the workbook.


## BlackRock Princeton, Sausalito, and Beijing offices — November 4, 2026

BlackRock’s current official locations directory lists Princeton at 1 University Square Drive, Sausalito at 3 Harbor Drive, and Beijing at Excel Center, 6 Wudinghou Street. The two U.S. street addresses matched exact ArcGIS PointAddress results; the Beijing address matched the named Excel Centre Amap POI, with its GCJ-02 point converted to WGS-84.


## Marshall Wace London, Hong Kong, and Shanghai — November 4, 2026

Marshall Wace’s [current official contact page](https://www.mwam.com/contact/) confirms George House, 131 Sloane Street in London; 23/F, LHT Tower, 31 Queen’s Road Central in Hong Kong; and Level 43, Room 4301, HKRI Center Tower 1, 288 Shimen 1st Road in Shanghai. The Hong Kong [LHT Tower property site](https://www.lhttower.com/) confirms its street address, and the named building point is cross-checked against [OpenStreetMap](https://www.openstreetmap.org/way/200238459). The Shanghai [Amap Tower 1 point](https://www.amap.com/place/B0FFHM56A6) matches the official building/address; its GCJ-02 coordinates (31.227956, 121.463313) were converted to WGS-84 (31.22986052, 121.45874457). London’s named George House point matched the street, but ArcGIS returned postcode SW1X 9BW while Marshall Wace publishes SW1X 9AT, so the record is labelled building-level and the discrepancy is retained.


## Marubeni Seoul and SmartestEnergy London/Sydney — November 4, 2026

Marubeni’s [Korea company page](https://www.marubeni.com/korea/en/company/?id=message) confirms its 26F office at Mirae Asset CENTER1 West Tower; the named building point is [OSM way/358295173](https://www.openstreetmap.org/way/358295173). SmartestEnergy’s [current contact directory](https://group.smartestenergy.com/contact-us/) confirms The Columbus Building, 7 Westferry Circus, London and Level 5.01, 175 Pitt Street, Sydney. The London point is [OSM way/1075809998](https://www.openstreetmap.org/way/1075809998); the Sydney Level 5 subaddress matched ArcGIS at score 99.88.


## Engelhart Shanghai and Beijing — November 4, 2026

Engelhart’s [official office directory](https://www.ectp.com/about/locations/) confirms Shanghai at 66 Huayuan Shiqiao Road and Beijing at Room 1519, Block C, No. 2 Jianguomenwai Avenue. Shanghai maps to Amap’s [BEA Finance Tower POI](https://www.amap.com/place/B00155LA2D) at GCJ-02 31.234042, 121.502359, converted to WGS-84 31.23605200, 121.49791976. For Beijing, local government confirms the IFC Tower address and the [Beijing Yintai Centre listing](https://english.visitbeijing.com.cn/article/47ONW7Xp8Xf) confirms the No. 2 Jianguomenwai location. Available map data does not distinguish Block C from the Yintai complex shared pin, so the row remains explicitly complex-level.


## Goldman Sachs Plumtree Court, London — November 4, 2026

Goldman Sachs’ [global locations page](https://www.goldmansachs.com/our-firm/locations/) lists Goldman Sachs International at Plumtree Court, 2 Stonecutter Street; its [UK office page](https://www.goldmansachs.com/worldwide/united-kingdom) lists Plumtree Court, 25 Shoe Lane, with the same EC4A 4AU postcode. The [Goldman Sachs building profile](https://www.goldmansachs.com/our-firm/sustainable-finance/our-operational-impact/plumtree-court-london) and [New London Architecture](https://www.nla.london/projects/plumtree-court) confirm these refer to the same Plumtree Court building. ArcGIS matched 25 Shoe Lane to a PointAddress at 51.51635449, -0.10571390; one building pin is retained for both address forms.


## Japanese energy company Tokyo headquarters — November 4, 2026

ENEOS’s [current Japanese HQ page](https://www.eneos.co.jp/company/branch/otemachi/) lists Otemachi HQ at 1-1-2 Otemachi; the site map resolves to the [Otemon Tower / ENEOS Building](https://office.mec.co.jp/en/search/detail/011520) point at 35.6861067, 139.7619643. Cosmo Energy Holdings’ [current Japanese profile](https://www.cosmo-energy.co.jp/ja/company/overview.html) and [official relocation notice](https://www.cosmo-energy.co.jp/content/dam/corp/jp/en/press/2025/250314-01/250314en_01.pdf) identify TODA BUILDING, 1-7-1 Kyobashi, with operations there since July 22, 2025; ArcGIS matched its exact address at 35.67828023, 139.77168997. Idemitsu’s [official office directory](https://www.idemitsu.com/jp/company/network/index.html) lists 1-2-1 Otemachi, and its linked official map identifies Otemachi One Tower at 35.6879122, 139.7631803.


## SK Innovation Seoul headquarters — November 4, 2026

SK Innovation’s [current official Asia network page](https://www.skinnovation.com/company/global?type=asia) lists 26 Jong-ro, Jongno-gu as its Seoul headquarters. [SK REIT](https://www.skreit.co.kr/en/portfolio/skbuilding.php) identifies this as SK Seorin Building, an integrated SK group office used by SK Innovation and affiliates. The Korean road-address record for [26, Jong-ro, Jongno-gu](https://jusoga.com/b/1111012300100990000017867/%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C-%EC%A2%85%EB%A1%9C%EA%B5%AC-%EC%A2%85%EB%A1%9C-26-%EC%84%9C%EB%A6%B0%EB%8F%99) places the building at 37.56988486, 126.98031006. The Beijing and Shanghai entries remain city-level because the current source directory refers to SK affiliates and no direct parent-company office was confirmed.


## Tokyo energy company headquarters — November 4, 2026

JERA’s [current Japanese company profile](https://www.jera.co.jp/corporate/about/com_outline) lists its headquarters at 25F, Nihonbashi Takashimaya Mitsui Building, 2-5-1 Nihonbashi; this matches the named OSM building footprint already used by JERA Global Markets Services. Tokyo Gas’s [current company profile](https://www.tokyo-gas.co.jp/about/profile/index.html), updated April 2026, lists 1-5-20 Kaigan; its subsidiary’s [official locations page](https://www.tokyo-gas.co.jp/network/about/adress/index.html) identifies the head office building, matched to the named [Tokyo Gas office-building point](https://mapcarta.com/36449250) at 35.65345, 139.75853. TEPCO Holdings’ [current official company profile](https://www4.tepco.co.jp/about/corporateinfo/holdings/) gives 1-1-3 Uchisaiwai-cho and links directly to its map; the map resolves to 35.6701125, 139.7584239. Three TEPCO registry labels/aliases refer to that same physical headquarters and therefore share the same point.


## The Business Times Singapore — November 4, 2026

[SPH Media’s current contact page](https://www.sph.com.sg/media-centre/) lists News Centre at 1000 Toa Payoh North, Singapore 318994. The [Singapore Land Authority OneMap address search](https://www.onemap.gov.sg/api/common/elastic/search?searchVal=1000%20Toa%20Payoh%20North&returnGeom=Y&getAddrDetails=Y&pageNum=1) returns a named NEWS CENTRE address point at 1.34326295, 103.84843124. The Business Times row retains Podium Level 3 in its office label; the map point represents the News Centre property rather than a floor entrance.


## Nikkei Tokyo headquarters — November 4, 2026

Nikkei Inc.’s [official contact page](https://messe.nikkei.co.jp/en/kl/contact.html) gives its Tokyo address as 1-3-7 Otemachi, Chiyoda-ku. [NTT Urban Value Support](https://www.ntt-uvs.com/office/post_9/) identifies the Nikkei Building within the Otemachi 1-3-1/2/7 building complex, and [MapFan’s named Nikkei Building record](https://mapfan.com/spots/SCAQC,J,L5YFV0) supplies the map point 35.6886633, 139.7635682. This is a building point, not a suite-level location.


## Marex London office — November 4, 2026

Marex’s [current official contact directory](https://www.marex.com/contact-us) lists its London office at 155 Bishopsgate, EC2M 3TQ. [British Land’s property disclosure](https://www.britishland.com/media/fbidhpvw/british-land-2024-cdp-disclosure.pdf) identifies the 155 Bishopsgate building at 51.5189, -0.07976. The related [Marex careers listing](https://www.marex.com/careers/career-opportunities/20d68679ef4401-application-support-analyst-energy-trading-operations) names London but gives no building; the registry therefore represents the confirmed city office without claiming an advert-specific address.


## Société Générale London and Hong Kong office towers — November 4, 2026

Société Générale’s [UK legal page](https://www.societegenerale.co.uk/en/importantinformation/legal-information/) and [regulated subsidiary disclosure](https://sgildisclosure.societegenerale.com/fileadmin/user_upload/SG_NUK_Disclosure/SGIL_MIFID_documents/SGIL_Conflicts_of_Interest_Policy_Summary_01.pdf) confirm its London office at One Bank Street, E14 4SG; the named tower point is 51.503513, -0.024287. Société Générale’s [Hong Kong office page](https://wholesale.banking.societegenerale.com/fr/propos-nous/implantations/country-details/country/hong-kong-sar-1/) and [HKMA register](https://vpr.hkma.gov.hk/chs/regulatory-resources/registers/register-of-ais-and-lros/info/100102) list Three Pacific Place, 1 Queen’s Road East. The building owner confirms the tower and address, and [CTBUH building data](https://www.skyscrapercenter.com/complex/393) lists the tower point at 22.2767778, 114.1681583. Both coordinates are tower/site points, not tenant-suite entrances.


## Beijing office towers — November 4, 2026

China Datang’s [official company page](https://www.china-cdt.com/dtwzen/About/A029002Gone1.html) lists 1 Guangningbo Street, Xicheng; Amap’s [named China Datang Group POI](https://ditu.amap.com/place/B000A843ZE) identifies that site at GCJ-02 39.914554, 116.362276, converted to WGS-84 39.91318175, 116.35606846. Samsung Securities’ [official overseas-office directory](https://www.samsungsecurities.co.kr/eng/company/business.do) lists its Beijing office in Samsung Tower, Building 1, 31 Jinghui Street. Amap’s [named Samsung Tower feature](https://ditu.amap.com/place/B0FFKE06AO) gives GCJ-02 39.912160, 116.464736, converted to WGS-84 39.91078, 116.45851. Both pins denote building sites, not suite entrances.


## Beijing national energy group headquarters — November 4, 2026

CNOOC Limited’s [current official contact page](https://www.cnoocltd.com/english/investorrelations/contact/) lists its Beijing office at 25 Chaoyangmen North Street; its [named Amap headquarters POI](https://ditu.amap.com/place/B000A7XLH1) supplies the office point. PetroChina’s [2025 interim report](https://www.petrochina.com.cn/ptr/rdxx/202509/8b4fd3e98cb04047abe22e3216da3210/files/a1411ec2b5f9422ca5c19749c50d76d2.pdf) gives 9 Dongzhimen North Street; CNPC’s [2024 corporate responsibility report](https://www.cnpc.com.cn/en/csr2024enhmshn/202507/27dddef57a984a4e85415064d161555f/files/47a85f12ea8d4d1c98bea590bc26955f.pdf) lists the same address. Both share the named [China Petroleum Building Amap point](https://ditu.amap.com/place/B000A84M94). Sinopec’s [current contact page](https://intl.sinopec.com/contactUs) lists Sinopec Tower at 22 Chaoyangmen North Street, matched to its [named Amap tower point](https://ditu.amap.com/place/B000A98927). A 2026 CHN Energy [bond disclosure](https://static.sse.com.cn/bond/bridge2/disclosure/announcement/c/202602/04cef6_20260209_VVWD.pdf) gives the group headquarters at 22 Xibinhe Road; [Amap’s CHN Energy C Tower feature](https://ditu.amap.com/place/B000A499D8) maps the named headquarters compound. Chinese Amap GCJ-02 points were converted to WGS-84. The CHN Energy filing does not specify a tower, so its point is classified as compound-level.


## Macquarie New York headquarters — November 4, 2026

Macquarie’s [official 2024 move announcement](https://www.macquarie.com/cl/en/about/news/2024/macquarie-group-demonstrates-commitment-to-the-americas-with-move-to-iconic-new-york-address-at-660-fifth-avenue.html) confirms 660 Fifth Avenue as its Americas headquarters; the [current office directory](https://www.macquarie.com/us/en/about/contact/locations.html) repeats the address. The named 660 Fifth Avenue tower point is 40.760163, -73.976204; it represents the building/site, not a tenant entrance.


## Office coordinate batch 138 — November 4, 2026

- **Quark Energy Trading, London:** the [official contact page](https://www.quarkenergytrading.com/contact-us/) gives 20 Eastbourne Terrace. The [OpenStreetMap building feature](https://www.openstreetmap.org/way/42030138) resolves the building at 51.5166662, -0.1790635.
- **UNIPEC Singapore / Sinopec Trading:** [UNIPEC’s June 2026 official page](https://unipec.sinopec.com/unipec/news/jyjg/2026/6/I1517109856954220544.shtml) confirms oil-products and LNG trading at Suntec Tower One, 7 Temasek Boulevard. Singapore OneMap resolves the tower at 1.2954356978, 103.8583748253.
- **Singapore Petroleum Company:** the [Singapore MPA 2024 directory](https://www.mpa.gov.sg/docs/mpalibraries/mpa-documents-files/hydrographic/spi-2024_1-oct-2024.pdf) lists SPC at Millenia Tower, 1 Temasek Avenue; Singapore OneMap resolves the tower at 1.2926680808, 103.8602900985. Current corporate confirmation should be rechecked.


## Economist Group office batch 139 — November 4, 2026

The current [Economist Group office directory](https://www.economistgroup.com/about-us) identifies The Economist’s London office at The Adelphi and New York at 3 Columbus Circle. The Adelphi is matched to the [Historic England listed-building point](https://britishlistedbuildings.co.uk/101393391-the-adelphi-st-jamess-ward), while 3 Columbus Circle is resolved as a commercial building by OpenStreetMap. The San Francisco point is supported by the separate [Economist Enterprise office page](https://economistenterprise.com/who-we-are) at 90 New Montgomery Street; the record explicitly identifies it as a Group business-unit office, not an editorial bureau. The Economist’s official Hong Kong address was identified but was not added because no corresponding office row exists in the registry.


## Glencore Beijing — coordinate batch 140, November 4, 2026

Glencore’s [current group-entity register](https://www.glencore.com/who-we-are/transparency/group-entities) lists Glencore (Beijing) Trading Co., Ltd. at 27 East Third Ring Road North, Beijing 100020. The [Beijing municipal map](https://map.beijing.gov.cn/map-web/place?categoryId=lwtcc&placeId=68e135b83161b24f3945cba3) confirms the building address, and the [Jiaming Center named-building map record](https://commons.wikimedia.org/wiki/Category:Jiaming_Center) gives 39.9268139, 116.4545278. The pin represents the building site.


## ExodusPoint Hong Kong and Tokyo — coordinate batch 142, November 5, 2026

The [current ExodusPoint office page](https://www.exoduspoint.com/) confirms Hong Kong at Prosperity Tower, 39 Queens Road Central, and Tokyo at Marunouchi Nijubashi Building. For Hong Kong, the Lands Department’s location search identifies the tower at HK80 E 834141, N 815968, and its official [coordinate transformation service](https://www.geodetic.gov.hk/transform/v2/) converts that point to WGS84 22.2825900, 114.1562352. For Tokyo, [Mitsubishi Estate’s building directory](https://office.mec.co.jp/en/search/detail/011473/) confirms Marunouchi Nijubashi Building at 3-2-3 Marunouchi and its map point (35.6780389, 139.7614881). ExodusPoint’s London office address is confirmed, but the company site’s map link appears to point to a different, older address; that point was left unresolved.


## Office coordinate batch 143 — November 5, 2026

- **STX Group, New York:** the [current STX contact page](https://stxgroup.com/contact/) lists 11 Times Square, 31st Floor; the named [OpenStreetMap tower feature](https://www.openstreetmap.org/way/266143341) resolves the building at 40.7566036, -73.9896570.
- **Czarnikow, London:** the [current company contact page](https://www.czarnikow.com/contact/) lists its HQ at 4th Floor, 2 More London, SE1 2AP. The named 2 More London Place building is mapped at 51.5052915, -0.0803617. The OSM address record reports SE1 2RR rather than the company’s postcode, so this is treated as a named-building/site match and not an exact postal point.
- **Czarnikow, Singapore:** the [current company contact page](https://www.czarnikow.com/contact/) lists 3 Phillip Street, #14-01 Royal Group Building, 048693; Singapore Land Authority [OneMap](https://www.onemap.gov.sg/api/common/elastic/search?searchVal=3%20Phillip%20Street%20Royal%20Group%20Building%20048693%26returnGeom=Y%26getAddrDetails=Y%26pageNum=1) returns the building point at 1.2847205, 103.8499648.
- **HK Electric, Hong Kong:** an [official February 2026 release](https://www.hkelectric.com/documents/en/MediaResources/PressReleases/Documents/20260212_pre_EV%20Roadmap_Final_web.pdf) confirms Hongkong Electric Centre, 44 Kennedy Road. The [Lands Department location search](https://www.map.gov.hk/gs/api/v1.0.0/locationSearch?q=44%20Kennedy%20Road%20Hong%20Kong) returns HK80 E 835092, N 815036; the government [transformation service](https://www.geodetic.gov.hk/transform/v2/) yields WGS84 22.2741744, 114.1654638.


## Office coordinate batch 144 — November 5, 2026

- **GridBeyond, Sydney:** its [current contact page](https://gridbeyond.com/contact/) lists Suite 29, 55 Pyrmont Bridge Road. ArcGIS World Geocoding Service returns the exact address at score 100 (−33.8724032, 151.1946319).
- **GridBeyond, Tokyo:** the [current contact page](https://gridbeyond.com/contact/) lists Hibiya Fort Tower, 10F, 1-1-1 Nishi-shinbashi; its 2025 [relocation notice](https://gridbeyond.com/gridbeyond-strengthens-japanese-operations-with-new-tokyo-hq/) refers to the 9th floor. ArcGIS matched the street address at score 84.82 (35.6701621, 139.7527565); the pin indicates the tower/address, not tenant floor.
- **Yes Energy, Tokyo:** the [current locations directory](https://www.yesenergy.com/locations) lists The Energy Center, 4F, 2-20-1 Nishishinbashi. ArcGIS matched the street number at score 85.09 (35.6659943, 139.7521903); the pin is an address/building point.


## Office coordinate batch 145 — November 5, 2026

- **Volue, London:** the [current Volue office directory](https://www.volue.com/contact-us/office-locations) lists Halkin Mainframe, 24 Eversholt Street. The named Euston House building at the address is mapped at 51.5286997, −0.1317846.
- **Pexapark, London:** its [careers location page](https://jobs.pexapark.com/locations/london) names Orega Holborn Gate; Orega’s [official brochure](https://www.orega.com/hubfs/Resource%20page/Brochures%20-%20New%202020/Orega%20Serviced%20Offices%20London%20Holborn%20Gate%20Brochure.pdf) gives 330 High Holborn, WC1V 7QH. OSM’s Holborn Gate building point is 51.5177989, −0.1119903. This is the advertised work centre, not a specific Pexapark suite.
- **LSEG Data & Analytics, London:** LSEG’s [current locations directory](https://www.lseg.com/en/locations) lists 10 Paternoster Square as group head office. The OSM London Stock Exchange feature at that address is 51.5150440, −0.0990793. A division-specific London workplace was not separately confirmed, so the group-office qualification remains in the registry notes.


## Office coordinate batch 146 — November 5, 2026

- **Sinopec International, Singapore:** the [current contact page](https://intl.sinopec.com/sg/contactUs) lists 9 Raffles Place, #41-01, Republic Plaza. Singapore Land Authority OneMap resolves the named tower/address to 1.2834836, 103.8505740.
- **ENEOS Xplora, Tokyo:** its [current office directory](https://www.eneos-xplora.com/corporate/network.html) gives the HQ at 9F Azabudai Hills Mori JP Tower, 1-3-1 Azabudai; ArcGIS matched the street number at 35.6609406, 139.7405406. The older Otemachi address was replaced.
- **PetroChina, Hong Kong:** PetroChina’s [2026 HKEX office-change notice](https://www1.hkexnews.hk/search/titlesearch.xhtml?category=0&market=SEHK&stockId=2038) states its principal Hong Kong office moved effective June 30 to 37/F East Tower, Cheung Kong Center II, 10 Harcourt Road. The [Lands Department location service](https://www.map.gov.hk/gs/api/v1.0.0/locationSearch?q=10%20Harcourt%20Road%20Cheung%20Kong%20Center%20II%20Hong%20Kong) gives HK80 E 834795, N 815799; the government transformation API returns WGS84 22.2810645, 114.1625814.


## Office coordinate batch 147 — November 5, 2026

Nine current bank office locations were mapped from official or regulatory address lists: NatWest Markets in London (250 Bishopsgate), Singapore (One Raffles Quay South Tower) and Tokyo (Shin-Marunouchi Center); UBS in Zurich (Bahnhofstrasse 45), Tokyo (Otemachi One Tower) and London (5 Broadgate); and Scotiabank in London (201 Bishopsgate), Hong Kong (United Centre, 95 Queensway) and Sydney (Governor Phillip Tower, 1 Farrer Place). Addresses were matched with the respective official map/address sources: [NatWest locations](https://www.natwestgroup.com/who-we-are/board-and-governance/our-subsidiaries/natwest-markets-plc/locations.html), [UBS locations](https://www.ubs.com/global/en/our-firm/locations.html), [Scotiabank branch disclosure](https://www.scotiabank.com/content/dam/scotiabank/canada/en/documents/Appendix_A.pdf), Singapore SLA OneMap, Hong Kong Lands Department search + official coordinate conversion, ArcGIS and OSM. Scotiabank’s London map record has a different postcode than its regulatory disclosure, so the mapped feature is treated as the named tower only.


## Office coordinate batch 148 — November 5, 2026

DV Trading’s [current contact page](https://dvtrading.co/contact-us/) lists London at 20 Fenchurch Street, floor 31, and CCI’s [current office directory](https://www.cci.com/contact-us/) lists the same tower, floor 34. ArcGIS matched the exact 20 Fenchurch Street address (score 100) at 51.5111790, −0.0836110. The two registry rows remain separate, with their respective floor numbers retained; the marker is the shared tower/site.


## Office coordinate batch 149 — November 5, 2026

Iberdrola Japan’s [official contact page](https://www.iberdrola-renewables.jp/contact/) and Lloyd’s List Intelligence’s [current office directory](https://www.lloydslistintelligence.com/contact-us) confirm the two Tokyo buildings. ArcGIS PointAddress matches returned 35.6671627, 139.7703903 (score 96.46) for Millennium Tsukiji and 35.6684756, 139.7506212 (score 98.79) for KDX Toranomon 1 Chome. Both former city-fallback pins are now building-level.


## Office coordinate batch 150 — November 5, 2026

Noble Resources’ [official contact page](https://www.thisisnoble.com/contact-us/) lists its Singapore head office at Guoco Midtown, regional hubs at Dah Sing Financial Centre in Hong Kong and Jin Mao Tower in Shanghai, and a Tokyo office at Kasumigaseki Building. ArcGIS building/address results: Guoco Midtown 1.2968527, 103.8577736 (98.59); Dah Sing Financial Centre 22.2867392, 114.1431298 (95.59); Jin Mao Tower 31.2375400, 121.5012100 (named POI, 76.67); Kasumigaseki Building 35.6713088, 139.7471777 (PointAddress, 83.16). Match limitations are recorded by row.


## Office coordinate batch 151 — November 5, 2026

Four more city fallbacks were upgraded. S&P Global’s current [Beijing directory](https://www.spglobal.com/en/contact-us/office-locations) confirms Platts’ 49F office in the same Fortune Financial Center building already mapped for S&P; Sinopec International’s [official contact page](https://intl.sinopec.com/contactUs/components/contactUsDetails) confirms its trading subsidiary’s Beijing office in the already mapped Sinopec Tower. SK Innovation’s [current network directory](https://www.skinnovation.com/company/global?type=asia) confirms its Beijing and Shanghai group subsidiary offices at SK Tower. Named OSM building features provide WGS-84 points: Beijing SK Tower 39.9061700, 116.4507000; Shanghai SK Tower 31.1725000, 121.4698100.


## Office coordinate batch 152 — November 5, 2026

Dare’s [current London locations page](https://careers.dare.global/locations) gives One America Square, 17 Crosswall; the ArcGIS PointAddress match is 51.5113028, −0.0766566 (score 95.5). Kraken Technologies Japan’s [official Japanese company profile](https://www.kraken.tech/ja/about) lists Izumi Garden Tower 28F, 1-6-1 Roppongi; the named OSM office-tower feature is 35.6644700, 139.7395200. Both registry records are now building-level.


## Office coordinate batch 153 — November 5, 2026

Commonwealth Bank’s [current London office page](https://www.commbank.com.au/about-us/our-company/international-branches/europe.html) confirms 60 Ludgate Hill. ArcGIS returned the matching PointAddress at 51.5144563, −0.1030432 (score 97.03), replacing the full-postcode centroid. After this correction, 48 office records remain city-level.
