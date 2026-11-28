# Mars Has a Clingy Moon — script (as built, 83 s)

**Format:** a direct sequel to *The Moon Is Slowly Breaking Up With Us*, the channel's best performer (2.7k views against ~1.5k for the rest, per Sangam on 2026-11-28). Same recipe:
- the same narrator: Kokoro-82M **bm_george** (en-gb), per-line speed 1.0–1.1 (`voice_kokoro.py`);
- the same flat-vector kit: planets and moons as cute characters with faces and moods, cel shading, sparkle stars, word-pop captions with key words in gold;
- the same satire: space told as a relationship drama. The Moon left us; Mars has the opposite problem, a clingy moon.

**Why this topic:** it reuses the hit's premise and flips it (leaving → clinging), every beat is a relationship joke that is also a real fact, and the punchlines land on true science ("puts a ring on it" is the predicted debris ring, "red flags" are the real names). No aliens, ends on a question.

| # | Line (narration) | On screen | Type |
|---|---|---|---|
| 1 | Our Moon is slowly breaking up with us. Mars has the opposite problem. | Earth sad, the Moon drifts off with a suitcase. Whip-pan to Mars with Phobos glued to its cheek, hearts. Title **Mars has a CLINGY MOON** | hook |
| 2 | Its moon, Phobos, is clingy. It orbits just six thousand kilometres above the ground. Our Moon keeps sixty times more space. | Phobos on a tight orbit, **6,000 km above the ground** bracket; card: Earth–Moon **384,000 km**, **60× more space** | show → reward |
| 3 | It's so close, it laps Mars three times a day. From the ground, it rises in the west, and sets in the east. | Phobos whips round Mars, **lap 1-2-3**; cut to the Martian desert, Phobos crosses the sky **WEST → EAST**, "backwards!" | show → reward |
| 4 | And it's moving in. About two metres closer, every century. | Phobos hops over with a **MY STUFF** box, "hiii roomie"; card **−2 m closer every century** | joke → reward |
| 5 | Same physics as our Moon, just backwards. Phobos circles faster than Mars spins, so the tidal bulge it raises lags behind it, and drags it down. | Card: our Moon pushed OUT / Phobos pulled IN. Top-down: **Phobos orbits FAST / Mars spins slow**, the bulge lags, a red drag arrow, the orbit shrinks | mechanism |
| 6 | Mars is basically pulling it in for a hug it won't survive. | Mars (heart eyes) wraps its arms round Phobos: "aww" → "too tight!!", heart breaks | joke |
| 7 | You can already see the strain. Those long grooves? Scientists think they may be stretch marks, from Mars pulling on it. | Close-up of Phobos, grooves draw across it, it blushes; **stretch marks?** card, pull arrows | reward |
| 8 | NASA's Perseverance rover even filmed it crossing the Sun. The eclipse lasted just over forty seconds. | The rover on the desert, a REC frame round the Sun, potato-shaped shadow crosses; **~40 seconds** | how we know |
| 9 | In thirty to fifty million years, Mars will tear it apart, and the pieces could spread into a ring. | **30–50 million years from now**; Phobos cracks, crumbles, the rubble spreads into a ring | reward |
| 10 | So Mars finally puts a ring on it. | Mars wears the ring, a diamond sparkles, confetti, **put a ring on it** | punchline |
| 11 | Meanwhile, its other moon, Deimos, is quietly drifting away. Just like ours. | Deimos in sunglasses floats off with a suitcase; card: our Moon does the same, **just like ours** | twist |
| 12 | And their names? Phobos and Deimos. Fear, and Dread. Red planet. Red flags. | **Phobos = FEAR**, **Deimos = DREAD**; red flags pop up all over Mars, **red planet / RED FLAGS** | punchline |
| 13 | So which would you rather have? A moon that leaves you, or one that never lets go? | Two cards: Earth + leaving Moon / Mars + clinging Phobos; **which would you rather?** | question ending |

**Length:** 197 words, 75 s of speech, 83.4 s with gaps (lines 0.28 s apart, longer around the punchlines).

## Fact table

| Claim | Source | Hedge / note |
|---|---|---|
| Our Moon is drifting away (callback) | NASA: about 3.8 cm a year (see `moon-breakup/FACTS.md`) | — |
| Phobos orbits about 6,000 km above Mars | NASA Science, *Phobos*: "orbits 3,700 miles (6,000 kilometers) above the Martian surface" (mean altitude ~5,990 km; orbit radius ~9,380 km from the centre) | "just six thousand kilometres" |
| Our Moon keeps ~60× more space | Moon's mean distance 384,400 km ÷ 6,000 km ≈ 64 | "sixty times", rounded down |
| Phobos laps Mars three times a day | Orbital period 7 h 39 min; Mars day 24 h 37 min → 3.2 orbits per sol (NASA) | "three times a day" |
| It rises in the west and sets in the east | It orbits faster than Mars turns (Freedman & Kaufmann, *Universe*: "As seen from Mars, Deimos rises in the east but Phobos rises in the west") | — |
| About 2 m closer every century | NASA Goddard 2015 (Hurford et al.): "Mars' gravity is drawing in Phobos … by about 6.6 feet (2 meters) every hundred years" | "about two metres" |
| Bulge lags behind and drags it down; same physics as our Moon, reversed | Standard tidal deceleration: Phobos is inside the synchronous orbit (~6.0 Mars radii), so its bulge trails it and slows it; our Moon is outside, so it is pushed out | — |
| Grooves may be stretch marks from tidal forces | NASA Goddard 2015, "Phobos is falling apart": grooves are "more like stretch marks that occur when Phobos gets deformed by tidal forces" | "scientists think they may be" (other studies blame impact ejecta) |
| Perseverance filmed Phobos crossing the Sun; the eclipse lasted just over 40 s | NASA/JPL, 20 Apr 2022: Mastcam-Z on sol 397 (2 Apr 2022), "a little more than 40 seconds" | "just over forty seconds" |
| Torn apart in 30–50 million years | NASA Goddard 2015: "expected to be destroyed in 30 to 50 million years" (Black & Mittal 2015 give 20–40 Myr) | NASA's range |
| The pieces could form a ring | Black & Mittal, *Nature Geoscience* 2015: tidal break-up → a ring lasting 1–100 million years | "could" (it may partly crash instead) |
| Deimos is slowly drifting away | Deimos orbits outside the synchronous orbit, so tides push it slowly outward, like our Moon (very slowly) | "quietly drifting" |
| Phobos and Deimos mean Fear and Dread | Named by Asaph Hall (1877) after the sons of Ares: Phobos = fear/panic, Deimos = dread/terror (NASA) | — |

The narration never says *Mars* named them, so the joke ("red flags from the start") doesn't put a wrong fact in.

## Build

`sh build.sh` (add `--vo` to remake the voice with Kokoro; set `KOKORO` to the folder with `kokoro-v1.0.onnx` and `voices-v1.0.bin` from the kokoro-onnx releases). In the cloud, `LIB=$PWD/../tools/cloud-engine`. Thumbnails come from `index.html?thumb=v` and `?thumb=h`.
