# What If All Continents Reunited? — script, draft 1

**Brief**
- **Audience:** teens and a general audience.
- **Length:** about 93 s (19 lines). Sangam asked for 100–120 s; this runs a little shorter because every line has to earn its place.
- **Tone:** plain, friendly, no slang.
- **Voice:** edge-tts "Ryan" (`en-GB-RyanNeural`, rate +5%), one take per line, made with the shared `tools/voice.py`
  (trimmed takes, inner pauses capped at 0.3 s). Lines are 0.2 s apart, 0.3–0.35 s after the crash, after the fossils,
  before "But don't panic" and before the twist.

**Source:** Sangam's script (written with ChatGPT, 2026-11-20), rebuilt with the house formula: a strong hook and a
looping ending, people-level consequences, a "this can't happen suddenly" beat, and a sourced fact row for every claim.

**Sangam's rule: video → reward → video → reward.** Read as pacing: every scene that *shows* something is followed by a
*reward*, a surprising fact or reveal that pays it off, so the viewer gets a payoff every 4–6 seconds. The Type column
below marks each line. The hook is a show; the first reward ("It's happened before… Pangaea") lands by 5 s.

**What changed from Sangam's draft, and why**
- **Fixed:** "Imagine driving from Asia to Europe, Africa, and the Americas without crossing an ocean." Asia, Europe and
  Africa are already joined by land today (Europe–Asia directly, Asia–Africa through Sinai), so only the Americas are
  new. Now: "You could drive from New York to London."
- **Fixed:** "what would happen if all of Earth's land *suddenly* became one?" Plates move a few centimetres a year, so
  it can only happen over ~250 million years. That became its own beat ("This can't happen suddenly… fingernails").
- **Fixed:** "A supercontinent wouldn't necessarily mean a hotter or colder Earth overall" as the twist. For the *next*
  supercontinent, the best-known climate model (Farnsworth et al. 2023) finds it much hotter (a brighter Sun, more
  volcanic CO₂ and land far from the sea), so the line was misleading. Replaced with that study's mammal result, and the
  twist became the supercontinent cycle (Earth has done this at least three times).
- **Cut** as speculation with nothing to source: millions migrating, countries competing over land routes, "possibly an
  entirely different human civilization", "earthquakes and volcanic activity could increase". The road trip and the
  ships → trucks beat keep the people angle with checkable numbers.
- **Cut** the "end of the world as we know it" opener. New hook: "Every continent on Earth is moving. And one day,
  they'll all crash back together." (true, personal, and it sounds impossible).
- **Made concrete:** "massive deserts" → Pangaea really had them, and its dunes are now Zion's cliffs. "Coastal regions
  wetter" → megamonsoons. "Marine ecosystems disrupted" → less shallow sea, where much of ocean life lives. "Enormous
  mountain ranges" → Pangaea's central mountains may have rivalled the Himalayas, and are now the Appalachians.
- **Kept** Sangam's ending shape ("One planet. One supercontinent…"), made it loop into the first frame.

**Title:** "What If All Continents Reunited?" · **Hook (first 3 s):** "Every continent on Earth is moving."
**First frame (no sound):** a smiling Earth with today's map, big text **WHAT IF ALL CONTINENTS REUNITED?**
**Thumbnail (thumb.js):** a scared Earth with its continents smashing together, impact stars, "ONE CONTINENT", red pill.

