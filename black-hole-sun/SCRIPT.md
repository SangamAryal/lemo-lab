# What If a Black Hole Replaced Our Sun? — script, draft 1

**Brief**
- **Audience:** teens and a general audience.
- **Length:** about 68 s (63.6 s of narration after trimming). Every beat answers the question the last one raised.
- **Tone:** plain, friendly, no slang.
- **Voice:** edge-tts "Ryan" (`en-GB-RyanNeural`, rate +5%), one take per line, made with the shared `tools/voice.py`
  (trimmed takes, inner pauses capped at 0.3 s). Lines are 0.2 s apart in the timeline (0.35 s after line 6 and line 11).

**Why this topic:** the channel's best Shorts change something big about our sky (the Moon, the rings, the Sun
vanishing). This one has a real surprise that most people get wrong: Earth would *not* get sucked in. The black hole
pulls exactly as hard as the Sun from out here. What would kill us is the darkness, so the payoff is "it's the light".
It pairs with *What If the Sun Vanished?* without repeating it: there the orbit breaks, here it doesn't.

**Title:** "What If a Black Hole Replaced Our Sun?" · **Hook (first 3 s):** the Sun collapses into a black hole, Earth
panics, and the red "sucked in" arrow gets a **NOPE**. The hook is a conditional ("if"), and line 2 states its
condition (the same mass) straight away.
**First frame (no sound):** the Sun on its orbit, big text **WHAT IF A BLACK HOLE REPLACED OUR SUN?**
**Thumbnail (designed separately, thumb.js):** a smug black hole inside the Sun's dashed outline, a scared Earth on its
orbit, "OUR SUN / A BLACK HOLE?", pill "SAME PULL. NO LIGHT."

| # | Narration (spoken) | Visual cue | POV |
|---|---|---|---|
| 1 | If a black hole replaced our Sun right now, Earth would not get sucked in. | The sleepy Sun on Earth's dashed orbit flashes and collapses into a black hole. A red arrow drags at Earth; it fades and **NOPE** pops. "not to scale". | space |
| 2 | As long as it had the same mass as the Sun, its pull out here would be just the same. | A balance: the Sun on one pan, the black hole on the other, level, "=". Earth below with two equal pull arrows. Tag "same mass = same pull · from out here". | space |
| 3 | So Earth keeps circling, once a year, at about thirty kilometres a second. | Top view: Earth laps the black hole with a cyan trail. Bubble "business as usual". Tag "≈ 30 km/s · one lap a year, same as now". | space |
| 4 | But the black hole would be tiny: the Sun's whole mass, squeezed into a ball about six kilometres wide. | The Sun gets squeezed by arrows down to a dot; a magnifier shows the hole with a "6 km" bar. Tag "≈ 6 km wide · today's Sun: 1.4 million km". | space |
| 5 | And it would be dark. With nothing falling in, there's nothing to glow. | The black hole alone, sad. Inset card "with a meal: it glows" (a hole with a hot disk) gets crossed out. Tag "nothing to eat · nothing to glow". | space |
| 6 | The sunlight already on its way keeps arriving for about eight minutes. Then the sky goes black. | Smiling photons stream from the hole's spot to Earth; a timer runs to "8 min 20 s"; the stream ends, the screen darkens, **LIGHTS OUT**. Tag "last light still on its way". | space |
| 7 | Within a week, Earth's surface would be about minus eighteen degrees, on average. | Dark, greyed Earth frosting over; a thermometer drops from 15 °C to −18 °C; snow. Tag "≈ −18 °C · on average, within a week". | space |
| 8 | Within a year, about minus seventy. The oceans freeze over, but stay liquid underneath for ages. | Ocean cutaway: an ice lid grows on top; below it, fish keep swimming. "still liquid". Tag "≈ −70 °C · within a year". | sea |
| 9 | Could you fly over for a look? Get close, and it pulls your feet much harder than your head. | An astronaut drifts in feet first; a big red arrow on the feet ("feet: BIG pull"), a small gold one on the head. Tag "feet first · the near side gets pulled harder". | space |
| 10 | Long before you reached the edge, that difference would stretch you thin. Scientists call it spaghettification. | The astronaut stretches long and thin; speed lines; noodles and **SPAGHETTIFICATION**. Tag "stretched thin · long before the edge". | space |
| 11 | And the edge itself is the point of no return. Not even light gets back out. | A big hole with a dashed gold "event horizon"; one photon swings past and escapes, one spirals in. Bubble "no way back". Tag "the point of no return · not even light gets out". | space |
| 12 | The good news: this can't happen. The Sun is far too small to ever become a black hole. | **CAN'T HAPPEN**. The Sun sips its mug next to a much bigger blue giant star. Tag "far too small · black holes come from stars ~20× heavier". | space |
| 13 | In about five billion years, it will swell into a red giant, then shrink into a white dwarf. | The Sun swells red ("red giant"), then shrinks to a small white dwarf ("white dwarf"). Tag "≈ 5 billion years · from now". | space |
| 14 | So the Sun's gravity isn't what keeps you alive. Its light is. | Sunbeams pour onto a loved-up Earth; a "gravity" arrow fades as **IT'S THE LIGHT** pops. Tag "what keeps you alive?". **Loops to the first frame.** | space |

