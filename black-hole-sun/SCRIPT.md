# What If a Black Hole Replaced Our Sun? — script, draft 2

**Brief**
- **Audience:** teens and a general audience.
- **Length:** about 73 s (68.4 s of narration after trimming). Every beat answers the question the last one raised.
- **Tone:** plain, friendly, no slang.
- **Voice:** edge-tts "Ryan" (`en-GB-RyanNeural`, rate +5%), one take per line, made with the shared `tools/voice.py`
  (trimmed takes, inner pauses capped at 0.3 s). Lines are 0.2 s apart in the timeline (0.3 s after line 4, 0.35 s after line 12).

**Why this topic:** the channel's best Shorts change something big about our sky. The surprise most people get wrong:
Earth would *not* be swallowed, because the black hole pulls just as hard as the Sun from out here. What would really
hurt is the darkness, so the middle of the film follows what happens to the sky, cities, power, food, weather and people.

**Draft 2 (Sangam's notes, 2026-11-17):** the hook and ending follow Sangam's own script ("Imagine…", "the real
nightmare isn't being swallowed"). The fly-close / spaghettification beats are cut ("a different topic"), and the
middle now covers the consequences on Earth, cities and people's lives.

**Title:** "What If a Black Hole Replaced Our Sun?" · **Hook (first 3 s):** the Sun collapses into a black hole and
Earth panics. The hook says "imagine" and names the condition (the same mass) in the same line.
**First frame (no sound):** the Sun on Earth's orbit, big text **WHAT IF A BLACK HOLE REPLACED OUR SUN?**
**Thumbnail (designed separately, thumb.js):** a smug black hole inside the Sun's dashed outline, a scared Earth on its
orbit, "OUR SUN / A BLACK HOLE?", pill "SAME PULL. NO LIGHT."

| # | Narration (spoken) | Visual cue | POV |
|---|---|---|---|
| 1 | Imagine the Sun, right now, replaced by a black hole with the same mass. | The sleepy Sun on Earth's dashed orbit flashes and collapses into a smug black hole. Earth: "same mass?!". "not to scale". | space |
| 2 | Would Earth get swallowed? No. Its pull out here would be the same, so we'd keep orbiting just like today. | A red arrow drags Earth inward, then **NOPE**; Earth keeps lapping with a cyan trail. Tag "same mass = same pull · Earth keeps its orbit". | space |
| 3 | The black hole itself would be tiny, about six kilometres wide, and it wouldn't even glow. | The Sun gets squeezed to a dot; a magnifier shows a "6 km" bar. **NO GLOW**. Tag "≈ 6 km wide · today's Sun: 1.4 million km". | space |
| 4 | For about eight minutes, nothing changes. The last sunlight is still on its way. | Smiling photons stream from the hole's spot to a sunny Earth ("all good?"); a timer counts up toward 8 min 19 s. Tag "last light still on its way". | space |
| 5 | Then the lights go out. The daytime sky turns black, and the Moon goes dark too. | A sunny park: the Sun vanishes, the sky turns black with stars, the Moon dims; a person throws up their arms. **LIGHTS OUT**. Tag "black sky at noon · and no moonlight either". | ground |
| 6 | In cities, street lights stay on all day, and solar panels stop making power. | A city at "12:00 NOON" under a black sky: windows lit, street lights glowing, rooftop solar panels read "0 W". Tag "street lights on all day · solar panels: nothing". | city |
| 7 | Everyone turns the heating up at once, and power grids struggle to keep up. | Houses' windows glow orange; a POWER DEMAND bar fills to red; the pylon sparks. **OVERLOAD**. Tag "everyone heats at once". | city |
| 8 | Within a week, the average surface temperature drops to about minus eighteen degrees. | A dark, greyed Earth frosts over; a thermometer drops from 15 °C to −18 °C; snow. Tag "≈ −18 °C · on average, within a week". | space |
| 9 | Plants stop making food. Crops die in the fields, and the animals that eat them go hungry. | Rows of crops brown and droop; a worried cow, "hungry…". Tag "no light = no food · plants need sunlight to make it". | farm |
| 10 | The weather winds down too. Without the Sun's heat, there's little left to drive the wind and rain. | Earth's cloud swirls slow and fade, wind arrows fade, a rain cloud dries up. Tag "the Sun runs the weather · no heat → little wind or rain". | space |
| 11 | Within a year, about minus seventy. The oceans freeze over, and the ice keeps getting thicker. | Ocean cutaway: an ice lid forms and thickens (arrow); a worried fish below. Tag "≈ −70 °C · within a year". | sea |
| 12 | A few people might hang on underground, using nuclear and geothermal power. Deep below the ice, life at hot vents keeps going. | Cutaway: frozen surface, a warm underground room with two people, "nuclear" and "geothermal" labels; below, a smoking vent and a fish. Tag "a few might hang on · nuclear + geothermal power". | underground |
| 13 | The good news: this can't happen. The Sun is far too small to ever become a black hole. | **CAN'T HAPPEN**. The Sun sips its mug next to a much bigger blue giant star. Tag "far too small · black holes come from stars ~20× heavier". | space |
| 14 | So the real nightmare isn't being swallowed. It's orbiting perfectly around something that no longer keeps us alive. | A frozen grey Earth laps the black hole; "swallowed?" gets crossed out; **STILL ORBITING… IN THE DARK**. Tag "the real nightmare". **Loops to the first frame.** | space |

**Timing:** 230 words, 72.9 s as built.

## Fact checks

Every spoken claim and every on-screen number has a row. "Line" is the narration line above.

| Line | Claim (as said or shown) | Basis | Hedge |
|---|---|---|---|
| 1 | A black hole with the same mass replaces the Sun | A thought experiment, stated as "imagine". | "Imagine" |
| 2 | Earth would not be swallowed; its pull out here would be the same; we'd keep orbiting just like today | Outside a spherical mass, gravity depends only on the mass and the distance (Newton's shell theorem; the Schwarzschild solution in general relativity). NASA, "What Is a Black Hole? (Grades 5–8)" (nasa.gov/learning-resources/for-kids-and-students/what-is-a-black-hole-grades-5-8) and NASA Science, "Black Holes" (science.nasa.gov/universe/black-holes): a black hole with the Sun's mass would not pull the planets in; they would keep orbiting at the same distance and speed. Relativistic corrections at 1 AU are about one part in 10⁸. | "out here"; condition (same mass) given in line 1 |
| 3 | About 6 km wide | Schwarzschild radius r = 2GM/c² = 2.95 km for one solar mass, so the event horizon is ≈ 5.9 km across. NASA gives ≈ 3 km for the radius. | "about" |
| 3 (on-screen) | Today's Sun: 1.4 million km | The Sun's diameter is ≈ 1.39 million km (NASA Sun Fact Sheet). | rounded |
| 3 | It wouldn't even glow | A black hole gives off no light of its own; the black holes we see glowing are lit by hot gas falling in (NASA Science, "Black Holes"). Its Hawking radiation for one solar mass is ≈ 6 × 10⁻⁸ K, effectively black. With the Sun's gas gone, there is next to nothing to fall in. | — |
| 4 | For about eight minutes nothing changes; the last sunlight is still on its way | Light takes ≈ 499 s (8 min 19 s) to cross 1 AU (149.6 million km ÷ 299,792 km/s). NASA Space Place. Gravity doesn't change at all (line 2). | "about"; on-screen timer stops at 8 min 19 s |
| 5 | The daytime sky turns black | The blue daytime sky is sunlight scattered by air (Rayleigh scattering). With no sunlight there is nothing to scatter, so the sky looks like night, with stars. | — |
| 5 | The Moon goes dark too | Moonlight is reflected sunlight; the Moon is about as far from the Sun as we are, so it goes dark at about the same time (NASA Moon facts). | "too" (about the same time) |
| 6 | Street lights stay on all day | Most street lights switch on automatically with light sensors (photocells) or timers set for darkness. | "In cities" (general) |
| 6 | Solar panels stop making power | Solar panels turn sunlight into electricity; with no sunlight they produce essentially nothing. (Solar made about 7 % of the world's electricity in 2024: Ember, Global Electricity Review 2025; not said on screen.) | — |
| 7 | Everyone turns the heating up at once, and power grids struggle | A projection. Demand for heating spikes in severe cold, and grids have failed under it before (e.g. the Texas blackouts during Winter Storm Uri, February 2021; ERCOT/FERC report). | "struggle", no claim of total failure |
| 8 | Within a week, average surface temperature about −18 °C | Scientific American (2007), "What would happen to Earth if the Sun disappeared?", David Stevenson (Caltech): "within a week, the average global surface temperature would drop below 0 degrees Fahrenheit" (−18 °C). Same physics here: no sunlight. | "about", "average" |
| 9 | Plants stop making food; crops die; the animals that eat them go hungry | Photosynthesis needs light (Scientific American 2007, Stevenson: photosynthesis would stop). Crops and grazing animals depend on it; food chains start with plants. | — |
| 10 | The weather winds down; without the Sun's heat, little is left to drive wind and rain | Sunlight heats the equator more than the poles; that uneven heating drives the winds, and its heat evaporates the water that falls as rain and snow (NASA Earth Observatory, "Earth's energy budget"; NOAA, "The water cycle"). Without it, both fade. | "winds down", "little left" |
| 11 | Within a year, about −70 °C | Scientific American (2007), Stevenson: "within a year, it would dip to −100 degrees F" (−73 °C). | "about" |
| 11 | The oceans freeze over, and the ice keeps getting thicker | Same source: the ocean surfaces would freeze, and the ice layer would keep thickening while insulating the water below, which would not freeze solid for hundreds of thousands of years. | — |
| 12 | A few people might hang on underground, using nuclear and geothermal power | Popular Science (2013), "What would happen if the Sun went out?" (popsci.com/science/article/2013-07/if-sun-went-out-how-long-could-life-earth-survive): nuclear- or geothermal-powered habitats are the most workable option; Iceland already heats most of its homes with geothermal energy, and people could keep using volcanic heat for hundreds of years (Eric Blackman, University of Rochester). | "a few", "might" |
| 12 | Deep below the ice, life at hot vents keeps going | Vent ecosystems run on chemical energy, not sunlight (chemosynthesis; NOAA Ocean Exploration, "What is a hydrothermal vent?"). Stevenson (Scientific American 2007) notes such life could carry on. | — |
| 13 | This can't happen; the Sun is far too small to ever become a black hole | Stellar black holes form when the cores of stars born with more than roughly 20 solar masses collapse (NASA Science, "Black Holes"). NASA notes the Sun will end as a white dwarf instead. | "far too small" |
| 13 (on-screen) | Black holes come from stars ~20× heavier | Same source; the threshold is uncertain (≈ 20–25 solar masses). | "~" |
| 14 | The real nightmare: orbiting perfectly around something that no longer keeps us alive | The conclusion of lines 2 and 4–12: the orbit is unchanged, but without sunlight the surface freezes and food fails. | Framed as a summary, not a new claim |

Not claimed: that we could see the black hole from Earth, a survival timeline or head-count for people, how long stored food would last, or that the black hole would grow or pull in other planets.