| # | Type | Narration (spoken) | Visual cue | POV |
|---|---|---|---|---|
| 1 | show | Every continent on Earth is moving. And one day, they'll all crash back together. | Earth (today's map) smiles; arrows push in; on "crash" the continents lurch together with a shake; Earth looks scared. Title stays up. | space |
| 2 | reward | It's happened before. About three hundred million years ago, almost all land was one supercontinent: Pangaea. | Flat map rewinds ("⏪ 0 → 300 million years ago"); the continents slide into one; **PANGAEA** stamp. | map |
| 3 | reward | That's why fossils of the same little reptile turn up in both Brazil and South Africa. | Zoom on the South America–Africa join; a live Mesosaurus fades to two fossils; the continents split; "Brazil" / "South Africa" linked by a dashed line. Tag "Mesosaurus · same freshwater reptile, two continents". | map |
| 4 | show | So what if all the continents reunited? | Earth's continents slam together (shake, sparkles); "ONE CONTINENT?". | space |
| 5 | show | You could drive from New York to London. No planes, no ferries. | Merged-map inset with a dashed New York → London route; a red car drives; plane and ferry cards get red X's. | ground |
| 6 | reward | Today, ships carry about eighty percent of world trade. Trucks and trains would take over. | Container ship at sea, "80 % of world trade goes by sea"; the ship greys and sails off as land slides in with a truck and a train. | sea |
| 7 | show | But the middle of the continent would be brutal, farther from the sea than anywhere on Earth today. | The supercontinent turns sandy; a pin pulses in the middle with a dashed line to the far coast. Tag "today's record: about 2,500 km". | map |
| 8 | reward | With no ocean to calm the weather, summers could top forty degrees, and winters could freeze hard. | Split screen: scorching summer (sweating person, thermometer, "40 °C+") over snowy winter (shivering, "FREEZING"). | ground |
| 9 | show | Rain clouds would dry out long before they reached the centre, leaving giant deserts. | Side view: a rain cloud drifts inland from the sea, shrinks and stops raining; the inland turns to dunes. Tag "giant deserts". | ground |
| 10 | reward | Pangaea had them. Its sand dunes turned to stone, and became the red cliffs of Zion National Park. | Dunes rise into striped red cliffs; a tiny hiker; "Zion National Park, Utah". Tag "dunes → stone · the Navajo Sandstone". | ground |
| 11 | show | The coasts, though, would get megamonsoons: rainy seasons even wilder than India's. | Storm coast: dark clouds, lightning flash, bent palm, person with an umbrella. **MEGAMONSOONS**. | coast |
| 12 | reward | And there'd be just one giant ocean. Fewer coastlines means less shallow sea, where much of ocean life lives. | Globe turned to the ocean side, "ONE OCEAN"; cut to a shelf cross-section whose shallow shelf shrinks as fish fade. | sea |
| 13 | show | Where continents collide, the land crumples up into mountains. | Cross-section: arrows push two sides together; the rock layers fold up into a range. "CRUNCH!". | ground |
| 14 | reward | Pangaea's central mountains may have rivalled the Himalayas. Today, they're the worn-down Appalachians. | Tall snowy purple range under a "Himalaya height" line, "Central Pangean Mountains"; erodes to rounded green hills, "Appalachians, today". | ground |
| 15 | show | But don't panic. This can't happen suddenly. Continents move about as fast as your fingernails grow. | "DON'T PANIC" → **CAN'T HAPPEN SUDDENLY**; a finger whose nail grows ≈ a sleepy Earth barely moving. Tag "a few cm a year". | — |
| 16 | reward | So the next supercontinent is about two hundred and fifty million years away. | A counter runs to "250 million years from now" while Earth's continents merge. | space |
| 17 | reward | And one study found it could be so hot that mammals could survive on only about a tenth of it. | The merged map glows red under a flaring Sun, "TOO HOT"; a few green refuges with mice. Tag "≈ 8–16 % of land · livable for mammals · one 2023 model". | map |
| 18 | reward | Here's the twist: Earth has done this at least three times. Pangaea was just the latest. | **TWIST**; a dashed ring with Nuna, Rodinia, Pangaea and "next?". Tag "the supercontinent cycle". | — |
| 19 | show | One planet. One continent. One ocean. And we're already on our way there. | Earth with the supercontinent, smug: ONE PLANET / ONE CONTINENT / ONE OCEAN; then the map slips back to today with arrows, "ALREADY MOVING". **Loops to the first frame.** | space |

**Timing:** 278 words, 93.2 s as built.

## Fact checks