**Timing:** 225 words, 68.1 s as built.

## Fact checks

Every spoken claim and every on-screen number has a row. "Line" is the narration line above.

| Line | Claim (as said or shown) | Basis | Hedge |
|---|---|---|---|
| 1 | Earth would not get sucked in | Outside a spherical mass, gravity depends only on the mass and the distance (Newton's shell theorem; the Schwarzschild solution in general relativity). A black hole of one solar mass pulls on Earth exactly as the Sun does, so Earth's orbit is unchanged. NASA, "What Is a Black Hole? (Grades 5–8)" (nasa.gov/learning-resources/for-kids-and-students/what-is-a-black-hole-grades-5-8) and NASA Science, "Black Holes" (science.nasa.gov/universe/black-holes): a black hole with the Sun's mass would not pull the planets in; they would keep orbiting at the same distance and speed. The same page notes the Sun will never become one. | Conditional ("if"); line 2 gives the condition (same mass) at once. Assumes an instant swap with no mass lost. |
| 2 | With the same mass, its pull out here would be just the same | Same as line 1. Relativistic corrections at 1 AU are about one part in 10⁸ (GM/rc² ≈ 10⁻⁸), far too small to matter. | "as long as it had the same mass", "out here" |
| 3 | Earth keeps circling once a year at about 30 km/s | Same mass, same distance → same orbital period (Kepler's third law). Earth's mean orbital speed is 29.8 km/s (NASA Earth Fact Sheet). | "about" |
| 4 | The Sun's mass in a ball about 6 km wide | Schwarzschild radius r = 2GM/c² = 2.95 km for one solar mass (1.989 × 10³⁰ kg), so the event horizon is ≈ 5.9 km across. | "about six kilometres" |
| 4 (on-screen) | Today's Sun: 1.4 million km | The Sun's diameter is ≈ 1.39 million km (NASA Sun Fact Sheet). | rounded |
| 5 | It would be dark; with nothing falling in, nothing glows | A black hole gives off no light of its own; the glowing black holes astronomers see are lit by hot gas falling in (accretion disks). NASA Science, "Black Holes" (science.nasa.gov/universe/black-holes). Its Hawking radiation for one solar mass is ≈ 6 × 10⁻⁸ K, far colder than space, so it is effectively black. | "nothing falling in": a trickle of dust and solar-system debris is ignored |
| 6 | The sunlight already on its way keeps arriving for about 8 minutes, then the sky goes black | Light takes ≈ 499 s (8 min 19 s) to cross 1 AU (149.6 million km ÷ 299,792 km/s). NASA Space Place. | "about eight minutes"; on-screen timer rounds to 8 min 20 s |
| 7 | Within a week, about −18 °C on average | Scientific American (2007), "What would happen to Earth if the Sun disappeared?", David Stevenson (Caltech): "within a week, the average global surface temperature would drop below 0 degrees Fahrenheit" (−18 °C). Losing sunlight is the same in both cases. | "about", "on average" |
| 8 | Within a year, about −70 °C | Same source: "within a year, it would dip to −100 degrees F" (−73 °C). | "about" |
| 8 | The oceans freeze over but stay liquid underneath for ages | Same source: the ice would insulate the water below, and the oceans would not freeze solid for hundreds of thousands of years (Earth's internal heat). | "for ages", no figure |
| 9 | Get close and it pulls your feet much harder than your head | Gravity falls off with distance, so the near end of a body is pulled harder than the far end (tidal force). Feet first, the feet are nearer. | "get close" |
| 10 | Long before you reached the edge, that difference stretches you thin | For a stellar-mass black hole, tides become deadly well outside the event horizon (NASA Science, "Black Holes"; NASA Hubble, "Black Hole Anatomy"). For one solar mass, the tidal stretch across a 2 m body is 2GML/r³ ≈ 530 m/s² (≈ 54 g) at 1,000 km, while the horizon is at 3 km. | "long before" |
| 10 | Scientists call it spaghettification | The standard term (used by NASA and in Stephen Hawking's *A Brief History of Time*). | — |
| 11 | The edge is the point of no return; not even light gets back out | Definition of the event horizon (NASA Science, "Black Holes"). | — |
| 12 | This can't happen; the Sun is far too small to ever become a black hole | Stellar black holes form when the cores of stars born with more than roughly 20 solar masses collapse (NASA Science, "Black Holes"; NASA Imagine the Universe, "Stars"). The Sun will end as a white dwarf. | "far too small" |
| 12 (on-screen) | Black holes come from stars ~20× heavier | Same source; the threshold is uncertain (≈ 20–25 solar masses). | "~" |
| 13 | In about 5 billion years it swells into a red giant, then shrinks into a white dwarf | NASA Science, "The Sun": the Sun is about halfway through its life; in roughly 5 billion years it becomes a red giant, then sheds its outer layers and leaves a white dwarf. | "about" |
| 14 | The Sun's gravity isn't what keeps you alive; its light is | The conclusion of lines 1–8: with an equal-mass black hole the orbit is unchanged (1–3), but without sunlight the surface freezes (6–8). | Framed as a summary, not a new claim |

Not claimed: that we could see the black hole from Earth, any survival timeline for people, or that the black hole would grow or pull in other planets.
