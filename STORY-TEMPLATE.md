# Beyond Everything — story template for every Short

Fill this in, in order, **before** any animation code. A script that can't fill every box isn't ready.

## 0. Packaging first (the scroll decision)
- **Title** (under 50 characters, curiosity, no spoiler).
- **First frame:** what is on screen at 0.0 s with no sound? It must be readable as a still: a bold claim in large text plus a character reacting. Most viewers decide with the sound off.
- **Hook line** (≤ 8 words, said in the first 2 s): something that sounds wrong, impossible or personal. ✗ "Take one cubic metre…" ✓ "The Sun is terrible at its job."

## 1. The question chain (the engine)
Write the questions the viewer is silently asking, one per beat. Each answer must raise the next question.

| Beat | Time | Job | Our line | Question it leaves |
|---|---|---|---|---|
| Hook | 0–3 s | Sounds impossible | | |
| Mystery | 3–8 s | Show the weird thing happening | | |
| Explanation | 8–20 s | Just enough science, one idea | | |
| Escalation | 20–35 s | A bigger consequence | | |
| Scale | 35–50 s | Time, size, numbers the viewer can feel | | |
| Payoff | 50–60 s | The hook now means something new | | |

## 2. Rules
- **Length: 40–60 s.** Cut any fact that doesn't answer the current question. A topic with more good material becomes **Part 1 / Part 2**, with a cliffhanger that names what's in Part 2.
- **Every 3–5 s something changes on screen.** Every ~15 s there's a pattern interrupt: a hard cut, an extreme zoom, 0.3 s of silence, or a scale or colour change.
- **Show, don't list.** Each beat gets one visual metaphor the code can animate, such as a waiting room, a coin flip, or probability shown as 100 attempts with one success.
- **The characters are the brand.** Earth, the Moon and the lazy Sun react to the narration, and the joke lives in their reaction.
- **One number per beat,** said as something the viewer can feel ("about the speed your fingernails grow").
- **The payoff reframes the hook** (✓ "It's not lazy. It's pacing itself."), and the last line should flow back into the first so the Short loops.
- **Narration flows, no dead air.** Make the voice with `python3 tools/voice.py FILM_DIR` (Ryan, +5%). It trims each take and caps pauses inside a line at 0.3 s; in main.js keep the gap between lines at about 0.2 s (`LINE_GAP`). Add more only on purpose, for a single dramatic beat.
- **Accuracy:** every claim goes in FACTS.md with a source and a hedge. Avoid wording that can be read wrong, such as "takes 9 billion years to fuse a proton".

## 3. Before publishing
- **Captions:** big, centred, above the bottom 20%. Key words in gold.
- **Comment bait:** the last line, or the pinned comment, asks something viewers can answer.
- **Check analytics:** in YouTube Studio → Shorts → "Viewed vs swiped away". Below ~60% viewed means the first second is the problem; fix the hook and the first frame before anything else.