| Line | Claim (as said or shown) | Basis | Hedge |
|---|---|---|---|
| 1 | Every continent is moving; one day they'll crash back together | Plate tectonics: all plates move, ~2–10 cm/yr (GPS; USGS "This Dynamic Earth"). Every supercontinent model (Pangaea Proxima, Novopangaea, Amasia, Aurica) has today's continents rejoining within ~200–300 My (Davies et al. 2018, Geological Society SP 470; Way et al. 2024). | "one day" |
| 2 | ~300 million years ago almost all land was one supercontinent, Pangaea | Pangaea assembled ~335–300 Ma and began breaking up ~200 Ma (Rogers & Santosh, *Continents and Supercontinents*, 2004; USGS). Some fragments (parts of China, Southeast Asia) were never fully attached, hence "almost". | "about", "almost" |
| 2 | On screen: "300 million years ago" rewind | Same. | — |
| 3 | Fossils of the same reptile in Brazil and South Africa | *Mesosaurus*, an early Permian freshwater/brackish reptile, is found in southern Africa and South America (Brazil, Uruguay); it could not have crossed an ocean. One of Wegener's original lines of evidence (Wegener 1915; USGS "Historical perspective"). | — |
| 5 | You could drive from New York to London | In Pangaea, North America sat against Europe and north-west Africa. Pangaea Proxima-type futures close the Atlantic (Scotese, PALEOMAP). Not every model does (Amasia closes the Pacific instead), so this is "what if all reunited" in a Pangaea-like layout. | "could" |
| 6 | Ships carry about 80 % of world trade | Over 80 % of world merchandise trade by volume is carried by sea (UNCTAD, *Review of Maritime Transport* 2023). | "about" |
| 7 | The middle would be farther from the sea than anywhere today; on screen "today's record: about 2,500 km" | Today's continental pole of inaccessibility (Dzungaria, China) is ~2,510 km from the nearest coast (Garcia-Castellanos & Lombardo 2007, Scottish Geographical Journal). A single supercontinent has a much larger interior, so its middle lies farther from any coast. | "farther … than anywhere today" (no exact number spoken) |
| 8 | With no ocean nearby, summers could top 40 °C and winters freeze hard | Continentality: interiors far from the sea have huge seasonal swings (e.g. Yakutsk, −40 °C to +30 °C). Pangaea climate models give interior seasonal ranges of ~40–50 °C, with summer temperatures well above 35–40 °C and winters below freezing (Kutzbach & Gallimore 1989, JGR 94; Crowley et al. 1989). | "could" |
| 9 | Rain clouds dry out before the centre, leaving giant deserts | Moisture from the ocean is rained out on the way inland; Pangaea's interior had vast deserts and arid belts (Parrish 1993, J. Geology 101; Kutzbach & Gallimore 1989). | — |
| 10 | Pangaea's dunes turned to stone and became the red cliffs of Zion | Zion's cliffs are mostly Navajo Sandstone, a giant Early Jurassic (~190 Ma) erg (dune sea) that formed in western Pangaea before it split (NPS, "Zion Geology"; Kocurek & Dott 1983). | — |
| 11 | The coasts would get megamonsoons, rainy seasons wilder than India's | Models and rock records show "megamonsoons" on Pangaea's coasts, stronger than any monsoon today (Kutzbach & Gallimore 1989, "Pangaean climates: megamonsoons of the megacontinent"; Parrish 1993). | "would" in a what-if; "wilder than" per the models |
| 12 | Just one giant ocean | A single supercontinent leaves one surrounding superocean (Panthalassa in Pangaea's time). | — |
| 12 | Fewer coastlines means less shallow sea, where much of ocean life lives | Merged continents have less total coastline and continental-shelf area. Shelf seas hold a large share of marine species; the loss of shelf area as Pangaea assembled is linked to lower marine diversity (Valentine & Moores 1970, Nature 228). | "much of" |
| 13 | Where continents collide, the land crumples into mountains | Continental collision builds fold-and-thrust mountain belts (Himalaya from India–Asia, Alps from Africa–Europe). | — |
| 14 | Pangaea's central mountains may have rivalled the Himalayas; today they're the worn-down Appalachians | The Central Pangean Mountains (Appalachian–Caledonian–Variscan belt) formed in the collisions that built Pangaea and are often estimated at Himalaya-like heights; the Appalachians, Scottish Highlands and Little Atlas are their eroded remains (Slingerland & Furlong 1989; NPS/USGS Appalachian geology). | "may have" |
| 15 | It can't happen suddenly; continents move about as fast as fingernails grow | Plates move ~2–10 cm/yr (Atlantic widening ~2.5 cm/yr). Fingernails grow ~3.5 mm/month ≈ 4 cm/yr (Yaemsiri et al. 2010, J. Eur. Acad. Dermatol.). On screen "a few cm a year". | "about" |
| 16 | The next supercontinent is about 250 million years away | Most models put the next supercontinent ~200–300 My ahead; Pangaea Ultima/Proxima at ~250 My (Scotese; Farnsworth et al. 2023). | "about" |
| 17 | One study: so hot that mammals could survive on only about a tenth of it; on screen "≈ 8–16 % of land" | Farnsworth et al. 2023, Nature Geoscience 16, "Climate extremes likely to drive land mammal extinction during next supercontinent assembly": only 8–16 % of land habitable for mammals, driven by a ~2.5 % brighter Sun, higher volcanic CO₂ and continentality. | "one study", "could", "about" |
| 18 | Earth has done this at least three times; Pangaea was the latest | Recognised supercontinents: Columbia/Nuna (~1.8 Ga), Rodinia (~1.1–0.9 Ga), Pangaea (~0.3 Ga); older ones (Kenorland, Ur) are debated (Nance, Murphy & Santosh 2014, Gondwana Research, "The supercontinent cycle"). On screen ages: ~1.8 bn, ~1 bn, ~300 m yrs ago. | "at least" |
| 19 | We're already on our way there | Follows from line 1. | — |

Not claimed: any number of deaths, which future model is right, or that people would still be around in 250 My.
