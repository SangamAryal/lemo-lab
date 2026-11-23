# What If a Rogue Planet Passed Earth? — script, draft 3

**Brief**
- **Audience:** teens and a general audience.
- **Length:** about 89 s (17 lines). Longer than our earlier films on purpose: the new style tells a story with a
  timeline and an ending choice, like the reference Sangam picked.
- **Voice:** edge-tts "Ryan" (`en-GB-RyanNeural`, +5%) for the narrator, made with the shared `tools/voice.py`.
  (lines.json still supports per-line `voice`/`rate`/`pitch`; draft 3 has no character voices.)

**The new presentation style (Sangam, 2026-11-21, reference: youtube.com/shorts/2z_eNeQIVeg "What if Earth had
1,000 moons")**, studied from its transcript and a scene-by-scene breakdown:
- Told to **you**, as a story with **time stamps** (Year 1 → Year 5 → Pass week → gone).
- **People react on screen in every beat**: astronomers, a family, a crowd, a kid and their mum.
- **Escalation**: wonder → real consequences (tides, earthquakes, Earth's orbit) → the big picture (it never touched us;
  billions are out there) → a question for the viewer. Draft 3 has no imaginative twist (cut at Sangam's request).
- **No caption boxes and no running subtitles.** Only key words appear on screen, placed in the picture
  (YEAR 1, 26 KM PER SECOND, MISS, = 300 EARTHS, TIDES SURGE, ORBIT SHIFTED…). Character lines are shown as quotes.
- **Show → reward pacing** kept from earlier films: each scene is paid off by a surprising fact within a few seconds.

**Topic:** chosen by Claude. Not repeated from any earlier film (black hole sun, spin twice, continents, magnetic
field, sun vanished, earth stops, moon films, asteroid, rings, no tilt). Rogue planets are real, under-covered, and the
facts escalate naturally into a story.

**Title:** "What If a Rogue Planet Passed Earth?" · **Hook (first 3 s):** "What if a giant planet came drifting into our
solar system, and passed right by Earth?"
**First frame (no sound):** a kid in a back garden at night looking up at a striped planet; big text **WHAT IF A ROGUE
PLANET PASSED EARTH?**
**Thumbnail (thumb.js):** a giant striped planet beside a small Earth, a shocked face, "ROGUE PLANET", red pill
"IT PASSES EARTH".

| # | Type | Narration (spoken) | On screen (key words in CAPS) | People |
|---|---|---|---|---|
| 1 | show | What if a giant planet came drifting into our solar system, and passed right by Earth? | Night garden; the planet grows in the sky. Title. | you: wonder → shock |
| 2 | reward | Not a comet. Not an asteroid. A whole planet, as big as Jupiter, with no sun of its own. | COMET ✗, ASTEROID ✗, A WHOLE PLANET, JUPITER-SIZED, NO SUN | — |
| 3 | reward | These rogue planets are real. Our galaxy may hold more of them than stars. | Milky Way lights up with rogue planets. ROGUE PLANETS, THEY'RE REAL, MORE THAN STARS? | teen: awe → shock |
| 4 | show | Year one. Astronomers spot it out past Neptune, racing toward us at twenty-six kilometres every second. | YEAR 1; observatory monitor, UNKNOWN OBJECT past Neptune; 26 KM PER SECOND | two astronomers: think → shock |
| 5 | reward | They check the numbers again and again. It won't hit us. It will miss Earth by ten million kilometres. | IMPACT? → ✓ MISS; 10,000,000 KM | worried → relief |
| 6 | reward | Sounds safe? That's only twenty-six times farther than the Moon. And this thing weighs as much as three hundred Earths. | SOUNDS SAFE?; 26 Moon distances tick up; a balance: = 300 EARTHS | you: worried → scared |
| 7 | show | Year five. It's the brightest thing in the night sky after the Moon. With binoculars, you can see its stripes. | YEAR 5; city street; BRIGHTEST AFTER THE MOON; binocular view; STRIPES | gran points, dad with binoculars, teen films it |
| 8 | show | The week of the pass, it grows bigger than the full Moon. Nobody sleeps. Everyone is outside, staring up. | PASS WEEK; the planet dwarfs the full Moon; BIGGER THAN THE FULL MOON; NOBODY SLEEPS | a crowd of seven, awe |
| 9 | reward | But its gravity tugs on Earth even harder than the Moon does. Tides surge, and seaside towns are told to leave. | Earth's ocean bulges toward it: STRONGER PULL THAN THE MOON; a flooded street, siren: TIDES SURGE, EVACUATE | family walking out with a suitcase |
| 10 | reward | Scientists even watch for earthquakes, because strong tides can tip faults that are ready to slip. | Seismograph spikes; EARTHQUAKES? | astronomers: worried → scared |
| 11 | show | Then, in just a few days, it's gone. But it takes something with it. | The planet shrinks away; GONE; the sky turns red: BUT… | mum and you cheer → scared |
| 12 | reward | Its pull drags Earth's whole orbit, by up to three percent. | Old orbit (dashed) → new orbit (gold); ORBIT SHIFTED, UP TO 3% | astronomer: shock |
| 13 | reward | A little closer to the Sun, and Earth could get hotter than any climate forecast. | Huge Sun, heat haze, thermometer; HOTTER | dad, hands on head |
| 14 | reward | A little farther, and we could slide into an ice age. Even the year could change by two weeks. | Snow; ICE AGE; a calendar flickering around 365 days; ± 2 WEEKS | gran shivering |
| 15 | reward | And all of that, from a planet that never even touched us. | TIDES, QUAKES, ORBIT recap; the planet's dashed path past Earth with a 10 million km line: NEVER TOUCHED US | astronomer: awe → shock |
| 16 | reward | Right now, billions of rogue planets may be drifting through our galaxy. None is known to be heading our way. | The Milky Way fills with drifting rogue planets: BILLIONS, DRIFTING; then NONE HEADING OUR WAY ✓ | mum and kid: awe → relief |
| 17 | show | But if one ever did, would you stay up all night to watch it pass? | The hook's night garden; a new point of light where the planet will appear; WOULD YOU STAY UP ALL NIGHT TO WATCH IT PASS? **Loops to the first frame.** | you with binoculars, kid pointing |

**Timing:** 89.5 s as built.

**Draft 2 (Sangam, 2026-11-21):** cut line 16 ("a moon like that can stay warm inside… like Europa") and its cut-away scene. Once the story turns to the civilization, no more science explaining: it slows the twist down. The zoom on the moon now goes straight to "And on its night side, there are lights." 

## Fact checks

**Draft 3 (Sangam, 2026-11-23):** removed the whole aliens twist (the moon, the lights, the civilization, the message, the
refugees-or-invaders choice and the countdown). The film now stays real science to the end and closes on a reassurance plus a
question for the comments, then loops back into the hook. Lines 15–17 are new.

All lines are real science, worked out for one concrete case: a Jupiter-mass rogue planet arriving at 26 km/s and
passing 10 million km from Earth.

| Line | Claim (as said or shown) | Basis | Hedge |
|---|---|---|---|
| 2, 3 | Planets with no star exist, some as big as Jupiter; our galaxy may hold more of them than stars | Free-floating planets are found by microlensing and direct imaging (e.g. OTS 44, CFBDSIR 2149−0403; JWST's Jupiter-mass objects in Orion, 2023). The MOA survey estimates ~20 free-floating planets per star in the Milky Way, mostly small ones (Sumi et al. 2023, AJ 166:108); NASA: "rogue planets may outnumber the stars". | "may" |
| 4 | Spotted past Neptune, at 26 km/s | Objects from outside the solar system arrive at tens of km/s: 'Oumuamua 26 km/s, Borisov 32 km/s (relative to the Sun, before the Sun's pull). A Jupiter-sized body at Neptune's distance (30 AU) would shine at about magnitude 5–6 in reflected sunlight, easy for sky surveys. At ~26–27 km/s, 30 AU takes about 5 years, hence "Year 1 → Year 5". | — |
| 5, 6 | Misses Earth by 10 million km = 26× the Moon's distance; weighs as much as 300 Earths | 10,000,000 / 384,400 km = 26.0. Jupiter's mass = 318 Earth masses (NASA fact sheet). The 10 million km is our chosen scenario, not a prediction. | "about" in the description |
| 7 | Brightest thing in the night sky after the Moon; stripes visible in binoculars | Within ~2 AU it would be magnitude −6 to −9 (Venus at its brightest is −4.9). At 1 AU its disc is ~3 arcmin wide, ~30 arcmin through 10× binoculars, enough to see bands. | — |
| 8 | Grows bigger than the full Moon | Jupiter's diameter is 140,000 km; at 10 million km that is 0.8°, vs the Moon's 0.52°. It is bigger than the Moon while closer than ~15 million km, about five days around the pass. | — |
| 9 | Its gravity tugs on Earth even harder than the Moon does; tides surge | At 10 million km, its pull on Earth is ~38× the Moon's, and its tide-raising force (∝ M/d³) is ~1.5× the Moon's. Added to the Moon's and Sun's tides for several days, high tides could be far above normal. | "could" in the voice: "surge"; no height number claimed |
| 10 | Strong tides can tip faults that are ready to slip | Large earthquakes are slightly more likely during high tidal stress (Ide, Yabe & Tanaka 2016, Nature Geoscience 9:834; Cochran et al. 2004, Science 306:1164). | "can" |
| 12 | Earth's orbit shifts by up to 3 % | Our own n-body check (Sun, Earth, Moon, the rogue planet; scipy DOP853), 10 million km pass at 26 km/s: Earth's orbit grew or shrank by up to 3.1–3.2 % depending on the direction of the pass (≈0 for some geometries). The Moon's orbit changed by <1 %. | "up to" |
| 13 | A little closer: hotter than any climate forecast | 3 % closer → ~6 % more sunlight → ~14 W/m² extra absorbed, ~4× the forcing of doubled CO₂; at a typical sensitivity (~3 °C per doubling) that is ~10 °C of eventual warming, above the highest IPCC scenario for 2100 (~4–6 °C). | "could" |
| 14 | A little farther: an ice age; the year changes by two weeks | 3 % farther → ~6 % less sunlight → ~−10 °C eventually, colder than the last glacial maximum (~−6 °C). Kepler's third law: 3 % in orbit size → ~4.7 % in year length ≈ 17 days (the simulation gives ±17 days). | "could", "two weeks" (rounded down) |
| 15 | It never touched us | In our scenario it passes 10 million km away; every effect above is from gravity alone. | — |
| 16 | Billions of rogue planets may be drifting through our galaxy; none is known to be heading our way | ~20 free-floating planets per star (Sumi et al. 2023) × 100–400 billion stars gives trillions, so "billions" is a cautious floor. No known rogue planet is on course for the solar system. | "may", "known" |

Not claimed: that any rogue planet is heading our way (none is known), a tide height, a number of deaths, or how
likely such a pass is. For scale: the closest known visitor, Scholz's star, passed ~0.8 light-years away 70,000 years
ago (Mamajek et al. 2015, ApJL 800:L17).

## Changes after the frame-by-frame review
See the PR description (each fix found by checking every scene in contact sheets and a 1 fps frame dump).
